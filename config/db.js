// config/db.js
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Conexión robusta a MongoDB.
 * Se usa Mongoose con opciones de producción.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('✅ Conexión exitosa a MongoDB Atlas');
  } catch (error) {
    logger.error(`❌ Error al conectar a MongoDB: ${error.message}`);
    process.exit(1); // Detiene la app en caso de fallo
  }
};

module.exports = connectDB;
