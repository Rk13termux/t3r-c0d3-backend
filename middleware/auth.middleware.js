// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware para verificar el token JWT y adjuntar el usuario al request.
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado. Token faltante.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado.' });
    }

    req.user = user; // Adjunto el usuario al request
    next();
  } catch (error) {
    logger.error(`❌ Error de autenticación: ${error.message}`);
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

/**
 * Middleware para verificar el rol del usuario.
 * @param {Array} roles - Array de roles permitidos (e.g. ['admin', 'premium']).
 */
exports.authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso denegado. Permisos insuficientes.' });
    }
    next();
  };
};
