const { Prisma } = require('@prisma/client');
const { StatusCodes } = require('http-status-codes');

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = error.message || 'Internal server error';

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      statusCode = StatusCodes.CONFLICT;
      message = 'A record with that value already exists';
    }

    if (error.code === 'P2025') {
      statusCode = StatusCodes.NOT_FOUND;
      message = 'Record not found';
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid request data';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: error.stack } : {})
  });
}

module.exports = errorHandler;
