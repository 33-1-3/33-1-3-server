const { Schema, model } = require('mongoose');

const commonVinylSchema = new Schema(
  {
    releasedId: { type: Number, required: true },
    count: { type: Number, default: 1 },
    imgUrl: { type: String, default: '' },
    title: { type: String, default: '' },
    artist: { type: String, default: '' },
    released: { type: String },
    genre: [{ type: String }],
  },
  { timestamps: { createdAt: 'rDate', updatedAt: 'uDate' } }
);

module.exports = model('CommonVinyl', commonVinylSchema);
