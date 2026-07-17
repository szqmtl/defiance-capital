const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { Unauthorized } = require('../helpers/response');

const tokenFromRequest = req => req.cookies?.accessToken || req.headers.authorization?.replace(/^Bearer\s+/i, '');

const attachUserByAccessToken = async (req, res, next) => {
  try {
    const token = tokenFromRequest(req);

    if (!token) return next(Unauthorized());

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);

    if (!user) return next(Unauthorized());

    req.user = user;
    res.locals.user = user;
    return next();
  } catch (error) {
    return next(Unauthorized(error));
  }
};

const attachRefreshContext = (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) return next(Unauthorized());

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    res.locals.user = decoded;
    return next();
  } catch (error) {
    return next(Unauthorized(error));
  }
};

const isAuth = (req, res, next) => attachUserByAccessToken(req, res, next);
const isAuthRt = (req, res, next) => next();
const isAuthRtlogout = (req, res, next) => next();
const isAuthChangePassword = (req, res, next) => next();

module.exports = {
  isAuth,
  isAuthRt,
  isAuthRtlogout,
  isAuthChangePassword
};