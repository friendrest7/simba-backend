const { StatusCodes } = require('http-status-codes');

const categoryService = require('../services/categoryService');

async function getCategories(req, res) {
  const categories = await categoryService.getCategories();
  res.status(StatusCodes.OK).json({
    success: true,
    data: categories
  });
}

async function getCategoryById(req, res) {
  const category = await categoryService.getCategoryById(req.params.id);
  res.status(StatusCodes.OK).json({
    success: true,
    data: category
  });
}

async function createCategory(req, res) {
  const category = await categoryService.createCategory(req.body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
}

async function createSubcategory(req, res) {
  const subcategory = await categoryService.createSubcategory(req.params.categoryId, req.body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Subcategory created successfully',
    data: subcategory
  });
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  createSubcategory
};
