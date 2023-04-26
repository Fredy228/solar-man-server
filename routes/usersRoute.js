const express = require('express');

const validators = require('../services/joiValidate');

const router = express.Router();

const {
  createUser,
  getUsers,
  deleteUser,
  updateUser,
  checkDoubleName,
} = require('../database/userDB');

router.post('/register', async (req, res) => {
  try {
    const { value, error } = validators.userRegister(req.body);

    if (error) return res.status(400).json({ message: error.message });

    const { name, role, password } = value;

    const isName = await checkDoubleName(name);

    if (isName)
      return res
        .status(400)
        .json({ message: `Name ${name} already exists in the database` });

    const newUser = await createUser(
      name,
      'solarmanua@gmail.com',
      role,
      password
    );
    console.log(newUser);
    res.status(200).json({ Status: 'OK Created', user: newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await getUsers();

    res.status(200).json({ Status: 'OK Got', users });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const delUser = await deleteUser(id);

    res.status(200).json({ Status: 'OK Deleted', rows: delUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { value, error } = validators.userUpdate(req.body);

    if (error) return res.status(400).json({ message: error.message });

    const { name, email } = value;

    const isName = await checkDoubleName(name);

    if (isName)
      return res
        .status(400)
        .json({ message: `Name ${name} already exists in the database` });

    const updatedUser = await updateUser(name, email, id);
    updatedUser.password = undefined;

    res.status(200).json({ Status: 'OK Patched', rows: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
