const express = require("express");
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const User = require("../models/User");
const { enviarEmailNotificacionSolicitud } = require("../utils/emailUtils");
const Solicitud = require("../models/Solicitud");

const router = express.Router();

// Obtener acompañantes pendientes
router.get("/acompanantes-pendientes", auth, adminMiddleware, async (req, res) => {
  try {
    const pendientes = await User.find({ rol: "acompanante", verificado: "pendiente" });
    res.json(pendientes);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener acompañantes pendientes" });
  }
});

// Estadísticas generales
router.get("/estadisticas", auth, adminMiddleware, async (req, res) => {
  try {
    const totalUsuarios = await User.countDocuments();
    const totalClientes = await User.countDocuments({ rol: "cliente" });
    const totalAcompanantes = await User.countDocuments({ rol: "acompanante" });
    const totalAdmins = await User.countDocuments({ rol: "admin" });

    const totalSolicitudes = await Solicitud.countDocuments();
    const solicitudesPendientes = await Solicitud.countDocuments({ estado: "pendiente" });
    const solicitudesAceptadas = await Solicitud.countDocuments({ estado: "aceptada" });
    const solicitudesRechazadas = await Solicitud.countDocuments({ estado: "rechazada" });

    const acompanantesPendientes = await User.countDocuments({ rol: "acompanante", verificado: "pendiente" });
    const acompanantesVerificados = await User.countDocuments({ rol: "acompanante", verificado: "aprobado" });
    const acompanantesRechazados = await User.countDocuments({ rol: "acompanante", verificado: "rechazado" });

    res.json({
      usuarios: { totalUsuarios, totalClientes, totalAcompanantes, totalAdmins },
      solicitudes: { totalSolicitudes, solicitudesPendientes, solicitudesAceptadas, solicitudesRechazadas },
      acompanantesPendientes,
      acompanantesVerificados,
      acompanantesRechazados
    });
  } catch (err) {
    console.error("Error en estadísticas:", err);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// Verificar o rechazar acompañante
router.put("/verificar-acompanante/:id", auth, adminMiddleware, async (req, res) => {
  const { estado } = req.body;
  const { id } = req.params;

  if (!["aprobado", "rechazado"].includes(estado)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  try {
    const user = await User.findByIdAndUpdate(id, { verificado: estado }, { new: true });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const mensaje =
      estado === "aprobado"
        ? "¡Tu cuenta como acompañante ha sido verificada! Ya puedes acceder y ofrecer acompañamientos."
        : "Tu cuenta como acompañante ha sido rechazada. Si crees que esto es un error, por favor contacta con soporte.";

    await enviarEmailNotificacionSolicitud(user.email, mensaje);

    res.json({ message: `Acompañante ${estado} correctamente.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar verificación" });
  }
});

module.exports = router;


  
