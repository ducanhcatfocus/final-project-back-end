const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const userRouter = require("./routes/user");
const friendRouter = require("./routes/friend");
const documentRouter = require("./routes/document");
const flowRouter = require("./routes/flow");
const chatRouter = require("./routes/chat");
const notificationRouter = require("./routes/notification");

const connectDatabase = require("./database/connectDB");
const { errorHandler } = require("./middlewares/errorHandler");
const { handleNotFoundApi } = require("./utils/helper");
const { registerSocketServer } = require("./socketServer");
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(errorHandler);
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use("/api/user", userRouter);
app.use("/api/friend-invitation", friendRouter);
app.use("/api/document", documentRouter);
app.use("/api/flow", flowRouter);
app.use("/api/conversation", chatRouter);
app.use("/api/notification", notificationRouter);

app.use("*", handleNotFoundApi);

connectDatabase();

server = app.listen(process.env.PORT || 5000, () => {
  console.log("Server:" + process.env.PORT);
});

registerSocketServer(server);
