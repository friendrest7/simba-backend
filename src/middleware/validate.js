const { validationResult } = require('express-validator');
const { StatusCodes } = require('http-status-codes');

module.exports = function validate(validations) {
  return async function validationMiddleware(req, res, next) {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg
      }))
    });
  };
};
