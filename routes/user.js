const express = require("express");
const { uploadImage } = require("../config/multer");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");
const {
  create,
  verifyEmail,
  reSendEmailVerifyToken,
  forgetPassword,
  sendResetPasswordTokenStatus,
  resetPassword,
  signIn,
  getUserByEmail,
  getAllUsersByEmail,
} = require("../controllers/userController");
const { isAuth } = require("../middlewares/auth");
const { isValidPassResetToken } = require("../middlewares/user");
const {
  userValidator,
  validate,
  validatePassword,
  signInValidator,
  validateEmail,
} = require("../middlewares/validator");
const router = express.Router();

router.post("/create", userValidator, validate, create);
router.post("/login", signInValidator, validate, signIn);

router.post("/verify-email", verifyEmail);
router.post("/resend-verify-email", reSendEmailVerifyToken);
router.post("/forget-password", forgetPassword);
router.post(
  "/verify-password-reset-token",
  isValidPassResetToken,
  sendResetPasswordTokenStatus
);
router.post(
  "/reset-password",
  validatePassword,
  validate,
  isValidPassResetToken,
  resetPassword
);

router.get("/userProfile/:userId", isAuth, getProfile);
router.put(
  "/updateProfile",
  isAuth,
  uploadImage.single("avatar"),
  updateProfile
);

router.post("/account", isAuth, validateEmail, getUserByEmail);
router.get("/auth", isAuth, (req, res) => {
  const { user } = req;
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: user.token,
    },
  });
});

router.get("/searchReceiver", isAuth, getAllUsersByEmail);

module.exports = router;
