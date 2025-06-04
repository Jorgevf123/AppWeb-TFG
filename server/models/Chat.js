const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participantes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  ],
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true }
});

module.exports = mongoose.model("Chat", chatSchema);