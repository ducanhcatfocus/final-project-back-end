const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  receiverId: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  document: {
    title: String,
    content: String,
    doc: { type: Object, url: String, public_id: String, filename: String },
  },
  isFlow: {
    type: Boolean,
    default: false,
  },
  index: {
    type: Number,
    default: 0,
  },
  isCancel: {
    type: Boolean,
    default: false,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Document", documentSchema);
