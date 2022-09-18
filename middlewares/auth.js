const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendError } = require("../utils/helper");

exports.isAuth = async (req, res, next) => {
  const token = req.headers?.authorization;

  if (!token) return sendError(res, "Token is missing", 403);

  const jwtToken = token.split("Bearer ")[1];

  if (!jwtToken) return sendError(res, "Invalid token");

  try {
    const decode = jwt.verify(jwtToken, process.env.JWT_SECRET);
    const { userId } = decode;

    const user = await User.findById(userId);
    if (!user) return sendError(res, "Invalid token user not found", 404);

    req.user = user;
    return next();
  } catch (err) {
    return sendError(res, "Error");
  }
};
