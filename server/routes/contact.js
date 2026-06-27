const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { submitMessage, getMessages, markRead, deleteMessage } = require('../controllers/contactController');

const router = express.Router();

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
], validate, submitMessage);

router.get('/', authenticate, requireRole('admin'), getMessages);
router.patch('/:id/read', authenticate, requireRole('admin'), markRead);
router.delete('/:id', authenticate, requireRole('admin'), deleteMessage);

module.exports = router;
