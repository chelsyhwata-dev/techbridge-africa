// AI Resume Analyzer (PRD 7.2): Resume Score + ATS Score + specific feedback,
// including rewritten stronger versions of weak bullet points.
// Rules-based per V1 spec — no external API needed.

const ACTION_VERBS = ['built', 'designed', 'developed', 'implemented', 'led', 'created', 'launched', 'improved', 'reduced', 'increased', 'automated', 'optimized', 'optimised', 'deployed', 'managed', 'delivered', 'architected', 'migrated', 'integrated', 'analysed', 'analyzed'];
const WEAK_PHRASES = [
  { weak: /worked on/i, strongExample: '"Designed and developed a responsive React application serving 1,500+ users, reducing load time by 38%."' },
  { weak: /responsible for/i, strongExample: '"Owned the deployment pipeline, cutting release time from 2 days to 2 hours."' },
  { weak: /helped with/i, strongExample: '"Collaborated with a 4-person team to deliver the payment module two weeks early."' },
  { weak: /was involved in/i, strongExample: '"Implemented input validation across 12 API endpoints, eliminating a class of injection bugs."' },
  { weak: /duties included/i, strongExample: '"Automated weekly reporting with Python, saving the team 6 hours per week."' },
];
const TECH_KEYWORDS = ['python', 'java', 'javascript', 'typescript', 'react', 'node', 'sql', 'mysql', 'postgresql', 'mongodb', 'git', 'github', 'docker', 'kubernetes', 'aws', 'azure', 'linux', 'html', 'css', 'rest', 'api', 'c++', 'c#', 'machine learning', 'tensorflow', 'pandas', 'excel', 'agile'];
const SECTION_HEADERS = ['education', 'experience', 'skills', 'projects', 'contact', 'summary', 'objective', 'certifications', 'references'];

function analyzeResume(text) {
  const lower = text.toLowerCase();
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const feedback = [];
  const strengths = [];
  let resumeScore = 100;
  let atsScore = 100;

  // Length
  if (wordCount < 150) { resumeScore -= 20; feedback.push({ area: 'Length', issue: 'Your CV is very short. Aim for 300–600 words covering education, skills, and at least two projects or experiences.' }); }
  else if (wordCount > 1200) { resumeScore -= 10; feedback.push({ area: 'Length', issue: 'Your CV is long for a student profile. Recruiters skim — cut it to 1–2 pages of your strongest material.' }); }
  else strengths.push('Good length — detailed but skimmable.');

  // Sections (ATS looks for standard headers)
  const foundSections = SECTION_HEADERS.filter((h) => lower.includes(h));
  const missingCore = ['education', 'skills', 'experience'].filter((h) => !lower.includes(h) && !(h === 'experience' && lower.includes('project')));
  if (missingCore.length) { atsScore -= missingCore.length * 12; feedback.push({ area: 'Structure', issue: `Missing standard section header${missingCore.length > 1 ? 's' : ''}: ${missingCore.join(', ')}. ATS software scans for these exact words.` }); }
  else strengths.push(`Clear structure — found sections: ${foundSections.slice(0, 5).join(', ')}.`);

  // Contact info
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(text);
  const hasPhone = /(\+?\d[\d\s()-]{8,})/.test(text);
  if (!hasEmail) { atsScore -= 15; feedback.push({ area: 'Contact', issue: 'No email address detected. Put it at the top — an unreachable candidate is an automatic rejection.' }); }
  if (!hasPhone) { atsScore -= 5; feedback.push({ area: 'Contact', issue: 'No phone number detected. Add one so recruiters can reach you quickly.' }); }
  if (hasEmail && hasPhone) strengths.push('Contact details present and machine-readable.');

  // Technical keywords
  const foundKeywords = TECH_KEYWORDS.filter((k) => lower.includes(k));
  if (foundKeywords.length < 5) { atsScore -= 15; feedback.push({ area: 'Keywords', issue: `Only ${foundKeywords.length} technical keywords detected. ATS ranks CVs by keyword match — name your actual tools and languages explicitly (e.g. Python, SQL, Git, React).` }); }
  else strengths.push(`Strong keyword coverage: ${foundKeywords.slice(0, 8).join(', ')}.`);

  // Quantified impact
  const hasNumbers = /\d+\s*(%|percent|users|hours|projects|people|clients|records)/i.test(text);
  if (!hasNumbers) { resumeScore -= 15; feedback.push({ area: 'Impact', issue: 'No quantified results found. Numbers make claims credible.', example: 'Before: "Worked on website." After: "Designed and developed a responsive React application serving 1,500+ users, reducing load time by 38%."' }); }
  else strengths.push('You quantify your impact — recruiters love numbers.');

  // Action verbs
  const verbCount = ACTION_VERBS.filter((v) => lower.includes(v)).length;
  if (verbCount < 3) { resumeScore -= 12; feedback.push({ area: 'Language', issue: 'Few strong action verbs found. Start bullets with verbs like Built, Designed, Automated, Reduced.' }); }
  else strengths.push('Good use of strong action verbs.');

  // Weak phrases with rewrites
  const rewrites = [];
  for (const { weak, strongExample } of WEAK_PHRASES) {
    const line = lines.find((l) => weak.test(l));
    if (line) rewrites.push({ original: line.slice(0, 120), suggestion: strongExample });
  }
  if (rewrites.length) { resumeScore -= rewrites.length * 5; feedback.push({ area: 'Weak bullet points', issue: `${rewrites.length} weak phrase${rewrites.length > 1 ? 's' : ''} found (e.g. "worked on", "responsible for"). Rewrite them to show ownership and outcome.` }); }

  // Links
  if (lower.includes('github.com')) strengths.push('GitHub link included — a credible skill signal.');
  else { resumeScore -= 8; feedback.push({ area: 'Links', issue: 'No GitHub link found. For tech roles, a GitHub profile is your strongest proof of skill.' }); }
  if (lower.includes('linkedin.com')) strengths.push('LinkedIn link included.');

  resumeScore = Math.max(5, Math.min(100, resumeScore));
  atsScore = Math.max(5, Math.min(100, atsScore));

  return {
    resumeScore,
    atsScore,
    wordCount,
    keywordsFound: foundKeywords,
    strengths,
    feedback,
    rewrites,
    verdict: resumeScore >= 80 ? 'Strong — ready to send' : resumeScore >= 60 ? 'Good foundation — apply the fixes below' : 'Needs work — but every fix below is quick',
  };
}

module.exports = { analyzeResume };
