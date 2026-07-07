const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/', eventController.list);
router.post('/', authenticate, requireRole('admin', 'company', 'university'), eventController.create);
router.delete('/:id', authenticate, requireRole('admin'), eventController.remove);

module.exports = router;
