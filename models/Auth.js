const { Schema, model } = require('mongoose');

const authSchema = new Schema(
  {
    // _id = userId
    email: { type: String, required: true },
    nickname: { type: String, required: true },
    password: { type: String, require: true },
    profileImage: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'rDate', updatedAt: 'uDate' } }
);

module.exports = model('Auth', authSchema);
