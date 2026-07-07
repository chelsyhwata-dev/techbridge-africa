const pool = require('../config/db');

// Recruiter Search (PRD 8.4): filtered search over the student pool.
// A straightforward filtered search for V1 — not an AI-ranked discovery engine.
exports.searchCandidates = async (req, res) => {
  const { skill, location, degree, availability, hasGithub, minVerifiedSkills, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let where = [];
    let params = [];

    if (skill) { where.push('s.skills LIKE ?'); params.push(`%${skill}%`); }
    if (location) { where.push('(s.location LIKE ? OR s.city LIKE ?)'); params.push(`%${location}%`, `%${location}%`); }
    if (degree) { where.push('s.degree LIKE ?'); params.push(`%${degree}%`); }
    if (availability) { where.push('s.availability = ?'); params.push(availability); }
    if (hasGithub === 'true') { where.push('s.github_username IS NOT NULL'); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [candidates] = await pool.query(
      `SELECT s.id, s.university, s.degree, s.year_of_study, s.location, s.city, s.headline,
              s.bio, s.skills, s.github_username, s.career_path, s.availability, s.portfolio_slug,
              u.name, u.profile_image,
              (SELECT COUNT(*) FROM student_skills ss WHERE ss.student_id = s.id AND ss.verified = TRUE) as verified_skill_count,
              (SELECT COUNT(*) FROM projects p WHERE p.student_id = s.id) as project_count
       FROM students s JOIN users u ON s.user_id = u.id
       ${whereClause}
       ORDER BY verified_skill_count DESC, s.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const filtered = minVerifiedSkills
      ? candidates.filter((c) => c.verified_skill_count >= Number(minVerifiedSkills))
      : candidates;

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM students s ${whereClause}`, params);

    res.json({ candidates: filtered, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Recruiter search error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
