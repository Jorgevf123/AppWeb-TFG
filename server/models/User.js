const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['cliente', 'acompanante', 'admin'], default: 'cliente' },
  ubicacion: {
    type: {
      lat: { type: Number },
      lng: { type: Number }
    },
    default: null
  },
  viaje: {
    tipo: { type: String, enum: ['avion', 'tren'] },
    origen: { type: String },
    destino: { type: String },
    fecha: { type: Date }
  },
  imagenPerfil: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model('User', userSchema);
