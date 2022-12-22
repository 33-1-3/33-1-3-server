const { Schema, model } = require('mongoose');

const commonVinylSchema = new Schema(
  {
    // _id = releasedId
    _id: { type: String, required: true },
    imgUrl: { type: String, default: '' },
    title: { type: String, default: '' },
    artist: { type: String, default: '' },
    year: { type: String, default: '' },
    genre: [{ type: String }],
    resourceUrl: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'rDate', updatedAt: 'uDate' } }
);

module.exports = model('CommonVinyl', commonVinylSchema);
