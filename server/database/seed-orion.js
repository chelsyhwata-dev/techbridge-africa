// Seeds the ORION expansion: skills taxonomy, coding assessments, sample
// projects/student_skills for the existing seeded students, a university
// account, and a few community events. Run after seed.js / seed-railway.js.
// Usage: node seed-orion.js [local|railway]
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { ASSESSMENTS } = require('../ai/assessmentBank');

const TARGETS = {
  local: { host: 'localhost', port: 3306, user: 'root', password: 'ChelsyTinevimbo@2003', database: 'techbridge_africa' },
  railway: { host: 'reseau.proxy.rlwy.net', port: 24135, user: 'root', password: 'afrntGirildfdinUqjfQCbBXFdVeqVlA', database: 'railway' },
};

const SKILLS_TAXONOMY = {
  'Programming Languages': ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'PHP', 'Go', 'Dart', 'Bash'],
  'Frameworks': ['React', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'React Native', 'Flutter', 'FastAPI', 'Next.js'],
  'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQL', 'SQLite'],
  'Cloud': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'AWS IoT'],
  'Cybersecurity': ['Cybersecurity', 'Network Security', 'Linux', 'Ethical Hacking', 'Cryptography'],
  'AI & Data': ['Machine Learning', 'TensorFlow', 'Pandas', 'Data Visualization', 'Statistics', 'NLP', 'R'],
  'Tools & DevOps': ['Git', 'CI/CD', 'REST APIs', 'Microservices', 'Testing', 'Selenium', 'Figma', 'MQTT', 'Arduino', 'IoT'],
  'Soft Skills': ['Communication', 'Teamwork', 'Problem Solving', 'Time Management'],
};

