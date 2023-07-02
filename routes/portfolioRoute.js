const express = require('express');
const multer = require('multer');
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
const paginateItems = require('../services/paginateItems');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const upload = multer();

router.post(
  '/',
  protect,
  allowFor('admin moderator'),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'gallery', maxCount: 12 },
  ]),
  async (req, res) => {
    try {
      const { photo, gallery } = req.files;
      if (!gallery || !photo)
        return res.status(400).json({ message: 'Not upload image' });

      const { title, year, components } = req.body;
      const { value, error } = validators.createPost({
        title,
        year,
        components: JSON.parse(components),
      });

      if (error) return res.status(400).json({ message: error });

      const idPost = uuidv4();

      const urlImg = await ImageService.save(
        photo[0],
        { width: 450, height: 300 },
        'images',
        'portfolio',
        idPost
      );

      const galleryMini = await ImageService.saveMany(
        gallery,
        { height: 300, width: 450 },
        'images',
        'portfolio',
        idPost
      );

      const galleryOriginal = await ImageService.saveMany(
        gallery,
        { height: 1000, width: 1800 },
        'images',
        'portfolio',
        idPost
      );

      const galleryUrl = galleryMini.map((item, index) => {
        return {
          original: galleryOriginal[index],
          mini: item,
        };
      });

      await createPost(
        value.title,
        value.year,
        JSON.stringify(value.components),
        urlImg,
        JSON.stringify(galleryUrl),
        idPost
      );

      res.status(200).json({
        title: value.title,
        year: value.year,
        components: value.components,
        urlImg,
      });
    } catch (err) {
      res.status(500).json({ message: err });
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

      const filePathFolder = path.join(
        __dirname,
        '..',
        'static',
        'images',
        'portfolio',
        `${post.id}`
      );

      await ImageService.deleteFolders([filePathFolder]);

      const data = await deletePosts(idPost);

      res.status(200).json({ status: data });
    } catch (err) {
      res.status(400).json({ message: err });
    }
  }
);

router.patch(
  '/image/:idPost',
  protect,
  allowFor('admin moderator'),
  async (req, res) => {
    try {
      const { idPost } = req.params;
      if (!idPost) return res.status(400).json({ message: 'Id не знайдено' });

      const post = await getPostById(idPost);
      if (!post) return res.status(400).json({ message: 'Post не знайдено' });

      const { urlMini } = req.body;
      console.log('urlMini', urlMini);
      if (!urlMini) return res.status(400).json({ message: 'Url не знайдено' });

      const updatedGallery = JSON.parse(post.galleryUrl).filter(
        item => urlMini !== item.mini
      );
      const foundUrls = JSON.parse(post.galleryUrl).find(
        item => urlMini === item.mini
      );

      const filePath1 = path.join(
        __dirname,
        '..',
        'static',
        `${foundUrls.mini}`
      );
      await ImageService.deleteImages([filePath1]);
      const filePath2 = path.join(
        __dirname,
        '..',
        'static',
        `${foundUrls.original}`
      );
      await ImageService.deleteImages([filePath2]);

      await updatePost(
        idPost,
        undefined,
        undefined,
        undefined,
        undefined,
        JSON.stringify(updatedGallery)
      );

      res.status(200).json({ status: 'Deleted' });
    } catch (err) {
      res.status(400).json({ message: err });
    }
  }
);

router.patch(
  '/:idPost',
  protect,
  allowFor('admin moderator'),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'gallery', maxCount: 12 },
  ]),
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
      let galleryUrl = post.galleryUrl
        ? JSON.parse(post.galleryUrl)
        : undefined;

      console.log('post.galleryUrl:', post.galleryUrl);

      const { photo, gallery } = req.files;
      if (photo) {
        const filePath = path.join(__dirname, '..', 'static', `${post.urlImg}`);
        await ImageService.deleteImages([filePath]);

        urlImg = await ImageService.save(
          photo,
          { width: 450, height: 300 },
          'images',
          'portfolio',
          idPost
        );
      }

      if (gallery) {
        const galleryMini = await ImageService.saveMany(
          gallery,
          { height: 300, width: 450 },
          'images',
          'portfolio',
          idPost
        );

        const galleryOriginal = await ImageService.saveMany(
          gallery,
          { height: 1000, width: 1800 },
          'images',
          'portfolio',
          idPost
        );

        const galleryPaths = galleryMini.map((item, index) => {
          return {
            original: galleryOriginal[index],
            mini: item,
          };
        });

        if (galleryUrl) {
          galleryUrl.push(...galleryPaths);
        } else {
          galleryUrl = galleryPaths;
        }
      }

      const data = await updatePost(
        idPost,
        value.title,
        value.year,
        JSON.stringify(value.components),
        urlImg,
        JSON.stringify(galleryUrl)
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
