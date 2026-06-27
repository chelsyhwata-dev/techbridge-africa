const pool = require('../config/db');

exports.create = async (req, res) => {
  const { title, description, requiredSkills, location, type, industry, experienceLevel, salaryRange, applicationDeadline } = req.body;

  try {
    const [company] = await pool.query('SELECT id FROM companies WHERE user_id = ?', [req.user.id]);
    if (company.length === 0) return res.status(404).json({ message: 'Company profile not found' });

    const [result] = await pool.query(
      `INSERT INTO jobs (company_id, title, description, required_skills, location, type, industry, experience_level, salary_range, application_deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company[0].id, title, description, JSON.stringify(requiredSkills), location, type, industry, experienceLevel || 'entry', salaryRange, applicationDeadline]
    );

    res.status(201).json({ message: 'Job posted', jobId: result.insertId });
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  const { search, skill, location, type, industry, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let where = ['j.status = ?'];
    let params = ['open'];

    if (search) {
      where.push('(j.title LIKE ? OR j.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (location) {
      where.push('j.location LIKE ?');
      params.push(`%${location}%`);
    }
    if (type) {
      where.push('j.type = ?');
      params.push(type);
    }
    if (industry) {
      where.push('j.industry LIKE ?');
      params.push(`%${industry}%`);
    }
    if (skill) {
      where.push('JSON_CONTAINS(j.required_skills, ?)');
      params.push(JSON.stringify(skill));
    }

    const whereClause = where.join(' AND ');

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM jobs j WHERE ${whereClause}`, params
    );

    const [jobs] = await pool.query(
      `SELECT j.*, c.company_name, c.logo_path, c.verified
       FROM jobs j JOIN companies c ON j.company_id = c.id
       WHERE ${whereClause}
       ORDER BY j.is_premium DESC, j.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    res.json({
      jobs,
      pagination: {
        total: countResult[0].total,
        page: Number(page),
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT j.*, c.company_name, c.logo_path, c.location as company_location,
              c.industry as company_industry, c.website, c.verified
       FROM jobs j JOIN companies c ON j.company_id = c.id
       WHERE j.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Job not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const { title, description, requiredSkills, location, type, industry, experienceLevel, salaryRange, applicationDeadline, status } = req.body;

  try {
    const [company] = await pool.query('SELECT id FROM companies WHERE user_id = ?', [req.user.id]);
    if (company.length === 0) return res.status(404).json({ message: 'Company not found' });

    const [job] = await pool.query('SELECT id FROM jobs WHERE id = ? AND company_id = ?', [req.params.id, company[0].id]);
    if (job.length === 0) return res.status(403).json({ message: 'Not authorized to edit this job' });

    await pool.query(
      `UPDATE jobs SET title = ?, description = ?, required_skills = ?, location = ?,
       type = ?, industry = ?, experience_level = ?, salary_range = ?,
       application_deadline = ?, status = ? WHERE id = ?`,
      [title, description, JSON.stringify(requiredSkills), location, type, industry, experienceLevel, salaryRange, applicationDeadline, status || 'open', req.params.id]
    );

    res.json({ message: 'Job updated' });
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const [company] = await pool.query('SELECT id FROM companies WHERE user_id = ?', [req.user.id]);
    if (company.length === 0) return res.status(404).json({ message: 'Company not found' });

    const [result] = await pool.query('DELETE FROM jobs WHERE id = ? AND company_id = ?', [req.params.id, company[0].id]);
    if (result.affectedRows === 0) return res.status(403).json({ message: 'Not authorized' });

    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCompanyJobs = async (req, res) => {
  try {
    const [company] = await pool.query('SELECT id FROM companies WHERE user_id = ?', [req.user.id]);
    if (company.length === 0) return res.status(404).json({ message: 'Company not found' });

    const [jobs] = await pool.query(
      `SELECT j.*, (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as applicant_count
       FROM jobs j WHERE j.company_id = ? ORDER BY j.created_at DESC`,
      [company[0].id]
    );

    res.json(jobs);
  } catch (err) {
    console.error('Get company jobs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
