const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const { hashPassword } = require('./hashPassword');
const { singToken } = require('./createToken');

const toConectDB = () => {
  const db = new sqlite3.Database('database/users.db', err => {
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
          'CREATE TABLE users (id TEXT, name TEXT, email TEXT, role TEXT, password TEXT, token TEXT)',
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

const createUser = async (name, email, role, password) => {
  const hashedPass = await hashPassword(password);

  return new Promise((resolve, reject) => {
    const db = toConectDB();

    const id = uuidv4();
    const token = singToken(id);

    db.run(
      `INSERT INTO users(id, name, email, role, password, token) VALUES(?,?,?,?,?,?)`,
      [id, name, email, role, hashedPass, token],
      function (err) {
        if (err) reject(err.message);

        const newUser = { id, name, email, role, token };
        console.log(newUser);
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

const getUserById = id => {
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
      if (err) reject(err.message);

      resolve(row);
    });
    toCloseDB(db);
  });
};

const getUserByName = name => {
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

const updateUser = ({ name, email, token, id, role }) => {
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    db.run(
      `UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), token = COALESCE(?, token) WHERE id = ?`,
      [name, email, role, token, id],
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

const updatePass = async (password, id) => {
  const hashedPass = await hashPassword(password);
  return new Promise((resolve, reject) => {
    const db = toConectDB();

    db.run(
      `UPDATE users SET password = COALESCE(?, password) WHERE id = ?`,
      [hashedPass, id],
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
  getUserById,
  deleteUser,
  updateUser,
  getUserByName,
  updatePass,
};
