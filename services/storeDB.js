const sqlite3 = require('sqlite3').verbose();

const toConnectDB = () => {
  return new sqlite3.Database('database/store.db', err => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
  });
};

const toCloseDB = db => {
  db.close(err => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });
};

const createTableComponents = () => {
  const db = toConnectDB();

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
            console.log('Таблица /components/ создана.');
          }
        );
      }
    }
  );

  toCloseDB(db);
};

const createTableSets = () => {
  const db = toConnectDB();

  db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='sets'",
    (err, result) => {
      if (err) {
        console.error(err.message);
      }
      if (!result) {
        // Таблицы не существует, создаем ее
        db.run(
          'CREATE TABLE sets (id TEXT, title TEXT, cost INTEGER, type TEXT, power TEXT, descripMain TEXT, photo TEXT, descripCharacter TEXT, descripPhoto TEXT,  components TEXT, home TEXT)',
          err => {
            if (err) {
              console.error(err.message);
            }
            console.log('Таблица /sets/ создана.');
          }
        );
      }
    }
  );

  toCloseDB(db);
};

const alterTableDB = (tableName, newColumnName, datatype = 'TEXT') => {
  return new Promise((resolve, reject) => {
    const db = toConnectDB();

    db.get(`PRAGMA table_info(${tableName})`, (err, rows) => {
      if (err) {
        console.error(err.message);
        return reject(err);
      }

      const columns = Array.from(rows);

      const columnExists = columns.some(column => column.name === tableName);

      if (columnExists) {
        console.log('Столбец существует.');
        return reject('Столбец существует.');
      }

      db.run(
        `ALTER TABLE ${tableName} ADD COLUMN ${newColumnName} ${datatype}`,
        function (err) {
          if (err) {
            console.error(err.message);
            toCloseDB(db);
            return reject(err);
          }
          console.log(
            `Column /${newColumnName}/ successfully added to the table /${tableName}/.`
          );
          toCloseDB(db);
          resolve('successfully');
        }
      );
    });
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
    const db = toConnectDB();

    const home = {
      value: false,
      series: 999,
    };

    db.run(
      `INSERT INTO sets(id , title , cost , type , power , descripMain , photo , descripCharacter , descripPhoto,  components, home) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
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
        JSON.stringify(home),
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
    const db = toConnectDB();

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
    const db = toConnectDB();

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

const getComponents = type => {
  return new Promise((resolve, reject) => {
    const db = toConnectDB();

    let query = 'SELECT * FROM components';

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

const getOneSet = id => {
  return new Promise((resolve, reject) => {
    const db = toConnectDB();

    db.get(`SELECT * FROM sets WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err.message);

      resolve(row);
    });
    toCloseDB(db);
  });
};

const getOneComponent = id => {
  return new Promise((resolve, reject) => {
    const db = toConnectDB();

    db.get(`SELECT * FROM components WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err.message);

      resolve(row);
    });
    toCloseDB(db);
  });
};

const deleteSet = id => {
  return new Promise((resolve, reject) => {
    const db = toConnectDB();

    db.run(`DELETE FROM sets WHERE id = ?`, [id], function (err) {
      if (err) reject(err);

      resolve(this.changes);
    });

    toCloseDB(db);
  });
};

const deleteComponents = id => {
  return new Promise((resolve, reject) => {
    const db = toConnectDB();

    db.run(`DELETE FROM components WHERE id = ?`, [id], function (err) {
      if (err) reject(err);

      resolve(this.changes);
    });

    toCloseDB(db);
  });
};

const updateSet = (
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
    const db = toConnectDB();

    db.run(
      `UPDATE sets SET title = COALESCE(?, title), cost = COALESCE(?, cost), type = COALESCE(?, type), power = COALESCE(?, power), descripMain = COALESCE(?, descripMain), photo = COALESCE(?, photo), descripCharacter = COALESCE(?, descripCharacter), descripPhoto = COALESCE(?, descripPhoto), components = COALESCE(?, components) WHERE id = ?`,
      [
        title,
        cost,
        type,
        power,
        descripMain,
        photo,
        descripCharacter,
        descripPhoto,
        components,
        id,
      ],
      function (err) {
        if (err) reject(err.message);

        db.get(`SELECT * FROM sets WHERE id = ?`, [id], function (err, row) {
          if (err) reject(err.message);

          resolve(row);
        });
      }
    );

    toCloseDB(db);
  });
};

const updateComponent = (
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
    const db = toConnectDB();

    db.run(
      `UPDATE components SET title = COALESCE(?, title), type = COALESCE(?, type), cost = COALESCE(?, cost), photo = COALESCE(?, photo), brand = COALESCE(?, brand), country = COALESCE(?, country), optionSort = COALESCE(?, optionSort), descripMain = COALESCE(?, descripMain), descripCharacter = COALESCE(?, descripCharacter) WHERE id = ?`,
      [
        title,
        type,
        cost,
        photo,
        brand,
        country,
        optionSort,
        descripMain,
        descripCharacter,
        id,
      ],
      function (err) {
        if (err) reject(err.message);

        db.get(
          `SELECT * FROM components WHERE id = ?`,
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

const updateOrderSets = objects => {
  return new Promise((resolve, reject) => {
    const db = toConnectDB();

    objects.forEach(({ id, series }) => {
      console.log(series, 'series');
      const home = {
        value: true,
        series: series,
      };

      db.run(
        'UPDATE sets SET home = ? WHERE id = ?',
        [JSON.stringify(home), id],
        function (err) {
          if (err) reject(err);
        }
      );
    });

    resolve('OK');

    toCloseDB(db);
  });
};

const updateHomeSets = (id, home) => {
  return new Promise((resolve, reject) => {
    const db = toConnectDB();

    db.run(
      'UPDATE sets SET home = ? WHERE id = ?',
      [JSON.stringify(home), id],
      function (err) {
        console.error(err);
        if (err) reject(err);
      }
    );

    resolve('OK');

    toCloseDB(db);
  });
};

module.exports = {
  createTableComponents,
  createTableSets,
  alterTableDB,
  createSet,
  createComponents,
  getSets,
  getComponents,
  deleteSet,
  deleteComponents,
  getOneSet,
  getOneComponent,
  updateSet,
  updateComponent,
  updateOrderSets,
  updateHomeSets,
};
