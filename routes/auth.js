const express = require('express');
const router = express.Router();

// Simulación de base de datos de usuarios
let users = [];

// Registro
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  // Aquí deberías validar el email, encriptar la contraseña y guardarlo en MongoDB.
  const newUser = { id: users.length + 1, username, email, password };
  users.push(newUser);

  res.status(201).json({ message: 'Usuario creado exitosamente.', user: newUser });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  res.json({ message: 'Login exitoso.', user });
});

module.exports = router;
