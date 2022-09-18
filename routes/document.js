const express = require("express");
const { uploadImage } = require("../config/multer");
const { isAuth } = require("../middlewares/auth");
const {
  sendDocument,
  receivedDocument,
  myDocument,
  getDocument,
  getReceivedDocument,
} = require("../controllers/documentController");
const router = express.Router();

router.post("/send-document", isAuth, uploadImage.single("doc"), sendDocument);
router.get("/received-document", isAuth, receivedDocument);
router.get("/my-document", isAuth, myDocument);
router.get("/document-detail/:documentId", isAuth, getDocument);
router.get(
  "/received-document-detail/:documentId",
  isAuth,
  getReceivedDocument
);

module.exports = router;
