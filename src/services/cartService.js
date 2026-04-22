const { Prisma } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');

const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

async function ensureProductAvailable(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product || !product.isActive) {
    throw new AppError('Product not found or inactive', StatusCodes.NOT_FOUND);
  }

  return product;
}

async function getCartSummary(userId) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: true,
          subcategory: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalAmount = items.reduce((sum, item) => {
    return sum.plus(item.product.price.mul(item.quantity));
  }, new Prisma.Decimal(0));

  return {
    items,
    summary: {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount
    }
  };
}

async function getCart(userId) {
  return getCartSummary(userId);
}

async function addCartItem(userId, payload) {
  const product = await ensureProductAvailable(payload.productId);

  if (product.stock < payload.quantity) {
    throw new AppError('Requested quantity exceeds available stock', StatusCodes.BAD_REQUEST);
  }

  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: payload.productId
      }
    }
  });

  const nextQuantity = existing ? existing.quantity + payload.quantity : payload.quantity;

  if (product.stock < nextQuantity) {
    throw new AppError('Requested quantity exceeds available stock', StatusCodes.BAD_REQUEST);
  }

  await prisma.cartItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId: payload.productId
      }
    },
    update: {
      quantity: nextQuantity
    },
    create: {
      userId,
      productId: payload.productId,
      quantity: payload.quantity
    }
  });

  return getCartSummary(userId);
}

async function updateCartItem(userId, cartItemId, quantity) {
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      userId
    },
    include: {
      product: true
    }
  });

  if (!cartItem) {
    throw new AppError('Cart item not found', StatusCodes.NOT_FOUND);
  }

  if (cartItem.product.stock < quantity) {
    throw new AppError('Requested quantity exceeds available stock', StatusCodes.BAD_REQUEST);
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity }
  });

  return getCartSummary(userId);
}

async function removeCartItem(userId, cartItemId) {
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      userId
    }
  });

  if (!cartItem) {
    throw new AppError('Cart item not found', StatusCodes.NOT_FOUND);
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId }
  });

  return getCartSummary(userId);
}

async function clearCart(userId) {
  await prisma.cartItem.deleteMany({
    where: { userId }
  });
}

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart
};
