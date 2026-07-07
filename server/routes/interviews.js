const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const interviewController = require('../controllers/interviewController');

const router = express.Router();

router.post('/', authenticate, requireRole('company'), interviewController.propose);
router.patch('/:id/respond', authenticate, requireRole('student'), interviewController.respond);
router.get('/application/:applicationId', authenticate, interviewController.listForApplication);
router.get('/:id/ics', authenticate, interviewController.exportIcs);

module.exports = router;
