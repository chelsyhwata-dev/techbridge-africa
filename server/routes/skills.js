const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const skillsController = require('../controllers/skillsController');

const router = express.Router();

router.get('/', skillsController.getTaxonomy);
router.get('/mine', authenticate, requireRole('student'), skillsController.getMySkills);
router.post('/mine', authenticate, requireRole('student'), skillsController.addSkill);
router.delete('/mine/:id', authenticate, requireRole('student'), skillsController.removeSkill);

module.exports = router;
