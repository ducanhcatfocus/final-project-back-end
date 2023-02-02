const express = require("express");
const { uploadImage } = require("../config/multer");
const { isAuth } = require("../middlewares/auth");
const {
  sendDocument,
  receivedDocument,
  myDocument,
  getDocument,
  searchMyDocument,
  deleteDocument,
} = require("../controllers/documentController");
const router = express.Router();

router.post(
  "/send-document",
  isAuth,
  uploadImage.single("files"),
  sendDocument
);
router.get("/received-document", isAuth, receivedDocument);
router.get("/my-document", isAuth, myDocument);
router.get("/search-my-document", isAuth, searchMyDocument);
router.get("/document-detail/:documentId", isAuth, getDocument);
router.put("/document-detail/:documentId", isAuth, deleteDocument);

module.exports = router;
