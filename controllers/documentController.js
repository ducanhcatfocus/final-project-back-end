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
  const { email, title, content, type } = req.body;
  const { file } = req;
  const { _id: senderId } = req.user;
  const { flow } = req.query;
  console.log(req.query);
  let receiverId = [];
  console.log(email);
  console.log(type);

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    file.path,
    { folder: "documents" }
  );
  const newDocument = new Document({
    receiverId,
    senderId,
    document: {
      title,
      content,
      doc: { url: secure_url, public_id, filename: file.originalname },
    },
  });

  if (type === "single") {
    const receiver = await User.findOne({ email: email });
    if (!receiver) return sendError(res, "Address not found");
    newDocument.receiverId = receiver._id;
    await newDocument.save();
    await ReceiverDocument.create({
      receiverId: receiver._id,
      document: newDocument._id,
      senderId: senderId,
    });
    return res.status(200).json({
      message: "document sent!",
    });
  }
  if (type === "multiple" && flow === "false") {
    receiverId = JSON.parse(email);
    newDocument.receiverId = receiverId;

    await newDocument.save();
    receiverId.forEach((element) => {
      const receiverDocument = new ReceiverDocument({
        receiverId: element,
        document: newDocument._id,
        senderId: senderId,
      });
      receiverDocument.save();
    });

    return res.status(200).json({
      message: "document sent!",
    });
  }
  if (flow === "true") {
    receiverId = JSON.parse(email);
    newDocument.receiverId = receiverId;
    newDocument.isFlow = true;

    await newDocument.save();

    const receiverDocument = new ReceiverDocument({
      receiverId: receiverId[0],
      document: newDocument._id,
      senderId: senderId,
    });
    await receiverDocument.save();
  }
  return res.status(200).json({
    message: "document sent!",
  });
};

const myDocument = async (req, res) => {
  const { _id: senderId } = req.user;
  const { documentId, status } = req.query;

  if (documentId && status === "next") {
    const allDocument = await Document.find({
      senderId: senderId,
      _id: { $gt: documentId },
    })
      .populate("receiverId", "_id name email")
      .limit(21);
    if (allDocument.length < 21)
      return res.status(200).json({ data: allDocument, page: "final" });
    return res.status(200).json({ data: allDocument });
  }

  if (documentId && status === "back") {
    const allDocument = await Document.find({
      senderId: senderId,
      _id: { $lt: documentId },
    })
      .populate("receiverId", "_id name email")
      .limit(21);
    if (allDocument.length < 21) {
      console.log(allDocument);
      return res.status(200).json({ data: allDocument, page: "first" });
    }
    return res.status(200).json({ data: allDocument });
  }

  const allDocument = await Document.find({
    senderId: senderId,
  })
    .populate("receiverId", "_id name email")
    .limit(21);
  return res.status(200).json({ data: allDocument, page: "first" });
};

const getDocument = async (req, res) => {
  const { documentId } = req.params;
  const { _id: senderId } = req.user;

  if (!isValidObjectId(documentId)) return sendError(res, "Invalid request!");

  const document = await Document.findOne({
    _id: documentId,
    senderId: senderId,
  }).populate("receiverId", "_id name email");
  if (!document) return sendError(res, "Document not found");
  res.status(200).json({ document });
};

const receivedDocument = async (req, res) => {
  const { _id: receiverId } = req.user;

  const allDocument = await ReceiverDocument.find({
    receiverId: receiverId,
    isDelete: false,
  })
    .populate("document", "receiverId document")
    .populate("senderId", "name email");
  console.log(allDocument);
  res.status(200).json({ data: allDocument });
};

const getReceivedDocument = async (req, res) => {
  const { documentId } = req.params;
  const { _id: receiverId } = req.user;
  console.log(documentId);

  if (!isValidObjectId(documentId)) return sendError(res, "Invalid request!");

  const document = await ReceiverDocument.findOne({
    _id: documentId,
    receiverId,
  })
    .populate("document", "receiverId document isFlow index")
    .populate("senderId", "name email");
  if (!document) return sendError(res, "Document not found");
  res.status(200).json({ document });
};

const confirmDocument = async (req, res) => {
  const { documentId } = req.params;
  const { _id: receiverId } = req.user;
  console.log(documentId);

  if (!isValidObjectId(documentId)) return sendError(res, "Invalid request!");

  const document = await Document.findOne({
    _id: documentId,
  });
  if (!document) return sendError(res, "Document not found");
  if (document.receiverId[document.index] !== receiverId)
    return sendError(res, "Access is denied");
  if (document.receiverId.length - 1 === document.index)
    return sendError(res, "End of queue!");

  await ReceiverDocument.create({
    receiverId: document.receiverId[document.index + 1],
    document: document._id,
    senderId: document.senderId,
  });

  document.index = document.index + 1;

  await document.save();

  res.status(200).json({ document });
};

module.exports = {
  sendDocument,
  receivedDocument,
  getReceivedDocument,
  myDocument,
  getDocument,
};
