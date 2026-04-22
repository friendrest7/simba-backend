const express = require('express');
const { body, param } = require('express-validator');

const orderController = require('../controllers/orderController');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  validate([
    body('deliveryAddress').trim().notEmpty().withMessage('deliveryAddress is required'),
    body('contactPhone').trim().notEmpty().withMessage('contactPhone is required'),
    body('notes').optional().isString()
  ]),
  asyncHandler(orderController.createOrder)
);

router.get('/', asyncHandler(orderController.getOrders));

router.get(
  '/:id',
  validate([param('id').isString().notEmpty().withMessage('Order id is required')]),
  asyncHandler(orderController.getOrderById)
);

module.exports = router;
