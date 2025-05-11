const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');
const Solicitud = require('../models/Solicitud'); 
const { enviarEmailNotificacionSolicitud } = require('../utils/emailUtils');


const calcularTiempoDesde = (fechaRegistro) => {
  const ahora = new Date();
  const registro = new Date(fechaRegistro);
  const diffMs = ahora.getTime() - registro.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias >= 365) {
    const años = Math.floor(diffDias / 365);
    return `Miembro desde hace ${años} año${años > 1 ? 's' : ''}`;
  } else if (diffDias >= 30) {
    const meses = Math.floor(diffDias / 30);
    return `Miembro desde hace ${meses} mes${meses > 1 ? 'es' : ''}`;
  } else {
    return `Miembro desde hace ${diffDias} día${diffDias !== 1 ? 's' : ''}`;
  }
};


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
// Obtener acompañantes pasados para un cliente
router.get('/historial/:clienteId', async (req, res) => {
  const clienteId = req.params.clienteId;

  try {
    const solicitudes = await Solicitud.find({
      clienteId,
      estado: { $in: ["aceptada", "finalizada"] } // Ahora incluye ambas
    })
    .populate('acompananteId')
    .populate('matchId', 'finalizado valoracionCliente comentarioCliente')
    .select('valoracionPendiente');

    res.json(solicitudes);
  } catch (err) {
    console.error("Error en historial:", err);
    res.status(500).json({ error: "Error al cargar historial" });
  }
});

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
    const acompanantes = await User.find({
      rol: 'acompanante',
      ubicacion: { $ne: null },
      viajes: { $exists: true, $not: { $size: 0 } }
    }).select('nombre viajes ubicacion imagenPerfil createdAt bio');

    const acompanantesConMedia = [];

    for (const acompanante of acompanantes) {
      if (!acompanante.ubicacion?.lat || !acompanante.ubicacion?.lng) continue;

      const distancia = calcularDistancia(
        clienteLat,
        clienteLng,
        acompanante.ubicacion.lat,
        acompanante.ubicacion.lng
      );

      if (distancia <= distanciaMaximaKm) {
        const matches = await Match.find({ 
          acompananteId: acompanante._id, 
          valoracionCliente: { $exists: true } 
        }).populate('clienteId', 'nombre'); // ⬅️ importante

        // Solo valoraciones cuyo cliente todavía exista
        const valoracionesValidas = matches.filter(m => m.clienteId);

        const valoraciones = valoracionesValidas.map(m => m.valoracionCliente).filter(v => typeof v === 'number');
        console.log(`Valoraciones para ${acompanante.nombre}:`, valoraciones);

        const mediaValoracion = valoraciones.length > 0
          ? parseFloat((valoraciones.reduce((sum, v) => sum + v, 0) / valoraciones.length).toFixed(1))
          : null;
        console.log(`Media calculada para ${acompanante.nombre}: ${mediaValoracion}`);


        acompanantesConMedia.push({
          _id: acompanante._id,
          nombre: acompanante.nombre,
          viajes: acompanante.viajes,
          ubicacion: acompanante.ubicacion,
          imagenPerfil: acompanante.imagenPerfil,
          mediaValoracion: mediaValoracion ? Number(mediaValoracion) : null,
          numeroValoraciones: valoraciones.length,
          tiempoEnPlataforma: calcularTiempoDesde(acompanante.createdAt)
        });
      }
    }

    console.log("Acompañantes filtrados:", acompanantesConMedia.map(a => a.nombre));
    res.json(acompanantesConMedia);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

router.get('/valoraciones/:acompananteId', async (req, res) => {
  const { acompananteId } = req.params;

  try {
    const valoraciones = await Match.find({ 
      acompananteId,
      valoracionCliente: { $exists: true }
    }).populate('clienteId', 'nombre');

    const valoracionesData = valoraciones.map(match => ({
      clienteNombre: match.clienteId?.nombre || "Anónimo",
      valoracionCliente: match.valoracionCliente,
      comentarioCliente: match.comentarioCliente
    }));

    res.json(valoracionesData);
  } catch (err) {
    console.error('Error al obtener valoraciones:', err);
    res.status(500).json({ error: 'Error al obtener valoraciones' });
  }
});

router.post('/', async (req, res) => {
  const { clienteId, acompananteId, solicitudId } = req.body;

  try {
    const solicitud = await Solicitud.findById(solicitudId);
    if (!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }

    const nuevoMatch = new Match({ 
      clienteId, 
      acompananteId,
      estado: "pendiente",
      finalizado: false 
    });
    await nuevoMatch.save();

    solicitud.matchId = nuevoMatch._id;
    await solicitud.save();

    res.status(201).json({ mensaje: "Match creado correctamente", match: nuevoMatch });
  } catch (err) {
    console.error("Error al crear match:", err);
    res.status(500).json({ error: "Error al crear el match" });
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
    match.estado = "completado";
    await match.save();

    console.log("Match actualizado a finalizado y completado:", match);

    await Solicitud.updateMany(
      { matchId: match._id },
      { estado: "finalizada", valoracionPendiente: true }
    );

    console.log("Solicitudes actualizadas a valoracionPendiente: true");

    if (match.clienteId && match.clienteId.email) {
      await enviarEmailNotificacionSolicitud(
        match.clienteId.email,
        `El acompañante ha finalizado el trayecto y ha entregado tu mascota correctamente. ¡Puedes dejar tu valoración ahora!`
      );
    }

    res.json({ mensaje: "Trayecto finalizado y marcado como completado. Valoración pendiente." });
  } catch (err) {
    console.error("Error al finalizar trayecto:", err);
    res.status(500).json({ error: "Error al finalizar trayecto" });
  }
});

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
     console.log(`Valoración guardada para Match ID ${matchId}: ${valoracionCliente}`);

    res.json({ mensaje: "Valoración guardada correctamente." });
  } catch (err) {
    console.error("Error al guardar valoración:", err);
    res.status(500).json({ error: "Error al guardar valoración" });
  }
});


module.exports = router;
