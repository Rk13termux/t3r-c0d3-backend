// middleware/error.middleware.js
const logger = require('../utils/logger');

/**
 * Middleware global de manejo de errores.
 * Captura cualquier error que ocurra en el servidor y devuelve una respuesta estandarizada.
 */
exports.errorHandler = (err, req, res, next) => {
  logger.error(`❌ Error: ${err.message}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor.';

  res.status(statusCode).json({
    success: false,
    message
  });
};
