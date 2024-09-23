const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, 'my_super_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
};

router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    res.status(201).send('User created');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).send('User not found');
    user.username = username || user.username;
    if (password) user.password = password;
    await user.save();
    res.status(200).send('User updated');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).send('User not found');
    await user.remove();
    res.status(200).send('User deleted');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
