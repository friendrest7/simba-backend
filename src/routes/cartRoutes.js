const express = require('express');
const { body, param } = require('express-validator');

const cartController = require('../controllers/cartController');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', asyncHandler(cartController.getCart));

router.post(
  '/items',
  validate([
    body('productId').isString().notEmpty().withMessage('productId is required'),
    body('quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1')
  ]),
  asyncHandler(cartController.addCartItem)
);

router.patch(
  '/items/:id',
  validate([
    param('id').isString().notEmpty().withMessage('Cart item id is required'),
    body('quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1')
  ]),
  asyncHandler(cartController.updateCartItem)
);

router.delete(
  '/items/:id',
  validate([param('id').isString().notEmpty().withMessage('Cart item id is required')]),
  asyncHandler(cartController.removeCartItem)
);

router.delete('/', asyncHandler(cartController.clearCart));

module.exports = router;
