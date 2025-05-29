require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

app.use(cors());
app.use(express.json());

// Crear tabla si no existe
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    telegram_id TEXT UNIQUE,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    photo_url TEXT
  )
`);

// Registro por email
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Email y contraseña requeridos' });
  try {
    const exists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (exists.rows.length) return res.status(400).json({ msg: 'El usuario ya existe' });
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hash]);
    res.json({ msg: 'Usuario registrado correctamente' });
  } catch (e) {
    res.status(500).json({ msg: 'Error de servidor' });
  }
});

// Login por email
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Email y contraseña requeridos' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ msg: 'Credenciales incorrectas' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ msg: 'Credenciales incorrectas' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ msg: 'Error de servidor' });
  }
});

// Login/registro por Telegram
app.post('/api/telegram-login', async (req, res) => {
  const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.body;
  if (!id || !username || !hash) return res.status(400).json({ msg: 'Datos incompletos' });
  const secret = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
  const dataCheckString = Object.keys(req.body)
    .filter(k => k !== 'hash')
    .sort()
    .map(k => `${k}=${req.body[k]}`)
    .join('\n');
  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  if (hmac !== hash) return res.status(401).json({ msg: 'Datos de Telegram no válidos' });
  try {
    let result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [id]);
    let user = result.rows[0];
    if (!user) {
      await pool.query(
        'INSERT INTO users (telegram_id, username, first_name, last_name, photo_url) VALUES ($1, $2, $3, $4, $5)',
        [id, username, first_name, last_name, photo_url]
      );
      result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [id]);
      user = result.rows[0];
    }
    const token = jwt.sign({ id: user.id, telegramId: id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ msg: 'Error de servidor' });
  }
});

app.get('/', (req, res) => res.send('API RK13 funcionando con PostgreSQL'));

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));