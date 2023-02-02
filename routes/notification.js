const express = require("express");
const {
  getAllNotifications,
} = require("../controllers/notificationController");
const { isAuth } = require("../middlewares/auth");

const router = express.Router();

router.get("/getAllNotifications", isAuth, getAllNotifications);

module.exports = router;
