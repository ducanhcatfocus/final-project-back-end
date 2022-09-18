const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, trim: true, unique: true, required: true },
  password: { type: String, required: true },
  avatar: {
    type: String,
    default:
      "https://res.cloudinary.com/dzhpyrb7b/image/upload/v1659260703/default-avatar_uu3qqx.jpg",
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  friends: [{ type: mongoose.Schema.Types.Object, ref: "User" }],
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

module.exports = mongoose.model("User", userSchema);
