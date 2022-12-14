const { Schema, model } = require('mongoose');

const collectionsSchema = new Schema(
  {
    collectionId: { type: Number, required: true },
    title: { type: String, required: true },
    albums: [{ type: Number }],
  },
  { timestamps: { createdAt: 'rDate', updatedAt: 'uDate' } }
);

const userSchema = new Schema({
  userId: { type: Number, required: true },
  collections: [collectionsSchema],
});

module.exports = model('User', userSchema);
