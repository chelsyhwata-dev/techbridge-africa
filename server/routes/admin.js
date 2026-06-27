const express = require('express');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, requireRole('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/jobs', adminController.getAllJobs);
router.delete('/jobs/:id', adminController.deleteJob);
router.get('/transactions', adminController.getAllTransactions);
router.get('/transactions/export', adminController.exportAllTransactionsCSV);

module.exports = router;
