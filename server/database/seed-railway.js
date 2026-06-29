const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: 'reseau.proxy.rlwy.net',
    port: 24135,
    user: 'root',
    password: 'afrntGirildfdinUqjfQCbBXFdVeqVlA',
    database: 'railway',
  });

  const hash = await bcrypt.hash('Password@123', 10);
  const adminHash = await bcrypt.hash('Admin@123', 10);

  await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [adminHash, 'admin@techbridgeafrica.com']);
  console.log('Admin password set');

  const students = [
    { n: 'Thabo Mokoena', e: 'thabo@student.com', u: 'University of Cape Town', y: '3rd Year', l: 'Cape Town', c: 'South Africa', s: 'Current Student', g: null, b: 'Passionate full-stack developer.', sk: ['JavaScript','React','Node.js','MySQL','Python','Git'] },
    { n: 'Amara Okafor', e: 'amara@student.com', u: 'University of Lagos', y: 'Graduate', l: 'Lagos', c: 'Nigeria', s: 'Recent Graduate', g: 2025, b: 'Data science graduate specializing in ML.', sk: ['Python','TensorFlow','SQL','Pandas','R','Machine Learning','Data Visualization'] },
    { n: 'Chelsy Tinevimbo', e: 'chelsy@student.com', u: 'Sol Plaatje University', y: '4th Year', l: 'Kimberley', c: 'South Africa', s: 'Current Student', g: null, b: 'Final year CS student focused on web dev and AI.', sk: ['React','Node.js','Express','MySQL','Python','Tailwind CSS','JavaScript','HTML','CSS'] },
    { n: 'Tendai Mupfupi', e: 'tendai@student.com', u: 'University of Zimbabwe', y: 'Honours', l: 'Harare', c: 'Zimbabwe', s: 'Current Student', g: null, b: 'Mobile-first developer passionate about fintech.', sk: ['React Native','Flutter','Dart','Firebase','JavaScript','TypeScript','REST APIs'] },
    { n: 'Naledi Dlamini', e: 'naledi@student.com', u: 'University of Pretoria', y: 'Masters', l: 'Pretoria', c: 'South Africa', s: 'Current Student', g: null, b: 'Cybersecurity researcher.', sk: ['Python','Linux','Cybersecurity','Network Security','Docker','Kubernetes','Bash'] },
    { n: 'Kwame Asante', e: 'kwame@student.com', u: 'Ashesi University', y: 'Graduate', l: 'Accra', c: 'Ghana', s: 'Alumni', g: 2024, b: 'Software engineer with enterprise Java experience.', sk: ['Java','Spring Boot','PostgreSQL','Docker','AWS','Microservices','CI/CD'] },
  ];

  for (const s of students) {
    const [r] = await pool.query('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)', [s.n, s.e, hash, 'student']);
    await pool.query('INSERT INTO students (user_id,university,year_of_study,location,country,status,graduation_year,bio,skills) VALUES (?,?,?,?,?,?,?,?,?)',
      [r.insertId, s.u, s.y, s.l, s.c, s.s, s.g, s.b, JSON.stringify(s.sk)]);
  }
  console.log('6 students created');

  const comps = [
    { n: 'TechCo Africa', e: 'hr@techco.com', i: 'Fintech', l: 'Johannesburg', c: 'South Africa', w: 'https://techco.africa', d: 'Leading fintech startup building payment solutions.', v: true },
    { n: 'CloudNine Labs', e: 'jobs@cloudnine.com', i: 'Cloud Computing', l: 'Cape Town', c: 'South Africa', w: 'https://cloudnine.co.za', d: 'Cloud infrastructure consultancy.', v: true },
    { n: 'AfriLearn', e: 'careers@afrilearn.com', i: 'EdTech', l: 'Lagos', c: 'Nigeria', w: 'https://afrilearn.ng', d: 'EdTech platform for African students.', v: true },
    { n: 'GreenByte Solutions', e: 'hr@greenbyte.com', i: 'AgriTech', l: 'Nairobi', c: 'Kenya', w: 'https://greenbyte.co.ke', d: 'IoT and AI for farming.', v: false },
    { n: 'Zim Digital', e: 'hello@zimdigital.com', i: 'Software Development', l: 'Harare', c: 'Zimbabwe', w: 'https://zimdigital.co.zw', d: 'Full-service software dev agency.', v: true },
  ];

  const cids = [];
  for (const co of comps) {
    const [r] = await pool.query('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)', [co.n, co.e, hash, 'company']);
    const [r2] = await pool.query('INSERT INTO companies (user_id,company_name,industry,location,country,website,description,verified) VALUES (?,?,?,?,?,?,?,?)',
      [r.insertId, co.n, co.i, co.l, co.c, co.w, co.d, co.v]);
    cids.push(r2.insertId);
  }
  console.log('5 companies created');

  const jobs = [
    { ci: cids[0], t: 'Junior Frontend Developer (React)', d: 'Build payment interfaces with React.', sk: ['React','JavaScript','TypeScript','CSS','Git'], l: 'Johannesburg', tp: 'internship', i: 'Fintech', sal: 'R8,000-R12,000/mo', dl: '2026-08-15', pr: true },
    { ci: cids[0], t: 'Backend Engineer - Python', d: 'Build APIs for payment platform.', sk: ['Python','FastAPI','PostgreSQL','Docker','REST APIs'], l: 'Johannesburg', tp: 'graduate_programme', i: 'Fintech', sal: 'R25,000-R35,000/mo', dl: '2026-09-01', pr: true },
    { ci: cids[1], t: 'DevOps Intern', d: 'Learn cloud infrastructure and CI/CD.', sk: ['Linux','Docker','AWS','Git','Bash','Python'], l: 'Cape Town', tp: 'internship', i: 'Cloud Computing', sal: 'R6,000-R10,000/mo', dl: '2026-08-30', pr: false },
    { ci: cids[1], t: 'Cloud Solutions Architect', d: 'Design cloud architectures.', sk: ['AWS','Azure','Docker','Kubernetes','Terraform'], l: 'Cape Town', tp: 'entry_level', i: 'Cloud Computing', sal: 'R30,000-R40,000/mo', dl: '2026-10-01', pr: true },
    { ci: cids[2], t: 'Full-Stack Developer Learnership', d: '12-month learnership programme.', sk: ['JavaScript','React','Node.js','MongoDB','HTML','CSS'], l: 'Lagos', tp: 'learnership', i: 'EdTech', sal: 'Stipend: R7,000/mo', dl: '2026-07-31', pr: false },
    { ci: cids[2], t: 'Mobile Developer (React Native)', d: 'Build mobile learning app.', sk: ['React Native','JavaScript','TypeScript','Redux','REST APIs'], l: 'Lagos', tp: 'graduate', i: 'EdTech', sal: 'R18,000-R25,000/mo', dl: '2026-09-15', pr: false },
    { ci: cids[3], t: 'Data Analyst Intern', d: 'Analyze agricultural IoT data.', sk: ['Python','Pandas','SQL','Data Visualization','Excel'], l: 'Nairobi', tp: 'internship', i: 'AgriTech', sal: 'KES 40,000-60,000/mo', dl: '2026-08-20', pr: false },
    { ci: cids[3], t: 'IoT Engineer - Graduate Programme', d: '18-month IoT graduate programme.', sk: ['Python','C++','IoT','Arduino','AWS IoT','Linux'], l: 'Nairobi', tp: 'graduate_programme', i: 'AgriTech', sal: 'KES 80,000-120,000/mo', dl: '2026-09-30', pr: true },
    { ci: cids[4], t: 'Software Developer (Full-Stack)', d: 'Build custom web apps.', sk: ['React','Node.js','PostgreSQL','Docker','TypeScript'], l: 'Harare', tp: 'full-time', i: 'Software Development', sal: 'USD 800-1,200/mo', dl: '2026-10-15', pr: false },
    { ci: cids[4], t: 'QA Engineering Intern', d: 'Learn software testing.', sk: ['JavaScript','Selenium','Python','SQL','Git'], l: 'Harare', tp: 'internship', i: 'Software Development', sal: 'USD 300-500/mo', dl: '2026-08-01', pr: false },
    { ci: cids[0], t: 'UI/UX Designer Intern', d: 'Design fintech interfaces.', sk: ['Figma','UI Design','UX Research','HTML','CSS'], l: 'Johannesburg', tp: 'internship', i: 'Fintech', sal: 'R7,000-R10,000/mo', dl: '2026-08-10', pr: false },
    { ci: cids[2], t: 'Machine Learning Engineer', d: 'Build recommendation systems.', sk: ['Python','TensorFlow','Machine Learning','SQL','Docker'], l: 'Lagos', tp: 'entry_level', i: 'EdTech', sal: 'R28,000-R38,000/mo', dl: '2026-10-30', pr: true },
  ];

  const jids = [];
  for (const j of jobs) {
    const [r] = await pool.query(
      'INSERT INTO jobs (company_id,title,description,required_skills,location,type,industry,experience_level,salary_range,application_deadline,is_premium,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [j.ci, j.t, j.d, JSON.stringify(j.sk), j.l, j.tp, j.i, 'entry', j.sal, j.dl, j.pr, 'open']
    );
    jids.push(r.insertId);
  }
  console.log('12 jobs created');

  const [srows] = await pool.query('SELECT id FROM students ORDER BY id');
  const sids = srows.map(r => r.id);

  const apps = [
    [sids[0], jids[0], 'shortlisted', 'Great fit for this React role.'],
    [sids[1], jids[6], 'accepted', 'Strong data science skills.'],
    [sids[2], jids[0], 'pending', 'React projects from university.'],
    [sids[2], jids[4], 'shortlisted', 'Excited about the learnership.'],
    [sids[3], jids[5], 'accepted', 'React Native experience.'],
    [sids[4], jids[2], 'shortlisted', 'Linux and security background.'],
    [sids[5], jids[1], 'accepted', 'Java/Spring Boot experience.'],
  ];
  for (const a of apps) {
    await pool.query('INSERT INTO applications (student_id,job_id,status,cover_letter) VALUES (?,?,?,?)', a);
  }
  console.log('7 applications created');

  const txns = [
    [cids[0], 499.99, 'premium_listing', 'completed', 'Premium listing - Frontend Dev'],
    [cids[0], 499.99, 'premium_listing', 'completed', 'Premium listing - Backend Engineer'],
    [cids[1], 499.99, 'premium_listing', 'completed', 'Premium listing - Cloud Architect'],
    [cids[2], 1499.99, 'subscription', 'completed', 'Annual hiring subscription'],
    [cids[3], 499.99, 'premium_listing', 'completed', 'Premium listing - IoT Engineer'],
  ];
  for (const t of txns) {
    const ref = `TBA-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    await pool.query('INSERT INTO transactions (company_id,amount,type,status,reference,description) VALUES (?,?,?,?,?,?)', [t[0], t[1], t[2], t[3], ref, t[4]]);
  }
  console.log('5 transactions created');

  console.log('\n=== RAILWAY SEED COMPLETE ===');
  console.log('Admin: admin@techbridgeafrica.com / Admin@123');
  console.log('Students: chelsy@student.com / Password@123');
  console.log('Companies: hr@techco.com / Password@123');

  await pool.end();
})().catch(e => console.error(e));
