const Conversation = require("../models/conversation");
const mongoose = require("mongoose");
const id = mongoose.Types.ObjectId("630a32cfa1664e058fe88a2c");

const getMessage = async (req, res) => {
  const { _id: myId } = req.user;
  const { userId } = req.params;
  const { page = 0 } = req.query;
  console.log(userId);
  console.log(myId);
  console.log(page);

  const conversation = await Conversation.findOne({
    participants: { $all: [userId, myId] },
  }).populate({
    path: "messages",
    model: "Message",
    options: {
      limit: 20,
      sort: { _id: -1 },
      skip: page * 20,
    },
    populate: {
      path: "author",
      model: "User",
      select: "name _id avatar",
    },
  });

  if (conversation)
    return res
      .status(200)
      .json({ conversation: conversation.messages.reverse() });
  return res.status(200).json({ conversation: [] });
};

module.exports = {
  getMessage,
};
