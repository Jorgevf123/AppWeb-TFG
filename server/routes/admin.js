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
    const { anio, mes } = req.query;
    let filtroFechaUsuarios = { createdAt: { $exists: true } };
    let filtroFechaSolicitudes = {};

    if (anio && mes) {
      const y = parseInt(anio);
      const m = parseInt(mes) - 1; // JavaScript: enero = 0
      const desde = new Date(y, m, 1);
      const hasta = new Date(y, m + 1, 1);

      filtroFechaUsuarios = { createdAt: { $gte: desde, $lt: hasta } };
      filtroFechaSolicitudes = { fechaSolicitud: { $gte: desde, $lt: hasta } };
    }

    const totalUsuarios = await User.countDocuments(filtroFechaUsuarios);
    const totalClientes = await User.countDocuments({ rol: "cliente", ...filtroFechaUsuarios });
    const totalAcompanantes = await User.countDocuments({ rol: "acompanante", ...filtroFechaUsuarios });
    const totalAdmins = await User.countDocuments({ rol: "admin", ...filtroFechaUsuarios });

    const totalSolicitudes = await Solicitud.countDocuments(filtroFechaSolicitudes);
    const solicitudesPendientes = await Solicitud.countDocuments({ estado: "pendiente", ...filtroFechaSolicitudes });
    const solicitudesAceptadas = await Solicitud.countDocuments({ estado: "aceptada", ...filtroFechaSolicitudes });
    const solicitudesRechazadas = await Solicitud.countDocuments({ estado: "rechazada", ...filtroFechaSolicitudes });

    const acompanantesPendientes = await User.countDocuments({ rol: "acompanante", verificado: "pendiente", ...filtroFechaUsuarios });
    const acompanantesVerificados = await User.countDocuments({ rol: "acompanante", verificado: "aprobado", ...filtroFechaUsuarios });
    const acompanantesRechazados = await User.countDocuments({ rol: "acompanante", verificado: "rechazado", ...filtroFechaUsuarios });

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


router.get("/estadisticas-mensuales", auth, adminMiddleware, async (req, res) => {
  try {
    const ahora = new Date();
    const hace12Meses = new Date(ahora.getFullYear(), ahora.getMonth() - 11, 1);

    // Agrupar usuarios registrados por mes
    const usuariosPorMes = await User.aggregate([
      { $match: { createdAt: { $gte: hace12Meses } } },
      {
        $group: {
          _id: { año: { $year: "$createdAt" }, mes: { $month: "$createdAt" } },
          total: { $sum: 1 }
        }
      },
      { $sort: { "_id.año": 1, "_id.mes": 1 } }
    ]);

    // Agrupar solicitudes aceptadas por mes
    const solicitudesPorMes = await Solicitud.aggregate([
      { $match: { estado: "aceptada", fechaSolicitud: { $gte: hace12Meses } } },
      {
        $group: {
          _id: { año: { $year: "$fechaSolicitud" }, mes: { $month: "$fechaSolicitud" } },
          total: { $sum: 1 }
        }
      },
      { $sort: { "_id.año": 1, "_id.mes": 1 } }
    ]);

    res.json({ usuariosPorMes, solicitudesPorMes });
  } catch (err) {
    console.error("Error en estadísticas mensuales:", err);
    res.status(500).json({ error: "Error al obtener estadísticas mensuales" });
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


  
