const express = require('express');
const router = express.Router();

// Ruta: POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  // Validación básica
  if (!email || !password || !username) {
    return res.status(400).json({ message: 'Username, email y contraseña son requeridos.' });
  }

  // Simulación de registro (en la vida real guardarías en MongoDB)
  const newUser = {
    id: Date.now(),
    username,
    email,
    password
  };

  // Enviar respuesta simulada
  res.status(201).json({
    message: 'Usuario registrado exitosamente.',
    user: newUser
  });
});

module.exports = router;
