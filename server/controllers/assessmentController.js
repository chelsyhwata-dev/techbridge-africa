const pool = require('../config/db');
const { awardBadge } = require('../utils/badges');
const { notify } = require('../utils/notify');

exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.title, a.difficulty, a.pass_mark, sk.name as skill_name, sk.id as skill_id,
              JSON_LENGTH(a.questions_json) as question_count
       FROM assessments a JOIN skills sk ON a.skill_id = sk.id
       ORDER BY sk.name, a.difficulty`
    );
    res.json(rows);
  } catch (err) {
    console.error('List assessments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Returns questions WITHOUT the correct answer index.
exports.getQuestions = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, title, difficulty, pass_mark, questions_json FROM assessments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Assessment not found' });

    let questions = rows[0].questions_json;
    if (typeof questions === 'string') questions = JSON.parse(questions);

    res.json({
      id: rows[0].id,
      title: rows[0].title,
      difficulty: rows[0].difficulty,
      passMark: rows[0].pass_mark,
      questions: questions.map((q, i) => ({ index: i, q: q.q, options: q.options })),
    });
  } catch (err) {
    console.error('Get assessment questions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submit = async (req, res) => {
  const { answers } = req.body; // array of selected option indices, same order as questions
  if (!Array.isArray(answers)) return res.status(400).json({ message: 'answers array is required' });

  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    const [assessment] = await pool.query('SELECT skill_id, pass_mark, questions_json FROM assessments WHERE id = ?', [req.params.id]);
    if (assessment.length === 0) return res.status(404).json({ message: 'Assessment not found' });

    let questions = assessment[0].questions_json;
    if (typeof questions === 'string') questions = JSON.parse(questions);

    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= assessment[0].pass_mark;

    await pool.query(
      'INSERT INTO assessment_results (student_id, assessment_id, score, passed) VALUES (?, ?, ?, ?)',
      [student[0].id, req.params.id, score, passed]
    );

    if (passed) {
      const [existing] = await pool.query('SELECT id, verified FROM student_skills WHERE student_id = ? AND skill_id = ?', [student[0].id, assessment[0].skill_id]);
      if (existing.length > 0) {
        await pool.query('UPDATE student_skills SET verified = TRUE, verified_at = NOW() WHERE id = ?', [existing[0].id]);
      } else {
        await pool.query('INSERT INTO student_skills (student_id, skill_id, proficiency, verified, verified_at) VALUES (?, ?, ?, TRUE, NOW())', [student[0].id, assessment[0].skill_id, 'Intermediate']);
      }
      await awardBadge(req.user.id, 'first_verified_skill');
      await notify(req.user.id, 'assessment_passed', `You passed the assessment and earned a Verified Skill badge!`, '/student/skills');
    }

    res.json({ score, passed, correct, total: questions.length });
  } catch (err) {
    console.error('Submit assessment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyResults = async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    const [rows] = await pool.query(
      `SELECT ar.id, ar.score, ar.passed, ar.completed_at, a.title, a.difficulty, sk.name as skill_name
       FROM assessment_results ar JOIN assessments a ON ar.assessment_id = a.id JOIN skills sk ON a.skill_id = sk.id
       WHERE ar.student_id = ? ORDER BY ar.completed_at DESC`,
      [student[0].id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get assessment results error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
