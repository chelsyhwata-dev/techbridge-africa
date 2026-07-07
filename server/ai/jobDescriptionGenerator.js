// AI Job Description Generator (PRD 7.6): expands a rough recruiter note
// ("Need React intern, knows JS, remote") into a complete posting.
// Template-based per V1 spec.

const { resolvePath, CAREER_PATHS } = require('./careerData');

const KNOWN_SKILLS = ['python', 'java', 'javascript', 'typescript', 'react', 'node', 'node.js', 'sql', 'mysql', 'postgresql', 'mongodb', 'git', 'github', 'docker', 'kubernetes', 'aws', 'azure', 'linux', 'html', 'css', 'rest', 'apis', 'c++', 'c#', 'php', 'angular', 'vue', 'flutter', 'react native', 'tensorflow', 'pandas', 'excel', 'figma'];

const TYPE_LABELS = {
  internship: 'Internship', graduate: 'Graduate Role', graduate_programme: 'Graduate Programme',
  entry_level: 'Entry-Level Role', 'part-time': 'Part-Time Role', 'full-time': 'Full-Time Role',
  contract: 'Contract Role', learnership: 'Learnership',
};

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bJs\b/g, 'JS').replace(/\bSql\b/g, 'SQL').replace(/\bAws\b/g, 'AWS').replace(/\bApis?\b/gi, (m) => m.toUpperCase());
}

function generateJobDescription({ prompt, companyName = 'our company', type = 'internship' }) {
  const t = String(prompt || '').toLowerCase();

  const skills = KNOWN_SKILLS.filter((s) => t.includes(s)).map(titleCase);
  const remote = /remote/.test(t);
  const hybrid = /hybrid/.test(t);
  const path = resolvePath(t);
  const pathData = path ? CAREER_PATHS[path] : null;

  // Derive a role title
  let role = path ? path.replace(' Development', ' Developer').replace(' Engineering', ' Engineer') : 'Software Developer';
  if (skills.length && !path) role = `${skills[0]} Developer`;
  const isIntern = ['internship', 'learnership'].includes(type);
  const title = isIntern ? `${role} Intern` : ['graduate', 'graduate_programme'].includes(type) ? `Graduate ${role}` : `Junior ${role}`;

  const finalSkills = skills.length >= 3 ? skills : [...new Set([...skills, ...(pathData ? pathData.skills.slice(0, 5) : ['Git', 'Problem Solving', 'REST APIs'])])].slice(0, 6);

  const workModel = remote ? 'Remote' : hybrid ? 'Hybrid' : 'On-site';
  const label = TYPE_LABELS[type] || 'Role';

  const description = `About the Role
${companyName} is looking for a motivated ${title} to join our team. This is a ${label.toLowerCase()} (${workModel.toLowerCase()}) ideal for a student or recent graduate ready to apply their skills to real products with real users.

What You'll Do
- Build, test, and ship features alongside experienced engineers
- Write clean, maintainable code and participate in code reviews
- Collaborate with the team on design, planning, and problem-solving
- Learn our stack, tools, and engineering practices through structured mentorship
- Take ownership of well-scoped tasks and grow into larger ones

What We're Looking For
- Working knowledge of ${finalSkills.slice(0, 4).join(', ')}
- A portfolio, GitHub profile, or class projects that show what you can build
- Curiosity, willingness to learn, and clear communication
- Currently studying or recently graduated in Computer Science, IT, or a related field

Nice to Have
- Experience with ${finalSkills.slice(4).join(', ') || 'cloud platforms or CI/CD tools'}
- Contributions to open source or hackathon participation

What We Offer
- Real mentorship from senior engineers — not busywork
- ${isIntern ? 'A meaningful stipend and a pathway to a permanent role' : 'A competitive salary and clear growth path'}
- ${workModel} work with flexible hours around your studies
- The chance to ship work that real users touch`;

  return { title, type, workModel, requiredSkills: finalSkills, description };
}

module.exports = { generateJobDescription };
