// controllers/payment.controller.js
const paypal = require('../config/paypal');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

/**
 * Crear orden de pago en PayPal.
 * Retorna la URL de aprobación al cliente.
 */
exports.createOrder = async (req, res) => {
  try {
    const { scriptId, amount } = req.body;

    if (!scriptId || !amount) {
      return res.status(400).json({ message: 'scriptId y amount son requeridos.' });
    }

    const request = new paypal.core.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount
          }
        }
      ]
    });

    const order = await paypal.client().execute(request);
    logger.info(`✅ Orden de pago creada: ${order.result.id}`);

    res.status(201).json({
      orderId: order.result.id,
      approvalLink: order.result.links.find(link => link.rel === 'approve').href
    });
  } catch (error) {
    logger.error(`❌ Error al crear orden: ${error.message}`);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

/**
 * Capturar pago de una orden de PayPal.
 * Registra la transacción como completada.
 */
exports.captureOrder = async (req, res) => {
  try {
    const { orderId, userId, scriptId, amount } = req.body;

    if (!orderId || !userId || !scriptId || !amount) {
      return res.status(400).json({ message: 'orderId, userId, scriptId y amount son requeridos.' });
    }

    const request = new paypal.core.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await paypal.client().execute(request);

    if (capture.result.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Pago no completado.' });
    }

    const transaction = new Transaction({
      userId,
      scriptId,
      amount,
      status: 'completed'
    });

    await transaction.save();
    logger.info(`💰 Pago registrado: ${transaction._id}`);

    res.status(200).json({
      message: 'Pago completado exitosamente.',
      transactionId: transaction._id
    });
  } catch (error) {
    logger.error(`❌ Error al capturar pago: ${error.message}`);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};
