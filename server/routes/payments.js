const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { getPricing, processPayment, handleNotify } = require('../controllers/paymentController');

const router = express.Router();

router.get('/pricing', getPricing);
router.post('/process', authenticate, requireRole('company'), processPayment);
router.post('/notify', handleNotify);

module.exports = router;
