const { Prisma } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');

const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

async function buildCart(userId) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true
    }
  });

  if (!items.length) {
    throw new AppError('Cart is empty', StatusCodes.BAD_REQUEST);
  }

  for (const item of items) {
    if (!item.product || !item.product.isActive) {
      throw new AppError(`Product "${item.product?.name || item.productId}" is unavailable`, StatusCodes.BAD_REQUEST);
    }

    if (item.product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for product "${item.product.name}"`, StatusCodes.BAD_REQUEST);
    }
  }

  return items;
}

async function createOrder(userId, payload) {
  const cartItems = await buildCart(userId);

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum.plus(item.product.price.mul(item.quantity));
  }, new Prisma.Decimal(0));

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        userId,
        deliveryAddress: payload.deliveryAddress,
        contactPhone: payload.contactPhone,
        notes: payload.notes,
        totalAmount,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productPrice: item.product.price,
            quantity: item.quantity,
            subtotal: item.product.price.mul(item.quantity)
          }))
        }
      },
      include: {
        items: true
      }
    });

    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    await tx.cartItem.deleteMany({
      where: { userId }
    });

    return createdOrder;
  });

  return order;
}

async function getOrders(userId) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function getOrderById(userId, orderId) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId
    },
    include: {
      items: true
    }
  });

  if (!order) {
    throw new AppError('Order not found', StatusCodes.NOT_FOUND);
  }

  return order;
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById
};
