const Conversation = require("../../models/conversation");
const {
  getSocketServerInstance,
  getActiveConnections,
} = require("../../socketServer");

const updateChat = async (conversationId) => {
  const conversation = Conversation.findById(conversationId).populate({
    path: "message",
    model: "Model",
    populate: {
      path: "author",
      model: "User",
      select: "name _id",
    },
  });

  if (conversation) {
    const io = getSocketServerInstance();
    conversation.participants.forEach((userId) => {
      const activeConnection = getActiveConnections(userId.toString());
      activeConnection.forEach((socketId) => {
        io.to(socketId).emit("");
      });
    });
  }
};
