const pool = require('../config/db');

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
  const { university, yearOfStudy, location, country, bio, skills, githubUrl, linkedinUrl, status, graduationYear } = req.body;

  try {
    await pool.query(
      `UPDATE students SET university = ?, year_of_study = ?, location = ?, country = ?,
       status = ?, graduation_year = ?, bio = ?, skills = ?, github_url = ?, linkedin_url = ? WHERE user_id = ?`,
      [
        university, yearOfStudy, location, country || 'South Africa',
        status || 'Current Student', graduationYear || null,
        bio, JSON.stringify(skills || []), githubUrl, linkedinUrl, req.user.id,
      ]
    );

    if (req.body.name) {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [req.body.name, req.user.id]);
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
      `SELECT s.university, s.year_of_study, s.location, s.country, s.bio, s.skills,
              s.github_url, s.linkedin_url, u.name, u.profile_image
       FROM students s JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get public profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
