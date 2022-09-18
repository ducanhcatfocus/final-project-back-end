const multer = require("multer");
const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  console.log(file);
  if (
    !file.mimetype.startsWith("image") &&
    file.mimetype !== "application/pdf"
  ) {
    cb("Support only image and pdf");
  }
  cb(null, true);
};

exports.uploadImage = multer({ storage, fileFilter });
