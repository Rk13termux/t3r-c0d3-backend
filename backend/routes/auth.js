const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;

// Registro por email
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ msg: 'Email y contraseña requeridos' });

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'El usuario ya existe' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hash });
    await user.save();
    res.json({ msg: 'Usuario registrado correctamente' });
  } catch (e) {
    res.status(500).json({ msg: 'Error de servidor' });
  }
});

// Login por email
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ msg: 'Email y contraseña requeridos' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: 'Credenciales incorrectas' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ msg: 'Credenciales incorrectas' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ msg: 'Error de servidor' });
  }
});

// Login/registro por Telegram
router.post('/telegram-login', async (req, res) => {
  const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.body;
  if (!id || !username || !hash) return res.status(400).json({ msg: 'Datos incompletos' });

  const secret = crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest();
  const dataCheckString = Object.keys(req.body)
    .filter(k => k !== 'hash')
    .sort()
    .map(k => `${k}=${req.body[k]}`)
    .join('\n');
  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  if (hmac !== hash) return res.status(401).json({ msg: 'Datos de Telegram no válidos' });

  try {
    let user = await User.findOne({ telegramId: id });
    if (!user) {
      user = new User({ telegramId: id, username, first_name, last_name, photo_url });
      await user.save();
    }
    const token = jwt.sign({ id: user._id, telegramId: id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ msg: 'Error de servidor' });
  }
});

module.exports = router;