const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { uploadLogo } = require('../middleware/upload');
const companyController = require('../controllers/companyController');

const router = express.Router();

router.get('/profile', authenticate, requireRole('company'), companyController.getProfile);
router.put('/profile', authenticate, requireRole('company'), companyController.updateProfile);
router.post('/upload-logo', authenticate, requireRole('company'), uploadLogo, companyController.uploadLogo);
router.get('/analytics', authenticate, requireRole('company'), companyController.getAnalytics);
router.get('/:id', companyController.getPublicProfile);

module.exports = router;
