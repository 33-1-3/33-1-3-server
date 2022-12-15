const { Schema, model } = require('mongoose');

const commonVinylSchema = new Schema(
  {
    // _id = releasedId
    _id: { type: Number, required: true },
    imgUrl: { type: String, default: '' },
    title: { type: String, default: '' },
    artist: { type: String, default: '' },
    released: { type: Number },
    genre: [{ type: String }],
  },
  { timestamps: { createdAt: 'rDate', updatedAt: 'uDate' } }
);

module.exports = model('CommonVinyl', commonVinylSchema);
