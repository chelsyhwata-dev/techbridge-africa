require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST, user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  });
  const hash = await bcrypt.hash('Password@123', 10);

  // STUDENTS
  const students = [
    { name: 'Thabo Mokoena', email: 'thabo@student.com', uni: 'University of Cape Town', year: '3rd Year', loc: 'Cape Town', country: 'South Africa', status: 'Current Student', gradYear: null, bio: 'Passionate full-stack developer with a love for building scalable web apps. Active open-source contributor.', skills: ['JavaScript','React','Node.js','MySQL','Python','Git'] },
    { name: 'Amara Okafor', email: 'amara@student.com', uni: 'University of Lagos', year: 'Graduate', loc: 'Lagos', country: 'Nigeria', status: 'Recent Graduate', gradYear: 2025, bio: 'Data science graduate specializing in machine learning and analytics. Looking for entry-level AI/ML roles.', skills: ['Python','TensorFlow','SQL','Pandas','R','Machine Learning','Data Visualization'] },
    { name: 'Chelsy Tinevimbo', email: 'chelsy@student.com', uni: 'Sol Plaatje University', year: '4th Year', loc: 'Kimberley', country: 'South Africa', status: 'Current Student', gradYear: null, bio: 'Final year CS student focused on web development and AI. Building projects that solve real African problems.', skills: ['React','Node.js','Express','MySQL','Python','Tailwind CSS','JavaScript','HTML','CSS'] },
    { name: 'Tendai Mupfupi', email: 'tendai@student.com', uni: 'University of Zimbabwe', year: 'Honours', loc: 'Harare', country: 'Zimbabwe', status: 'Current Student', gradYear: null, bio: 'Mobile-first developer passionate about fintech solutions for Africa. Experienced with React Native and Flutter.', skills: ['React Native','Flutter','Dart','Firebase','JavaScript','TypeScript','REST APIs'] },
    { name: 'Naledi Dlamini', email: 'naledi@student.com', uni: 'University of Pretoria', year: 'Masters', loc: 'Pretoria', country: 'South Africa', status: 'Current Student', gradYear: null, bio: 'Cybersecurity researcher focusing on network security and ethical hacking. CompTIA Security+ certified.', skills: ['Python','Linux','Cybersecurity','Network Security','Docker','Kubernetes','Bash'] },
    { name: 'Kwame Asante', email: 'kwame@student.com', uni: 'Ashesi University', year: 'Graduate', loc: 'Accra', country: 'Ghana', status: 'Alumni', gradYear: 2024, bio: 'Software engineer with 1 year experience building enterprise Java applications. Looking for senior opportunities.', skills: ['Java','Spring Boot','PostgreSQL','Docker','AWS','Microservices','CI/CD'] },
  ];

  for (const s of students) {
    const [r] = await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [s.name, s.email, hash, 'student']);
    await pool.query(
      'INSERT INTO students (user_id, university, year_of_study, location, country, status, graduation_year, bio, skills, github_url, linkedin_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [r.insertId, s.uni, s.year, s.loc, s.country, s.status, s.gradYear, s.bio, JSON.stringify(s.skills), `https://github.com/${s.name.split(' ')[0].toLowerCase()}`, `https://linkedin.com/in/${s.name.split(' ')[0].toLowerCase()}`]
    );
  }
  console.log('6 students created');

  // COMPANIES
  const companies = [
    { name: 'TechCo Africa', email: 'hr@techco.com', company: 'TechCo Africa', industry: 'Fintech', loc: 'Johannesburg', country: 'South Africa', website: 'https://techco.africa', desc: 'Leading fintech startup building payment solutions for sub-Saharan Africa. We process over 2M transactions monthly.', verified: true },
    { name: 'CloudNine Labs', email: 'jobs@cloudnine.com', company: 'CloudNine Labs', industry: 'Cloud Computing', loc: 'Cape Town', country: 'South Africa', website: 'https://cloudnine.co.za', desc: 'Cloud infrastructure and DevOps consultancy helping African businesses modernize their tech stack.', verified: true },
    { name: 'AfriLearn', email: 'careers@afrilearn.com', company: 'AfriLearn', industry: 'EdTech', loc: 'Lagos', country: 'Nigeria', website: 'https://afrilearn.ng', desc: 'EdTech platform making quality education accessible to millions of African students through interactive online learning.', verified: true },
    { name: 'GreenByte Solutions', email: 'hr@greenbyte.com', company: 'GreenByte Solutions', industry: 'AgriTech', loc: 'Nairobi', country: 'Kenya', website: 'https://greenbyte.co.ke', desc: 'Using IoT and AI to revolutionize farming across East Africa. Our sensors help farmers increase yields by 40%.', verified: false },
    { name: 'Zim Digital', email: 'hello@zimdigital.com', company: 'Zim Digital', industry: 'Software Development', loc: 'Harare', country: 'Zimbabwe', website: 'https://zimdigital.co.zw', desc: 'Full-service software development agency building custom solutions for businesses across Southern Africa.', verified: true },
  ];

  const companyIds = [];
  for (const c of companies) {
    const [r] = await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [c.name, c.email, hash, 'company']);
    const [r2] = await pool.query(
      'INSERT INTO companies (user_id, company_name, industry, location, country, website, description, verified) VALUES (?,?,?,?,?,?,?,?)',
      [r.insertId, c.company, c.industry, c.loc, c.country, c.website, c.desc, c.verified]
    );
    companyIds.push(r2.insertId);
  }
  console.log('5 companies created');

  // JOBS
  const jobs = [
    { cid: companyIds[0], title: 'Junior Frontend Developer (React)', desc: 'Join our fintech team building the next generation of payment interfaces.\n\nResponsibilities:\n- Build and maintain React components\n- Collaborate with designers and backend engineers\n- Write unit and integration tests\n- Participate in code reviews', skills: ['React','JavaScript','TypeScript','CSS','Git'], loc: 'Johannesburg', type: 'internship', industry: 'Fintech', exp: 'entry', salary: 'R8,000 - R12,000/mo', deadline: '2026-08-15', premium: true },
    { cid: companyIds[0], title: 'Backend Engineer - Python', desc: 'Build robust APIs and microservices powering our payment platform.\n\nRequirements:\n- Strong Python fundamentals\n- Experience with REST APIs\n- Database design skills', skills: ['Python','FastAPI','PostgreSQL','Docker','REST APIs','Redis'], loc: 'Johannesburg', type: 'graduate_programme', industry: 'Fintech', exp: 'entry', salary: 'R25,000 - R35,000/mo', deadline: '2026-09-01', premium: true },
    { cid: companyIds[1], title: 'DevOps Intern', desc: 'Learn cloud infrastructure and CI/CD pipelines while supporting our team.\n\nWhat you will learn:\n- AWS/Azure cloud services\n- Docker and Kubernetes\n- CI/CD with GitHub Actions', skills: ['Linux','Docker','AWS','Git','Bash','Python'], loc: 'Cape Town', type: 'internship', industry: 'Cloud Computing', exp: 'entry', salary: 'R6,000 - R10,000/mo', deadline: '2026-08-30', premium: false },
    { cid: companyIds[1], title: 'Cloud Solutions Architect (Entry-Level)', desc: 'Help design and implement cloud architectures for our growing client base across Africa.', skills: ['AWS','Azure','Docker','Kubernetes','Terraform','Networking'], loc: 'Cape Town', type: 'entry_level', industry: 'Cloud Computing', exp: 'junior', salary: 'R30,000 - R40,000/mo', deadline: '2026-10-01', premium: true },
    { cid: companyIds[2], title: 'Full-Stack Developer Learnership', desc: 'A 12-month learnership combining structured learning with real-world project work.\n\nProgramme includes:\n- Mentorship from senior engineers\n- Monthly tech talks\n- Certification upon completion', skills: ['JavaScript','React','Node.js','MongoDB','HTML','CSS'], loc: 'Lagos', type: 'learnership', industry: 'EdTech', exp: 'entry', salary: 'Stipend: R7,000/mo', deadline: '2026-07-31', premium: false },
    { cid: companyIds[2], title: 'Mobile Developer (React Native)', desc: 'Build cross-platform mobile experiences for our learning app used by hundreds of thousands of students.', skills: ['React Native','JavaScript','TypeScript','Redux','REST APIs'], loc: 'Lagos', type: 'graduate', industry: 'EdTech', exp: 'entry', salary: 'R18,000 - R25,000/mo', deadline: '2026-09-15', premium: false },
    { cid: companyIds[3], title: 'Data Analyst Intern', desc: 'Analyze agricultural data from IoT sensors to generate actionable insights for farmers.\n\nGreat for data science students working with real-world datasets.', skills: ['Python','Pandas','SQL','Data Visualization','Excel','Statistics'], loc: 'Nairobi', type: 'internship', industry: 'AgriTech', exp: 'entry', salary: 'KES 40,000 - 60,000/mo', deadline: '2026-08-20', premium: false },
    { cid: companyIds[3], title: 'IoT Engineer - Graduate Programme', desc: '18-month graduate programme with rotation across hardware, firmware, and cloud teams.', skills: ['Python','C++','IoT','Arduino','AWS IoT','MQTT','Linux'], loc: 'Nairobi', type: 'graduate_programme', industry: 'AgriTech', exp: 'entry', salary: 'KES 80,000 - 120,000/mo', deadline: '2026-09-30', premium: true },
    { cid: companyIds[4], title: 'Software Developer (Full-Stack)', desc: 'Join our agency team building custom web applications for clients across Southern Africa.\n\nTech stack: React, Node.js, PostgreSQL, Docker', skills: ['React','Node.js','PostgreSQL','Docker','TypeScript','Git'], loc: 'Harare', type: 'full-time', industry: 'Software Development', exp: 'junior', salary: 'USD 800 - 1,200/mo', deadline: '2026-10-15', premium: false },
    { cid: companyIds[4], title: 'QA Engineering Intern', desc: 'Learn software testing methodologies while ensuring quality across our client projects.', skills: ['JavaScript','Selenium','Python','SQL','Git','Testing'], loc: 'Harare', type: 'internship', industry: 'Software Development', exp: 'entry', salary: 'USD 300 - 500/mo', deadline: '2026-08-01', premium: false },
    { cid: companyIds[0], title: 'UI/UX Designer Intern', desc: 'Design intuitive interfaces for our financial products. Tools: Figma, Adobe XD, Prototyping.', skills: ['Figma','UI Design','UX Research','Prototyping','HTML','CSS'], loc: 'Johannesburg', type: 'internship', industry: 'Fintech', exp: 'entry', salary: 'R7,000 - R10,000/mo', deadline: '2026-08-10', premium: false },
    { cid: companyIds[2], title: 'Machine Learning Engineer', desc: 'Build recommendation systems and adaptive learning algorithms to personalize the learning experience.', skills: ['Python','TensorFlow','Machine Learning','SQL','Docker','Statistics','NLP'], loc: 'Lagos', type: 'entry_level', industry: 'EdTech', exp: 'junior', salary: 'R28,000 - R38,000/mo', deadline: '2026-10-30', premium: true },
  ];

  const jobIds = [];
  for (const j of jobs) {
    const [r] = await pool.query(
      'INSERT INTO jobs (company_id, title, description, required_skills, location, type, industry, experience_level, salary_range, application_deadline, is_premium, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [j.cid, j.title, j.desc, JSON.stringify(j.skills), j.loc, j.type, j.industry, j.exp, j.salary, j.deadline, j.premium, 'open']
    );
    jobIds.push(r.insertId);
  }
  console.log('12 jobs created');

  // APPLICATIONS
  const [studentRows] = await pool.query('SELECT id FROM students ORDER BY id');
  const sids = studentRows.map(r => r.id);

  const apps = [
    { sid: sids[0], jid: jobIds[0], status: 'shortlisted', cover: 'I am excited about this opportunity! My React experience and passion for fintech make me a great fit.' },
    { sid: sids[0], jid: jobIds[4], status: 'pending', cover: 'I would love to participate in this learnership to grow my full-stack skills.' },
    { sid: sids[1], jid: jobIds[6], status: 'accepted', cover: 'As a data science graduate with strong Python and ML skills, I can contribute to your analytics team.' },
    { sid: sids[1], jid: jobIds[11], status: 'reviewed', cover: 'My expertise in TensorFlow and NLP aligns perfectly with your recommendation system needs.' },
    { sid: sids[2], jid: jobIds[0], status: 'pending', cover: 'I have been building React projects throughout university and would love to apply my skills at TechCo.' },
    { sid: sids[2], jid: jobIds[4], status: 'shortlisted', cover: 'This learnership is exactly what I need to transition from university to professional development.' },
    { sid: sids[2], jid: jobIds[8], status: 'pending', cover: 'My full-stack experience with React and Node.js makes me a strong candidate.' },
    { sid: sids[3], jid: jobIds[5], status: 'accepted', cover: 'I have extensive React Native experience and am ready to build mobile apps professionally.' },
    { sid: sids[3], jid: jobIds[0], status: 'rejected', cover: 'I am interested in expanding from mobile to web development.' },
    { sid: sids[4], jid: jobIds[2], status: 'shortlisted', cover: 'My cybersecurity background and Linux expertise would be valuable in a DevOps role.' },
    { sid: sids[4], jid: jobIds[3], status: 'pending', cover: 'I am pursuing cloud certifications and this role would accelerate my career.' },
    { sid: sids[5], jid: jobIds[1], status: 'accepted', cover: 'With 1 year of Java/Spring Boot experience, I am ready for Python backend engineering.' },
    { sid: sids[5], jid: jobIds[7], status: 'reviewed', cover: 'My software engineering background with Python makes this IoT role very appealing.' },
    { sid: sids[5], jid: jobIds[8], status: 'pending', cover: 'Experienced full-stack developer looking to join a dynamic agency environment.' },
  ];

  for (const a of apps) {
    await pool.query('INSERT INTO applications (student_id, job_id, status, cover_letter) VALUES (?,?,?,?)', [a.sid, a.jid, a.status, a.cover]);
  }
  console.log('14 applications created');

  // TRANSACTIONS
  const txns = [
    { cid: companyIds[0], amount: 499.99, type: 'premium_listing', status: 'completed', desc: 'Premium listing - Junior Frontend Developer' },
    { cid: companyIds[0], amount: 499.99, type: 'premium_listing', status: 'completed', desc: 'Premium listing - Backend Engineer Python' },
    { cid: companyIds[0], amount: 199.99, type: 'featured_post', status: 'completed', desc: 'Featured post boost - UI/UX Designer' },
    { cid: companyIds[1], amount: 499.99, type: 'premium_listing', status: 'completed', desc: 'Premium listing - Cloud Solutions Architect' },
    { cid: companyIds[2], amount: 1499.99, type: 'subscription', status: 'completed', desc: 'Annual hiring subscription' },
    { cid: companyIds[2], amount: 499.99, type: 'premium_listing', status: 'completed', desc: 'Premium listing - ML Engineer' },
    { cid: companyIds[3], amount: 499.99, type: 'premium_listing', status: 'completed', desc: 'Premium listing - IoT Engineer' },
    { cid: companyIds[3], amount: 199.99, type: 'featured_post', status: 'pending', desc: 'Featured post boost - Data Analyst' },
    { cid: companyIds[4], amount: 499.99, type: 'premium_listing', status: 'failed', desc: 'Premium listing - payment failed' },
    { cid: companyIds[0], amount: 2999.99, type: 'subscription', status: 'completed', desc: 'Premium annual hiring plan' },
  ];

  for (const t of txns) {
    const ref = `TBA-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    await pool.query('INSERT INTO transactions (company_id, amount, type, status, reference, description) VALUES (?,?,?,?,?,?)',
      [t.cid, t.amount, t.type, t.status, ref, t.desc]);
  }
  console.log('10 transactions created');

  console.log('\n=== SEED COMPLETE ===');
  console.log('All passwords: Password@123');
  console.log('\nStudents: thabo@student.com, amara@student.com, chelsy@student.com, tendai@student.com, naledi@student.com, kwame@student.com');
  console.log('Companies: hr@techco.com, jobs@cloudnine.com, careers@afrilearn.com, hr@greenbyte.com, hello@zimdigital.com');
  console.log('Admin: admin@techbridgeafrica.com / Admin@123');

  await pool.end();
})();
