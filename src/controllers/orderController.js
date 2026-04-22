const { StatusCodes } = require('http-status-codes');

const orderService = require('../services/orderService');

async function createOrder(req, res) {
  const order = await orderService.createOrder(req.user.id, req.body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Order placed successfully',
    data: order
  });
}

async function getOrders(req, res) {
  const orders = await orderService.getOrders(req.user.id);
  res.status(StatusCodes.OK).json({
    success: true,
    data: orders
  });
}

async function getOrderById(req, res) {
  const order = await orderService.getOrderById(req.user.id, req.params.id);
  res.status(StatusCodes.OK).json({
    success: true,
    data: order
  });
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById
};
