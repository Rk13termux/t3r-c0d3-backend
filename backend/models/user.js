const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true, lowercase: true },
  password: String,
  telegramId: { type: String, unique: true, sparse: true },
  username: String,
  first_name: String,
  last_name: String,
  photo_url: String
});

module.exports = mongoose.model('User', UserSchema);