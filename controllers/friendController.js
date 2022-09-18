const FriendInvitation = require("../models/friendInvitation");
const User = require("../models/user");
const {
  updateFriendPendingInvitation,
  updateFriends,
} = require("../socket/updates/friend");
const { sendError } = require("../utils/helper");

const friendInvitation = async (req, res) => {
  const { _id: userId } = req.user;
  const pending = await FriendInvitation.find({
    receiverId: userId,
  }).populate("senderId", "_id name email");

  return res.status(200).json({ data: pending });
};

const friends = async (req, res) => {
  const { _id: userId } = req.user;
  const friends = await User.findOne(
    { _id: userId },
    {
      friends: 1,
      _id: 0,
    }
  ).populate("friends", "_id name email avatar");
  console.log(friends);

  return res.status(200).json({ data: friends.friends });
};

const sendFriendInvitation = async (req, res) => {
  const { targetEmail } = req.body;
  const { _id: userId, email } = req.user;

  if (email.toLowerCase() === targetEmail.toLowerCase()) {
    return sendError(res, "Invalid email");
  }
  const targetUser = await User.findOne({ email: targetEmail });
  if (!targetUser) {
    return sendError(res, `${targetEmail} account not found`, 404);
  }

  const sentInvitation = await FriendInvitation.findOne({
    senderId: userId,
    receiverId: targetUser._id,
  });

  if (sentInvitation) {
    return sendError(res, "Friend request has been already sent");
  }

  const myFriend = targetUser.friends.find(
    (friendId) => friendId.toString() === userId.toString()
  );
  if (myFriend) {
    return sendError(res, "This account is already your friend");
  }
  console.log(userId);
  const newInvitation = await FriendInvitation.create({
    senderId: userId,
    receiverId: targetUser._id,
  });
  //update friend in User model

  // send pending socket
  updateFriendPendingInvitation(targetUser._id.toString());
  return res.status(200).json({ message: "Friend request has been sent!" });
};

const acceptFriendInvitation = async (req, res) => {
  const { id } = req.body;
  const { _id: userId } = req.user;

  const invitation = await FriendInvitation.findById(id);
  if (!invitation) {
    return sendError(res, "The invitation no longer exist!");
  }

  //add friend to both user
  const senderUser = await User.findById({ _id: invitation.senderId });
  senderUser.friends = [...senderUser.friends, invitation.receiverId];

  const receiverUser = await User.findById({ _id: invitation.receiverId });
  receiverUser.friends = [...receiverUser.friends, invitation.senderId];

  await senderUser.save();
  await receiverUser.save();

  //delete invitation after accept friend request

  await FriendInvitation.findByIdAndDelete(id);

  //update list friend if the user are online
  updateFriends(invitation.senderId.toString());
  updateFriends(invitation.receiverId.toString());

  //update list pending invitation
  updateFriendPendingInvitation(invitation.receiverId.toString());

  return res.status(200).json({ message: "Friend request accepted!" });
};

const rejectFriendInvitation = async (req, res) => {
  const { id } = req.body;
  const { _id: userId } = req.user;

  const invitation = await FriendInvitation.findByIdAndDelete(id);
  if (!invitation) {
    return sendError(res, "The invitation no longer exist!");
  }

  //update pendings invitation list
  updateFriendPendingInvitation(userId.toString());

  console.log(id);
  return res.status(200).json({ message: "Friend request rejected!" });
};
module.exports = {
  sendFriendInvitation,
  friendInvitation,
  acceptFriendInvitation,
  rejectFriendInvitation,
  friends,
};
