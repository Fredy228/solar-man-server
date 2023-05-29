const express = require('express');
const multer = require('multer');
const upload = multer();

const { protect, allowFor } = require('../middleware/tokenAuth');

const {
  createStoreSets,
  getAllSets,
  deleteSetById,
  getSetById,
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
router.get('/:setId', getSetById);

router.delete('/:setId', deleteSetById);

module.exports = router;
