const pool = require('../config/db');
const { awardBadge } = require('../utils/badges');

exports.getTaxonomy = async (req, res) => {
  try {
    const [skills] = await pool.query('SELECT id, name, category FROM skills ORDER BY category, name');
    const grouped = {};
    for (const s of skills) {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push({ id: s.id, name: s.name });
    }
    res.json(grouped);
  } catch (err) {
    console.error('Get skills taxonomy error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMySkills = async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    const [rows] = await pool.query(
      `SELECT ss.id, ss.skill_id, ss.proficiency, ss.verified, ss.verified_at, s.name, s.category
       FROM student_skills ss JOIN skills s ON ss.skill_id = s.id
       WHERE ss.student_id = ? ORDER BY ss.verified DESC, s.name`,
      [student[0].id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get my skills error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addSkill = async (req, res) => {
  const { skillId, proficiency } = req.body;
  if (!skillId) return res.status(400).json({ message: 'skillId is required' });

  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    await pool.query(
      `INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE proficiency = ?`,
      [student[0].id, skillId, proficiency || 'Beginner', proficiency || 'Beginner']
    );

    res.status(201).json({ message: 'Skill added' });
  } catch (err) {
    console.error('Add skill error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeSkill = async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    await pool.query('DELETE FROM student_skills WHERE id = ? AND student_id = ?', [req.params.id, student[0].id]);
    res.json({ message: 'Skill removed' });
  } catch (err) {
    console.error('Remove skill error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
