const { StatusCodes } = require('http-status-codes');

const productService = require('../services/productService');

async function getProducts(req, res) {
  const products = await productService.getProducts(req.query);
  res.status(StatusCodes.OK).json({
    success: true,
    ...products
  });
}

async function getProductById(req, res) {
  const product = await productService.getProductById(req.params.id);
  res.status(StatusCodes.OK).json({
    success: true,
    data: product
  });
}

async function createProduct(req, res) {
  const product = await productService.createProduct(req.body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Product created successfully',
    data: product
  });
}

async function updateProduct(req, res) {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Product updated successfully',
    data: product
  });
}

async function deleteProduct(req, res) {
  await productService.deleteProduct(req.params.id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Product deleted successfully'
  });
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
