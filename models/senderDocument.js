const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const sendDocumentSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  documents: [
    {
      documentId: {
        type: Schema.Types.ObjectId,
        ref: "Document",
      },
      receivers: [{ receiverEmail: String }],
      isDelete: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model("SendDocument", sendDocumentSchema);
