const sqlite3 = require('sqlite3').verbose();

const toConectDB = () => {
  const db = new sqlite3.Database('database/database.db', err => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
  });

  db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
    (err, result) => {
      if (err) {
        console.error(err.message);
      }
      if (!result) {
        // Таблицы не существует, создаем ее
        db.run(
          'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, role TEXT, password TEXT)',
          err => {
            if (err) {
              console.error(err.message);
            }
            console.log('Таблица users создана.');
          }
        );
      } else {
        console.log('Таблица users уже существует.');
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

const createUser = (name, email, role, password) => {
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    db.run(
      `INSERT INTO users(name, email, role, password) VALUES(?,?,?,?)`,
      [name, email, role, password],
      function (err) {
        if (err) reject(err.message);

        const id = this.lastID;
        const newUser = { id, name, email, role };
        resolve(newUser);
      }
    );

    toCloseDB(db);
  });
};

const getUsers = () => {
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    db.all(`SELECT * FROM users`, [], function (err, rows) {
      if (err) reject(err.message);

      resolve(rows);
    });

    toCloseDB(db);
  });
};

const checkDoubleName = name => {
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    db.get(`SELECT * FROM users WHERE name = ?`, [name], (err, row) => {
      if (err) reject(err.message);

      resolve(row);
    });

    toCloseDB(db);
  });
};

const deleteUser = id => {
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
      if (err) reject(err.message);

      resolve(this.changes);
    });

    toCloseDB(db);
  });
};

const updateUser = (name, email, id) => {
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    db.run(
      `UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?`,
      [name, email, id],
      function (err) {
        if (err) reject(err.message);

        db.get(`SELECT * FROM users WHERE id = ?`, [id], function (err, row) {
          if (err) reject(err.message);

          resolve(row);
        });
      }
    );

    toCloseDB(db);
  });
};

module.exports = {
  createUser,
  getUsers,
  deleteUser,
  updateUser,
  checkDoubleName,
};
