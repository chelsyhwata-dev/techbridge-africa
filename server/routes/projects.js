const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const projectController = require('../controllers/projectController');

const router = express.Router();

router.use(authenticate, requireRole('student'));

router.get('/', projectController.list);
router.post('/', projectController.create);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.remove);
router.post('/import-github', projectController.importGithub);

module.exports = router;
