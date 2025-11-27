const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(verifyToken);

// Get assessment history
router.get('/history', assessmentController.getAssessmentHistory);

// Save assessment result
router.post('/result', assessmentController.saveAssessmentResult);

// Get assessment statistics for a specific type
router.get('/stats/:assessmentType', assessmentController.getAssessmentStats);

module.exports = router;
