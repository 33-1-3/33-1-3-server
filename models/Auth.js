const { Schema, model } = require('mongoose');

const authSchema = new Schema(
  {
    userId: { type: Number, required: true },
    email: { type: String, required: true },
    nickname: { type: String, required: true },
    password: { type: String, require: true },
    profileImage: { type: String },
  },
  { timestamps: { createdAt: 'rDate', updatedAt: 'uDate' } }
);

module.exports = model('Auth', authSchema);
