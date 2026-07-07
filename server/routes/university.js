const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const universityController = require('../controllers/universityController');

const router = express.Router();

router.use(authenticate, requireRole('university'));

router.get('/profile', universityController.getProfile);
router.put('/profile', universityController.updateProfile);
router.get('/students', universityController.listStudents);
router.patch('/students/:studentId/verify', universityController.verifyStudent);
router.get('/placement-stats', universityController.getPlacementStats);
router.get('/internship-placements', universityController.listInternshipPlacements);
router.get('/employer-partnerships', universityController.getEmployerPartnerships);
router.get('/graduate-analytics', universityController.getGraduateAnalytics);

module.exports = router;
