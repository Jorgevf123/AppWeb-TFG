const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');
const Solicitud = require('../models/Solicitud'); 
const { enviarEmailNotificacionSolicitud } = require('../utils/emailUtils');


// Obtener acompañantes disponibles
router.get('/acompanantes', async (req, res) => {
  try {
    const acompanantes = await User.find({ rol: 'Acompañante' });
    res.json(acompanantes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener acompañantes pasados para un cliente
router.get('/historial/:clienteId', async (req, res) => {
  const clienteId = req.params.clienteId;

  try {
    const solicitudes = await Solicitud.find({
      clienteId,
      estado: "aceptada"
    }).populate('acompananteId')
    .populate('matchId', 'finalizado valoracionCliente comentarioCliente');

    res.json(solicitudes);
  } catch (err) {
    console.error("Error en historial:", err);
    res.status(500).json({ error: "Error al cargar historial" });
  }
});

// Obtener acompañantes cercanos
router.get('/acompanantes-cercanos', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Latitud y longitud requeridas" });
  }

  const clienteLat = parseFloat(lat);
  const clienteLng = parseFloat(lng);

  const distanciaMaximaKm = 20;

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  try {
    const todos = await User.find({ 
      rol: 'acompanante',
      ubicacion: { $ne: null },
      viajes: { $exists: true, $not: { $size: 0 } }
    }).select('nombre viajes ubicacion imagenPerfil valoracion');
       

    const cercanos = todos.filter(a => {
      if (!a.ubicacion?.lat || !a.ubicacion?.lng) return false;

      const dist = calcularDistancia(
        clienteLat,
        clienteLng,
        a.ubicacion.lat,
        a.ubicacion.lng
      );

      return dist <= distanciaMaximaKm;
    });
    console.log("Acompañantes filtrados:", cercanos.map(a => a.nombre));
    res.json(cercanos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Crear nuevo match
router.post('/', async (req, res) => {
  const { clienteId, acompananteId } = req.body;
  try {
    const nuevoMatch = new Match({ clienteId, acompananteId });
    await nuevoMatch.save();
    res.status(201).json(nuevoMatch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/finalizar/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId).populate('clienteId');
    if (!match) {
      return res.status(404).json({ error: "Match no encontrado" });
    }

    if (match.finalizado) {
      return res.status(400).json({ error: "El trayecto ya está finalizado." });
    }

    match.finalizado = true;
    await match.save();

    if (match.clienteId && match.clienteId.email) {
      await enviarEmailNotificacionSolicitud(
        match.clienteId.email,
        `El acompañante ha finalizado el trayecto y ha entregado tu mascota correctamente. ¡Gracias por confiar en PetTravelBuddy!`
      );
    }

    res.json({ mensaje: "Trayecto finalizado correctamente." });
  } catch (err) {
    console.error("Error al finalizar trayecto:", err);
    res.status(500).json({ error: "Error al finalizar trayecto" });
  }
});

// Valoración de un match
router.put('/valorar/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { valoracionCliente, comentarioCliente } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: "Match no encontrado" });
    }

    match.valoracionCliente = valoracionCliente;
    match.comentarioCliente = comentarioCliente;
    await match.save();

    res.json({ mensaje: "Valoración guardada correctamente." });
  } catch (err) {
    console.error("Error al guardar valoración:", err);
    res.status(500).json({ error: "Error al guardar valoración" });
  }
});


module.exports = router;
