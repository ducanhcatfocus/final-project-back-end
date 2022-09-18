const roomCreateHandler = (socket, data, addNewActiveRoom) => {
  console.log("room created");
  const socketId = socket.id;
  const userId = socket.user.userId;

  const roomDetails = addNewActiveRoom(userId, socketId, data);

  // console.log(roomDetails);

  socket.emit("room-create", roomDetails);

  socket.join(roomDetails.roomId);
};

module.exports = { roomCreateHandler };
