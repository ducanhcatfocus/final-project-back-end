const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/helper");

const verifyTokenSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decode;
  } catch (error) {
    console.log(error);
  }

  next();
};

module.exports = verifyTokenSocket;
