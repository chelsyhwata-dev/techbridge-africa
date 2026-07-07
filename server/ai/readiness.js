// Internship Readiness Score (PRD 6.8) + Profile Completion Score (PRD 6.2).
// Explainable by design: every score ships with its component breakdown and
// a concrete "do this next" recommendation list.

function profileCompletion(student, user, skillCount, projectCount) {
  const items = [
    { key: 'photo', label: 'Add a profile photo', done: !!user.profile_image, weight: 10, why: 'Profiles with photos get significantly more recruiter views' },
    { key: 'headline', label: 'Write a professional headline', done: !!student.headline, weight: 10, why: 'The first thing recruiters see in search results' },
    { key: 'bio', label: 'Write a short bio', done: !!student.bio && student.bio.length >= 50, weight: 10, why: 'Tells your story beyond the bullet points' },
    { key: 'university', label: 'Add your university and degree', done: !!student.university && !!student.degree, weight: 10, why: 'Required for university verification' },
    { key: 'location', label: 'Add your location', done: !!student.location || !!student.city, weight: 5, why: 'Enables location-based job matching' },
    { key: 'cv', label: 'Upload your CV', done: !!student.cv_path, weight: 15, why: 'Needed to apply — and unlocks the AI Resume Analyzer' },
    { key: 'skills', label: 'Add at least 5 skills', done: skillCount >= 5, weight: 15, why: 'Skills power your AI job matches' },
    { key: 'github', label: 'Connect your GitHub', done: !!student.github_username, weight: 15, why: 'Increases recruiter visibility by an estimated 40%' },
    { key: 'projects', label: 'Add at least 2 projects', done: projectCount >= 2, weight: 10, why: 'Recruiters trust demonstrated work over claimed skills' },
  ];

  const score = items.reduce((sum, i) => sum + (i.done ? i.weight : 0), 0);
  const nextSteps = items.filter((i) => !i.done).map(({ label, weight, why }) => ({ label, gain: weight, why }));
  return { score, items, nextSteps };
}

function readinessScore({ student, user, skillCount, verifiedCount, projectCount, applicationCount, resumeScore }) {
  // Component scores 0-100
  const resume = student.cv_path ? (resumeScore != null ? resumeScore : 70) : 0;
  const projects = Math.min(100, projectCount * 34);
  const skills = Math.min(100, skillCount * 12 + verifiedCount * 15);
  const github = student.github_username ? 95 : 0;
  const communication = student.communication_self_score != null ? student.communication_self_score : 50;

  const components = [
    { name: 'Resume', score: Math.round(resume), weight: 0.25 },
    { name: 'Projects', score: Math.round(projects), weight: 0.25 },
    { name: 'Skills', score: Math.round(skills), weight: 0.25 },
    { name: 'GitHub', score: Math.round(github), weight: 0.15 },
    { name: 'Communication', score: Math.round(communication), weight: 0.10 },
  ];

  const overall = Math.round(components.reduce((sum, c) => sum + c.score * c.weight, 0));

  const recommendations = [];
  if (!student.cv_path) recommendations.push({ action: 'Upload your CV and run the AI Resume Analyzer', gain: '+18%' });
  else if (resume < 75) recommendations.push({ action: 'Apply the Resume Analyzer suggestions to raise your resume score', gain: '+8%' });
  if (projectCount < 3) recommendations.push({ action: `Add ${projectCount === 0 ? 'your first project' : 'one more project'} — e.g. one demonstrating API integration`, gain: '+6%' });
  if (!student.github_username) recommendations.push({ action: 'Connect your GitHub account', gain: '+14%' });
  if (verifiedCount === 0 && skillCount > 0) recommendations.push({ action: 'Pass a coding assessment to earn your first Verified Skill badge', gain: '+5%' });
  if (skillCount < 5) recommendations.push({ action: 'Add more skills from the skills taxonomy', gain: '+7%' });
  if (applicationCount === 0) recommendations.push({ action: 'Apply to your first AI-matched job', gain: 'Momentum!' });

  return { overall, components, recommendations: recommendations.slice(0, 4) };
}

module.exports = { profileCompletion, readinessScore };
