const pool = require('../config/db');

// Fire-and-forget in-app notification. Never throws — a failed notification
// must not break the action that triggered it.
async function notify(userId, type, content, link = null) {
  try {
    await pool.query(
      'INSERT INTO notifications (user_id, type, content, link) VALUES (?, ?, ?, ?)',
      [userId, type, content.slice(0, 500), link]
    );
  } catch (err) {
    console.error('Notification insert failed:', err.message);
  }
}

module.exports = { notify };
