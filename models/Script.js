// models/Script.js
const mongoose = require('mongoose');

/**
 * Esquema de Script.
 * Incluye:
 * - title
 * - description
 * - price
 * - downloadUrl
 * - type: free o pago
 */
const scriptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  downloadUrl: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['free', 'paid'],
    default: 'free'
  }
}, { timestamps: true });

module.exports = mongoose.model('Script', scriptSchema);
