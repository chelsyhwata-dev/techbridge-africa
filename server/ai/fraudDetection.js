// AI Fraud Detection (PRD 7.9): simple rule-based checks that cover most
// real-world abuse at V1 — duplicate accounts, copied CVs/portfolios, spam postings.

const pool = require('../config/db');

async function detectDuplicateAccounts() {
  const [rows] = await pool.query(`
    SELECT email, COUNT(*) as count FROM users GROUP BY LOWER(email) HAVING count > 1
  `);
  return rows.map((r) => ({ type: 'duplicate_email', detail: r.email, count: r.count }));
}

async function detectDuplicateResumeText() {
  const [rows] = await pool.query(`
    SELECT cv_path, COUNT(*) as count FROM students
    WHERE cv_path IS NOT NULL GROUP BY cv_path HAVING count > 1
  `);
  return rows.map((r) => ({ type: 'duplicate_cv_file', detail: r.cv_path, count: r.count }));
}

async function detectDuplicatePortfolioContent() {
  const [rows] = await pool.query(`
    SELECT title, repo_url, COUNT(*) as count FROM projects
    WHERE repo_url IS NOT NULL GROUP BY repo_url HAVING count > 1
  `);
  return rows.map((r) => ({ type: 'duplicate_project_repo', detail: r.repo_url, count: r.count }));
}

async function detectSpamJobPostings() {
  const [rows] = await pool.query(`
    SELECT c.id as company_id, c.company_name, COUNT(*) as count
    FROM jobs j JOIN companies c ON j.company_id = c.id
    WHERE j.created_at > NOW() - INTERVAL 1 DAY
    GROUP BY c.id HAVING count > 10
  `);
  return rows.map((r) => ({ type: 'high_volume_postings', detail: `${r.company_name} posted ${r.count} jobs in 24h`, count: r.count }));
}

async function detectUnverifiedCompaniesWithJobs() {
  const [rows] = await pool.query(`
    SELECT c.id, c.company_name, COUNT(j.id) as job_count
    FROM companies c JOIN jobs j ON j.company_id = c.id
    WHERE c.verified = FALSE
    GROUP BY c.id
  `);
  return rows.map((r) => ({ type: 'unverified_company_posting', detail: `${r.company_name} has ${r.job_count} live job(s) while unverified`, count: r.job_count }));
}

async function runFraudScan() {
  const [duplicateAccounts, duplicateResumes, duplicateProjects, spamPostings, unverifiedWithJobs] = await Promise.all([
    detectDuplicateAccounts(),
    detectDuplicateResumeText(),
    detectDuplicatePortfolioContent(),
    detectSpamJobPostings(),
    detectUnverifiedCompaniesWithJobs(),
  ]);

  const flags = [...duplicateAccounts, ...duplicateResumes, ...duplicateProjects, ...spamPostings, ...unverifiedWithJobs];
  return { flags, totalFlags: flags.length, scannedAt: new Date().toISOString() };
}

module.exports = { runFraudScan };
