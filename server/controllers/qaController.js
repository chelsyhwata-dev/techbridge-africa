const pool = require('../config/db');

// Community Q&A (PRD 10): a single, simple question-and-answer space.
exports.listQuestions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT q.id, q.title, q.body, q.created_at, u.name as author_name, u.role as author_role,
              (SELECT COUNT(*) FROM qa_answers WHERE question_id = q.id) as answer_count
       FROM qa_questions q JOIN users u ON q.user_id = u.id
       ORDER BY q.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('List questions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const [question] = await pool.query(
      `SELECT q.id, q.title, q.body, q.created_at, u.name as author_name, u.role as author_role
       FROM qa_questions q JOIN users u ON q.user_id = u.id WHERE q.id = ?`,
      [req.params.id]
    );
    if (question.length === 0) return res.status(404).json({ message: 'Question not found' });

    const [answers] = await pool.query(
      `SELECT a.id, a.body, a.created_at, u.name as author_name, u.role as author_role
       FROM qa_answers a JOIN users u ON a.user_id = u.id WHERE a.question_id = ? ORDER BY a.created_at ASC`,
      [req.params.id]
    );

    res.json({ ...question[0], answers });
  } catch (err) {
    console.error('Get question error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.askQuestion = async (req, res) => {
  const { title, body } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  try {
    const [result] = await pool.query('INSERT INTO qa_questions (user_id, title, body) VALUES (?, ?, ?)', [req.user.id, title, body || null]);
    res.status(201).json({ message: 'Question posted', questionId: result.insertId });
  } catch (err) {
    console.error('Ask question error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.answerQuestion = async (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ message: 'Answer body is required' });

  try {
    const [question] = await pool.query('SELECT id FROM qa_questions WHERE id = ?', [req.params.id]);
    if (question.length === 0) return res.status(404).json({ message: 'Question not found' });

    const [result] = await pool.query('INSERT INTO qa_answers (question_id, user_id, body) VALUES (?, ?, ?)', [req.params.id, req.user.id, body]);
    res.status(201).json({ message: 'Answer posted', answerId: result.insertId });
  } catch (err) {
    console.error('Answer question error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
