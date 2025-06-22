const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (_req, file, cb) {
  const ext = path.extname(file.originalname); 
  const hash = crypto.randomBytes(16).toString("hex");
  cb(null, `${hash}${ext}`);
}
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;

