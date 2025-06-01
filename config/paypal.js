// config/paypal.js
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const logger = require('../utils/logger');

/**
 * Configuración de PayPal para producción.
 * Usa el entorno de producción si está habilitado.
 */
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;

  if (!clientId || !clientSecret) {
    logger.error('❌ PAYPAL_CLIENT_ID o PAYPAL_SECRET no definidos en el entorno.');
    throw new Error('Configuración incompleta de PayPal');
  }

  if (process.env.NODE_ENV === 'production') {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
  }
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };
