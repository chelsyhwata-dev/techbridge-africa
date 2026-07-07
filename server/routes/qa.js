const express = require('express');
const authenticate = require('../middleware/auth');
const qaController = require('../controllers/qaController');

const router = express.Router();

router.get('/', qaController.listQuestions);
router.get('/:id', qaController.getQuestion);
router.post('/', authenticate, qaController.askQuestion);
router.post('/:id/answers', authenticate, qaController.answerQuestion);

module.exports = router;
