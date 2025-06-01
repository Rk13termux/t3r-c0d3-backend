// utils/email.js
const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Configuración de transporte de correo electrónico con Nodemailer.
 * Se puede adaptar para usar Amazon SES u otro servicio SMTP.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true para puerto 465, false para otros
  auth: {
    user: process.env.SMTP_USER || 'tu-email@example.com',
    pass: process.env.SMTP_PASS || 'tu-password'
  }
});

/**
 * Enviar email.
 * @param {string} to - Destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} text - Texto del correo (opcional)
 * @param {string} html - HTML del correo (opcional)
 */
const sendEmail = async (to, subject, text = '', html = '') => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'Tienda de Scripts <no-reply@example.com>',
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`📧 Email enviado: ${info.messageId}`);
  } catch (error) {
    logger.error(`❌ Error al enviar email: ${error.message}`);
  }
};

module.exports = { sendEmail };
