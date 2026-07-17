const User = require('../models/user');
const Rt = require('../models/rt');
const dayjs = require('dayjs');
const {
  SendData,
  ServerError,
  NotFound,
  EmailAlreadyExists,
  DeletedAccount,
  WrongEmail,
  WrongPassword,
  InactiveAccount,
  Unauthorized,
  UnauthorizedRefreshToken,
  ExpiredRefreshToken,
  BadRequest,
  AlreadyExists
} = require('../helpers/response');
const { generateToken, clearTokens } = require('../helpers/auth');
const { langs, defaultLang } = require('../config');

const buildRefreshExpiry = () => dayjs().add(7, 'day').toDate();

const saveRefreshToken = async (user, refreshToken) =>
  Rt.create({
    token: refreshToken,
    expires: buildRefreshExpiry(),
    user: user._id
  });

const issueTokens = async (res, user) => {
  const tokens = await generateToken(res, user);
  await saveRefreshToken(user, tokens.refreshToken);
  return tokens;
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const deletedUser = await User.findOne({ email: email.toLowerCase(), deleted: true }, { _id: 1 }).lean();
    if (deletedUser) return next(DeletedAccount());

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(WrongEmail());
    if (!user.active) return next(InactiveAccount());

    const passwordMatches = await new Promise((resolve, reject) => {
      user.comparePassword(password, (err, isMatch) => {
        if (err) return reject(err);
        return resolve(isMatch);
      });
    });

    if (!passwordMatches) return next(WrongPassword());

    await issueTokens(res, user);

    return next(SendData(user.response()));
  } catch (e) {
    return next(ServerError(e));
  }
};

exports.check = async (req, res, next) => {
  try {
    return next(SendData(req.user.response()));
  } catch (err) {
    return next(Unauthorized(err));
  }
};

exports.checkIfEmailExists = async ({ params: { email } }, res, next) => {
  try {
    const foundUser = await User.findOne({ email: email.toLowerCase(), deleted: false }, { _id: 1 }).lean();
    if (!foundUser) return next(NotFound());

    return next(SendData({ message: 'Email exists!', id: foundUser._id, email: email.toLowerCase() }));
  } catch (err) {
    return next(ServerError(err));
  }
};

exports.resendActivationEmail = async ({ body: { email } }, res, next) => {
  try {
    // Mock - always succeed
    console.log(`[MOCK] Resend activation email to: ${email}`);
    return next(SendData());
  } catch (e) {
    return next(ServerError(e));
  }
};

exports.register = async (req, res, next) => {
  try {
    if (req.body.lang && !langs.includes(req.body.lang)) {
      req.body.lang = defaultLang;
    }

    const deletedUser = await User.findOne({ email: req.body.email.toLowerCase(), deleted: true }, { _id: 1 }).lean();
    if (deletedUser) return next(DeletedAccount());

    const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
    if (existingUser) return next(EmailAlreadyExists());

    const user = await new User({
      ...req.body,
      email: req.body.email.toLowerCase(),
      lang: req.body.lang || defaultLang
    }).save();

    await issueTokens(res, user);

    return next(SendData(user.response()));
  } catch (e) {
    return next(ServerError(e));
  }
};

exports.invite = async (_req, _res, next) => next(NotFound());

exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const tokenDoc = await Rt.findOne({ token: refreshToken });
    if (!tokenDoc) return next(UnauthorizedRefreshToken());
    if (tokenDoc.expires && dayjs(tokenDoc.expires).isBefore(dayjs())) return next(ExpiredRefreshToken());

    const user = await User.findById(tokenDoc.user);
    if (!user || user.deleted) return next(UnauthorizedRefreshToken());

    await tokenDoc.deleteOne();
    await issueTokens(res, user);

    return next(SendData(user.response()));
  } catch (e) {
    return next(ServerError(e));
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) await Rt.deleteOne({ token: refreshToken });
    clearTokens(res);
    return next(SendData({ message: 'Logout succesfully!' }));
  } catch (err) {
    return next(ServerError(err));
  }
};

exports.forgotPassword = async ({ body: { email } }, res, next) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.deleted) return next(NotFound());

    return next(SendData());
  } catch (err) {
    return next(ServerError(err));
  }
};

exports.restoreUser = async ({ body: { email } }, res, next) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase(), deleted: true });
    if (!user) return next(NotFound());

    return next(SendData());
  } catch (err) {
    return next(ServerError(err));
  }
};

exports.changePassword = async ({ params: { email, token: encodedToken }, body: { password } }, res, next) => {
  try {
    const token = Buffer.from(encodedToken, 'base64').toString('utf8');
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.email.toLowerCase() !== email.toLowerCase()) return next(Unauthorized());

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.deleted) return next(Unauthorized());

    if (decoded.password !== user.password) return next(Unauthorized());

    user.password = password;
    user.authReset = null;
    await user.save();

    clearTokens(res);
    return next(SendData({ message: 'Password changed successfully' }));
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') return next(Unauthorized());
    return next(ServerError(err));
  }
};