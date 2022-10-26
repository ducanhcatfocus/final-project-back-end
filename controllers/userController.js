const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");
const User = require("../models/user");
const EmailVerifyToken = require("../models/emailVerifytoken");
const PasswordResetToken = require("../models/passwordResetToken");
const sendEmail = require("../config/sendMail");
const { generateOTP } = require("../utils/generateOTP");
const { sendError, generateRandomByte } = require("../utils/helper");
const Profile = require("../models/profile");

const create = async (req, res) => {
  const { email, name, password } = req.body;
  const newUser = new User({ email, name, password });

  const oldUser = await User.findOne({ email });
  if (oldUser) return sendError(res, "This email is already in use!");
  await newUser.save();

  await Profile.create({
    user: newUser._id,
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

  //generate 6 digit otp
  let OTP = generateOTP();
  //store otp in db
  const newEmailVerifyToken = new EmailVerifyToken({
    owner: newUser._id,
    token: OTP,
  });
  await newEmailVerifyToken.save();

  //send otp email
  sendEmail({
    email: newUser.email,
    subject: "Email verification",
    html: `<p>Your verification OTP</p>
    <h1>${OTP}</h1>`,
  });

  res.status(200).json({
    user: { id: newUser._id, name: newUser.name, email: newUser.email },
  });
};

const verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;
  console.log(OTP);
  if (!isValidObjectId(userId)) return sendError(res, "Invalid user");
  const user = await User.findById(userId);
  if (!user) return sendError(res, "User not found");
  if (user.isVerified) return sendError(res, "Something wrong");
  const token = await EmailVerifyToken.findOne({ owner: userId });
  if (!token) return sendError(res, "Token not found");
  const isMatched = await token.compareToken(OTP);
  if (!isMatched) return sendError(res, "Please submit a valid OTP!");

  user.isVerified = true;
  await user.save();

  EmailVerifyToken.findByIdAndDelete(token._id);

  //send mail

  sendEmail({
    email: user.email,
    subject: "Welcome Email",
    html: `<h1>Welcome</h1>`,
  });
  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
  res.status(200).json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      token: jwtToken,
    },
    message: "Your email is verified",
  });
};

const reSendEmailVerifyToken = async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return sendError(res, "Token not found", 404);
  if (user.isVerified) return sendError(res, "Something wrong");
  const token = await EmailVerifyToken.findOne({ owner: userId });
  if (token) return sendError(res, "Something wrong");

  //generate 6 digit otp
  let OTP = generateOTP();
  //store otp in db
  const newEmailVerifyToken = new EmailVerifyToken({
    owner: newUser._id,
    token: OTP,
  });
  await newEmailVerifyToken.save();

  //send otp email
  sendEmail({
    email: newUser.email,
    subject: "Email verification",
    html: `<p>Your verification OTP</p>
    <h1>${OTP}</h1>`,
  });

  res.status(200).json({ message: "New OTP send" });
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return sendError(res, "Email is missing!");
  const user = await User.findOne({ email });
  if (!user) return sendError(res, "User not found", 404);
  const existedToken = await PasswordResetToken.findOne({ owner: user._id });
  if (existedToken) return sendError(res, "Something wrong");

  const token = await generateRandomByte();
  const newPasswordResetToken = await PasswordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;
  sendEmail({
    email: user.email,
    subject: "Reset Password  ",
    html: `<p>Click here to reset password</p>
    <a href="${resetPasswordUrl}">Change password</a>`,
  });

  res.status(200).json({ message: "Link reset password send to your email" });
};

const sendResetPasswordTokenStatus = (req, res) => {
  res.json({ valid: true });
};

const resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;
  const user = await User.findById(userId);
  const matched = await user.comparePassword(newPassword);
  if (matched)
    return sendError(
      res,
      "The new password is must be different from the old one!"
    );
  user.password = newPassword;
  await user.save();

  await PasswordResetToken.findByIdAndDelete(req.resetToken._id);

  res.status(200).json({ message: "Password reset successfully!" });
};

////////////////////////////////////////////////////////////////

const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  console.log(user);
  if (!user) return sendError(res, "Email/Password is not correct");
  const matchPassword = await user.comparePassword(password);
  if (!matchPassword) return sendError(res, "Email/Password is not correct");

  const { _id, name, avatar } = user;

  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

  res.status(200).json({
    user: {
      id: _id,
      name,
      email,
      avatar,
      isVerified: user.isVerified,
      token: jwtToken,
    },
  });
};

const getUserByEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  console.log(user);
  if (!user) return sendError(res, "User not found!");

  const { _id, name, avatar } = user;

  res.status(200).json({
    user: {
      id: _id,
      name,
      avatar,
      email,
    },
  });
};

const getAllUsersByEmail = async (req, res) => {
  const { search } = req.query;
  const regex = new RegExp(search, "i");
  console.log(regex);
  const user = await User.find(
    { email: regex },
    { friends: 0, isVerified: 0, password: 0, __v: 0 }
  );
  console.log(user.length);
  // if (!user) return sendError(res, "User not found!");

  // const { _id, name, avatar } = user;

  res.status(200).json(user);
};

module.exports = {
  create,
  verifyEmail,
  reSendEmailVerifyToken,
  forgetPassword,
  sendResetPasswordTokenStatus,
  resetPassword,
  signIn,
  getUserByEmail,
  getAllUsersByEmail,
};
