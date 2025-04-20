const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participantes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  ],
  mensajes: [
    {
      remitente: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      texto: String,
      archivo: String, // Nuevo campo para almacenar el nombre del archivo adjunto
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Chat", chatSchema);


