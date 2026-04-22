const { StatusCodes } = require('http-status-codes');

const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/jwt');

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', StatusCodes.UNAUTHORIZED));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return next(new AppError('User no longer exists', StatusCodes.UNAUTHORIZED));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', StatusCodes.UNAUTHORIZED));
  }
}

function authorize(...roles) {
  return function authorizeRoles(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', StatusCodes.FORBIDDEN));
    }

    return next();
  };
}

module.exports = {
  protect,
  authorize
};
