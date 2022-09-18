const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const receiverDocumentSchema = new Schema({
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  document: {
    type: Schema.Types.ObjectId,
    ref: "Document",
  },
  isDelete: {
    type: Boolean,
    default: false,
    select: false,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("ReceiverDocument", receiverDocumentSchema);
