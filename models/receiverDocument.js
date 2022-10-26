const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const receiverDocumentSchema = new Schema({
  receiverEmail: String,
  document: {
    type: Schema.Types.ObjectId,
    ref: "Document",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("ReceiverDocument", receiverDocumentSchema);
