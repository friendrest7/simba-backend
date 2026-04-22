const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/register',
  validate([
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('phone').optional().isString(),
    body('address').optional().isString()
  ]),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ]),
  asyncHandler(authController.login)
);

router.get('/me', protect, asyncHandler(authController.getMe));

module.exports = router;
