const pool = require('../config/db');
const crypto = require('crypto');
const { Parser } = require('json2csv');

exports.create = async (req, res) => {
  const { amount, type, description } = req.body;

  try {
    const [company] = await pool.query('SELECT id FROM companies WHERE user_id = ?', [req.user.id]);
    if (company.length === 0) return res.status(404).json({ message: 'Company not found' });

    const reference = `TBA-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const [result] = await pool.query(
      'INSERT INTO transactions (company_id, amount, type, reference, description) VALUES (?, ?, ?, ?, ?)',
      [company[0].id, amount, type, reference, description]
    );

    res.status(201).json({ message: 'Transaction created', transactionId: result.insertId, reference });
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCompanyTransactions = async (req, res) => {
  const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [company] = await pool.query('SELECT id FROM companies WHERE user_id = ?', [req.user.id]);
    if (company.length === 0) return res.status(404).json({ message: 'Company not found' });

    let where = ['t.company_id = ?'];
    let params = [company[0].id];

    if (status) { where.push('t.status = ?'); params.push(status); }
    if (startDate) { where.push('t.created_at >= ?'); params.push(startDate); }
    if (endDate) { where.push('t.created_at <= ?'); params.push(endDate); }

    const whereClause = where.join(' AND ');

    const [transactions] = await pool.query(
      `SELECT * FROM transactions t WHERE ${whereClause} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [total] = await pool.query(
      `SELECT COUNT(*) as count, SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as totalSpent
       FROM transactions t WHERE ${whereClause}`,
      params
    );

    res.json({ transactions, total: total[0].count, totalSpent: total[0].totalSpent || 0 });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const [company] = await pool.query('SELECT id, company_name FROM companies WHERE user_id = ?', [req.user.id]);
    if (company.length === 0) return res.status(404).json({ message: 'Company not found' });

    const [transactions] = await pool.query(
      'SELECT reference, amount, type, status, description, created_at FROM transactions WHERE company_id = ? ORDER BY created_at DESC',
      [company[0].id]
    );

    const parser = new Parser({ fields: ['reference', 'amount', 'type', 'status', 'description', 'created_at'] });
    const csv = parser.parse(transactions);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename=transactions-${company[0].company_name}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;

  try {
    await pool.query('UPDATE transactions SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Transaction status updated' });
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
