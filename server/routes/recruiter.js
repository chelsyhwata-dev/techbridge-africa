const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const recruiterController = require('../controllers/recruiterController');

const router = express.Router();

router.get('/candidates', authenticate, requireRole('company'), recruiterController.searchCandidates);

module.exports = router;
