// routes/script.routes.js
const express = require('express');
const router = express.Router();
const scriptController = require('../controllers/script.controller');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const Joi = require('joi');

// Esquema de validación para crear script
const createScriptSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow(''),
  price: Joi.number().min(0).required(),
  downloadUrl: Joi.string().required(),
  type: Joi.string().valid('free', 'paid').required()
});

// Rutas
router.get('/', scriptController.getScripts);
router.post(
  '/',
  verifyToken,
  authorizeRoles(['admin']),
  validateRequest(createScriptSchema),
  scriptController.createScript
);
router.get('/:id/download', verifyToken, scriptController.getScriptDownload);

module.exports = router;
