const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

exports.apply = async (req, res) => {
  const { jobId, coverLetter } = req.body;

  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    const [job] = await pool.query(
      'SELECT j.title, j.status, c.company_name, u.email as company_email FROM jobs j JOIN companies c ON j.company_id = c.id JOIN users u ON c.user_id = u.id WHERE j.id = ?',
      [jobId]
    );
    if (job.length === 0) return res.status(404).json({ message: 'Job not found' });
    if (job[0].status !== 'open') return res.status(400).json({ message: 'Job is no longer accepting applications' });

    await pool.query(
      'INSERT INTO applications (student_id, job_id, cover_letter) VALUES (?, ?, ?)',
      [student[0].id, jobId, coverLetter]
    );

    res.status(201).json({ message: 'Application submitted' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'You have already applied to this job' });
    }
    console.error('Apply error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentApplications = async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    const [applications] = await pool.query(
      `SELECT a.*, j.title, j.type, j.location, c.company_name, c.logo_path
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.applied_at DESC`,
      [student[0].id]
    );

    res.json(applications);
  } catch (err) {
    console.error('Get student applications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getJobApplicants = async (req, res) => {
  try {
    const [company] = await pool.query('SELECT id FROM companies WHERE user_id = ?', [req.user.id]);
    if (company.length === 0) return res.status(404).json({ message: 'Company not found' });

    const [job] = await pool.query('SELECT id FROM jobs WHERE id = ? AND company_id = ?', [req.params.jobId, company[0].id]);
    if (job.length === 0) return res.status(403).json({ message: 'Not authorized' });

    const [applicants] = await pool.query(
      `SELECT a.id, a.status, a.cover_letter, a.applied_at,
              u.name, u.email, u.profile_image,
              s.university, s.year_of_study, s.location, s.skills, s.cv_path, s.bio
       FROM applications a
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE a.job_id = ?
       ORDER BY a.applied_at DESC`,
      [req.params.jobId]
    );

    res.json(applicants);
  } catch (err) {
    console.error('Get applicants error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const [company] = await pool.query('SELECT id FROM companies WHERE user_id = ?', [req.user.id]);
    if (company.length === 0) return res.status(404).json({ message: 'Company not found' });

    const [app] = await pool.query(
      `SELECT a.id, a.student_id, j.title, j.company_id
       FROM applications a JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ? AND j.company_id = ?`,
      [req.params.id, company[0].id]
    );
    if (app.length === 0) return res.status(403).json({ message: 'Not authorized' });

    await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);

    // Send email notification
    const [student] = await pool.query(
      'SELECT u.email, u.name FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
      [app[0].student_id]
    );
    if (student.length > 0) {
      sendEmail(
        student[0].email,
        `Application Update - ${app[0].title}`,
        `Hi ${student[0].name},\n\nYour application for "${app[0].title}" has been updated to: ${status.toUpperCase()}.\n\nLog in to NexGen Hire to view details.\n\nBest,\nNexGen Hire Team`
      ).catch(err => console.error('Email notification failed:', err));
    }

    res.json({ message: 'Application status updated' });
  } catch (err) {
    console.error('Update application status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
