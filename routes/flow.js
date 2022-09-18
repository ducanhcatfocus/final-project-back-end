const express = require("express");
const { createFlow, getAllFlow } = require("../controllers/flowController");
const { isAuth } = require("../middlewares/auth");
const router = express.Router();

router.post("/create-flow", isAuth, createFlow);
router.get("/all-flow", isAuth, getAllFlow);

module.exports = router;
