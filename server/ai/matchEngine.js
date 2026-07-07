const pool = require('../config/db');

function calculateMatchScore(studentSkills, jobSkills) {
  return explainMatch(studentSkills, jobSkills).score;
}

// Explainable match (PRD 7.5): always shows *why* a score is what it is,
// not just the percentage — matched skills, missing skills.
function explainMatch(studentSkills, jobSkills) {
  if (!studentSkills.length || !jobSkills.length) return { score: 0, matched: [], missing: jobSkills || [] };

  const normalize = (s) => s.toLowerCase().trim();
  const studentSet = studentSkills.map(normalize);

  const matched = [];
  const missing = [];
  for (const skill of jobSkills) {
    const norm = normalize(skill);
    if (studentSet.some((s) => s === norm || s.includes(norm) || norm.includes(s))) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const score = Math.round((matched.length / jobSkills.length) * 100);
  return { score, matched, missing };
}

const STATUS_JOB_TYPES = {
  'Current Student': ['internship', 'part-time', 'learnership'],
  'Recent Graduate': ['graduate', 'graduate_programme', 'entry_level', 'full-time', 'contract', 'learnership'],
  'Alumni': ['graduate', 'graduate_programme', 'entry_level', 'full-time', 'contract', 'part-time'],
};

async function getMatchedJobs(req, res) {
  try {
    const [student] = await pool.query('SELECT skills, location, country, status FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    let studentSkills = student[0].skills;
    if (typeof studentSkills === 'string') studentSkills = JSON.parse(studentSkills);
    if (!Array.isArray(studentSkills) || studentSkills.length === 0) {
      return res.json({ matches: [], message: 'Add skills to your profile to get AI-matched jobs' });
    }

    const studentStatus = student[0].status || 'Current Student';
    const allowedTypes = STATUS_JOB_TYPES[studentStatus] || Object.values(STATUS_JOB_TYPES).flat();

    const placeholders = allowedTypes.map(() => '?').join(',');
    const [jobs] = await pool.query(
      `SELECT j.*, c.company_name, c.logo_path, c.verified
       FROM jobs j JOIN companies c ON j.company_id = c.id
       WHERE j.status = 'open' AND j.type IN (${placeholders})`,
      allowedTypes
    );

    const matches = jobs
      .map((job) => {
        let requiredSkills = job.required_skills;
        if (typeof requiredSkills === 'string') requiredSkills = JSON.parse(requiredSkills);

        const { score: matchScore, matched, missing } = explainMatch(studentSkills, requiredSkills);
        const locationMatch = student[0].location &&
          job.location && job.location.toLowerCase().includes(student[0].location.toLowerCase());

        return {
          ...job,
          matchScore,
          matchedSkills: matched,
          missingSkills: missing,
          locationMatch,
          overallScore: matchScore + (locationMatch ? 5 : 0),
        };
      })
      .filter((job) => job.matchScore > 0)
      .sort((a, b) => b.overallScore - a.overallScore);

    res.json({
      matches,
      totalMatches: matches.length,
      studentSkills,
      studentStatus,
    });
  } catch (err) {
    console.error('AI matching error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getMatchedJobs, calculateMatchScore, explainMatch };
