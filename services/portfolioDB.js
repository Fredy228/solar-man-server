const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const toConectDB = () => {
  const db = new sqlite3.Database('database/portfolio.db', err => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
  });

  db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='portfolio'",
    (err, result) => {
      if (err) {
        console.error(err.message);
      }
      if (!result) {
        // Таблицы не существует, создаем ее
        db.run(
          'CREATE TABLE portfolio (series INTEGER, id TEXT, title TEXT, year TEXT, components TEXT, urlImg TEXT, dateCreated INTEGER)',
          err => {
            if (err) {
              console.error(err.message);
            }
            console.log('Таблица portfolio создана.');
          }
        );
      } else {
        console.log('Таблица portfolio уже существует.');
      }
    }
  );

  return db;
};

const toCloseDB = db => {
  db.close(err => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });
};

const createPost = async (title, year, components, urlImg) => {
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    const id = uuidv4();

    const dateCreated = Date.now();

    db.run(
      `INSERT INTO portfolio(id, title, year, components, urlImg, dateCreated, series) VALUES(?,?,?,?,?,?,?)`,
      [id, title, year, components, urlImg, dateCreated, 0],
      function (err) {
        if (err) reject(err);

        const newPost = { id, title, year, components, urlImg };
        console.log(newPost);
        resolve(newPost);
      }
    );

    toCloseDB(db);
  });
};

const getPosts = () => {
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    db.all(`SELECT * FROM portfolio`, [], function (err, rows) {
      if (err) reject(err.message);

      resolve(rows);
    });

    toCloseDB(db);
  });
};

const getPostById = id => {
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    db.get(`SELECT * FROM portfolio WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err.message);

      resolve(row);
    });
    toCloseDB(db);
  });
};

const deletePosts = id => {
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    db.run(`DELETE FROM portfolio WHERE id = ?`, [id], function (err) {
      if (err) reject(err.message);

      resolve(this.changes);
    });

    toCloseDB(db);
  });
};

const updatePost = (id, title, year, components, urlImg) => {
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    db.run(
      `UPDATE portfolio SET title = COALESCE(?, title), year = COALESCE(?, year), components = COALESCE(?, components), urlImg = COALESCE(?, urlImg) WHERE id = ?`,
      [title, year, components, urlImg, id],
      function (err) {
        if (err) reject(err.message);

        db.get(
          `SELECT * FROM portfolio WHERE id = ?`,
          [id],
          function (err, row) {
            if (err) reject(err.message);

            resolve(row);
          }
        );
      }
    );

    toCloseDB(db);
  });
};

const updateOrderPosts = objects => {
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    objects.forEach(element => {
      const { id, series } = element;

      db.run(
        'UPDATE portfolio SET series = ? WHERE id = ?',
        [series, id],
        function (err) {
          console.error(err);
          if (err) reject(err.message);
        }
      );
    });

    resolve('OK');

    toCloseDB(db);
  });
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  deletePosts,
  updatePost,
  updateOrderPosts,
};
