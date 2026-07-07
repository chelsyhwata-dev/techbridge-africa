const pool = require('../config/db');

// Community: Events, Hackathons, Career Fairs (PRD 10) — discovery/listing only;
// registration happens via the external `url` (not a hosted hackathon platform).
exports.list = async (req, res) => {
  const { type } = req.query;
  try {
    let where = ['event_date >= NOW() - INTERVAL 1 DAY'];
    let params = [];
    if (type) { where.push('type = ?'); params.push(type); }

    const [rows] = await pool.query(
      `SELECT * FROM events WHERE ${where.join(' AND ')} ORDER BY event_date ASC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error('List events error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const { title, type, description, location, isVirtual, eventDate, url } = req.body;
  if (!title || !eventDate) return res.status(400).json({ message: 'title and eventDate are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO events (title, type, description, location, is_virtual, event_date, url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, type || 'meetup', description || null, location || null, !!isVirtual, eventDate, url || null, req.user.id]
    );
    res.status(201).json({ message: 'Event created', eventId: result.insertId });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
