// middleware/validate.middleware.js
const logger = require('../utils/logger');

/**
 * Middleware de validación de datos.
 * Puede usarse con Joi, express-validator o lógica personalizada.
 * Aquí lo dejamos genérico para que puedas integrarlo fácilmente.
 */
exports.validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map(detail => detail.message).join(', ');
      logger.warn(`⚠️ Datos inválidos: ${details}`);
      return res.status(400).json({
        success: false,
        message: `Datos inválidos: ${details}`
      });
    }
    next();
  };
};
