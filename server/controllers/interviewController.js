const pool = require('../config/db');
const { notify } = require('../utils/notify');
const { sendEmail } = require('../utils/email');

// Interview Scheduling (PRD 8.9): company proposes a time; student confirms/declines.
// Full video conferencing is out of scope for V1 — interviews link out to Zoom/Meet/Teams.

exports.propose = async (req, res) => {
  const { applicationId, proposedTime, meetingLink, notes } = req.body;
  if (!applicationId || !proposedTime) return res.status(400).json({ message: 'applicationId and proposedTime are required' });

  try {
    const [company] = await pool.query('SELECT id FROM companies WHERE user_id = ?', [req.user.id]);
    if (company.length === 0) return res.status(404).json({ message: 'Company not found' });

    const [app] = await pool.query(
      `SELECT a.id, a.student_id, j.title, s.user_id as student_user_id, u.email as student_email, u.name as student_name
       FROM applications a JOIN jobs j ON a.job_id = j.id JOIN students s ON a.student_id = s.id JOIN users u ON s.user_id = u.id
       WHERE a.id = ? AND j.company_id = ?`,
      [applicationId, company[0].id]
    );
    if (app.length === 0) return res.status(403).json({ message: 'Not authorized' });

    const [result] = await pool.query(
      'INSERT INTO interviews (application_id, proposed_time, meeting_link, notes) VALUES (?, ?, ?, ?)',
      [applicationId, proposedTime, meetingLink || null, notes || null]
    );

    await pool.query("UPDATE applications SET status = 'interview' WHERE id = ?", [applicationId]);
    await notify(app[0].student_user_id, 'interview_proposed', `Interview proposed for "${app[0].title}"`, '/applications');
    sendEmail(
      app[0].student_email,
      `Interview Scheduled — ${app[0].title}`,
      `Hi ${app[0].student_name},\n\nAn interview has been proposed for your application to "${app[0].title}" at ${new Date(proposedTime).toLocaleString()}.\n${meetingLink ? `Meeting link: ${meetingLink}\n` : ''}\nLog in to NexGen Hire to confirm.\n\nBest,\nNexGen Hire Team`
    ).catch((err) => console.error('Interview email failed:', err));

    res.status(201).json({ message: 'Interview proposed', interviewId: result.insertId });
  } catch (err) {
    console.error('Propose interview error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.respond = async (req, res) => {
  const { status } = req.body; // 'confirmed' | 'declined'
  if (!['confirmed', 'declined'].includes(status)) return res.status(400).json({ message: 'status must be confirmed or declined' });

  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    const [interview] = await pool.query(
      `SELECT i.id, a.student_id FROM interviews i JOIN applications a ON i.application_id = a.id WHERE i.id = ?`,
      [req.params.id]
    );
    if (interview.length === 0 || interview[0].student_id !== student[0].id) return res.status(403).json({ message: 'Not authorized' });

    await pool.query('UPDATE interviews SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Interview ${status}` });
  } catch (err) {
    console.error('Respond interview error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listForApplication = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM interviews WHERE application_id = ? ORDER BY proposed_time DESC', [req.params.applicationId]);
    res.json(rows);
  } catch (err) {
    console.error('List interviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// .ics calendar export for a confirmed interview.
exports.exportIcs = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.proposed_time, i.meeting_link, j.title, c.company_name
       FROM interviews i
       JOIN applications a ON i.application_id = a.id
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE i.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Interview not found' });

    const { proposed_time, meeting_link, title, company_name } = rows[0];
    const start = new Date(proposed_time);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NexGen Hire//Interview//EN', 'BEGIN:VEVENT',
      `UID:interview-${req.params.id}@nexgenhire`,
      `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
      `SUMMARY:Interview — ${title} at ${company_name}`,
      meeting_link ? `DESCRIPTION:Meeting link: ${meeting_link}` : 'DESCRIPTION:Interview via NexGen Hire',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');

    res.header('Content-Type', 'text/calendar');
    res.header('Content-Disposition', 'attachment; filename=interview.ics');
    res.send(ics);
  } catch (err) {
    console.error('Export ics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
