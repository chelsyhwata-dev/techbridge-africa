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

// Employer Analytics (PRD 8.8)
exports.getAnalytics = async (req, res) => {
  try {
    const [company] = await pool.query('SELECT id FROM companies WHERE user_id = ?', [req.user.id]);
    if (company.length === 0) return res.status(404).json({ message: 'Company not found' });

    const [jobs] = await pool.query(
      `SELECT j.id, j.title, j.status, j.created_at,
              (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applicant_count,
              (SELECT COUNT(*) FROM job_views v WHERE v.job_id = j.id) as view_count
       FROM jobs j WHERE j.company_id = ? ORDER BY j.created_at DESC`,
      [company[0].id]
    );

    const withCtr = jobs.map((j) => ({
      ...j,
      clickThroughRate: j.view_count > 0 ? Math.round((j.applicant_count / j.view_count) * 1000) / 10 : 0,
    }));

    const [[{ avgTimeToHireDays }]] = await pool.query(
      `SELECT AVG(DATEDIFF(a.updated_at, a.applied_at)) as avgTimeToHireDays
       FROM applications a JOIN jobs j ON a.job_id = j.id
       WHERE j.company_id = ? AND a.status IN ('offer','hired','accepted')`,
      [company[0].id]
    );

    const totalApplicants = jobs.reduce((sum, j) => sum + j.applicant_count, 0);
    const totalViews = jobs.reduce((sum, j) => sum + j.view_count, 0);

    res.json({
      jobs: withCtr,
      totalApplicants,
      totalViews,
      overallClickThroughRate: totalViews > 0 ? Math.round((totalApplicants / totalViews) * 1000) / 10 : 0,
      avgTimeToHireDays: avgTimeToHireDays != null ? Math.round(avgTimeToHireDays) : null,
    });
  } catch (err) {
    console.error('Employer analytics error:', err);
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
