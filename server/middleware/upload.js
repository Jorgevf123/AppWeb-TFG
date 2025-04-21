const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    // Ruta absoluta a la carpeta uploads (dentro de server/uploads)
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (_req, file, cb) {
    // Nombre único para evitar sobrescribir
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

module.exports = upload;

