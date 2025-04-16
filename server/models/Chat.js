const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participantes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  ],
  mensajes: [
    {
      remitente: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      texto: String,
      timestamp: Date
    }
  ]
});

module.exports = mongoose.model("Chat", chatSchema);

