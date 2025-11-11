const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');
const { validateAppointment, validateId } = require('../middleware/validation.middleware');
const { appointmentLimiter } = require('../middleware/rateLimiter.middleware');

// All routes require authentication
router.use(verifyToken);

// Get all appointments (filtered by user role)
router.get('/', appointmentController.getAppointments);

// Get single appointment
router.get('/:id', validateId, appointmentController.getAppointment);

// Create appointment (patients only)
router.post('/', authorize('patient'), appointmentLimiter, validateAppointment, appointmentController.createAppointment);

// Update appointment
router.put('/:id', validateId, appointmentController.updateAppointment);

// Cancel appointment
router.post('/:id/cancel', validateId, appointmentController.cancelAppointment);

module.exports = router;
