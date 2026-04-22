const { StatusCodes } = require('http-status-codes');

const authService = require('../services/authService');

async function register(req, res) {
  const result = await authService.register(req.body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'User registered successfully',
    data: result
  });
}

async function login(req, res) {
  const result = await authService.login(req.body);
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Login successful',
    data: result
  });
}

async function getMe(req, res) {
  const user = await authService.getProfile(req.user.id);
  res.status(StatusCodes.OK).json({
    success: true,
    data: user
  });
}

module.exports = {
  register,
  login,
  getMe
};
