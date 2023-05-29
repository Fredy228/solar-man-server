const express = require('express');
const multer = require('multer');
const upload = multer();

const { protect, allowFor } = require('../middleware/tokenAuth');
const { createStoreComponents } = require('../controllers/storeComponentsCtrl');

const router = express.Router();

router.post(
  '/',
  protect,
  allowFor('admin moderator'),
  upload.single('photo'),
  createStoreComponents
);

module.exports = router;
