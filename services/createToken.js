const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.singToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
