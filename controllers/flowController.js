const Flow = require("../models/flow");

const createFlow = async (req, res) => {
  const users = req.body;
  const { _id: createdId } = req.user;
  const newFlow = new Flow({ members: users, createdId });
  await newFlow.save();

  res.status(200).json({ message: "Flow created!" });
};

const getAllFlow = async (req, res) => {
  const { _id: createdId } = req.user;
  const flows = await Flow.find({ createdId }).populate(
    "members",
    "_id name email avatar"
  );
  console.log(flows);
  res.status(200).json({ data: flows });
};
module.exports = { createFlow, getAllFlow };