async function run() {
  const target = process.argv[2] || 'local';
  const config = TARGETS[target];
  if (!config) { console.error('Unknown target. Use: local | railway'); process.exit(1); }

  const pool = mysql.createPool(config);
  console.log(`Connected to ${target}`);

  // 1. Skills taxonomy
  const skillIdByName = {};
  for (const [category, names] of Object.entries(SKILLS_TAXONOMY)) {
    for (const name of names) {
      const [result] = await pool.query(
        'INSERT INTO skills (name, category) VALUES (?, ?) ON DUPLICATE KEY UPDATE category = category',
        [name, category]
      );
      const id = result.insertId || (await pool.query('SELECT id FROM skills WHERE name = ?', [name]))[0][0].id;
      skillIdByName[name.toLowerCase()] = id;
    }
  }
  console.log(`Skills taxonomy: ${Object.keys(skillIdByName).length} skills`);

  // 2. Coding assessments
  for (const a of ASSESSMENTS) {
    const skillId = skillIdByName[a.skill.toLowerCase()];
    if (!skillId) { console.warn(`Skipping assessment "${a.title}" — skill "${a.skill}" not in taxonomy`); continue; }
    const [existing] = await pool.query('SELECT id FROM assessments WHERE title = ?', [a.title]);
    if (existing.length > 0) continue;
    await pool.query(
      'INSERT INTO assessments (skill_id, title, difficulty, pass_mark, questions_json) VALUES (?, ?, ?, ?, ?)',
      [skillId, a.title, a.difficulty, a.passMark, JSON.stringify(a.questions)]
    );
  }
  console.log(`Assessments: ${ASSESSMENTS.length} seeded`);

  // 3. student_skills — map each seeded student's free-text skills[] onto the taxonomy
  const [students] = await pool.query('SELECT id, skills FROM students');
  let mappedCount = 0;
  for (const s of students) {
    let skills = s.skills;
    if (typeof skills === 'string') skills = JSON.parse(skills || '[]');
    for (const skillName of skills || []) {
      const skillId = skillIdByName[String(skillName).toLowerCase()];
      if (!skillId) continue;
      await pool.query(
        'INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE proficiency = proficiency',
        [s.id, skillId, 'Intermediate']
      );
      mappedCount++;
    }
  }
  console.log(`student_skills: ${mappedCount} rows mapped`);

  // 4. Verify one skill per student (so Verified Skills / readiness has signal)
  for (const s of students.slice(0, 4)) {
    const [ss] = await pool.query('SELECT id FROM student_skills WHERE student_id = ? LIMIT 1', [s.id]);
    if (ss.length > 0) await pool.query('UPDATE student_skills SET verified = TRUE, verified_at = NOW() WHERE id = ?', [ss[0].id]);
  }

  // 5. Sample projects for each student
  const projectTemplates = [
    { title: 'Personal Portfolio Site', description: 'A responsive personal site built to showcase projects and CV.', tech_stack: 'React, Tailwind CSS' },
    { title: 'Task Tracker API', description: 'A REST API with JWT auth and CRUD endpoints for managing tasks.', tech_stack: 'Node.js, Express, MySQL' },
  ];
  let projectCount = 0;
  for (const s of students) {
    const [existing] = await pool.query('SELECT id FROM projects WHERE student_id = ?', [s.id]);
    if (existing.length > 0) continue;
    for (const p of projectTemplates) {
      await pool.query(
        'INSERT INTO projects (student_id, title, description, tech_stack, source) VALUES (?, ?, ?, ?, ?)',
        [s.id, p.title, p.description, p.tech_stack, 'manual']
      );
      projectCount++;
    }
  }
  console.log(`Projects: ${projectCount} seeded`);

  // 6. Portfolio slugs for students missing one
  const [rows] = await pool.query(
    `SELECT s.id, u.name FROM students s JOIN users u ON s.user_id = u.id WHERE s.portfolio_slug IS NULL`
  );
  for (const r of rows) {
    const slug = `${String(r.name).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}-${r.id}`;
    await pool.query('UPDATE students SET portfolio_slug = ? WHERE id = ?', [slug, r.id]);
  }
  console.log(`Portfolio slugs: ${rows.length} assigned`);

  // 7. A sample university account
  const [existingUni] = await pool.query('SELECT id FROM users WHERE email = ?', ['careers@solplaatje.ac.za']);
  if (existingUni.length === 0) {
    const hash = await bcrypt.hash('Password@123', 10);
    const [u] = await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Sol Plaatje University Careers Office', 'careers@solplaatje.ac.za', hash, 'university']);
    await pool.query('INSERT INTO universities (user_id, university_name, contact_person, website, verified) VALUES (?, ?, ?, ?, ?)', [u.insertId, 'Sol Plaatje University', 'Careers Office', 'https://www.spu.ac.za', true]);
    console.log('University account: careers@solplaatje.ac.za / Password@123');
  }

  // 8. Community events
  const [existingEvents] = await pool.query('SELECT COUNT(*) as count FROM events');
  if (existingEvents[0].count === 0) {
    const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 19).replace('T', ' ');
    const events = [
      { title: 'Africa Tech Careers Fair 2026', type: 'career_fair', description: 'Meet 30+ employers hiring African tech graduates.', location: 'Johannesburg', is_virtual: false, event_date: inDays(14), url: null },
      { title: 'NexGen Hire Hackathon: Build for Africa', type: 'hackathon', description: '48-hour hackathon solving real problems for African SMEs.', location: 'Virtual', is_virtual: true, event_date: inDays(21), url: 'https://example.com/hackathon' },
      { title: 'React Meetup: State Management in 2026', type: 'meetup', description: 'A community meetup on modern React state patterns.', location: 'Cape Town', is_virtual: false, event_date: inDays(7), url: null },
      { title: 'Resume & Interview Workshop', type: 'workshop', description: 'Live workshop applying the AI Resume Analyzer to your own CV.', location: 'Virtual', is_virtual: true, event_date: inDays(3), url: null },
    ];
    for (const e of events) {
      await pool.query(
        'INSERT INTO events (title, type, description, location, is_virtual, event_date, url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [e.title, e.type, e.description, e.location, e.is_virtual, e.event_date, e.url]
      );
    }
    console.log(`Events: ${events.length} seeded`);
  }

  console.log('\n=== ORION SEED COMPLETE ===');
  await pool.end();
}

run().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
