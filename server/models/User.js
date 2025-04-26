const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['cliente', 'acompanante', 'admin'], default: 'cliente' },
  fechaNacimiento: { type: Date },
  ubicacion: {
    type: {
      lat: { type: Number },
      lng: { type: Number }
    },
    default: null
  },
  viajes: [{
    tipo: { type: String, enum: ['avion', 'tren'] },
    origen: { type: String },
    destino: { type: String },
    fecha: { type: Date },
    precio: { type: Number }
  }],
  imagenPerfil: {
    type: String,
    default: ""
  },
  dniFrontal: { type: String },
  dniTrasero: { type: String },
  verificado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);


