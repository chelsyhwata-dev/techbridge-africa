const pool = require('../config/db');
const { notify } = require('../utils/notify');

exports.send = async (req, res) => {
  const { recipientId, body } = req.body;
  if (!recipientId || !body) return res.status(400).json({ message: 'recipientId and body are required' });
  if (Number(recipientId) === req.user.id) return res.status(400).json({ message: 'Cannot message yourself' });

  try {
    const [recipient] = await pool.query('SELECT id, name FROM users WHERE id = ?', [recipientId]);
    if (recipient.length === 0) return res.status(404).json({ message: 'Recipient not found' });

    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, recipient_id, body) VALUES (?, ?, ?)',
      [req.user.id, recipientId, body.slice(0, 5000)]
    );

    await notify(recipientId, 'message', `New message from ${req.user.name}`, '/messages');
    res.status(201).json({ message: 'Message sent', id: result.insertId });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// List conversations: one row per counterpart, with the latest message.
exports.listConversations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         IF(m.sender_id = ?, m.recipient_id, m.sender_id) as counterpart_id,
         u.name as counterpart_name, u.profile_image as counterpart_image,
         m.body as last_message, m.sent_at as last_sent_at,
         SUM(CASE WHEN m.recipient_id = ? AND m.read_at IS NULL THEN 1 ELSE 0 END) as unread_count
       FROM messages m
       JOIN users u ON u.id = IF(m.sender_id = ?, m.recipient_id, m.sender_id)
       WHERE m.sender_id = ? OR m.recipient_id = ?
       GROUP BY counterpart_id
       ORDER BY MAX(m.sent_at) DESC`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('List conversations error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getConversation = async (req, res) => {
  const otherId = req.params.userId;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
       ORDER BY sent_at ASC`,
      [req.user.id, otherId, otherId, req.user.id]
    );

    await pool.query('UPDATE messages SET read_at = NOW() WHERE recipient_id = ? AND sender_id = ? AND read_at IS NULL', [req.user.id, otherId]);

    res.json(rows);
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
