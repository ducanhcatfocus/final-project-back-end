const { isValidObjectId } = require("mongoose");
const Document = require("../models/document");
const ReceiverDocument = require("../models/receiverDocument");
const User = require("../models/user");
const { sendError } = require("../utils/helper");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
  secure: true,
});

const sendDocument = async (req, res) => {
  const { receiver, subject, content } = req.body;
  const { file } = req;
  const { _id: senderId } = req.user;

  let receiverArr = JSON.parse(receiver);
  let url;
  console.log(file);

  if (file) {
    const { secure_url } = await cloudinary.uploader.upload(file.path, {
      folder: "documents",
    });
    url = secure_url;
  }

  const newDocument = await Document.create({
    sender: senderId,
    subject: subject,
    content: content,
    receivers: receiverArr,
    file: [
      {
        url: url,
        filename: file ? file.filename : "",
        mimetype: file ? file.mimetype : "",
      },
    ],
  });

  receiverArr.forEach((element) => {
    const receiverDocument = new ReceiverDocument({
      receiverEmail: element,
      document: newDocument._id,
    });
    receiverDocument.save();
  });

  return res.status(200).json({
    message: "document sent!",
  });
};

const myDocument = async (req, res) => {
  const { _id: senderId } = req.user;
  const allDocument = await Document.find(
    {
      sender: senderId,
      isDelete: false,
    },
    { isDelete: 0, sender: 0, password: 0, __v: 0 }
  );

  return res.status(200).json({ data: allDocument });
};

const searchMyDocument = async (req, res) => {
  const { _id: senderId } = req.user;
  const { search } = req.query;
  const regex = new RegExp(search, "i");
  const allDocument = await Document.find(
    {
      content: regex,
      sender: senderId,
      isDelete: false,
    },
    { isDelete: 0, sender: 0, password: 0, __v: 0 }
  );

  return res.status(200).json({ data: allDocument });
};

const getDocument = async (req, res) => {
  const { documentId } = req.params;
  const { email } = req.user;

  if (!isValidObjectId(documentId)) return sendError(res, "Invalid request!");

  await ReceiverDocument.findOneAndUpdate(
    {
      receiverEmail: email,
    },
    { isRead: true }
  );

  const document = await Document.findOne(
    {
      _id: documentId,
    },
    { isDelete: 0, receiverEmail: 0, _id: 0, __v: 0 }
  ).populate("sender", "_id name email avatar");
  if (!document) return sendError(res, "Document not found");
  res.status(200).json({ document });
};

const receivedDocument = async (req, res) => {
  const { email } = req.query;

  const allDocument = await ReceiverDocument.find(
    {
      receiverEmail: email,
      isDelete: false,
    },
    { isDelete: 0, receiverEmail: 0, _id: 0, __v: 0 }
  ).populate({
    path: "document",
    model: "Document",
    select: "content subject file createAt sender",
    populate: {
      path: "sender",
      model: "User",
      select: "name email avatar",
    },
  });
  console.log(allDocument);
  res.status(200).json({ data: allDocument });
};

const deleteDocument = async (req, res) => {
  const { documentId } = req.params;

  await Document.findOneAndUpdate(
    {
      _id: documentId,
    },
    { isDelete: true }
  );
  res.status(200).json({
    message: "document deleted!",
  });
};

module.exports = {
  sendDocument,
  receivedDocument,
  myDocument,
  getDocument,
  searchMyDocument,
  deleteDocument,
};
