const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const txController = require('../controllers/transactionController');

const router = express.Router();

router.post('/', authenticate, requireRole('company'), txController.create);
router.get('/', authenticate, requireRole('company'), txController.getCompanyTransactions);
router.get('/export', authenticate, requireRole('company'), txController.exportCSV);
router.patch('/:id/status', authenticate, requireRole('admin'), txController.updateStatus);

module.exports = router;
