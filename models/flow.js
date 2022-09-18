const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const flowSchema = new Schema({
  createdId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    default: "list-name",
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Flow", flowSchema);
