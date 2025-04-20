const express = require("express");
const router = express.Router();
const Solicitud = require("../models/Solicitud");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { isUserOnline } = require("../connectedUsers");
const { enviarEmailNotificacionSolicitud } = require("../utils/emailUtils");

// ✅ Crear nueva solicitud
router.post("/", auth, async (req, res) => {
  try {
    const clienteId = req.user.userId;
    const { acompananteId, tipoAnimal, raza, dimensiones, vacunasAlDia } = req.body;

    const nuevaSolicitud = new Solicitud({
      clienteId,
      acompananteId,
      tipoAnimal,
      raza,
      dimensiones,
      vacunasAlDia,
    });

    await nuevaSolicitud.save();
    res.status(201).json(nuevaSolicitud);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear la solicitud" });
  }
});

// ✅ Obtener solicitudes por acompañante
router.get("/:acompananteId", async (req, res) => {
  try {
    const solicitudes = await Solicitud.find({ acompananteId: req.params.acompananteId })
      .populate("clienteId", "nombre email");
    res.json(solicitudes);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener las solicitudes" });
  }
});

// ✅ Obtener solicitudes de un cliente
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

// ✅ Actualizar estado de una solicitud (y enviar email si el cliente está offline)
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

module.exports = router;




  