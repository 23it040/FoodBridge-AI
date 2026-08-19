const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await authService.registerUser({ name, email, password, role });
  const token = authService.generateToken(user._id);

  res.status(201).json(
    new ApiResponse({
      success: true,
      statusCode: 201,
      message: 'Registration successful',
      data: { user, token }
    })
  );
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authService.authenticateUser({ email, password });
  const token = authService.generateToken(user._id);

  user.password = undefined;

  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Login successful',
      data: { user, token }
    })
  );
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword({ email });

  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Password reset request processed successfully',
      data: result
    })
  );
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword({ token, newPassword });

  res.status(200).json(
    new ApiResponse({
      success: true,
      statusCode: 200,
      message: 'Password reset successfully'
    })
  );
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};
