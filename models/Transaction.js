// models/Transaction.js
const mongoose = require('mongoose');

/**
 * Esquema de Transacción.
 * Incluye:
 * - userId (referencia al usuario)
 * - scriptId (referencia al script comprado)
 * - amount (precio de la compra)
 * - status: completed, pending, failed
 * - timestamps para auditoría
 */
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scriptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Script',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
