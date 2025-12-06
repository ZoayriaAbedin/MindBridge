const { body, param, query, validationResult } = require('express-validator');

// Validation result checker
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('Validation failed for:', req.path);
    console.log('Request body:', req.body);
    console.log('Validation errors:', errors.array());
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// User registration validation
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 100 })
    .withMessage('First name must not exceed 100 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 100 })
    .withMessage('Last name must not exceed 100 characters'),
  body('role')
    .isIn(['patient', 'doctor'])
    .withMessage('Role must be either patient or doctor'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Phone number can only contain digits, spaces, and these characters: - + ( )'),
  validate
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Patient profile validation
const validatePatientProfile = [
  body('dateOfBirth')
    .optional()
    .isDate()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender value'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  body('zipCode')
    .optional()
    .matches(/^[\d\-]+$/)
    .withMessage('Please provide a valid zip code'),
  body('budgetRange')
    .optional()
    .isIn(['0-50', '51-100', '101-200', '201-500', '500+'])
    .withMessage('Invalid budget range'),
  validate
];

// Doctor profile validation
const validateDoctorProfile = [
  body('licenseNumber')
    .trim()
    .notEmpty()
    .withMessage('License number is required'),
  body('specialization')
    .trim()
    .notEmpty()
    .withMessage('Specialization is required')
    .isLength({ max: 100 })
    .withMessage('Specialization must not exceed 100 characters'),
  body('experienceYears')
    .optional()
    .isInt({ min: 0, max: 70 })
    .withMessage('Experience years must be between 0 and 70'),
  body('consultationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  validate
];

// Appointment validation
const validateAppointment = [
  body('doctorId')
    .isInt({ min: 1 })
    .withMessage('Valid doctor ID is required'),
  body('appointmentDate')
    .isDate()
    .withMessage('Valid appointment date is required')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),
  body('appointmentTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .withMessage('Valid appointment time is required (HH:MM format)'),
  body('appointmentType')
    .isIn(['consultation', 'follow_up', 'therapy', 'emergency'])
    .withMessage('Invalid appointment type'),
  body('meetingMode')
    .isIn(['in_person', 'video', 'phone'])
    .withMessage('Invalid meeting mode'),
  validate
];

// Medical history validation
const validateMedicalHistory = [
  body('conditionName')
    .trim()
    .notEmpty()
    .withMessage('Condition name is required')
    .isLength({ max: 255 })
    .withMessage('Condition name must not exceed 255 characters'),
  body('diagnosisDate')
    .optional()
    .isDate()
    .withMessage('Valid diagnosis date is required'),
  body('severity')
    .optional()
    .isIn(['mild', 'moderate', 'severe', 'critical'])
    .withMessage('Invalid severity level'),
  body('status')
    .optional()
    .isIn(['active', 'resolved', 'chronic', 'in_remission'])
    .withMessage('Invalid status'),
  validate
];

// Prescription validation
const validatePrescription = [
  body('patientId')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),
  body('prescriptionDate')
    .isDate()
    .withMessage('Valid prescription date is required'),
  body('validUntil')
    .optional()
    .isDate()
    .withMessage('Valid expiration date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.prescriptionDate)) {
        throw new Error('Expiration date must be after prescription date');
      }
      return true;
    }),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one prescription item is required'),
  body('items.*.itemType')
    .isIn(['medication', 'exercise', 'therapy', 'lifestyle'])
    .withMessage('Invalid item type'),
  body('items.*.itemName')
    .trim()
    .notEmpty()
    .withMessage('Item name is required'),
  validate
];

// Support group validation
const validateSupportGroup = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ max: 255 })
    .withMessage('Group name must not exceed 255 characters'),
  body('groupType')
    .isIn(['therapy', 'support', 'educational', 'peer'])
    .withMessage('Invalid group type'),
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 100 })
    .withMessage('Max members must be between 2 and 100'),
  body('meetingMode')
    .isIn(['in_person', 'online', 'hybrid'])
    .withMessage('Invalid meeting mode'),
  validate
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID parameter'),
  validate
];

// Search query validation
const validateSearch = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
];

module.exports = {
  validate,
  validateRegistration,
  validateLogin,
  validatePatientProfile,
  validateDoctorProfile,
  validateAppointment,
  validateMedicalHistory,
  validatePrescription,
  validateSupportGroup,
  validateId,
  validateSearch
};
