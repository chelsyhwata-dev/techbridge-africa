// Shared career intelligence data: role requirements, learning roadmaps and
// South African junior-market salary bands (ZAR/month). Powers the Career
// Coach, Skill Gap Analysis, Career Roadmaps and Salary Predictor (PRD 6.7,
// 7.1, 7.3, 7.7). Rules-based per V1 spec.

const CAREER_PATHS = {
  'Backend Development': {
    skills: ['Python', 'SQL', 'Git', 'REST APIs', 'Node.js', 'Docker'],
    roadmap: ['Python', 'SQL', 'Git', 'REST APIs', 'Docker', 'Junior Backend Engineer'],
    projects: ['Build a REST API with authentication', 'Dockerise an API and deploy it', 'Design a relational database for a real use case'],
    certifications: ['AWS Cloud Practitioner', 'PCEP Python Certification'],
    salary: { entry: [18000, 28000], junior: [25000, 40000], mid: [40000, 65000] },
    monthsToReady: 5,
  },
  'Frontend Development': {
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'REST APIs'],
    roadmap: ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Junior Frontend Developer'],
    projects: ['Build a responsive portfolio site', 'Build a React app consuming a public API', 'Clone a real product UI pixel-perfect'],
    certifications: ['Meta Front-End Developer Certificate'],
    salary: { entry: [16000, 26000], junior: [24000, 38000], mid: [38000, 60000] },
    monthsToReady: 4,
  },
  'Full-Stack Development': {
    skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'REST APIs'],
    roadmap: ['JavaScript', 'React', 'Node.js', 'SQL', 'REST APIs', 'Junior Full-Stack Developer'],
    projects: ['Build and deploy a full CRUD app', 'Add authentication and role-based access to an app', 'Integrate a third-party payment or email API'],
    certifications: ['freeCodeCamp Full Stack Certification'],
    salary: { entry: [18000, 30000], junior: [28000, 45000], mid: [45000, 70000] },
    monthsToReady: 6,
  },
  'Data Science': {
    skills: ['Python', 'SQL', 'Statistics', 'Pandas', 'Machine Learning', 'Data Visualization'],
    roadmap: ['Python', 'SQL', 'Statistics', 'Pandas', 'Machine Learning', 'Junior Data Scientist'],
    projects: ['Exploratory analysis on a public dataset', 'Train and evaluate a classification model', 'Build a dashboard telling a data story'],
    certifications: ['Google Data Analytics Certificate', 'IBM Data Science Certificate'],
    salary: { entry: [20000, 30000], junior: [28000, 45000], mid: [45000, 75000] },
    monthsToReady: 6,
  },
  'AI Engineering': {
    skills: ['Python', 'SQL', 'Machine Learning', 'TensorFlow', 'Statistics', 'APIs'],
    roadmap: ['Python', 'SQL', 'Statistics', 'Machine Learning', 'TensorFlow', 'Junior AI Engineer'],
    projects: ['Fine-tune a model on a custom dataset', 'Build an app around an LLM API', 'Deploy a model behind a REST endpoint'],
    certifications: ['DeepLearning.AI TensorFlow Certificate', 'AWS Machine Learning Specialty'],
    salary: { entry: [22000, 32000], junior: [30000, 50000], mid: [50000, 85000] },
    monthsToReady: 7,
  },
  'Cybersecurity': {
    skills: ['Networking', 'Linux', 'Python', 'Security Fundamentals', 'SIEM', 'Cryptography'],
    roadmap: ['Networking', 'Linux', 'Security Fundamentals', 'Python', 'SIEM', 'Junior Security Analyst'],
    projects: ['Set up and document a home lab', 'Complete 20 TryHackMe rooms', 'Write a security assessment report for a demo app'],
    certifications: ['CompTIA Security+', 'ISC2 Certified in Cybersecurity'],
    salary: { entry: [18000, 28000], junior: [28000, 45000], mid: [45000, 75000] },
    monthsToReady: 6,
  },
  'Cloud Engineering': {
    skills: ['Linux', 'AWS', 'Networking', 'Python', 'Docker', 'Terraform'],
    roadmap: ['Linux', 'Networking', 'AWS', 'Docker', 'Terraform', 'Junior Cloud Engineer'],
    projects: ['Deploy a three-tier app on AWS free tier', 'Automate infrastructure with Terraform', 'Set up CI/CD with GitHub Actions'],
    certifications: ['AWS Cloud Practitioner', 'AWS Solutions Architect Associate'],
    salary: { entry: [20000, 30000], junior: [30000, 48000], mid: [48000, 80000] },
    monthsToReady: 6,
  },
  'DevOps Engineering': {
    skills: ['Linux', 'Git', 'Docker', 'CI/CD', 'AWS', 'Kubernetes'],
    roadmap: ['Linux', 'Git', 'Docker', 'CI/CD', 'Kubernetes', 'Junior DevOps Engineer'],
    projects: ['Containerise and deploy an existing app', 'Build a full CI/CD pipeline', 'Set up monitoring and alerting for a service'],
    certifications: ['Docker Certified Associate', 'CKA (Kubernetes)'],
    salary: { entry: [20000, 30000], junior: [30000, 50000], mid: [50000, 85000] },
    monthsToReady: 7,
  },
  'Mobile Development': {
    skills: ['JavaScript', 'React Native', 'Git', 'REST APIs', 'UI/UX Basics'],
    roadmap: ['JavaScript', 'React Native', 'REST APIs', 'App Store Deployment', 'Junior Mobile Developer'],
    projects: ['Build a to-do app with offline storage', 'Build an app consuming a live API', 'Publish an app to the Play Store'],
    certifications: ['Meta React Native Specialization'],
    salary: { entry: [17000, 27000], junior: [26000, 42000], mid: [42000, 65000] },
    monthsToReady: 5,
  },
  'Data Engineering': {
    skills: ['Python', 'SQL', 'ETL', 'Airflow', 'Cloud', 'Spark'],
    roadmap: ['Python', 'SQL', 'ETL', 'Airflow', 'Spark', 'Junior Data Engineer'],
    projects: ['Build an ETL pipeline from a public API', 'Model a data warehouse schema', 'Schedule pipelines with Airflow'],
    certifications: ['Google Cloud Data Engineer', 'Databricks Lakehouse Fundamentals'],
    salary: { entry: [20000, 30000], junior: [30000, 48000], mid: [48000, 80000] },
    monthsToReady: 6,
  },
};

