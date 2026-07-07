const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const optionalAuthenticate = require('../middleware/optionalAuth');
const requireRole = require('../middleware/roleCheck');
const jobController = require('../controllers/jobController');

const router = express.Router();

const jobValidation = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('requiredSkills').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('type').isIn(['internship', 'graduate', 'part-time', 'full-time', 'contract', 'graduate_programme', 'entry_level', 'learnership']),
];

router.get('/', jobController.getAll);
router.get('/my-jobs', authenticate, requireRole('company'), jobController.getCompanyJobs);
router.get('/:id', optionalAuthenticate, jobController.getById);
router.post('/', authenticate, requireRole('company'), jobValidation, validate, jobController.create);
router.put('/:id', authenticate, requireRole('company'), jobController.update);
router.delete('/:id', authenticate, requireRole('company'), jobController.delete);

module.exports = router;
