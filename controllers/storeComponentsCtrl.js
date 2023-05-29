const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ctrlWrapper = require('../services/ctrlWrapper');
const validators = require('../services/joiValidate');
const ImageService = require('../services/imageService');
const httpError = require('../services/httpError');

const { createComponents, getSets } = require('../services/storeDB');
const paginateItems = require('../services/paginateItems');

const createStoreComponents = async (req, res) => {
  const {
    title,
    type,
    cost,
    brand,
    country,
    optionSort,
    descripMain,
    descripCharacter,
  } = req.body;

  const { error } = validators.CreateStoreComponents({
    title,
    type,
    cost,
    brand,
    country,
    descripMain,
    descripCharacter: JSON.parse(descripCharacter),
    optionSort: JSON.parse(optionSort),
  });
  if (error) throw httpError(400, `${error}`);

  const { file } = req;

  if (!file) throw httpError(400, `Ви не завантажили зображення`);

  const idComponent = uuidv4();

  const pathPhoto = await ImageService.save(
    file,
    { width: 500, height: 500 },
    'images',
    'store',
    idComponent
  );

  await createComponents(
    idComponent,
    title,
    type,
    cost,
    pathPhoto,
    brand,
    country,
    optionSort,
    descripMain,
    descripCharacter
  );

  res.status(201).json({
    result: {
      id: idComponent,
      photo: pathPhoto,
      title,
      cost,
      type,
      brand,
      country,
      descripMain,
      descripCharacter,
      optionSort,
    },
  });
};

const getAllComponents = async (req, res) => {
  const {
    limit = 12,
    page = 1,
    sort = 'none',
    type = 'Всі',
    subtype,
    power,
    material,
    reservoir,
    voltage,
    phases,
  } = req.query;

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
      //сделать такие же для всех фильтров
      default:
        console.log('Not unknown sort:', sort);
        break;
    }
  }

  const paginateSet = paginateItems(result, limit, page);

  res.status(200).json({ result: paginateSet, count: result.length });
};

module.exports = {
  createStoreComponents: ctrlWrapper(createStoreComponents),
  getAllComponents: ctrlWrapper(getAllComponents),
};
