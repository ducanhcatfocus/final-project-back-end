const Notification = require("../models/notification");

const getAllNotifications = async (req, res) => {
  const { _id: userId } = req.user;
  const notifications = await Notification.findOne({
    owner: userId,
  });
  return res.status(200).json(notifications);
};

module.exports = {
  getAllNotifications,
};
