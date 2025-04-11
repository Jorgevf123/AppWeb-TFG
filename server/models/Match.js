const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  acompananteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fecha: { type: Date, default: Date.now },
  estado: { type: String, enum: ['pendiente', 'aceptado', 'rechazado', 'completado'], default: 'pendiente' }
});

module.exports = mongoose.model('Match', matchSchema);
