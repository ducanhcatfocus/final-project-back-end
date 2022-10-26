const express = require("express");
const {
  getMessage,
  getAllConversations,
} = require("../controllers/chatController");
const { isAuth } = require("../middlewares/auth");

const router = express.Router();

router.get("/chat/:userId", isAuth, getMessage);
router.get("/getAllConversations", isAuth, getAllConversations);

module.exports = router;
