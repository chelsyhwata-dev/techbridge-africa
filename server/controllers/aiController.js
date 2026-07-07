const pool = require('../config/db');
const path = require('path');
const fs = require('fs');
const { analyzeResume } = require('../ai/resumeAnalyzer');
const { CAREER_PATHS, LOCATION_FACTOR, resolvePath, normalizeSkill } = require('../ai/careerData');
const { QUESTION_BANK, scoreAnswer } = require('../ai/interviewSimulator');
const { generateJobDescription } = require('../ai/jobDescriptionGenerator');
const { explainMatch } = require('../ai/matchEngine');

async function getStudentSkillNames(userId) {
  const [student] = await pool.query('SELECT id, skills FROM students WHERE user_id = ?', [userId]);
  if (student.length === 0) return { studentId: null, skills: [] };
  let skills = student[0].skills;
  if (typeof skills === 'string') skills = JSON.parse(skills);
  return { studentId: student[0].id, skills: skills || [] };
}

// 7.2 AI Resume Analyzer — analyzes the student's already-uploaded CV, or raw pasted text.
exports.analyzeResumeEndpoint = async (req, res) => {
  try {
    let text = req.body.text;

    if (!text) {
      const [student] = await pool.query('SELECT cv_path FROM students WHERE user_id = ?', [req.user.id]);
      if (student.length === 0 || !student[0].cv_path) {
        return res.status(400).json({ message: 'Upload a CV first, or paste resume text to analyze.' });
      }
      const filePath = path.join(__dirname, '..', student[0].cv_path.replace(/^\/uploads\//, 'uploads/'));
      if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Stored CV file not found' });

      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    }

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ message: 'Could not extract enough text to analyze. Try pasting your resume text directly.' });
    }

    const result = analyzeResume(text);
    res.json(result);
  } catch (err) {
    console.error('Resume analysis error:', err);
    res.status(500).json({ message: 'Server error analyzing resume' });
  }
};

