const mongoose = require("mongoose");

const profileSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  about: { type: String, default: "" },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  gender: { type: String, default: "" },
  day: { type: String, default: "" },
  month: { type: String, default: "" },
  year: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },
  address: { type: String, default: "" },
  otherLink: { type: String, default: "" },
  background: { type: String, default: "" },
});

module.exports = mongoose.model("Profile", profileSchema);
