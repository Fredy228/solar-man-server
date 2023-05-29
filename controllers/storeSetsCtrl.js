const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ctrlWrapper = require('../services/ctrlWrapper');
const validators = require('../services/joiValidate');
const ImageService = require('../services/imageService');
const httpError = require('../services/httpError');
const {
  createSet,
  getSets,
  getSet,
  deleteSet,
} = require('../services/storeDB');
const paginateItems = require('../services/paginateItems');

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
    { width: 940, height: 700 },
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

const getSetById = async (req, res) => {
  const { setId } = req.params;

  const findSet = await getSet(setId);
  if (!findSet) throw httpError(404, `Товар по /${setId}/ не знайдено`);

  res.status(200).json({ result: findSet });
};
const deleteSetById = async (req, res) => {
  const { setId } = req.params;

  const findSet = await getSet(setId);
  if (!findSet) throw httpError(404, `Товар по /${setId}/ не знайдено`);

  const filePathPhoto = path.join(
    __dirname,
    '..',
    'static',
    'images',
    'store',
    `${findSet.id}`
  );

  await ImageService.deleteFolders([filePathPhoto]);

  await deleteSet(setId);

  res.status(200).json({ result: findSet.id });
};

module.exports = {
  createStoreSets: ctrlWrapper(createStoreSets),
  getAllSets: ctrlWrapper(getAllSets),
  getSetById: ctrlWrapper(getSetById),
  deleteSetById: ctrlWrapper(deleteSetById),
};
