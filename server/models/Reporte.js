const mongoose = require("mongoose");

const reporteSchema = new mongoose.Schema({
  remitente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  destinatario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  motivo: { type: String, required: true },
  estado: { 
    type: String, 
    enum: ["abierto", "rechazado", "baneado"], 
    default: "abierto" 
  },  
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Reporte", reporteSchema);
