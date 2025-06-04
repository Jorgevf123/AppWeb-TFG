
const mongoose = require("mongoose");

const mensajeSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  remitente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  texto: String,
  archivo: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Mensaje", mensajeSchema);
