const Message = require("../models/message");
const Conversation = require("../models/conversation");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});

const uploadFromBuffer = (file) => {
  return new Promise((resolve, reject) => {
    let cld_upload_stream = cloudinary.uploader.upload_stream(
      {
        folder: "file",
        resource_type: "auto",
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(file).pipe(cld_upload_stream);
  });
};

const directMessageHandle = async (socket, data, io, getActiveConnections) => {
  try {
    console.log("chatting", data);
    const { userId } = socket.user;
    const { receiverId, content, file } = data;
    let newFile = [];

    // console.log(file[0].toString("utf8"));
    if (file.length > 0) {
      for (const f of file) {
        const result = await uploadFromBuffer(f);
        newFile.push({
          resource_type: result.resource_type,
          fileUrl: result.secure_url,
        });
      }
    }
    //create new message
    console.log(newFile);

    let message = await Message.create({
      content: content,
      author: userId,
      date: new Date(),
      type: "DIRECT",
      file: newFile,
    });

    await message.populate("author", "name avatar");

    //if conversation exist ? - if not create new one

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, receiverId] },
    });

    if (conversation) {
      conversation.messages.push(message._id);
      conversation.newMessage = true;

      await conversation.save();

      //update chatbox of sender and receiver if they online
      conversation.participants.forEach((userId) => {
        const activeConnection = getActiveConnections(userId.toString());
        activeConnection.forEach((socketId) => {
          io.to(socketId).emit("update-chat", message);
        });
      });
      return;
    }

    const newConversation = await Conversation.create({
      messages: [message._id],
      participants: [userId, receiverId],
      newMessage: true,
    });
    //update chatbox of sender and receiver if they online

    newConversation.participants.forEach((userId) => {
      const activeConnection = getActiveConnections(userId.toString());
      console.log(activeConnection);
      activeConnection.forEach((socketId) => {
        io.to(socketId).emit("update-chat", message);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const typingHandle = (socket, data, io, getActiveConnections) => {
  const { id, isTyping } = data;
  const { userId } = socket.user;
  const activeConnection = getActiveConnections(id.toString());
  console.log(activeConnection);
  activeConnection.forEach((socketId) => {
    if (!isTyping) {
      io.to(socketId).emit("update-typing", { type: "", id: userId });
      return;
    }
    io.to(socketId).emit("update-typing", { type: "typing...", id: userId });
  });
};

module.exports = { directMessageHandle, typingHandle };
