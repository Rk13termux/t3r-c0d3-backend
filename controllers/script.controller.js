// controllers/script.controller.js
const Script = require('../models/Script');
const { generateSignedUrl } = require('../config/s3');
const logger = require('../utils/logger');

/**
 * Listar todos los scripts disponibles.
 * Se puede filtrar por tipo si se requiere.
 */
exports.getScripts = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const scripts = await Script.find(filter);
    res.status(200).json(scripts);
  } catch (error) {
    logger.error(`❌ Error al listar scripts: ${error.message}`);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

/**
 * Crear un nuevo script (solo admin).
 */
exports.createScript = async (req, res) => {
  try {
    const { title, description, price, downloadUrl, type } = req.body;

    if (!title || !price || !downloadUrl) {
      return res.status(400).json({ message: 'Título, precio y URL de descarga son requeridos.' });
    }

    const newScript = new Script({ title, description, price, downloadUrl, type });
    await newScript.save();

    logger.info(`✅ Script creado: ${newScript.title}`);
    res.status(201).json({ message: 'Script creado exitosamente.', script: newScript });
  } catch (error) {
    logger.error(`❌ Error al crear script: ${error.message}`);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};

/**
 * Obtener URL firmada para descargar un script.
 * Verifica acceso según tipo (free o paid) y rol de usuario.
 */
exports.getScriptDownload = async (req, res) => {
  try {
    const scriptId = req.params.id;
    const user = req.user; // Asume que auth.middleware.js adjunta user al request

    const script = await Script.findById(scriptId);
    if (!script) {
      return res.status(404).json({ message: 'Script no encontrado.' });
    }

    // Acceso abierto si es free
    if (script.type === 'free') {
      return res.status(200).json({ url: script.downloadUrl });
    }

    // Verificar permisos de pago o rol premium/admin
    if (user.role === 'premium' || user.role === 'admin') {
      const signedUrl = generateSignedUrl(script.downloadUrl);
      return res.status(200).json({ url: signedUrl });
    }

    // Verificar si el usuario compró el script
    const hasPurchased = true; // Integrar lógica real con Transaction
    if (hasPurchased) {
      const signedUrl = generateSignedUrl(script.downloadUrl);
      return res.status(200).json({ url: signedUrl });
    }

    return res.status(403).json({ message: 'No tienes acceso a este script.' });
  } catch (error) {
    logger.error(`❌ Error al obtener URL de descarga: ${error.message}`);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
};
