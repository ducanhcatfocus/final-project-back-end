const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  notifications: [
    {
      sender: { type: String },
      content: { type: String },
      createAt: {
        type: Date,
        default: Date.now(),
      },
      isDelete: {
        type: Boolean,
        default: false,
      },
      isRead: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model("Notification", notificationSchema);