// 7.1 AI Career Coach — compares profile against a stated goal role.
exports.careerCoach = async (req, res) => {
  const { goal } = req.body;
  if (!goal) return res.status(400).json({ message: 'Tell me what role you want to work toward, e.g. "I want to become a backend developer".' });

  try {
    const { skills } = await getStudentSkillNames(req.user.id);
    const path = resolvePath(goal);

    if (!path) {
      return res.json({
        message: `I don't have a structured roadmap for "${goal}" yet. Try one of: ${Object.keys(CAREER_PATHS).join(', ')}.`,
        matchedPath: null,
      });
    }

    const pathData = CAREER_PATHS[path];
    const { matched, missing } = explainMatch(skills, pathData.skills);

    res.json({
      matchedPath: path,
      have: matched,
      missing,
      monthsToReady: pathData.monthsToReady,
      roadmap: pathData.roadmap,
      recommendedProjects: pathData.projects,
      recommendedCertifications: pathData.certifications,
      message: `You already have ${matched.length ? matched.map((s) => `✔ ${s}`).join(' ') : 'none of the core skills yet'}. Still needed: ${missing.length ? missing.map((s) => `✖ ${s}`).join(' ') : 'nothing — you\'re fully covered!'}. Recommended path: ${pathData.monthsToReady} months.`,
    });
  } catch (err) {
    console.error('Career coach error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 7.3 AI Skill Gap Analysis — vs a career path OR a specific job posting.
exports.skillGap = async (req, res) => {
  const { targetPath, jobId } = req.body;

  try {
    const { skills } = await getStudentSkillNames(req.user.id);
    let targetSkills, courses = [], projects = [], label;

    if (jobId) {
      const [job] = await pool.query('SELECT title, required_skills FROM jobs WHERE id = ?', [jobId]);
      if (job.length === 0) return res.status(404).json({ message: 'Job not found' });
      targetSkills = job[0].required_skills;
      if (typeof targetSkills === 'string') targetSkills = JSON.parse(targetSkills);
      label = job[0].title;
    } else {
      const path = resolvePath(targetPath || '') || targetPath;
      const pathData = CAREER_PATHS[path];
      if (!pathData) return res.status(400).json({ message: `Unknown target. Choose one of: ${Object.keys(CAREER_PATHS).join(', ')}`, availablePaths: Object.keys(CAREER_PATHS) });
      targetSkills = pathData.skills;
      courses = pathData.certifications;
      projects = pathData.projects.slice(0, 1);
      label = path;
    }

    const { matched, missing } = explainMatch(skills, targetSkills || []);
    res.json({ target: label, have: matched, missing, suggestedCourses: courses, suggestedProjects: projects });
  } catch (err) {
    console.error('Skill gap error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 7.4 AI Interview Simulator
exports.getInterviewQuestions = (req, res) => {
  const { category } = req.query;
  const questions = category
    ? QUESTION_BANK.filter((q) => q.category.toLowerCase() === category.toLowerCase())
    : QUESTION_BANK;
  res.json(questions.map(({ id, category, question }) => ({ id, category, question })));
};

exports.submitInterviewAnswer = (req, res) => {
  const { questionId, answer } = req.body;
  if (!questionId || !answer) return res.status(400).json({ message: 'questionId and answer are required' });

  const result = scoreAnswer(questionId, answer);
  if (!result) return res.status(404).json({ message: 'Question not found' });
  res.json(result);
};

// 7.6 AI Job Description Generator (for companies)
exports.generateJobDescriptionEndpoint = async (req, res) => {
  const { prompt, type } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Describe the role in a sentence or two.' });

  try {
    const [company] = await pool.query('SELECT company_name FROM companies WHERE user_id = ?', [req.user.id]);
    const companyName = company.length > 0 ? company[0].company_name : 'our company';

    const result = generateJobDescription({ prompt, companyName, type: type || 'internship' });
    res.json(result);
  } catch (err) {
    console.error('Job description generation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 7.7 AI Salary Predictor
exports.predictSalary = async (req, res) => {
  const { role, location, experienceLevel } = req.body;
  if (!role) return res.status(400).json({ message: 'A target role is required' });

  try {
    const path = resolvePath(role) || role;
    const pathData = CAREER_PATHS[path];
    if (!pathData) return res.status(400).json({ message: `Unknown role. Choose one of: ${Object.keys(CAREER_PATHS).join(', ')}`, availableRoles: Object.keys(CAREER_PATHS) });

    const level = ['entry', 'junior', 'mid'].includes(experienceLevel) ? experienceLevel : 'entry';
    const [lowBase, highBase] = pathData.salary[level];

    const locKey = String(location || '').toLowerCase().trim();
    const factor = LOCATION_FACTOR[locKey] ?? 1.0;

    const low = Math.round((lowBase * factor) / 500) * 500;
    const high = Math.round((highBase * factor) / 500) * 500;

    res.json({
      role: path,
      experienceLevel: level,
      location: location || 'National average',
      currency: 'ZAR',
      period: 'month',
      range: [low, high],
      note: 'Estimate based on South African junior-market data and role-typical skill requirements. Actual offers vary by company size and sector.',
    });
  } catch (err) {
    console.error('Salary prediction error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 7.8 AI Portfolio Generator — drafts About/bio copy from existing profile data.
exports.generatePortfolioDraft = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, u.name FROM students s JOIN users u ON s.user_id = u.id WHERE s.user_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Student profile not found' });
    const student = rows[0];

    let skills = student.skills;
    if (typeof skills === 'string') skills = JSON.parse(skills);
    const [projects] = await pool.query('SELECT title, description, tech_stack FROM projects WHERE student_id = ?', [student.id]);

    const skillsList = (skills || []).slice(0, 6).join(', ') || 'a growing set of technical skills';
    const path = student.career_path || null;

    const about = `${student.name} is a ${student.year_of_study || ''} student${student.university ? ` at ${student.university}` : ''}${path ? `, focused on ${path}` : ''}. Skilled in ${skillsList}, ${student.name.split(' ')[0]} ${projects.length ? `has built ${projects.length} project${projects.length > 1 ? 's' : ''} demonstrating hands-on ability` : 'is actively building a portfolio of hands-on projects'}. ${student.bio ? student.bio : `Currently looking for opportunities to apply these skills in a real engineering team.`}`.replace(/\s+/g, ' ').trim();

    const projectDescriptions = projects.map((p) => ({
      title: p.title,
      draft: p.description || `A project built with ${p.tech_stack || 'a modern tech stack'}, demonstrating practical application of ${student.name.split(' ')[0]}'s skills.`,
    }));

    const headline = path ? `Aspiring ${path.replace(' Development', ' Developer').replace(' Engineering', ' Engineer')}` : `${student.year_of_study || 'Student'} Software Developer`;

    res.json({ headline, about, projectDescriptions });
  } catch (err) {
    console.error('Portfolio generation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
