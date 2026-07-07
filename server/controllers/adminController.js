const pool = require('../config/db');
const { runFraudScan } = require('../ai/fraudDetection');

exports.getFraudScan = async (req, res) => {
  try {
    const result = await runFraudScan();
    res.json(result);
  } catch (err) {
    console.error('Fraud scan error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyCompany = async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE companies SET verified = TRUE WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Company not found' });
    res.json({ message: 'Company verified' });
  } catch (err) {
    console.error('Verify company error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [[students]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const [[companies]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'company'");
    const [[jobs]] = await pool.query('SELECT COUNT(*) as count FROM jobs');
    const [[openJobs]] = await pool.query("SELECT COUNT(*) as count FROM jobs WHERE status = 'open'");
    const [[applications]] = await pool.query('SELECT COUNT(*) as count FROM applications');
    const [[revenue]] = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = 'completed'");

    const [recentApplications] = await pool.query(
      `SELECT a.id, a.status, a.applied_at, u.name as student_name, j.title as job_title
       FROM applications a
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN jobs j ON a.job_id = j.id
       ORDER BY a.applied_at DESC LIMIT 10`
    );

    res.json({
      stats: {
        totalStudents: students.count,
        totalCompanies: companies.count,
        totalJobs: jobs.count,
        openJobs: openJobs.count,
        totalApplications: applications.count,
        totalRevenue: revenue.total,
      },
      recentApplications,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let where = [];
    let params = [];
    if (role) { where.push('role = ?'); params.push(role); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [users] = await pool.query(
      `SELECT id, name, email, role, profile_image, created_at FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const [[{ count }]] = await pool.query(`SELECT COUNT(*) as count FROM users ${whereClause}`, params);

    res.json({ users, total: count });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ? AND id != ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found or cannot delete self' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const [jobs] = await pool.query(
      `SELECT j.*, c.company_name, (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applicant_count
       FROM jobs j JOIN companies c ON j.company_id = c.id ORDER BY j.created_at DESC`
    );
    res.json(jobs);
  } catch (err) {
    console.error('Admin get jobs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error('Admin delete job error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const [transactions] = await pool.query(
      `SELECT t.*, c.company_name FROM transactions t
       JOIN companies c ON t.company_id = c.id ORDER BY t.created_at DESC`
    );
    const [[{ total }]] = await pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = 'completed'");
    res.json({ transactions, totalRevenue: total });
  } catch (err) {
    console.error('Admin get transactions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportAllTransactionsCSV = async (req, res) => {
  const { Parser } = require('json2csv');
  try {
    const [transactions] = await pool.query(
      `SELECT t.reference, t.amount, t.type, t.status, t.description, t.created_at, c.company_name
       FROM transactions t JOIN companies c ON t.company_id = c.id ORDER BY t.created_at DESC`
    );

    const parser = new Parser({ fields: ['reference', 'company_name', 'amount', 'type', 'status', 'description', 'created_at'] });
    const csv = parser.parse(transactions);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=all-transactions.csv');
    res.send(csv);
  } catch (err) {
    console.error('Export all transactions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
