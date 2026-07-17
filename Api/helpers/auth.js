const jwt = require('jsonwebtoken');

const buildTokenPair = user => {
  const userId = user._id || user.id;
  const userEmail = user.email;
  const userRole = user.role || 'user';

  const payload = {
    id: userId,
    email: userEmail,
    role: userRole
  };

  return {
    accessToken: jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' }),
    refreshToken: jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
  };
};

const generateToken = async (res, user) => {
  const { accessToken, refreshToken } = buildTokenPair(user);

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  });

  res.cookie('logged', true, {
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  });

  return { accessToken, refreshToken };
};

const clearTokens = res => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('logged');
};

const genereteAuthToken = user => {
  const { accessToken, refreshToken } = buildTokenPair(user);
  return { token: accessToken, accessToken, refreshToken };
};

const genereteChangePasswordToken = user => {
  const payload = {
    email: user.email,
    password: user.password
  };

  return {
    token: jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' })
  };
};

module.exports = {
  generateToken,
  clearTokens,
  genereteAuthToken,
  genereteChangePasswordToken
};