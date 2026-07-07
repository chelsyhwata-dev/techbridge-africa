const express = require('express');
const careerController = require('../controllers/careerController');

const router = express.Router();

router.get('/paths', careerController.listPaths);
router.get('/roadmap/:path', careerController.getRoadmap);

module.exports = router;