// City cost-of-market multipliers relative to the national baseline.
const LOCATION_FACTOR = {
  'johannesburg': 1.1, 'sandton': 1.15, 'pretoria': 1.05, 'cape town': 1.1,
  'durban': 0.95, 'kimberley': 0.85, 'bloemfontein': 0.85, 'gqeberha': 0.9,
  'port elizabeth': 0.9, 'east london': 0.85, 'polokwane': 0.85, 'remote': 1.0,
};

function normalizeSkill(s) {
  return String(s || '').toLowerCase().trim();
}

function skillsMatch(a, b) {
  const na = normalizeSkill(a), nb = normalizeSkill(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

// Best-effort mapping of a free-text goal ("I want to be an AI engineer")
// onto one of the defined career paths.
function resolvePath(text) {
  const t = String(text || '').toLowerCase();
  const aliases = {
    'Backend Development': ['backend', 'back-end', 'back end'],
    'Frontend Development': ['frontend', 'front-end', 'front end', 'ui developer'],
    'Full-Stack Development': ['full stack', 'full-stack', 'fullstack', 'web developer'],
    'Data Science': ['data scien', 'data analy', 'analyst'],
    'AI Engineering': ['ai engineer', 'machine learning', 'ml engineer', 'artificial intelligence'],
    'Cybersecurity': ['security', 'cyber', 'pentest', 'soc analyst'],
    'Cloud Engineering': ['cloud'],
    'DevOps Engineering': ['devops', 'dev ops', 'sre', 'site reliability'],
    'Mobile Development': ['mobile', 'android', 'ios', 'react native', 'flutter'],
    'Data Engineering': ['data engineer', 'etl', 'pipeline'],
  };
  for (const [path, keys] of Object.entries(aliases)) {
    if (keys.some((k) => t.includes(k))) return path;
  }
  return null;
}

module.exports = { CAREER_PATHS, LOCATION_FACTOR, resolvePath, skillsMatch, normalizeSkill };
