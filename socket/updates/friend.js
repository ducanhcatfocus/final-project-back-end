const User = require("../../models/user");
const FriendInvitation = require("../../models/friendInvitation");
const {
  getActiveConnections,
  getSocketServerInstance,
} = require("../../socketServer");

const updateFriendPendingInvitation = async (userId) => {
  try {
    const pending = await FriendInvitation.find({
      receiverId: userId,
    }).populate("senderId", "_id name email");

    //find user online
    console.log(userId);
    const receiverList = getActiveConnections(userId);
    console.log(receiverList);

    const io = getSocketServerInstance();

    //emit to all online user
    receiverList.forEach((receiverSocketId) => {
      io.to(receiverSocketId).emit("friend-invitation", {
        pending: pending ? pending : [],
      });
    });
  } catch (error) {
    console.log(error);
  }
};

const updateFriends = async (userId) => {
  try {
    //find user online
    const receiverList = getActiveConnections(userId);
    console.log(receiverList);

    if (receiverList.length > 0) {
      const user = await User.findOne(
        { _id: userId },
        {
          _id: 0,
          friends: 1,
        }
      ).populate("friends", "_id name email avatar");

      if (user.friends) {
        // const friendLists = user.friends.map((f) => {
        //   return {
        //     id: f._id,
        //     email: f.email,
        //     name: f.name,
        //   };
        // });

        const io = getSocketServerInstance();

        //emit to all online user
        receiverList.forEach((receiverSocketId) => {
          io.to(receiverSocketId).emit("friends-list", {
            friends: user.friends ? user.friends : [],
          });
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { updateFriendPendingInvitation, updateFriends };
