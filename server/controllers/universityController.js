const pool = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT un.*, u.name, u.email FROM universities un JOIN users u ON un.user_id = u.id WHERE un.user_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'University profile not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get university profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { universityName, contactPerson, website } = req.body;
  try {
    await pool.query(
      'UPDATE universities SET university_name = ?, contact_person = ?, website = ? WHERE user_id = ?',
      [universityName, contactPerson, website, req.user.id]
    );
    res.json({ message: 'University profile updated' });
  } catch (err) {
    console.error('Update university profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 9.1 Student Verification — university confirms a student is genuinely enrolled.
exports.listStudents = async (req, res) => {
  try {
    const [uni] = await pool.query('SELECT university_name FROM universities WHERE user_id = ?', [req.user.id]);
    if (uni.length === 0) return res.status(404).json({ message: 'University not found' });

    const [students] = await pool.query(
      `SELECT s.id, s.university_verified, s.year_of_study, s.degree, u.name, u.email
       FROM students s JOIN users u ON s.user_id = u.id
       WHERE s.university = ? ORDER BY s.university_verified ASC, u.name`,
      [uni[0].university_name]
    );
    res.json(students);
  } catch (err) {
    console.error('List university students error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyStudent = async (req, res) => {
  try {
    const [uni] = await pool.query('SELECT university_name FROM universities WHERE user_id = ?', [req.user.id]);
    if (uni.length === 0) return res.status(404).json({ message: 'University not found' });

    const [result] = await pool.query(
      'UPDATE students SET university_verified = TRUE WHERE id = ? AND university = ?',
      [req.params.studentId, uni[0].university_name]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found at this university' });

    res.json({ message: 'Student verified' });
  } catch (err) {
    console.error('Verify student error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 9.2 Placement Statistics
exports.getPlacementStats = async (req, res) => {
  try {
    const [uni] = await pool.query('SELECT university_name FROM universities WHERE user_id = ?', [req.user.id]);
    if (uni.length === 0) return res.status(404).json({ message: 'University not found' });

    const [[stats]] = await pool.query(
      `SELECT
         COUNT(DISTINCT s.id) as verifiedStudentCount,
         COUNT(DISTINCT CASE WHEN a.status IN ('offer','hired','accepted') THEN s.id END) as placedStudentCount,
         COUNT(DISTINCT CASE WHEN j.type IN ('internship','learnership') AND a.status IN ('offer','hired','accepted') THEN s.id END) as internshipPlacements
       FROM students s
       LEFT JOIN applications a ON a.student_id = s.id
       LEFT JOIN jobs j ON a.job_id = j.id
       WHERE s.university = ? AND s.university_verified = TRUE`,
      [uni[0].university_name]
    );
    res.json(stats);
  } catch (err) {
    console.error('Placement stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 9.3 Internship Management — internship placements originating through the platform
exports.listInternshipPlacements = async (req, res) => {
  try {
    const [uni] = await pool.query('SELECT university_name FROM universities WHERE user_id = ?', [req.user.id]);
    if (uni.length === 0) return res.status(404).json({ message: 'University not found' });

    const [rows] = await pool.query(
      `SELECT a.id, a.status, a.applied_at, u.name as student_name, j.title, c.company_name
       FROM applications a
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE s.university = ? AND j.type IN ('internship','learnership') AND a.status IN ('interview','offer','hired','accepted')
       ORDER BY a.applied_at DESC`,
      [uni[0].university_name]
    );
    res.json(rows);
  } catch (err) {
    console.error('List internship placements error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 9.4 Employer Partnerships — companies actively engaging with this university's students
exports.getEmployerPartnerships = async (req, res) => {
  try {
    const [uni] = await pool.query('SELECT university_name FROM universities WHERE user_id = ?', [req.user.id]);
    if (uni.length === 0) return res.status(404).json({ message: 'University not found' });

    const [rows] = await pool.query(
      `SELECT c.id, c.company_name, c.logo_path, c.industry, COUNT(a.id) as application_count
       FROM applications a
       JOIN students s ON a.student_id = s.id
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE s.university = ?
       GROUP BY c.id ORDER BY application_count DESC`,
      [uni[0].university_name]
    );
    res.json(rows);
  } catch (err) {
    console.error('Employer partnerships error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 9.5 Graduate Analytics — employment-rate and time-to-first-job metrics
exports.getGraduateAnalytics = async (req, res) => {
  try {
    const [uni] = await pool.query('SELECT university_name FROM universities WHERE user_id = ?', [req.user.id]);
    if (uni.length === 0) return res.status(404).json({ message: 'University not found' });

    const [[{ totalGraduates }]] = await pool.query(
      `SELECT COUNT(*) as totalGraduates FROM students WHERE university = ? AND status IN ('Recent Graduate','Alumni')`,
      [uni[0].university_name]
    );
    const [[{ employedGraduates }]] = await pool.query(
      `SELECT COUNT(DISTINCT s.id) as employedGraduates FROM students s
       JOIN applications a ON a.student_id = s.id
       WHERE s.university = ? AND s.status IN ('Recent Graduate','Alumni') AND a.status IN ('offer','hired','accepted')`,
      [uni[0].university_name]
    );
    const [[{ avgDaysToFirstOffer }]] = await pool.query(
      `SELECT AVG(DATEDIFF(a.updated_at, a.applied_at)) as avgDaysToFirstOffer
       FROM applications a JOIN students s ON a.student_id = s.id
       WHERE s.university = ? AND a.status IN ('offer','hired','accepted')`,
      [uni[0].university_name]
    );

    res.json({
      totalGraduates,
      employedGraduates,
      employmentRate: totalGraduates > 0 ? Math.round((employedGraduates / totalGraduates) * 1000) / 10 : 0,
      avgDaysToFirstOffer: avgDaysToFirstOffer != null ? Math.round(avgDaysToFirstOffer) : null,
    });
  } catch (err) {
    console.error('Graduate analytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
