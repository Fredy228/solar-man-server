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
  getComponentOption,
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
router.get('/by-id/:setId', getComponentById);
router.get('/option', getComponentOption);

router.delete(
  '/by-id/:setId',
  protect,
  allowFor('admin moderator'),
  deleteComponentById
);
router.patch(
  '/by-id/:setId',
  protect,
  allowFor('admin moderator'),
  upload.single('photo'),
  updateStoreComponents
);

module.exports = router;
