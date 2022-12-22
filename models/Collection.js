const { Schema, model } = require('mongoose');

const vinylSchema = new Schema(
  {
    releasedId: { type: String, required: true },
  },
  { timestamps: { createdAt: 'rDate', updatedAt: false } }
);

const collectionSchema = new Schema(
  {
    //  _id = collectionId
    title: { type: String, required: true },
    vinyls: [vinylSchema],
    userId: { type: String, required: true },
  },
  { timestamps: { createdAt: 'rDate', updatedAt: 'uDate' } }
);

module.exports = model('Collection', collectionSchema);
