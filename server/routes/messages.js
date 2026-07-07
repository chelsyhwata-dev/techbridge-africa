const express = require('express');
const authenticate = require('../middleware/auth');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.use(authenticate);

router.get('/', messageController.listConversations);
router.get('/:userId', messageController.getConversation);
router.post('/', messageController.send);

module.exports = router;
