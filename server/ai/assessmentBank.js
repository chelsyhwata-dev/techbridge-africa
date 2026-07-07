// Coding Assessments question bank (PRD 8.6): short multiple-choice checks
// per language/difficulty. Passing upgrades the matching skill to Verified (8.7).

const ASSESSMENTS = [
  {
    skill: 'Python', title: 'Python Fundamentals', difficulty: 'Beginner', passMark: 70,
    questions: [
      { q: 'What is the output of print(type([]))?', options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"], answer: 0 },
      { q: 'Which keyword defines a function in Python?', options: ['func', 'def', 'function', 'lambda'], answer: 1 },
      { q: 'What does len("hello") return?', options: ['4', '5', '6', 'Error'], answer: 1 },
      { q: 'Which of these is immutable?', options: ['list', 'dict', 'tuple', 'set'], answer: 2 },
      { q: 'What does the "in" operator check for a list?', options: ['Index position', 'Membership', 'Length', 'Type'], answer: 1 },
    ],
  },
  {
    skill: 'JavaScript', title: 'JavaScript Fundamentals', difficulty: 'Beginner', passMark: 70,
    questions: [
      { q: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'global', 'static'], answer: 1 },
      { q: 'What does === check that == does not?', options: ['Nothing', 'Type and value', 'Only type', 'Only value'], answer: 1 },
      { q: 'What is the result of typeof undefined?', options: ["'undefined'", "'null'", "'object'", "'undefined'"], answer: 0 },
      { q: 'Which method adds an item to the end of an array?', options: ['shift()', 'unshift()', 'push()', 'pop()'], answer: 2 },
      { q: 'What does JSON.stringify() do?', options: ['Parses JSON to object', 'Converts object to JSON string', 'Deletes a key', 'Validates JSON'], answer: 1 },
    ],
  },
  {
    skill: 'SQL', title: 'SQL Fundamentals', difficulty: 'Beginner', passMark: 70,
    questions: [
      { q: 'Which clause filters rows before grouping?', options: ['HAVING', 'WHERE', 'GROUP BY', 'ORDER BY'], answer: 1 },
      { q: 'Which JOIN returns only matching rows from both tables?', options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN'], answer: 2 },
      { q: 'Which statement removes rows from a table?', options: ['DROP', 'DELETE', 'REMOVE', 'TRUNCATE ONLY'], answer: 1 },
      { q: 'What does a PRIMARY KEY guarantee?', options: ['Sorted data', 'Uniqueness and non-null', 'Fast joins only', 'Encryption'], answer: 1 },
      { q: 'Which function counts rows?', options: ['SUM()', 'COUNT()', 'TOTAL()', 'LEN()'], answer: 1 },
    ],
  },
  {
    skill: 'Java', title: 'Java Fundamentals', difficulty: 'Beginner', passMark: 70,
    questions: [
      { q: 'Which keyword is used to create a class instance?', options: ['new', 'create', 'instance', 'class'], answer: 0 },
      { q: 'What is the default value of a boolean field?', options: ['true', 'false', '0', 'null'], answer: 1 },
      { q: 'Which access modifier restricts to the same class only?', options: ['public', 'protected', 'private', 'default'], answer: 2 },
      { q: 'What does the "extends" keyword indicate?', options: ['Interface implementation', 'Inheritance', 'Exception handling', 'Package import'], answer: 1 },
      { q: 'Which collection does not allow duplicate elements?', options: ['ArrayList', 'LinkedList', 'HashSet', 'Vector'], answer: 2 },
    ],
  },
  {
    skill: 'React', title: 'React Fundamentals', difficulty: 'Intermediate', passMark: 70,
    questions: [
      { q: 'What hook manages local component state?', options: ['useEffect', 'useState', 'useMemo', 'useRef'], answer: 1 },
      { q: 'When does useEffect with an empty dependency array run?', options: ['On every render', 'Only once, after mount', 'Never', 'Only on unmount'], answer: 1 },
      { q: 'How does data flow between parent and child components?', options: ['Through global variables', 'Through props', 'Through the DOM', 'Through cookies'], answer: 1 },
      { q: 'What is the purpose of a "key" prop in a list?', options: ['Styling', 'Helping React identify list items efficiently', 'Sorting the list', 'Validation'], answer: 1 },
      { q: 'What does JSX compile down to?', options: ['HTML strings', 'React.createElement calls', 'CSS', 'JSON'], answer: 1 },
    ],
  },
];

module.exports = { ASSESSMENTS };
