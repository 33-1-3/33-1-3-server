const { Schema, model } = require('mongoose');

const infoSchema = new Schema({
  price: { type: String },
  date: { type: String },
  state: { type: String },
});

const userVinylSchema = new Schema(
  {
    // _id = userVinylId
    releasedId: { type: Number, required: true },
    userId: { type: Number, required: true },
    info: [infoSchema],
    memo: { type: String },
  },
  { timestamps: { createdAt: false, updatedAt: 'uDate' } }
);

module.exports = model('UserVinyl', userVinylSchema);
