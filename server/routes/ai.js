const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const aiController = require('../controllers/aiController');

const router = express.Router();

router.post('/resume-analysis', authenticate, requireRole('student'), aiController.analyzeResumeEndpoint);
router.post('/career-coach', authenticate, requireRole('student'), aiController.careerCoach);
router.post('/skill-gap', authenticate, requireRole('student'), aiController.skillGap);
router.get('/interview/questions', authenticate, requireRole('student'), aiController.getInterviewQuestions);
router.post('/interview/answer', authenticate, requireRole('student'), aiController.submitInterviewAnswer);
router.post('/job-description', authenticate, requireRole('company'), aiController.generateJobDescriptionEndpoint);
router.post('/salary-predict', authenticate, aiController.predictSalary);
router.get('/portfolio-draft', authenticate, requireRole('student'), aiController.generatePortfolioDraft);

module.exports = router;
