const { Schema, model } = require('mongoose');

const infoSchema = new Schema({
  price: { type: String },
  date: { type: String },
  state: { type: String },
});

const dateSchema = new Schema(
  {
    collectionId: { type: Number, required: true },
    uDate: { type: Date },
  },
  { timestamps: { createdAt: 'rDate', updatedAt: false } }
);

const vinylSchema = new Schema({
  releasedId: { type: Number, required: true },
  info: [infoSchema],
  memo: { type: String },
  dates: [dateSchema],
});

module.exports = model('Vinyl', vinylSchema);
