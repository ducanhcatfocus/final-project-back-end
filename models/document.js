const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const documentSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  receivers: [],
  subject: String,
  content: String,
  file: [
    {
      url: String,
      filename: String,
      mimetype: String,
    },
  ],
  createAt: {
    type: Date,
    default: Date.now(),
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Document", documentSchema);
