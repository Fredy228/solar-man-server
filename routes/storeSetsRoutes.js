const express = require('express');
const multer = require('multer');
const upload = multer();

const { protect, allowFor } = require('../middleware/tokenAuth');

const {
  createStoreSets,
  getAllSets,
  deleteSetById,
  getSetById,
  updateStoreSets,
} = require('../controllers/storeSetsCtrl');

const router = express.Router();

router.post(
  '/',
  protect,
  allowFor('admin moderator'),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'descripPhoto', maxCount: 1 },
    { name: 'componentsPhoto', maxCount: 12 },
  ]),
  createStoreSets
);

router.get('/', getAllSets);
router.get('/by-id/:setId', getSetById);

router.delete(
  '/by-id/:setId',
  protect,
  allowFor('admin moderator'),
  deleteSetById
);
router.patch(
  '/by-id/:setId',
  protect,
  allowFor('admin moderator'),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'descripPhoto', maxCount: 1 },
  ]),
  updateStoreSets
);

module.exports = router;
