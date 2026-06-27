const pool = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.name, u.email, u.profile_image
       FROM companies c JOIN users u ON c.user_id = u.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Company profile not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get company profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { companyName, industry, location, country, website, description } = req.body;

  try {
    await pool.query(
      `UPDATE companies SET company_name = ?, industry = ?, location = ?,
       country = ?, website = ?, description = ? WHERE user_id = ?`,
      [companyName, industry, location, country || 'South Africa', website, description, req.user.id]
    );
    res.json({ message: 'Company profile updated' });
  } catch (err) {
    console.error('Update company profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadLogo = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const filePath = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE companies SET logo_path = ? WHERE user_id = ?', [filePath, req.user.id]);
    await pool.query(
      'INSERT INTO uploads (user_id, file_path, file_type, original_name, file_size) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, filePath, 'company_logo', req.file.originalname, req.file.size]
    );
    res.json({ message: 'Logo uploaded', path: filePath });
  } catch (err) {
    console.error('Logo upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.company_name, c.logo_path, c.industry, c.location, c.country,
              c.website, c.description, c.verified
       FROM companies c WHERE c.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Company not found' });

    const [jobs] = await pool.query(
      'SELECT id, title, type, location, created_at FROM jobs WHERE company_id = ? AND status = ?',
      [req.params.id, 'open']
    );

    res.json({ ...rows[0], openJobs: jobs });
  } catch (err) {
    console.error('Get public company profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
