const express = require('express');

const validators = require('../services/joiValidate');
const { checkPassword } = require('../services/hashPassword');
const { singToken } = require('../services/createToken');
const { protect, allowFor } = require('../middleware/tokenAuth');

const router = express.Router();

const {
  createUser,
  getUsers,
  updatePass,
  deleteUser,
  updateUser,
  getUserByName,
} = require('../services/userDB');

router.post('/register', protect, allowFor('admin'), async (req, res) => {
  try {
    const { value, error } = validators.userRegister(req.body);

    if (error) return res.status(400).json({ message: error.message });

    const { name, role, password } = value;

    const isName = await getUserByName(name);

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

    res.status(200).json({ Status: 'OK Created', user: newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await getUserByName(name);
    if (!user)
      return res.status(401).json({ message: `Username or password is wrong` });

    const passIsVavid = await checkPassword(password, user.password);

    if (!passIsVavid)
      return res.status(401).json({ message: `Username or password is wrong` });

    const token = singToken(user.id);
    const updatedUser = await updateUser({ token, id: user.id });

    res.status(200).json({ Status: 'OK Authorized', user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/logout', protect, async (req, res) => {
  try {
    await updateUser({ token: 'null', id: req.user.id });

    res.status(204).json({
      Status: '204 No Content',
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/check-auth', protect, async (req, res) => {
  try {
    res.status(200).json({
      status: true,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/users', protect, allowFor('admin'), async (req, res) => {
  try {
    const users = await getUsers();

    res.status(200).json({ Status: 'OK Got', users });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/delete/:id', protect, allowFor('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const delUser = await deleteUser(id);

    res.status(200).json({ Status: 'OK Deleted', rows: delUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch(
  '/update-role/:userName',
  protect,
  allowFor('admin'),
  async (req, res) => {
    try {
      const { userName } = req.params;
      const { value, error } = validators.userUpdate(req.body);

      if (error) return res.status(400).json({ message: error.message });

      const { role } = value;

      const user = await getUserByName(userName);

      if (!user)
        return res
          .status(400)
          .json({ message: `Name ${userName} don't exists in the database` });

      const updatedUser = await updateUser({ role, id: user.id });
      updatedUser.password = undefined;

      res.status(200).json({ Status: 'OK Patched', user: updatedUser });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.patch('/update-me', protect, async (req, res) => {
  try {
    const { id } = req.user;
    const { value, error } = validators.userUpdate(req.body);

    if (error) return res.status(400).json({ message: error.message });
    const { name, email } = value;

    const user = await getUserByName(name);

    if (user)
      return res
        .status(400)
        .json({ message: `Name ${name} already exists in the database` });

    const updatedUser = await updateUser({ name, email, id });
    updatedUser.password = undefined;

    res.status(200).json({ Status: 'OK Patched', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

router.patch('/update-pass', protect, async (req, res) => {
  try {
    const { id } = req.user;
    const { value, error } = validators.userUpdate(req.body);

    if (error) return res.status(400).json({ message: error.message });

    const { newPass } = value;
    const { password } = req.body;

    const passIsVavid = await checkPassword(password, req.user.password);

    if (!passIsVavid)
      return res.status(400).json({ message: `Username or password is wrong` });

    const updatedUser = await updatePass(newPass, id);

    res.status(200).json({ Status: 'OK Patched', user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
