const express = require('express');
const { body, param } = require('express-validator');

const categoryController = require('../controllers/categoryController');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', asyncHandler(categoryController.getCategories));
router.get(
  '/:id',
  validate([param('id').isString().notEmpty().withMessage('Category id is required')]),
  asyncHandler(categoryController.getCategoryById)
);

router.post(
  '/',
  protect,
  authorize('ADMIN'),
  validate([
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('imageUrl').optional().isURL().withMessage('imageUrl must be a valid URL')
  ]),
  asyncHandler(categoryController.createCategory)
);

router.post(
  '/:categoryId/subcategories',
  protect,
  authorize('ADMIN'),
  validate([
    param('categoryId').isString().notEmpty().withMessage('Category id is required'),
    body('name').trim().notEmpty().withMessage('Subcategory name is required'),
    body('imageUrl').optional().isURL().withMessage('imageUrl must be a valid URL')
  ]),
  asyncHandler(categoryController.createSubcategory)
);

module.exports = router;
