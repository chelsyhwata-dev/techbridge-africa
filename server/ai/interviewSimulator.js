// AI Interview Simulator (PRD 7.4): text-based practice with scored,
// structured feedback. Keyword-based scoring per V1 spec.

const QUESTION_BANK = [
  { id: 1, category: 'Web', question: 'Explain what a REST API is and why it is useful.', keywords: ['http', 'endpoint', 'resource', 'get', 'post', 'stateless', 'json', 'client', 'server', 'crud'], modelAnswer: 'A REST API is an interface that lets clients communicate with a server over HTTP using standard methods (GET, POST, PUT, DELETE) on resources identified by URLs. It is stateless — each request carries everything the server needs — and typically exchanges JSON. This makes systems easy to integrate, scale, and evolve independently.' },
  { id: 2, category: 'Web', question: 'What is the difference between SQL and NoSQL databases?', keywords: ['relational', 'table', 'schema', 'document', 'scal', 'structured', 'join', 'flexible', 'acid'], modelAnswer: 'SQL databases are relational: data lives in tables with a fixed schema and relationships enforced through keys and joins, with strong ACID guarantees. NoSQL databases (document, key-value, graph) trade rigid schemas for flexibility and easier horizontal scaling. SQL suits structured, consistent data; NoSQL suits rapidly-changing or massive-scale data.' },
  { id: 3, category: 'JavaScript', question: 'Explain the difference between let, const and var in JavaScript.', keywords: ['scope', 'block', 'hoist', 'reassign', 'function scope', 'constant', 'redeclare'], modelAnswer: 'var is function-scoped and hoisted, which causes surprising bugs. let and const are block-scoped: let allows reassignment, const does not (though object contents can still change). Modern code uses const by default and let when reassignment is needed.' },
  { id: 4, category: 'React', question: 'What is React state and how does it differ from props?', keywords: ['component', 'immutable', 'setstate', 'usestate', 'parent', 'render', 'internal', 'read-only'], modelAnswer: 'Props are read-only data passed from a parent component; state is data a component owns and can change over time via useState/setState. When state or props change, React re-renders the component. Props flow down; state stays local unless lifted up.' },
  { id: 5, category: 'Python', question: 'What is the difference between a list and a tuple in Python?', keywords: ['mutable', 'immutable', 'change', 'fixed', 'hash', 'performance', 'bracket', 'parenthes'], modelAnswer: 'A list is mutable — you can add, remove, and change items. A tuple is immutable — fixed once created, which makes it hashable (usable as a dict key) and slightly faster. Use lists for collections that change and tuples for fixed records.' },
  { id: 6, category: 'CS Fundamentals', question: 'Explain Object-Oriented Programming and its four main principles.', keywords: ['encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'class', 'object', 'method'], modelAnswer: 'OOP models software as objects — instances of classes bundling data and behaviour. Its four principles: encapsulation (hide internal state behind methods), inheritance (share behaviour through parent classes), polymorphism (same interface, different implementations), and abstraction (expose what, hide how).' },
  { id: 7, category: 'CS Fundamentals', question: 'What is Big O notation and why does it matter?', keywords: ['complexity', 'time', 'space', 'worst case', 'algorithm', 'scale', 'input', 'linear', 'constant', 'quadratic'], modelAnswer: 'Big O describes how an algorithm\'s time or memory grows with input size, in the worst case — O(1) constant, O(n) linear, O(n²) quadratic, etc. It matters because an approach that works on 100 records may collapse on 10 million; Big O lets you predict and compare that before it happens.' },
  { id: 8, category: 'Git', question: 'Explain the difference between git merge and git rebase.', keywords: ['history', 'commit', 'branch', 'linear', 'merge commit', 'rewrite', 'conflict'], modelAnswer: 'git merge combines branches by creating a merge commit, preserving both histories. git rebase replays your commits on top of the target branch, producing a linear history but rewriting commits. Merge is safer for shared branches; rebase keeps local feature history clean.' },
  { id: 9, category: 'Web', question: 'What happens when you type a URL into a browser and press Enter?', keywords: ['dns', 'ip', 'tcp', 'http', 'request', 'server', 'response', 'render', 'html', 'tls'], modelAnswer: 'The browser resolves the domain to an IP via DNS, opens a TCP (and usually TLS) connection, and sends an HTTP request. The server responds with HTML; the browser parses it, fetches linked CSS/JS/images, builds the DOM, and renders the page.' },
  { id: 10, category: 'Behavioural', question: 'Tell me about a challenging project you worked on and how you handled it.', keywords: ['situation', 'task', 'action', 'result', 'learned', 'team', 'deadline', 'problem', 'solution'], modelAnswer: 'Strong answers follow STAR: Situation (context), Task (your responsibility), Action (specific steps you took), Result (measurable outcome plus what you learned). Pick a real project, emphasise your decisions, and end with the impact.' },
  { id: 11, category: 'Behavioural', question: 'Why do you want to work in tech, and where do you see yourself in five years?', keywords: ['passion', 'learn', 'grow', 'goal', 'impact', 'career', 'skill', 'contribute'], modelAnswer: 'Connect a genuine origin story to concrete goals: what drew you in, what you have built or learned since, and a realistic five-year trajectory (e.g. junior → strong mid-level engineer with a specialisation). Ambition plus specifics beats generic enthusiasm.' },
  { id: 12, category: 'Databases', question: 'What is a JOIN in SQL? Name the main types.', keywords: ['inner', 'left', 'right', 'outer', 'table', 'key', 'match', 'combine', 'null'], modelAnswer: 'A JOIN combines rows from two tables based on a related column. INNER JOIN returns only matching rows; LEFT JOIN keeps all left-table rows (NULLs where no match); RIGHT JOIN mirrors that; FULL OUTER JOIN keeps everything from both sides.' },
];

function scoreAnswer(questionId, answer) {
  const q = QUESTION_BANK.find((x) => x.id === Number(questionId));
  if (!q) return null;

  const text = String(answer || '').toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;

  const hit = q.keywords.filter((k) => text.includes(k));
  const missed = q.keywords.filter((k) => !text.includes(k));

  let score = Math.round((hit.length / q.keywords.length) * 70);
  // Depth bonus: substantive answers earn structure points
  if (words >= 40) score += 15;
  else if (words >= 20) score += 8;
  if (/for example|e\.g\.|such as|for instance/i.test(text)) score += 10;
  score = Math.min(100, score);
  if (words < 5) score = Math.min(score, 10);

  const feedback = [];
  if (words < 20) feedback.push('Your answer is very brief. Interviewers want to see your reasoning — aim for 3-5 sentences.');
  if (hit.length) feedback.push(`Good — you covered: ${hit.slice(0, 5).join(', ')}.`);
  if (missed.length) feedback.push(`Consider also mentioning: ${missed.slice(0, 4).join(', ')}.`);
  if (!/for example|e\.g\.|such as|for instance/i.test(text) && words >= 20) feedback.push('Add a concrete example — examples are what make answers memorable.');

  return { score, coveredConcepts: hit, missedConcepts: missed.slice(0, 5), feedback, modelAnswer: q.modelAnswer };
}

module.exports = { QUESTION_BANK, scoreAnswer };
