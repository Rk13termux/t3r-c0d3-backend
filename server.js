// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const scriptRoutes = require('./routes/script.routes');
const paymentRoutes = require('./routes/payment.routes');

// Inicializar app
const app = express();

// Seguridad y Middlewares globales
app.use(helmet());
app.use(cors({
  origin: '*', // Ajustar según el dominio de la APK
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // Límite de 100 requests por IP
}));
app.use(morgan('combined', { stream: logger.stream }));

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info('✅ Conectado a MongoDB Atlas'))
  .catch(err => {
    logger.error(`❌ Error al conectar a MongoDB: ${err.message}`);
    process.exit(1);
  });

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/payments', paymentRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({ message: '🚀 Backend de la Tienda de Scripts funcionando.' });
});

// Middleware de errores global
app.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`🚀 Servidor corriendo en el puerto ${PORT}`));
