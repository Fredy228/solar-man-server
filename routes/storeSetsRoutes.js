const express = require('express');
const multer = require('multer');
const upload = multer();
const router = express.Router();

const { protect, allowFor } = require('../middleware/tokenAuth');

const {
  createStoreSets,
  getAllSets,
  deleteSetById,
  getSetById,
  updateStoreSets,
  workWithTableStoreDB,
  getHomeSets,
  updateSetsHome,
  updateSetsOrder,
} = require('../controllers/storeSetsCtrl');

router.post('/work-db/:typeWork', workWithTableStoreDB);
router.post(
  '/home-sets',
  protect,
  allowFor('admin moderator'),
  updateSetsOrder
);
router.get('/home-sets', getHomeSets);
router.patch(
  '/home-sets/:idSetHome',
  protect,
  allowFor('admin moderator'),
  updateSetsHome
);
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
