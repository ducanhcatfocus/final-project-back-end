const verifyTokenSocket = require("./middlewares/authSocket");
const { directMessageHandle, typingHandle } = require("./socket/directMessage");
const { roomCreateHandler } = require("./socket/roomCreateHandle");
const { v4: uuidv4 } = require("uuid");

let userConnected = [];
let activeRooms = [];
let time = [];
let io = null;

const registerSocketServer = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 1e8,
  });

  setSocketServerInstance(io);

  io.use((socket, next) => {
    verifyTokenSocket(socket, next);
  });

  const emitOnlineUsers = () => {
    const onlineUsers = getOnlineUsers();
    io.emit("online-users", { onlineUsers });
  };

  const emitActiveRooms = () => {
    const activeRooms = getActiveRooms();
    io.emit("active-rooms", { activeRooms });
  };

  io.on("connection", (socket) => {
    let currentRoom = null;
    userConnected.push({
      socketId: socket.id,
      userId: socket.user.userId,
    });
    emitOnlineUsers();

    console.log(userConnected);

    //listen direct chat
    socket.on("direct-message", (data) => {
      directMessageHandle(socket, data, io, getActiveConnections);
    });

    socket.on("typing", (data) => {
      console.log(data);
      typingHandle(socket, data, io, getActiveConnections);
    });

    socket.on("room-create", (data) => {
      // console.log(data);

      // const myTimeout = setTimeout(() => {
      //
      //   time.pop();
      //   console.log("10 giay");
      //   console.log(time);
      // }, 10000);
      // time.push(myTimeout);
      // console.log(time);
      // clearTimeout(time[0]);
      // }
      roomCreateHandler(socket, data, addNewActiveRoom);
      emitActiveRooms();
    });

    socket.on("room-join", (data) => {
      const { roomId, userName, userAvatar, userMail } = data;
      let afterJoin;
      socket.join(roomId);
      const participantDetails = {
        userId: socket.user.userId,
        socketId: socket.id,
        userName,
        userAvatar,
        userMail,
      };

      // const roomDetails = getRoom(roomId);
      for (const room of activeRooms) {
        if (room.roomId === roomId) {
          room.participants = [...room.participants, participantDetails];
          afterJoin = room;
          break;
        }
      }
      io.to(roomId).emit("join-room", afterJoin);
      socket.broadcast.to(roomId).emit("conn-prepare", {
        connUserSocketId: socket.id,
      });
      emitActiveRooms();

      console.log(activeRooms);
    });

    socket.on("chat-room", (data) => {
      const { roomId, chat, userName } = data;
      const date = new Date();

      io.to(roomId).emit("update-chat-room", {
        chat,
        userName,
        time: null,
      });
    });

    socket.on("room-leave", (data) => {
      console.log(data);
      const { roomId } = data;
      let afterLeave;
      socket.leave(roomId);

      for (const room of activeRooms) {
        if (room.roomId === roomId) {
          room.participants = room.participants.filter(
            (p) => p.socketId !== socket.id
          );
          afterLeave = room;
          break;
        }
      }
      io.to(roomId).emit("join-room", afterLeave);
      io.to(roomId).emit("room-participant-left", {
        connUserSocketId: socket.id,
      });
      emitActiveRooms();
    });

    socket.on("update-chat-room", () => {
      const activeRooms = getActiveRooms();
      io.to(socket.id).emit("active-rooms", { activeRooms });
    });

    socket.on("conn-init", (data) => {
      const { connUserSocketId } = data;
      const initData = { connUserSocketId: socket.id };
      socket.to(connUserSocketId).emit("conn-init", initData);
    });

    socket.on("conn-signal", (data) => {
      const { connUserSocketId, signal } = data;
      const signalingData = { signal, connUserSocketId: socket.id };
      socket.to(connUserSocketId).emit("conn-signal", signalingData);
    });

    socket.on("disconnecting", () => {
      if (socket.rooms.size > 1) {
        for (value of socket.rooms);
        currentRoom = value;
      }
    });

    socket.on("disconnect", () => {
      if (currentRoom) {
        for (const room of activeRooms) {
          if (room.roomId === currentRoom) {
            room.participants = room.participants.filter(
              (p) => p.socketId !== socket.id
            );
            io.to(currentRoom).emit("join-room", room);
            break;
          }
        }
        io.to(currentRoom).emit("room-participant-left", {
          connUserSocketId: socket.id,
        });
        emitActiveRooms();
      }
      userConnected = userConnected.filter(
        (data) => data.socketId != socket.id
      );
      console.log(userConnected);
      emitOnlineUsers();
    });
  });
};

const setSocketServerInstance = (ioInstance) => {
  io = ioInstance;
};

const getSocketServerInstance = () => {
  return io;
};

const getActiveConnections = (userId) => {
  const activeConnection = [];
  userConnected.map((user) => {
    if (user.userId === userId) {
      activeConnection.push(user.socketId);
    }
  });
  return activeConnection;
};

const getOnlineUsers = () => {
  const onlineUsers = userConnected;
  return onlineUsers;
};

const addNewActiveRoom = (userId, socketId, data) => {
  const newActiveRoom = {
    roomCreator: {
      userId,
      socketId,
      roomCreatorName: data.userName,
      roomCreatorAvatar: data.userAvatar,
    },
    roomName: data.name,
    roomPassword: data.password,
    roomPrivate: data.privateRoom,
    participants: [
      {
        userId,
        socketId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        userMail: data.userMail,
      },
    ],
    roomId: uuidv4(),
  };

  activeRooms = [...activeRooms, newActiveRoom];
  return newActiveRoom;
};

const getActiveRooms = () => {
  return [...activeRooms];
};

const getRoom = (roomId) => {
  const room = activeRooms.find((activeRoom) => activeRoom.roomId === roomId);
  return { ...room };
};

module.exports = {
  registerSocketServer,
  getActiveConnections,
  setSocketServerInstance,
  getSocketServerInstance,
  getActiveRooms,
};
