const sqlite3 = require('sqlite3').verbose();

const toConnectComponentsDB = () => {
  const db = new sqlite3.Database('database/store.db', err => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
  });

  db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='components'",
    (err, result) => {
      if (err) {
        console.error(err.message);
      }
      if (!result) {
        // Таблицы не существует, создаем ее
        db.run(
          'CREATE TABLE components (id TEXT, title TEXT, type TEXT, cost INTEGER, photo TEXT, brand TEXT, country TEXT, optionSort TEXT, descripMain TEXT, descripCharacter TEXT)',
          err => {
            if (err) {
              console.error(err.message);
            }
            console.log('Таблица components создана.');
          }
        );
      }
    }
  );

  return db;
};

const toConnectSetsDB = () => {
  const db = new sqlite3.Database('database/store.db', err => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
  });

  db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='sets'",
    (err, result) => {
      if (err) {
        console.error(err.message);
      }
      if (!result) {
        // Таблицы не существует, создаем ее
        db.run(
          'CREATE TABLE sets (id TEXT, title TEXT, cost INTEGER, type TEXT, power TEXT, descripMain TEXT, photo TEXT, descripCharacter TEXT, descripPhoto TEXT,  components TEXT)',
          err => {
            if (err) {
              console.error(err.message);
            }
            console.log('Таблица components создана.');
          }
        );
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

const createSet = async (
  id,
  title,
  cost,
  type,
  power,
  descripMain,
  photo,
  descripCharacter,
  descripPhoto,
  components
) => {
  return new Promise((resolve, reject) => {
    const db = toConnectSetsDB();

    db.run(
      `INSERT INTO sets(id , title , cost , type , power , descripMain , photo , descripCharacter , descripPhoto,  components) VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        title,
        cost,
        type,
        power,
        descripMain,
        photo,
        descripCharacter,
        descripPhoto,
        components,
      ],
      function (err) {
        if (err) reject(err);

        resolve('201 Created');
      }
    );

    toCloseDB(db);
  });
};

const createComponents = async (
  id,
  title,
  type,
  cost,
  photo,
  brand,
  country,
  optionSort,
  descripMain,
  descripCharacter
) => {
  return new Promise((resolve, reject) => {
    const db = toConnectComponentsDB();

    db.run(
      `INSERT INTO components(id, title , type , cost , photo , brand , country , optionSort , descripMain, descripCharacter ) VALUES(?,?,?,?,?,?,?,?,?,?)`,
      [
        id,
        title,
        type,
        cost,
        photo,
        brand,
        country,
        optionSort,
        descripMain,
        descripCharacter,
      ],
      function (err) {
        if (err) reject(err);

        resolve('201 Created');
      }
    );

    toCloseDB(db);
  });
};

const getSets = type => {
  return new Promise((resolve, reject) => {
    const db = toConnectSetsDB();

    let query = 'SELECT * FROM sets';

    if (type !== 'Всі') {
      query += ` WHERE type = ?`;

      db.all(query, [type], function (err, rows) {
        if (err) reject(err.message);

        resolve(rows);
      });
    }

    if (type === 'Всі') {
      db.all(query, function (err, rows) {
        if (err) reject(err.message);

        resolve(rows);
      });
    }

    toCloseDB(db);
  });
};

const getSet = id => {
  return new Promise((resolve, reject) => {
    const db = toConnectSetsDB();

    db.get(`SELECT * FROM sets WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err);

      resolve(row);
    });
    toCloseDB(db);
  });
};

const deleteSet = id => {
  return new Promise((resolve, reject) => {
    const db = toConnectSetsDB();

    db.run(`DELETE FROM sets WHERE id = ?`, [id], function (err) {
      if (err) reject(err);

      resolve(this.changes);
    });

    toCloseDB(db);
  });
};

module.exports = {
  createSet,
  createComponents,
  getSets,
  deleteSet,
  getSet,
};
