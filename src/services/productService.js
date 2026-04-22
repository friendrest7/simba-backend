const { StatusCodes } = require('http-status-codes');
const { Prisma } = require('@prisma/client');

const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { slugify } = require('../utils/slugify');
const { buildPagination } = require('../utils/pagination');

function mapProductPayload(payload) {
  return {
    name: payload.name,
    slug: slugify(payload.name),
    description: payload.description,
    price: new Prisma.Decimal(payload.price),
    imageUrl: payload.imageUrl,
    stock: payload.stock,
    isActive: payload.isActive,
    unit: payload.unit,
    categoryId: payload.categoryId,
    subcategoryId: payload.subcategoryId || null
  };
}

async function ensureRelations(categoryId, subcategoryId) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });

  if (!category) {
    throw new AppError('Category not found', StatusCodes.NOT_FOUND);
  }

  if (subcategoryId) {
    const subcategory = await prisma.subcategory.findFirst({
      where: {
        id: subcategoryId,
        categoryId
      }
    });

    if (!subcategory) {
      throw new AppError('Subcategory not found for selected category', StatusCodes.BAD_REQUEST);
    }
  }
}

async function getProducts(query) {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Math.min(Number(query.limit), 100) : 10;
  const skip = (page - 1) * limit;

  const where = {
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.subcategoryId ? { subcategoryId: query.subcategoryId } : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive === 'true' } : { isActive: true }),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        subcategory: true
      }
    }),
    prisma.product.count({ where })
  ]);

  return {
    data: items,
    pagination: buildPagination(page, limit, total)
  };
}

async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      subcategory: true
    }
  });

  if (!product) {
    throw new AppError('Product not found', StatusCodes.NOT_FOUND);
  }

  return product;
}

async function createProduct(payload) {
  await ensureRelations(payload.categoryId, payload.subcategoryId);

  return prisma.product.create({
    data: mapProductPayload(payload),
    include: {
      category: true,
      subcategory: true
    }
  });
}

async function updateProduct(id, payload) {
  const existing = await prisma.product.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new AppError('Product not found', StatusCodes.NOT_FOUND);
  }

  const nextCategoryId = payload.categoryId || existing.categoryId;
  const nextSubcategoryId =
    payload.subcategoryId !== undefined ? payload.subcategoryId || null : existing.subcategoryId;

  await ensureRelations(nextCategoryId, nextSubcategoryId);

  const data = {
    ...(payload.name ? { name: payload.name, slug: slugify(payload.name) } : {}),
    ...(payload.description !== undefined ? { description: payload.description } : {}),
    ...(payload.price !== undefined ? { price: new Prisma.Decimal(payload.price) } : {}),
    ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
    ...(payload.stock !== undefined ? { stock: payload.stock } : {}),
    ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
    ...(payload.unit !== undefined ? { unit: payload.unit } : {}),
    ...(payload.categoryId !== undefined ? { categoryId: payload.categoryId } : {}),
    ...(payload.subcategoryId !== undefined ? { subcategoryId: payload.subcategoryId || null } : {})
  };

  return prisma.product.update({
    where: { id },
    data,
    include: {
      category: true,
      subcategory: true
    }
  });
}

async function deleteProduct(id) {
  const existing = await prisma.product.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new AppError('Product not found', StatusCodes.NOT_FOUND);
  }

  await prisma.product.delete({
    where: { id }
  });
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
