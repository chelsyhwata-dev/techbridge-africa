const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

exports.submitMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await pool.query(
      'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );

    // Send email notification to site admin
    sendEmail(
      process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      `New Contact Message from ${name}`,
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent via TechBridge Africa contact form`
    ).catch(err => console.log('[Contact email skipped]', err.message));

    // Auto-reply to sender
    sendEmail(
      email,
      'Thanks for contacting TechBridge Africa',
      `Hi ${name},\n\nThank you for reaching out! We received your message and will get back to you within 24-48 hours.\n\nBest regards,\nTechBridge Africa Team`
    ).catch(err => console.log('[Auto-reply skipped]', err.message));

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const [messages] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    const [[{ unread }]] = await pool.query('SELECT COUNT(*) as unread FROM contact_messages WHERE is_read = FALSE');
    res.json({ messages, unread });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markRead = async (req, res) => {
  try {
    await pool.query('UPDATE contact_messages SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await pool.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
