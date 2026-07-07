const pool = require('../config/db');
const { awardBadge } = require('../utils/badges');

exports.list = async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    const [projects] = await pool.query('SELECT * FROM projects WHERE student_id = ? ORDER BY created_at DESC', [student[0].id]);
    res.json(projects);
  } catch (err) {
    console.error('List projects error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const { title, description, repoUrl, demoUrl, techStack } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    const [result] = await pool.query(
      'INSERT INTO projects (student_id, title, description, repo_url, demo_url, tech_stack) VALUES (?, ?, ?, ?, ?, ?)',
      [student[0].id, title, description || null, repoUrl || null, demoUrl || null, techStack || null]
    );

    await awardBadge(req.user.id, 'first_project');
    res.status(201).json({ message: 'Project added', projectId: result.insertId });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const { title, description, repoUrl, demoUrl, techStack } = req.body;

  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    const [result] = await pool.query(
      'UPDATE projects SET title = ?, description = ?, repo_url = ?, demo_url = ?, tech_stack = ? WHERE id = ? AND student_id = ?',
      [title, description || null, repoUrl || null, demoUrl || null, techStack || null, req.params.id, student[0].id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Project not found' });

    res.json({ message: 'Project updated' });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    const [result] = await pool.query('DELETE FROM projects WHERE id = ? AND student_id = ?', [req.params.id, student[0].id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Project not found' });

    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GitHub Integration (PRD 6.6): imports public repos as portfolio projects.
exports.importGithub = async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: 'GitHub username is required' });

  try {
    const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
    if (student.length === 0) return res.status(404).json({ message: 'Student profile not found' });

    const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`, {
      headers: { 'User-Agent': 'nexgen-hire-app' },
    });
    if (!ghRes.ok) return res.status(400).json({ message: 'GitHub user not found or rate-limited' });

    const repos = await ghRes.json();
    if (!Array.isArray(repos)) return res.status(400).json({ message: 'Unexpected GitHub response' });

    await pool.query('UPDATE students SET github_username = ? WHERE user_id = ?', [username, req.user.id]);

    let imported = 0;
    for (const repo of repos.filter((r) => !r.fork).slice(0, 6)) {
      const [existing] = await pool.query(
        'SELECT id FROM projects WHERE student_id = ? AND repo_url = ?',
        [student[0].id, repo.html_url]
      );
      if (existing.length > 0) continue;

      await pool.query(
        'INSERT INTO projects (student_id, title, description, repo_url, demo_url, tech_stack, source) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [student[0].id, repo.name, repo.description || null, repo.html_url, repo.homepage || null, repo.language || null, 'github']
      );
      imported++;
    }

    await awardBadge(req.user.id, 'github_connected');
    res.json({ message: `Imported ${imported} repositories`, imported, totalRepos: repos.length });
  } catch (err) {
    console.error('GitHub import error:', err);
    res.status(500).json({ message: 'Failed to import from GitHub' });
  }
};
