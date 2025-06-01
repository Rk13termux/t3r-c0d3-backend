const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String
  },
  role: {
    type: String,
    enum: ['free', 'pro', 'admin'],
    default: 'free'
  },
  scriptsPurchased: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Script'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseñas en login
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
