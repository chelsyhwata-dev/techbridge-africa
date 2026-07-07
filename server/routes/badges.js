const express = require('express');
const authenticate = require('../middleware/auth');
const badgeController = require('../controllers/badgeController');

const router = express.Router();

router.get('/mine', authenticate, badgeController.getMyBadges);

module.exports = router;
