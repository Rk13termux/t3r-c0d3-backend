// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Esquema de Usuario.
 * Incluye:
 * - username
 * - email
 * - password (hash)
 * - role: free, premium, admin
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
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
  role: {
    type: String,
    enum: ['free', 'premium', 'admin'],
    default: 'free'
  }
}, { timestamps: true });

/**
 * Pre-save hook para cifrar la contraseña antes de guardarla.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Método para comparar contraseñas.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
