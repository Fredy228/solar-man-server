const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ctrlWrapper = require('../services/ctrlWrapper');
const validators = require('../services/joiValidate');
const ImageService = require('../services/imageService');
const httpError = require('../services/httpError');

const {
  createComponents,
  getComponents,
  getOneComponent,
  deleteComponents,
  updateComponent,
} = require('../services/storeDB');
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
    brand,
    country,
  } = req.query;

  console.log('type', type);
  console.log('Всі' === type);

  let result = await getComponents(type);

  if (!result) throw httpError(400, `Помилка получення товарів з БД`);

  if (type !== 'Всі') {
    result = result.filter(item => item.type === type);
  }

  //Filter -------------
  if (
    [
      'Панелі',
      'Інвентори',
      'Акумулятори',
      'Кріплення',
      'Комлпектуючі',
      'Контролери заряду',
    ].includes(type) &&
    brand
  ) {
    const optionFilter = brand.split('_');
    result = result.filter(item => optionFilter.includes(item.brand));
  }

  if (
    [
      'Панелі',
      'Інвентори',
      'Акумулятори',
      'Кріплення',
      'Комлпектуючі',
      'Контролери заряду',
    ].includes(type) &&
    country
  ) {
    const optionFilter = country.split('_');
    result = result.filter(item => optionFilter.includes(item.country));
  }

  if (
    ['Панелі', 'Інвентори', 'Акумулятори', 'Кріплення'].includes(type) &&
    subtype
  ) {
    const optionFilter = subtype.split('_');
    result = result.filter(item =>
      optionFilter.includes(JSON.parse(item.optionSort).subtype)
    );
  }
  if (['Панелі', 'Інвентори'].includes(type) && power) {
    const optionFilter = power.split('_');
    result = result.filter(item =>
      optionFilter.includes(JSON.parse(item.optionSort).power)
    );
  }
  if (['Кріплення'].includes(type) && material) {
    const optionFilter = material.split('_');
    result = result.filter(item =>
      optionFilter.includes(JSON.parse(item.optionSort).material)
    );
  }
  if (['Акумулятори'].includes(type) && reservoir) {
    const optionFilter = reservoir.split('_');
    result = result.filter(item =>
      optionFilter.includes(JSON.parse(item.optionSort).reservoir)
    );
  }
  if (['Акумулятори'].includes(type) && voltage) {
    const optionFilter = voltage.split('_');
    result = result.filter(item =>
      optionFilter.includes(JSON.parse(item.optionSort).voltage)
    );
  }
  if (['Інвентори'].includes(type) && phases) {
    const optionFilter = phases.split('_');
    result = result.filter(item =>
      optionFilter.includes(JSON.parse(item.optionSort).phases)
    );
  }

  //Sort ---------------
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
      default:
        break;
    }

    if (['Панелі', 'Інвентори'].includes(type)) {
      switch (sort) {
        case 'с-power-down':
          result.sort(
            (a, b) =>
              Number(JSON.parse(b.optionSort).power.split('-')[0]) -
              Number(JSON.parse(a.optionSort).power.split('-')[0])
          );
          break;
        case 'с-power-up':
          result.sort(
            (a, b) =>
              Number(JSON.parse(a.optionSort).power.split('-')[0]) -
              Number(JSON.parse(b.optionSort).power.split('-')[0])
          );
          break;
        default:
          break;
      }
    }

    if (['Акумулятори'].includes(type)) {
      switch (sort) {
        case 'с-voltage-up':
          result.sort(
            (a, b) =>
              Number(JSON.parse(a.optionSort).voltage.split('-')[0]) -
              Number(JSON.parse(b.optionSort).voltage.split('-')[0])
          );
          break;
        case 'с-voltage-down':
          result.sort(
            (a, b) =>
              Number(JSON.parse(b.optionSort).voltage.split('-')[0]) -
              Number(JSON.parse(a.optionSort).voltage.split('-')[0])
          );
          break;
        case 'с-reservoir-up':
          result.sort(
            (a, b) =>
              Number(JSON.parse(a.optionSort).reservoir.split('-')[0]) -
              Number(JSON.parse(b.optionSort).reservoir.split('-')[0])
          );
          break;
        case 'с-reservoir-down':
          result.sort(
            (a, b) =>
              Number(JSON.parse(b.optionSort).reservoir.split('-')[0]) -
              Number(JSON.parse(a.optionSort).reservoir.split('-')[0])
          );
          break;
        default:
          break;
      }
    }
  }

  //Paginate ------------
  const paginateSet = paginateItems(result, limit, page);

  res.status(200).json({ result: paginateSet, count: result.length });
};

const getComponentById = async (req, res) => {
  const { setId } = req.params;

  const findSet = await getOneComponent(setId);
  if (!findSet) throw httpError(404, `Товар по /${setId}/ не знайдено`);

  res.status(200).json({ result: findSet });
};

const deleteComponentById = async (req, res) => {
  const { setId } = req.params;

  const findSet = await getOneComponent(setId);
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

  await deleteComponents(setId);

  res.status(200).json({ result: findSet.id });
};

const updateStoreComponents = async (req, res) => {
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

  const { setId } = req.params;

  const findSet = await getOneComponent(setId);
  if (!findSet) throw httpError(404, `Товар по /${setId}/ не знайдено`);

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

  let pathPhoto = undefined;

  if (file) {
    pathPhoto = await ImageService.save(
      file,
      { width: 500, height: 500 },
      'images',
      'store',
      findSet.id
    );
    const filePath = path.join(__dirname, '..', 'static', `${findSet.photo}`);

    await ImageService.deleteImages([filePath]);
  }

  await updateComponent(
    findSet.id,
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
      id: findSet.id,
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

module.exports = {
  createStoreComponents: ctrlWrapper(createStoreComponents),
  getAllComponents: ctrlWrapper(getAllComponents),
  getComponentById: ctrlWrapper(getComponentById),
  deleteComponentById: ctrlWrapper(deleteComponentById),
  updateStoreComponents: ctrlWrapper(updateStoreComponents),
};
