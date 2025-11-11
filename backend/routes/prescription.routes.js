const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');
const { validatePrescription, validateId } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(verifyToken);

// Get prescriptions (filtered by role)
router.get('/', prescriptionController.getPrescriptions);

// Get single prescription
router.get('/:id', validateId, prescriptionController.getPrescription);

// Create prescription (doctors only)
router.post('/', authorize('doctor'), validatePrescription, prescriptionController.createPrescription);

// Update prescription (doctors only)
router.put('/:id', authorize('doctor'), validateId, prescriptionController.updatePrescription);

module.exports = router;
