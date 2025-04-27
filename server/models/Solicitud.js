const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  acompananteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipoAnimal: { type: String, required: true },
  raza: { type: String, required: true },
  dimensiones: { type: String, required: true },
  vacunasAlDia: { type: Boolean, required: true },
  estado: { type: String, enum: ['pendiente', 'aceptada', 'rechazada'], default: 'pendiente' },
  fechaSolicitud: { type: Date, default: Date.now },
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
});

module.exports = mongoose.model('Solicitud', solicitudSchema);

