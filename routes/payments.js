const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Script = require('../models/Script');

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token inválido:', error);
    res.status(401).json({ message: 'Token inválido.' });
  }
};

// Endpoint para confirmar pago de un script premium
router.post('/confirm', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { scriptId, paymentId, paymentProvider } = req.body;

    // Validar campos básicos
    if (!scriptId || !paymentId || !paymentProvider) {
      return res.status(400).json({ message: 'Faltan datos de pago.' });
    }

    // Validar que el script existe y es premium
    const script = await Script.findById(scriptId);
    if (!script || !script.premium) {
      return res.status(404).json({ message: 'Script premium no encontrado.' });
    }

    // (Aquí podrías integrar la validación real con Stripe o Google Play)
    // Ejemplo de validación simple simulada:
    console.log(`Validando pago con ${paymentProvider}: ID ${paymentId}`);
    // TODO: Integrar con Stripe o Google Play Billing

    // Actualizar el usuario: agregar script comprado
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (!user.scriptsPurchased.includes(scriptId)) {
      user.scriptsPurchased.push(scriptId);
      await user.save();
    }

    res.status(200).json({ message: 'Pago confirmado. Script desbloqueado.' });
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    res.status(500).json({ message: 'Error al procesar el pago.' });
  }
});

module.exports = router;
