const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const appController = require('../controllers/applicationController');

const router = express.Router();

router.post('/', authenticate, requireRole('student'), appController.apply);
router.get('/my-applications', authenticate, requireRole('student'), appController.getStudentApplications);
router.get('/job/:jobId', authenticate, requireRole('company'), appController.getJobApplicants);
router.patch('/:id/status', authenticate, requireRole('company'), appController.updateStatus);

module.exports = router;
