const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Attaches req.user if a valid token is present; never blocks the request.
async function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query('SELECT id, name, email, role, profile_image FROM users WHERE id = ?', [decoded.id]);
    if (rows.length > 0) req.user = rows[0];
  } catch {
    // ignore invalid/expired token — treat as anonymous
  }
  next();
}

module.exports = optionalAuthenticate;
