const path = require('path');
const fse = require('fs-extra');
const sharp = require('sharp');
const multer = require('multer');
const uuid = require('uuid').v4;

class ImageService {
  static upload(name) {
    const multerStorage = multer.memoryStorage();

    const multerFilter = (req, file, callBackFunc) => {
      if (file.mimetype.startsWith('image')) {
        callBackFunc(null, true);
      } else {
        callBackFunc(new Error(400, 'Please upload images only..'), false);
      }
    };

    return multer({
      storage: multerStorage,
      fileFilter: multerFilter,
    }).single(name);
  }

  static async save(file, options, ...pathSegments) {
    const fileName = `${uuid()}.webp`;
    const fullFilePath = path.join(process.cwd(), 'static', ...pathSegments);

    await fse.ensureDir(fullFilePath);
    await sharp(file.buffer)
      .resize(options || { height: 500, width: 500 })
      .toFormat('webp')
      .webp({ quality: 85 })
      .toFile(path.join(fullFilePath, fileName));

    return path.join(...pathSegments, fileName);
  }
}

module.exports = ImageService;
