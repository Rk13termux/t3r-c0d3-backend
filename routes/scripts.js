const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const Script = require('../models/Script');
const User = require('../models/User');

// Configurar AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token inválido:', error);
    res.status(401).json({ message: 'Token inválido.' });
  }
};

// Obtener lista de scripts
router.get('/list', async (req, res) => {
  try {
    const scripts = await Script.find({});
    res.status(200).json(scripts);
  } catch (error) {
    console.error('Error al obtener scripts:', error);
    res.status(500).json({ message: 'Error al obtener la lista de scripts.' });
  }
});

// Descargar script (requiere autenticación)
router.get('/download/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const scriptId = req.params.id;

    const script = await Script.findById(scriptId);
    if (!script) {
      return res.status(404).json({ message: 'Script no encontrado.' });
    }

    // Validar acceso premium
    if (script.premium) {
      const user = await User.findById(userId);
      if (!user || !user.scriptsPurchased.includes(scriptId)) {
        return res.status(403).json({ message: 'No has comprado este script premium.' });
      }
    }

    // Generar presigned URL
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: script.downloadUrl.replace(`https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/`, ''),
      Expires: 60 * 5 // 5 minutos
    };

    const url = s3.getSignedUrl('getObject', params);
    res.status(200).json({ url });
  } catch (error) {
    console.error('Error en descarga:', error);
    res.status(500).json({ message: 'Error al procesar la descarga.' });
  }
});

module.exports = router;
