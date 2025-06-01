const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['Termux', 'Windows', 'Linux', 'Otro'],
    default: 'Otro'
  },
  price: {
    type: Number,
    default: 0  // 0 = gratuito
  },
  downloadUrl: {
    type: String,
    required: true
  },
  premium: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Script', scriptSchema);
