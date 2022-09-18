const express = require("express");
const { getMessage } = require("../controllers/chatController");
const { isAuth } = require("../middlewares/auth");

const router = express.Router();

router.get("/chat/:userId", isAuth, getMessage);

module.exports = router;
