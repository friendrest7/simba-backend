const express = require('express');
const { body, param, query } = require('express-validator');

const productController = require('../controllers/productController');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    query('search').optional().isString(),
    query('categoryId').optional().isString(),
    query('subcategoryId').optional().isString(),
    query('isActive')
      .optional()
      .custom((value) => ['true', 'false'].includes(String(value)))
      .withMessage('isActive must be true or false')
  ]),
  asyncHandler(productController.getProducts)
);

router.get(
  '/:id',
  validate([param('id').isString().notEmpty().withMessage('Product id is required')]),
  asyncHandler(productController.getProductById)
);

router.post(
  '/',
  protect,
  authorize('ADMIN'),
  validate([
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').optional().isString(),
    body('price').isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
    body('imageUrl').optional({ nullable: true }).isURL().withMessage('imageUrl must be a valid URL'),
    body('stock').isInt({ min: 0 }).withMessage('stock must be 0 or greater'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('unit').optional().isString(),
    body('categoryId').isString().notEmpty().withMessage('categoryId is required'),
    body('subcategoryId').optional({ nullable: true }).isString()
  ]),
  asyncHandler(productController.createProduct)
);

router.patch(
  '/:id',
  protect,
  authorize('ADMIN'),
  validate([
    param('id').isString().notEmpty().withMessage('Product id is required'),
    body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
    body('description').optional().isString(),
    body('price').optional().isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
    body('imageUrl').optional({ nullable: true }).isURL().withMessage('imageUrl must be a valid URL'),
    body('stock').optional().isInt({ min: 0 }).withMessage('stock must be 0 or greater'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('unit').optional({ nullable: true }).isString(),
    body('categoryId').optional().isString(),
    body('subcategoryId').optional({ nullable: true }).isString()
  ]),
  asyncHandler(productController.updateProduct)
);

router.delete(
  '/:id',
  protect,
  authorize('ADMIN'),
  validate([param('id').isString().notEmpty().withMessage('Product id is required')]),
  asyncHandler(productController.deleteProduct)
);

module.exports = router;
