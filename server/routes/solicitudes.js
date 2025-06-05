const express = require("express");
const router = express.Router();
const Solicitud = require("../models/Solicitud");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { isUserOnline } = require("../connectedUsers");
const { enviarEmailNotificacionSolicitud } = require("../utils/emailUtils");
const Match = require('../models/Match');

router.post("/", auth, async (req, res) => {
  try {
    const clienteId = req.user.userId;
    const { acompananteId, tipoAnimal, raza, dimensiones, vacunasAlDia } = req.body;

    const match = new Match({ 
      clienteId, 
      acompananteId,
      estado: "pendiente", 
      finalizado: false 
    });
    await match.save();

    const nuevaSolicitud = new Solicitud({
      clienteId,
      acompananteId,
      tipoAnimal,
      raza,
      dimensiones,
      vacunasAlDia,
      matchId: match._id, 
    });

    await nuevaSolicitud.save();
    try {
      const cliente = await User.findById(clienteId);
      const acompanante = await User.findById(acompananteId);

      if (acompanante && acompanante.email) {
        const mensaje = `¡Hola ${acompanante.nombre}! El cliente ${cliente.nombre} te ha enviado una nueva solicitud para acompañar a su mascota.`;
        await enviarEmailNotificacionSolicitud(acompanante.email, mensaje);
      }
    } catch (err) {
      console.error("Error enviando correo de nueva solicitud:", err);
    }
    res.status(201).json(nuevaSolicitud);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la solicitud" });
  }
});

router.get("/:acompananteId", async (req, res) => {
  try {
    const solicitudes = await Solicitud.find({ acompananteId: req.params.acompananteId })
      .populate("clienteId", "nombre email")
      .populate("matchId", "finalizado valoracionCliente comentarioCliente");
    res.json(solicitudes);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener las solicitudes" });
  }
});

router.get("/cliente/:clienteId", async (req, res) => {
  try {
    const solicitudes = await Solicitud.find({ clienteId: req.params.clienteId }).sort({
      fechaSolicitud: -1,
    });
    res.json(solicitudes);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener solicitudes del cliente" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { estado } = req.body;
    const solicitud = await Solicitud.findByIdAndUpdate(req.params.id, { estado }, { new: true });

    if (!solicitud) return res.status(404).json({ error: "Solicitud no encontrada" });

    const cliente = await User.findById(solicitud.clienteId);

    if (!isUserOnline(cliente._id.toString())) {
      const acompanante = await User.findById(solicitud.acompananteId);
    
      const mensaje =
        estado === "aceptada"
          ? `El acompañante ${acompanante.nombre} ha aceptado tu solicitud.`
          : `El acompañante ${acompanante.nombre} ha rechazado tu solicitud.`;
    
      await enviarEmailNotificacionSolicitud(cliente.email, mensaje);
    }    

    res.json(solicitud);
  } catch (err) {
    console.error("Error al actualizar la solicitud:", err);
    res.status(500).json({ error: "Error al actualizar la solicitud" });
  }
});

router.put('/actualizar-valoracion/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const solicitudesActualizadas = await Solicitud.updateMany(
      { matchId },
      { valoracionPendiente: false }
    );

    if (!solicitudesActualizadas.matchedCount) {
      return res.status(404).json({ error: "No se encontró ninguna solicitud para el matchId dado" });
    }

    res.json({ mensaje: "Solicitud actualizada. Valoración completada." });
  } catch (err) {
    console.error("Error al actualizar valoracionPendiente:", err);
    res.status(500).json({ error: "Error al actualizar valoracionPendiente" });
  }
});


module.exports = router;




  