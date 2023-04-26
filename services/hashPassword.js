const bcrypt = require('bcrypt');

module.exports.hashPassword = async password => {
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);
  return hashedPass;
};

module.exports.checkPassword = (candidate, hash) =>
  bcrypt.compare(candidate, hash);
