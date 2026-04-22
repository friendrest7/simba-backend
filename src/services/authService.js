const bcrypt = require('bcryptjs');
const { StatusCodes } = require('http-status-codes');

const prisma = require('../config/prisma');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    createdAt: user.createdAt
  };
}

async function register(payload) {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (existingUser) {
    throw new AppError('Email is already in use', StatusCodes.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      address: payload.address
    }
  });

  return {
    user: sanitizeUser(user),
    token: generateToken({ id: user.id, email: user.email, role: user.role })
  };
}

async function login(payload) {
  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (!user) {
    throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.password);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
  }

  return {
    user: sanitizeUser(user),
    token: generateToken({ id: user.id, email: user.email, role: user.role })
  };
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND);
  }

  return sanitizeUser(user);
}

module.exports = {
  register,
  login,
  getProfile
};
