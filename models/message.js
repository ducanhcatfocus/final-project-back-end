const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const FileSchema = new Schema({
  resource_type: String,
  fileUrl: String,
});
const messageSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  content: { type: String },
  date: { type: Date },
  type: { type: String },
  file: [FileSchema],
});

module.exports = mongoose.model("Message", messageSchema);
