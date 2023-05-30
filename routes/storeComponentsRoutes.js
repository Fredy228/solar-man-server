const express = require('express');
const multer = require('multer');
const upload = multer();

const { protect, allowFor } = require('../middleware/tokenAuth');
const {
  createStoreComponents,
  getAllComponents,
  getComponentById,
  deleteComponentById,
  updateStoreComponents,
} = require('../controllers/storeComponentsCtrl');

const router = express.Router();

router.post(
  '/',
  protect,
  allowFor('admin moderator'),
  upload.single('photo'),
  createStoreComponents
);

router.get('/', getAllComponents);
router.get('/:setId', getComponentById);

router.delete(
  '/:setId',
  protect,
  allowFor('admin moderator'),
  deleteComponentById
);
router.patch(
  '/:setId',
  protect,
  allowFor('admin moderator'),
  upload.single('photo'),
  updateStoreComponents
);

module.exports = router;
