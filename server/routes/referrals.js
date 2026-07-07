const express = require('express');
const authenticate = require('../middleware/auth');
const referralController = require('../controllers/referralController');

const router = express.Router();

router.use(authenticate);

router.get('/my-code', referralController.getMyCode);
router.get('/my-stats', referralController.getMyStats);

module.exports = router;
