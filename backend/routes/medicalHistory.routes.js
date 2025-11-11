const express = require('express');
const router = express.Router();
const medicalHistoryController = require('../controllers/medicalHistory.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');
const { validateMedicalHistory, validateId } = require('../middleware/validation.middleware');

// All routes require authentication
router.use(verifyToken);

// Get medical history for a patient
router.get('/patient/:patientId', medicalHistoryController.getMedicalHistory);

// Add medical history entry
router.post('/patient/:patientId', validateMedicalHistory, medicalHistoryController.addMedicalHistory);

// Update medical history entry
router.put('/:id', validateId, medicalHistoryController.updateMedicalHistory);

// Delete medical history entry
router.delete('/:id', validateId, medicalHistoryController.deleteMedicalHistory);

module.exports = router;
