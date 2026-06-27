const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { uploadCV, uploadProfileImage } = require('../middleware/upload');
const studentController = require('../controllers/studentController');
const { getMatchedJobs } = require('../ai/matchEngine');

const router = express.Router();

router.get('/profile', authenticate, requireRole('student'), studentController.getProfile);
router.put('/profile', authenticate, requireRole('student'), studentController.updateProfile);
router.post('/upload-cv', authenticate, requireRole('student'), uploadCV, studentController.uploadCV);
router.post('/upload-image', authenticate, requireRole('student'), uploadProfileImage, studentController.uploadProfileImage);
router.get('/matches', authenticate, requireRole('student'), getMatchedJobs);
router.get('/:id', studentController.getPublicProfile);

module.exports = router;
