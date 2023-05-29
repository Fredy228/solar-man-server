const path = require('path');
const fse = require('fs-extra');
const sharp = require('sharp');
const httpError = require('./httpError');
const uuid = require('uuid').v4;

class ImageService {
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

  static async saveMany(files, options, ...pathSegments) {
    const fullFilePath = path.join(process.cwd(), 'static', ...pathSegments);
    await fse.ensureDir(fullFilePath);

    const arrFilesPath = await Promise.all(
      files.map(async file => {
        const fileName = `${uuid()}.webp`;

        await sharp(file.buffer)
          .resize(options || { height: 500, width: 500 })
          .toFormat('webp')
          .webp({ quality: 85 })
          .toFile(path.join(fullFilePath, fileName));

        return path.join(...pathSegments, fileName);
      })
    );

    return arrFilesPath;
  }

  static async deleteImages(filePaths) {
    try {
      await Promise.all(filePaths.map(filePath => fse.unlink(filePath)));
      console.log('Картинки успешно удалены');
    } catch (err) {
      console.error('Ошибка при удалении картинок', err);
    }
  }
  static async deleteFolders(folderPaths) {
    try {
      await Promise.all(folderPaths.map(folderPath => fse.remove(folderPath)));
      console.log('Папки успешно удалены');
    } catch (err) {
      throw httpError(400, 'Ошибка при удалении картинок');
    }
  }
}

module.exports = ImageService;
