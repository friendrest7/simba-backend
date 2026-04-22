const { StatusCodes } = require('http-status-codes');

const cartService = require('../services/cartService');

async function getCart(req, res) {
  const cart = await cartService.getCart(req.user.id);
  res.status(StatusCodes.OK).json({
    success: true,
    data: cart
  });
}

async function addCartItem(req, res) {
  const cart = await cartService.addCartItem(req.user.id, req.body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Item added to cart',
    data: cart
  });
}

async function updateCartItem(req, res) {
  const cart = await cartService.updateCartItem(req.user.id, req.params.id, req.body.quantity);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cart item updated successfully',
    data: cart
  });
}

async function removeCartItem(req, res) {
  const cart = await cartService.removeCartItem(req.user.id, req.params.id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cart item removed successfully',
    data: cart
  });
}

async function clearCart(req, res) {
  await cartService.clearCart(req.user.id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Cart cleared successfully'
  });
}

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart
};
