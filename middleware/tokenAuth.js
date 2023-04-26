const jwt = require('jsonwebtoken');
require('dotenv').config();

const { getUserById } = require('../database/userDB');

module.exports.protect = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.startsWith('Bearer') &&
      req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        Status: '401 Unauthorized',
        message: 'Not authorized',
      });
    }

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await getUserById(decodedToken.id);

    if (!currentUser) {
      return res.status(401).json({
        Status: '401 Unauthorized',
        message: 'Not authorized',
      });
    }

    req.user = currentUser;

    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.allowFor = role => (req, res, next) => {
  if (role.includes(req.user.role)) return next();

  next(new Error('403 You are not allowed to perform this action..'));
};
