require('dotenv').config();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ctrlWrapper = require('../services/ctrlWrapper');
const validators = require('../services/joiValidate');
const ImageService = require('../services/imageService');
const httpError = require('../services/httpError');

const {
  createSet,
  getSets,
  getOneSet,
  deleteSet,
  updateSet,
  alterTableDB,
  updateHomeSets,
  updateOrderSets,
} = require('../services/storeDB');
const paginateItems = require('../services/paginateItems');

const workWithTableStoreDB = async (req, res) => {
  const { tableName, newColumnName, datatype } = req.query;
  const { key } = req.body;
  const { typeWork } = req.params;

  if (!tableName) throw httpError(400, `You do not pass tableName`);

  if (!['create-db', 'alter-db'].includes(typeWork))
    throw httpError(400, `You pass wrong typeWork`);

  if (process.env.DB_PERSONAL_KEY !== key)
    throw httpError(401, `Wrong the key`);

  if (typeWork === 'alter-db') {
    if (!newColumnName) throw httpError(400, `You do not pass newColumnName`);
    await alterTableDB(tableName, newColumnName, datatype);
  }

  res.status(200).json({ message: 'Done' });
};

const createStoreSets = async (req, res) => {
  const {
    title,
    type,
    cost,
    power,
    descripMain,
    descripCharacter,
    components,
  } = req.body;

  const { value, error } = validators.CreateStoreSets({
    title,
    type,
    cost,
    power,
    descripMain,
    descripCharacter: JSON.parse(descripCharacter),
    components: JSON.parse(components),
  });
  if (error) throw httpError(400, `${error}`);

  const { photo, descripPhoto, componentsPhoto } = req.files;

  if (!photo || !descripPhoto || !componentsPhoto)
    throw httpError(400, `Ви не завантажили зображення`);

  const idSets = uuidv4();

  const pathPhoto = await ImageService.save(
    photo[0],
    { width: 500, height: 500 },
    'images',
    'store',
    idSets
  );

  const pathDescripPhoto = await ImageService.save(
    descripPhoto[0],
    { width: 1200, height: 700, fit: 'inside' },
    'images',
    'store',
    idSets
  );

  const pathComponentsPhoto = await ImageService.saveMany(
    componentsPhoto,
    { height: 200, width: 200, fit: 'inside' },
    'images',
    'store',
    idSets
  );

  const componentsUp = value.components.map((item, index) => ({
    ...item,
    image: pathComponentsPhoto[index],
  }));

  await createSet(
    idSets,
    title,
    cost,
    type,
    power,
    descripMain,
    pathPhoto,
    descripCharacter,
    pathDescripPhoto,
    JSON.stringify(componentsUp)
  );

  res.status(201).json({
    result: {
      id: idSets,
      title,
      cost,
      type,
      power,
      descripMain,
      descripPhoto: pathDescripPhoto,
      photo: pathPhoto,
      descripCharacter: value.descripCharacter,
      components: componentsUp,
    },
  });
};

const getAllSets = async (req, res) => {
  const { limit = 12, page = 1, sort = 'none', type = 'Всі' } = req.query;

  console.log('type', type);
  console.log('Всі' === type);

  let result = await getSets(type);

  if (!result) throw httpError(400, `Помилка получення товарів з БД`);

  if (type !== 'Всі') {
    result = result.filter(item => item.type === type);
  }

  if (sort === 'none') {
    const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
    result.sort((a, b) => collator.compare(a.title, b.title));
  } else {
    switch (sort) {
      case 'cost-up':
        result.sort((a, b) => a.cost - b.cost);
        break;
      case 'cost-down':
        result.sort((a, b) => b.cost - a.cost);
        break;
      case 'power-up':
        result.sort(
          (a, b) =>
            Number(a.power.split('-')[0]) - Number(b.power.split('-')[0])
        );
        break;
      case 'power-down':
        result.sort(
          (a, b) =>
            Number(b.power.split('-')[0]) - Number(a.power.split('-')[0])
        );
        break;
      default:
        console.log('Not unknown sort:', sort);
        break;
    }
  }

  const paginateSet = paginateItems(result, limit, page);

  res.status(200).json({ result: paginateSet, count: result.length });
};

