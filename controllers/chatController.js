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
  console.log(conversation);
  if (conversation) {
    if (
      conversation.newMessage == true &&
      !conversation.messages[0].author._id.equals(myId)
    ) {
      conversation.newMessage = false;
      await conversation.save();
    }
    return res
      .status(200)
      .json({ conversation: conversation.messages.reverse() });
  }
  return res.status(200).json({ conversation: [] });
};

const getAllConversations = async (req, res) => {
  const { _id: userId } = req.user;
  const conversations = await Conversation.find({
    participants: { $in: [userId] },
  })
    .populate({
      path: "messages",
      model: "Message",
      options: {
        limit: 10,
        sort: { $natural: -1 },
      },
      populate: {
        path: "author",
        model: "User",
        select: "name avatar",
      },
    })
    .populate("participants", " name avatar");
  console.log(conversations);
  return res.status(200).json(conversations);
};

module.exports = {
  getMessage,
  getAllConversations,
};
