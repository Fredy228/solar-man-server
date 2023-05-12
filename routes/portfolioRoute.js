const express = require('express');
const multer = require('multer');
const fse = require('fs-extra');
const path = require('path');

const { protect, allowFor } = require('../middleware/tokenAuth');
const ImageService = require('../services/imageService');
const {
  createPost,
  getPosts,
  getPostById,
  deletePosts,
  updatePost,
  updateOrderPosts,
} = require('../services/portfolioDB');

const validators = require('../services/joiValidate');

const router = express.Router();

const upload = multer();

const paginateItems = (sortedArray, limit, page) => {
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);

  return sortedArray.slice(startIndex, endIndex);
};

router.post(
  '/',
  upload.single('photo'),
  protect,
  allowFor('admin moderator'),
  async (req, res) => {
    try {
      const { file } = req;
      if (!file) return res.status(400).json({ message: 'Not upload image' });

      const { title, year, components } = req.body;
      const { value, error } = validators.createPost({
        title,
        year,
        components: JSON.parse(components),
      });

      if (error) return res.status(400).json({ message: error });

      const urlImg = await ImageService.save(
        file,
        { width: 500, height: 400 },
        'images',
        'portfolio'
      );

      await createPost(
        value.title,
        value.year,
        JSON.stringify(value.components),
        urlImg
      );

      res.status(200).json({
        title: value.title,
        year: value.year,
        components: value.components,
        urlImg,
      });
    } catch (err) {
      res.status(400).json({ message: err });
    }
  }
);

router.get('/', async (req, res) => {
  try {
    const { limit, page } = req.query;
    const posts = await getPosts();

    const sotrArr = posts.sort((a, b) => a.series - b.series);

    const paginateSet = paginateItems(sotrArr, limit, page);

    res.status(200).json({ posts: paginateSet, totalPosts: sotrArr.length });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

router.get('/:idPost', async (req, res) => {
  try {
    const { idPost } = req.params;
    if (!idPost) return res.status(400).json({ message: 'Id не знайдено' });

    const post = await getPostById(idPost);
    if (!post) return res.status(400).json({ message: 'Post не знайдено' });

    res.status(200).json({ post });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

router.delete(
  '/:idPost',
  protect,
  allowFor('admin moderator'),
  async (req, res) => {
    try {
      const { idPost } = req.params;
      if (!idPost) return res.status(400).json({ message: 'Id не знайдено' });

      const post = await getPostById(idPost);
      if (!post) return res.status(400).json({ message: 'Post не знайдено' });

      const filePath = path.join(__dirname, '..', 'static', `${post.urlImg}`);
      fse.unlink(filePath, err => {
        if (err) return console.error(err);
      });

      const data = await deletePosts(idPost);

      res.status(200).json({ status: data });
    } catch (err) {
      res.status(400).json({ message: err });
    }
  }
);

router.patch(
  '/:idPost',
  upload.single('photo'),
  protect,
  allowFor('admin moderator'),
  async (req, res) => {
    try {
      const { idPost } = req.params;
      if (!idPost) return res.status(400).json({ message: 'Id не знайдено' });

      const post = await getPostById(idPost);
      if (!post) return res.status(400).json({ message: 'Post не знайдено' });

      const { title, year, components } = req.body;
      const { value, error } = validators.createPost({
        title,
        year,
        components: JSON.parse(components),
      });

      if (error) return res.status(400).json({ message: error });

      let urlImg = undefined;

      const { file } = req;
      if (file) {
        const filePath = path.join(__dirname, '..', 'static', `${post.urlImg}`);
        fse.unlink(filePath, err => {
          if (err) return console.error(err);
        });

        urlImg = await ImageService.save(
          file,
          { width: 500, height: 400 },
          'images',
          'portfolio'
        );
      }

      const data = await updatePost(
        idPost,
        value.title,
        value.year,
        JSON.stringify(value.components),
        urlImg
      );

      res.status(200).json({ post: data });
    } catch (err) {
      res.status(400).json({ message: err });
    }
  }
);

router.post(
  '/order',
  protect,
  allowFor('admin moderator'),
  async (req, res) => {
    try {
      const objects = req.body;
      const data = await updateOrderPosts(objects);

      res.status(200).json({ status: data });
    } catch (err) {
      res.status(400).json({ message: err });
    }
  }
);

module.exports = router;
