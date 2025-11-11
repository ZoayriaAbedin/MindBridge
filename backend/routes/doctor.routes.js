const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');
const { validateId } = require('../middleware/validation.middleware');

// Public/optional auth routes
router.get('/search', doctorController.searchDoctors);
router.get('/:id', validateId, doctorController.getDoctorById);

// Protected routes
router.get('/recommended/for-me', verifyToken, authorize('patient'), doctorController.getRecommendedDoctors);

// Admin only routes
router.get('/pending/approvals', verifyToken, authorize('admin'), doctorController.getPendingDoctors);
router.post('/:id/approve', verifyToken, authorize('admin'), validateId, doctorController.approveDoctor);

module.exports = router;
