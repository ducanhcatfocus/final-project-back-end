const Profile = require("../models/profile");
const User = require("../models/user");
const { sendError } = require("../utils/helper");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});

const getProfile = async (req, res) => {
  const { userId } = req.params;
  const { _id: myId } = req.user;
  console.log(userId);
  console.log(myId);

  if (userId === myId.toString()) {
    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      const newProfile = await Profile.create({
        user: userId,
        about: "",
        firstName: "",
        lastName: "",
        gender: "",
        day: "",
        month: "",
        year: "",
        phoneNumber: "",
        address: "",
        otherLink: "",
        background: "",
      });
      return res.status(200).json({ profile: newProfile });
    }

    return res.status(200).json({ profile });
  }
  const profile = await Profile.findOne({ user: userId }).populate(
    "user",
    "name email avatar friends"
  );

  if (!profile) return sendError(res, "User profile not found!");
  return res.status(200).json({ profile });
};

const updateProfile = async (req, res) => {
  const { _id: myId } = req.user;
  const { file } = req;
  console.log(file);
  console.log(req.body);

  if (file) {
    const { secure_url } = await cloudinary.uploader.upload(file.path, {
      folder: "avatar",
    });
    await User.findByIdAndUpdate(myId, { $set: { avatar: secure_url } });
  }

  const profile = await Profile.findOneAndUpdate(
    { user: myId },
    { $set: req.body }
  );
  if (!profile) return sendError(res, "User profile not found!");
  return res.status(200).json({ message: "Profile updated!" });
};

module.exports = {
  getProfile,
  updateProfile,
};