const getHomeSets = async (req, res) => {
  const data = await getSets('Всі');

  const result = data.filter(({ home }) => JSON.parse(home).value);

  const sotrArr = result.sort(
    (a, b) => JSON.parse(a.home).series - JSON.parse(b.home).series
  );

  if (!result) throw httpError(400);

  res.status(200).json({ result: sotrArr });
};

const updateSetsHome = async (req, res) => {
  const { idSetHome } = req.params;

  const findSet = await getOneSet(idSetHome);
  if (!findSet) throw httpError(404, `Товар по /${idSetHome}/ не знайдено`);

  const home = {
    value: !JSON.parse(findSet.home).value,
    series: 999,
  };

  await updateHomeSets(idSetHome, home);

  res.status(200).json({});
};

const getSetById = async (req, res) => {
  const { setId } = req.params;

  const findSet = await getOneSet(setId);
  if (!findSet) throw httpError(404, `Товар по /${setId}/ не знайдено`);

  res.status(200).json({ result: findSet });
};
const deleteSetById = async (req, res) => {
  const { setId } = req.params;

  const findSet = await getOneSet(setId);
  if (!findSet) throw httpError(404, `Товар по /${setId}/ не знайдено`);

  const filePathFolder = path.join(
    __dirname,
    '..',
    'static',
    'images',
    'store',
    `${findSet.id}`
  );

  await ImageService.deleteFolders([filePathFolder]);

  await deleteSet(setId);

  res.status(200).json({ result: findSet.id });
};

const updateStoreSets = async (req, res) => {
  const {
    title,
    type,
    cost,
    power,
    descripMain,
    descripCharacter,
    components,
  } = req.body;

  const { setId } = req.params;

  const findSet = await getOneSet(setId);
  if (!findSet) throw httpError(404, `Товар по /${setId}/ не знайдено`);

  const { error } = validators.CreateStoreSets({
    title,
    type,
    cost,
    power,
    descripMain,
    descripCharacter: JSON.parse(descripCharacter),
    components: JSON.parse(components),
  });
  if (error) throw httpError(400, `${error}`);

  let { photo, descripPhoto } = req.files;

  let pathPhoto = undefined;
  let pathDescripPhoto = undefined;

  if (photo) {
    pathPhoto = await ImageService.save(
      photo[0],
      { width: 500, height: 500 },
      'images',
      'store',
      findSet.id
    );
    const filePath = path.join(__dirname, '..', 'static', `${findSet.photo}`);

    await ImageService.deleteImages([filePath]);
  }

  if (descripPhoto) {
    pathDescripPhoto = await ImageService.save(
      descripPhoto[0],
      { width: 1200, height: 700, fit: 'inside' },
      'images',
      'store',
      findSet.id
    );

    const filePath = path.join(
      __dirname,
      '..',
      'static',
      `${findSet.descripPhoto}`
    );

    await ImageService.deleteImages([filePath]);
  }

  await updateSet(
    findSet.id,
    title,
    cost,
    type,
    power,
    descripMain,
    pathPhoto,
    descripCharacter,
    pathDescripPhoto,
    components
  );

  res.status(201).json({
    result: {
      id: findSet.id,
      title,
      cost,
      type,
      power,
      descripMain,
      descripPhoto: pathDescripPhoto,
      photo: pathPhoto,
      descripCharacter,
      components,
    },
  });
};

const updateSetsOrder = async (req, res) => {
  const objects = req.body;
  const data = await updateOrderSets(objects);

  res.status(200).json({ status: data });
};

module.exports = {
  createStoreSets: ctrlWrapper(createStoreSets),
  getAllSets: ctrlWrapper(getAllSets),
  getSetById: ctrlWrapper(getSetById),
  deleteSetById: ctrlWrapper(deleteSetById),
  updateStoreSets: ctrlWrapper(updateStoreSets),
  workWithTableStoreDB: ctrlWrapper(workWithTableStoreDB),
  getHomeSets: ctrlWrapper(getHomeSets),
  updateSetsHome: ctrlWrapper(updateSetsHome),
  updateSetsOrder: ctrlWrapper(updateSetsOrder),
};
