const fs = require('fs-extra');

module.exports.saveFile = (file, pathname) => {
  fs.writeFileSync(pathname, file[0].buffer);
};
