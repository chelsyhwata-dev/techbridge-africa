const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { getBankingDetails, updateBankingDetails, getPublicBankingDetails } = require('../controllers/settingsController');

const router = express.Router();

router.get('/banking', authenticate, requireRole('admin'), getBankingDetails);
router.put('/banking', authenticate, requireRole('admin'), updateBankingDetails);
router.get('/banking/public', authenticate, getPublicBankingDetails);

module.exports = router;
