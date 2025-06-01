// config/s3.js
const AWS = require('aws-sdk');
const logger = require('../utils/logger');

/**
 * Configuración de Amazon S3 para producción.
 * Se usa para subir y generar URLs de scripts.
 */
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1' // Ajusta según tu región
});

/**
 * Generar URL firmada para descargas protegidas.
 * @param {string} key - Nombre del archivo en el bucket
 * @param {number} expiresIn - Tiempo de expiración en segundos
 * @returns {string} URL firmada
 */
const generateSignedUrl = (key, expiresIn = 60 * 60) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Expires: expiresIn
  };

  try {
    const url = s3.getSignedUrl('getObject', params);
    logger.info(`🔑 URL firmada generada para ${key}`);
    return url;
  } catch (error) {
    logger.error(`❌ Error generando URL firmada: ${error.message}`);
    throw error;
  }
};

module.exports = { s3, generateSignedUrl };
