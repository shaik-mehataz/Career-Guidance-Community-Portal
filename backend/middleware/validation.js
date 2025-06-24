const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validations
const validateRegister = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['student', 'job_seeker', 'mentor', 'employer'])
    .withMessage('Invalid role'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Resource validations
const validateResource = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  body('category')
    .isIn([
      'Resume Building',
      'Interview Preparation',
      'Career Planning',
      'Skill Development',
      'Industry Insights',
      'Networking',
      'Job Search',
      'Freelancing',
      'Entrepreneurship',
      'Personal Branding'
    ])
    .withMessage('Invalid category'),
  body('readTime')
    .isInt({ min: 1 })
    .withMessage('Read time must be a positive integer'),
  handleValidationErrors
];

// Job validations
const validateJob = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Job title must be between 1 and 200 characters'),
  body('company')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name must be between 1 and 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Job description is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('type')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'])
    .withMessage('Invalid job type'),
  body('experience')
    .isIn(['Entry Level', '1-3 years', '3-5 years', '5-10 years', '10+ years'])
    .withMessage('Invalid experience level'),
  body('applicationDeadline')
    .isISO8601()
    .withMessage('Invalid application deadline'),
  handleValidationErrors
];

// Event validations
const validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Event title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  body('organizer')
    .trim()
    .notEmpty()
    .withMessage('Organizer name is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date'),
  body('endDate')
    .isISO8601()
    .withMessage('Invalid end date'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('registrationDeadline')
    .isISO8601()
    .withMessage('Invalid registration deadline'),
  handleValidationErrors
];

// Mentor validations
const validateMentor = [
  body('expertise')
    .isArray({ min: 1 })
    .withMessage('At least one expertise area is required'),
  body('experience')
    .isIn(['1-3 years', '3-5 years', '5-10 years', '10+ years'])
    .withMessage('Invalid experience level'),
  body('industry')
    .isArray({ min: 1 })
    .withMessage('At least one industry is required'),
  body('bio')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Bio must be between 1 and 1000 characters'),
  body('currentRole')
    .trim()
    .notEmpty()
    .withMessage('Current role is required'),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required'),
  handleValidationErrors
];

// Parameter validations
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateResource,
  validateJob,
  validateEvent,
  validateMentor,
  validateObjectId,
  handleValidationErrors
};