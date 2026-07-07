const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const assessmentController = require('../controllers/assessmentController');

const router = express.Router();

router.get('/', authenticate, assessmentController.list);
router.get('/results/mine', authenticate, requireRole('student'), assessmentController.getMyResults);
router.get('/:id', authenticate, requireRole('student'), assessmentController.getQuestions);
router.post('/:id/submit', authenticate, requireRole('student'), assessmentController.submit);

module.exports = router;
