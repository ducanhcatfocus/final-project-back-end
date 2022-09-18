const express = require("express");
const {
  sendFriendInvitation,
  friendInvitation,
  acceptFriendInvitation,
  rejectFriendInvitation,
  friends,
} = require("../controllers/friendController");
const { isAuth } = require("../middlewares/auth");
const { validateEmail } = require("../middlewares/validator");

const router = express.Router();

router.post("/", isAuth, validateEmail, sendFriendInvitation);
router.get("/", isAuth, friendInvitation);
router.get("/friends", isAuth, friends);
router.post("/accept", isAuth, validateEmail, acceptFriendInvitation);
router.post("/reject", isAuth, validateEmail, rejectFriendInvitation);

module.exports = router;
