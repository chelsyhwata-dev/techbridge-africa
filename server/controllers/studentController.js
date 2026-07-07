const pool = require('../config/db');
const { profileCompletion, readinessScore } = require('../ai/readiness');
const { awardBadge } = require('../utils/badges');

function slugify(name, id) {
  const base = String(name || 'student').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  return `${base || 'student'}-${id}`;
}

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, u.name, u.email, u.profile_image
       FROM students s JOIN users u ON s.user_id = u.id
       WHERE s.user_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Profile not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get student profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const {
    university, yearOfStudy, location, country, bio, skills, githubUrl, linkedinUrl, status, graduationYear,
    headline, degree, city, careerPath, availability, communicationSelfScore,
  } = req.body;

  try {
    await pool.query(
      `UPDATE students SET university = ?, year_of_study = ?, location = ?, country = ?,
       status = ?, graduation_year = ?, bio = ?, skills = ?, github_url = ?, linkedin_url = ?,
       headline = ?, degree = ?, city = ?, career_path = ?, availability = ?, communication_self_score = ?
       WHERE user_id = ?`,
      [
        university, yearOfStudy, location, country || 'South Africa',
        status || 'Current Student', graduationYear || null,
        bio, JSON.stringify(skills || []), githubUrl, linkedinUrl,
        headline || null, degree || null, city || null, careerPath || null,
        availability || null, communicationSelfScore != null ? communicationSelfScore : null,
        req.user.id,
      ]
    );

    if (req.body.name) {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [req.body.name, req.user.id]);
    }

    const [student] = await pool.query('SELECT id, portfolio_slug FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length > 0 && !student[0].portfolio_slug) {
      const slug = slugify(req.body.name, student[0].id);
      await pool.query('UPDATE students SET portfolio_slug = ? WHERE id = ?', [slug, student[0].id]);
    }

    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('Update student profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadCV = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const filePath = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE students SET cv_path = ? WHERE user_id = ?', [filePath, req.user.id]);
    await pool.query(
      'INSERT INTO uploads (user_id, file_path, file_type, original_name, file_size) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, filePath, 'cv', req.file.originalname, req.file.size]
    );
    res.json({ message: 'CV uploaded', path: filePath });
  } catch (err) {
    console.error('CV upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadProfileImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const filePath = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [filePath, req.user.id]);
    await pool.query(
      'INSERT INTO uploads (user_id, file_path, file_type, original_name, file_size) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, filePath, 'profile_image', req.file.originalname, req.file.size]
    );
    res.json({ message: 'Profile image uploaded', path: filePath });
  } catch (err) {
    console.error('Profile image upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.university, s.year_of_study, s.location, s.country, s.bio, s.skills,
              s.github_url, s.linkedin_url, s.headline, s.degree, s.career_path, s.portfolio_slug,
              s.github_username, u.name, u.profile_image
       FROM students s JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });

    if (req.user && req.user.role !== 'student') {
      await pool.query('INSERT INTO profile_views (student_id, viewer_user_id) VALUES (?, ?)', [req.params.id, req.user.id]);
    }

    const [projects] = await pool.query('SELECT id, title, description, repo_url, demo_url, tech_stack FROM projects WHERE student_id = ? ORDER BY created_at DESC', [req.params.id]);
    const [verifiedSkills] = await pool.query(
      `SELECT sk.name FROM student_skills ss JOIN skills sk ON ss.skill_id = sk.id WHERE ss.student_id = ? AND ss.verified = TRUE`,
      [req.params.id]
    );

    res.json({ ...rows[0], projects, verifiedSkills: verifiedSkills.map((v) => v.name) });
  } catch (err) {
    console.error('Get public profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Portfolio Builder (PRD 6.5): public page at /u/:slug
exports.getPortfolioBySlug = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.university, s.year_of_study, s.location, s.country, s.bio, s.skills,
              s.github_url, s.linkedin_url, s.headline, s.degree, s.career_path, s.github_username,
              u.name, u.profile_image
       FROM students s JOIN users u ON s.user_id = u.id
       WHERE s.portfolio_slug = ?`,
      [req.params.slug]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Portfolio not found' });

    await pool.query('INSERT INTO profile_views (student_id, viewer_user_id) VALUES (?, ?)', [rows[0].id, req.user ? req.user.id : null]);

    const [projects] = await pool.query('SELECT id, title, description, repo_url, demo_url, tech_stack FROM projects WHERE student_id = ? ORDER BY created_at DESC', [rows[0].id]);
    const [verifiedSkills] = await pool.query(
      `SELECT sk.name FROM student_skills ss JOIN skills sk ON ss.skill_id = sk.id WHERE ss.student_id = ? AND ss.verified = TRUE`,
      [rows[0].id]
    );

    res.json({ ...rows[0], projects, verifiedSkills: verifiedSkills.map((v) => v.name) });
  } catch (err) {
    console.error('Get portfolio by slug error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Profile Completion Score (PRD 6.2)
exports.getCompletion = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, u.profile_image FROM students s JOIN users u ON s.user_id = u.id WHERE s.user_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Student profile not found' });
    const student = rows[0];

    const [[{ skillCount }]] = await pool.query('SELECT COUNT(*) as skillCount FROM student_skills WHERE student_id = ?', [student.id]);
    const [[{ projectCount }]] = await pool.query('SELECT COUNT(*) as projectCount FROM projects WHERE student_id = ?', [student.id]);

    const result = profileCompletion(student, student, skillCount, projectCount);
    if (result.score === 100) await awardBadge(req.user.id, 'profile_complete');

    res.json(result);
  } catch (err) {
    console.error('Get completion error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Internship Readiness Score (PRD 6.8)
exports.getReadiness = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, u.profile_image FROM students s JOIN users u ON s.user_id = u.id WHERE s.user_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Student profile not found' });
    const student = rows[0];

    const [[{ skillCount }]] = await pool.query('SELECT COUNT(*) as skillCount FROM student_skills WHERE student_id = ?', [student.id]);
    const [[{ verifiedCount }]] = await pool.query('SELECT COUNT(*) as verifiedCount FROM student_skills WHERE student_id = ? AND verified = TRUE', [student.id]);
    const [[{ projectCount }]] = await pool.query('SELECT COUNT(*) as projectCount FROM projects WHERE student_id = ?', [student.id]);
    const [[{ applicationCount }]] = await pool.query('SELECT COUNT(*) as applicationCount FROM applications WHERE student_id = ?', [student.id]);

    const result = readinessScore({ student, user: student, skillCount, verifiedCount, projectCount, applicationCount });
    res.json(result);
  } catch (err) {
    console.error('Get readiness error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student Analytics (PRD 6.9)
exports.getAnalytics = async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id, cv_path FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    const [[{ profileViews }]] = await pool.query('SELECT COUNT(*) as profileViews FROM profile_views WHERE student_id = ?', [student[0].id]);
    const [[{ recruiterViews }]] = await pool.query(
      `SELECT COUNT(DISTINCT pv.id) as recruiterViews FROM profile_views pv
       JOIN users u ON pv.viewer_user_id = u.id WHERE pv.student_id = ? AND u.role = 'company'`,
      [student[0].id]
    );
    const [[{ applicationsSent }]] = await pool.query('SELECT COUNT(*) as applicationsSent FROM applications WHERE student_id = ?', [student[0].id]);
    const [[{ interviewInvites }]] = await pool.query(
      `SELECT COUNT(*) as interviewInvites FROM applications WHERE student_id = ? AND status IN ('interview','offer','hired','accepted')`,
      [student[0].id]
    );
    const [statusBreakdown] = await pool.query(
      'SELECT status, COUNT(*) as count FROM applications WHERE student_id = ? GROUP BY status',
      [student[0].id]
    );

    res.json({ profileViews, recruiterViews, resumeDownloads: 0, applicationsSent, interviewInvites, statusBreakdown });
  } catch (err) {
    console.error('Get analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
