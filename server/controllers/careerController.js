const { CAREER_PATHS } = require('../ai/careerData');

// Career Roadmaps (PRD 6.7): structured skills/courses/projects/salary per path.
exports.listPaths = (req, res) => {
  res.json(Object.keys(CAREER_PATHS));
};

exports.getRoadmap = (req, res) => {
  const path = CAREER_PATHS[req.params.path];
  if (!path) return res.status(404).json({ message: 'Unknown career path' });
  res.json({ path: req.params.path, ...path });
};
