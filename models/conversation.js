const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
      index: true,
    },
  ],
  newMessage: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model("Conversation", conversationSchema);




