// routes/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const Joi = require('joi');

// Esquema de validación para crear orden de pago
const createOrderSchema = Joi.object({
  scriptId: Joi.string().required(),
  amount: Joi.number().required()
});

// Esquema de validación para capturar pago
const captureOrderSchema = Joi.object({
  orderId: Joi.string().required(),
  userId: Joi.string().required(),
  scriptId: Joi.string().required(),
  amount: Joi.number().required()
});

// Rutas
router.post('/create-order', verifyToken, validateRequest(createOrderSchema), paymentController.createOrder);
router.post('/capture-order', verifyToken, validateRequest(captureOrderSchema), paymentController.captureOrder);

module.exports = router;
