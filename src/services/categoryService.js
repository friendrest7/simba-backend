const { StatusCodes } = require('http-status-codes');

const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { slugify } = require('../utils/slugify');

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      subcategories: {
        orderBy: { name: 'asc' }
      }
    }
  });
}

async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      subcategories: {
        orderBy: { name: 'asc' }
      },
      products: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!category) {
    throw new AppError('Category not found', StatusCodes.NOT_FOUND);
  }

  return category;
}

async function createCategory(payload) {
  return prisma.category.create({
    data: {
      name: payload.name,
      slug: slugify(payload.name),
      imageUrl: payload.imageUrl
    }
  });
}

async function createSubcategory(categoryId, payload) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });

  if (!category) {
    throw new AppError('Category not found', StatusCodes.NOT_FOUND);
  }

  return prisma.subcategory.create({
    data: {
      categoryId,
      name: payload.name,
      slug: slugify(`${category.name}-${payload.name}`),
      imageUrl: payload.imageUrl
    }
  });
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  createSubcategory
};
