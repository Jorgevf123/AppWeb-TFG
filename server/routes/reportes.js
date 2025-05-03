const express = require("express");
const router = express.Router();
const Reporte = require("../models/Reporte");
const auth = require("../middleware/auth");
const User = require("../models/User");

// Crear reporte
router.post("/", auth, async (req, res) => {
  try {
    const { remitente, destinatario, motivo } = req.body;

    if (!remitente || !destinatario || !motivo) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const nuevoReporte = new Reporte({
      remitente,
      destinatario,
      motivo,
      estado: "abierto"
    });

    await nuevoReporte.save();
    res.status(201).json({ message: "Reporte enviado correctamente" });
  } catch (err) {
    console.error("Error creando reporte:", err);
    res.status(500).json({ error: "Error al crear reporte" });
  }
});
router.get("/", auth, async (req, res) => {
    try {
      if (req.user?.rol !== "admin") {
        return res.status(403).json({ error: "Solo accesible para administradores" });
      }
  
      const reportes = await Reporte.find()
      .populate("remitente", "nombre")
      .populate("destinatario", "nombre")
        .sort({ fecha: -1 });
  
      res.json(reportes);
    } catch (err) {
      console.error("Error al obtener reportes:", err);
      res.status(500).json({ error: "Error al cargar reportes" });
    }
  });
  
  // Actualizar estado de un reporte
  router.put("/:id", auth, async (req, res) => {
    try {
      if (req.user?.rol !== "admin") {
        return res.status(403).json({ error: "Solo accesible para administradores" });
      }
  
      const { estado } = req.body;
      if (!["abierto", "rechazado", "baneado"].includes(estado)) {
        return res.status(400).json({ error: "Estado inválido" });
      }
  
      // Actualizar estado del reporte
      const reporteActualizado = await Reporte.findByIdAndUpdate(
        req.params.id,
        { estado },
        { new: true }
      );
  
      if (!reporteActualizado) {
        return res.status(404).json({ error: "Reporte no encontrado" });
      }
      res.json(reporteActualizado);
    } catch (err) {
      console.error("Error actualizando reporte:", err);
      res.status(500).json({ error: "Error al actualizar estado del reporte" });
    }
  });  

  router.post("/banear/:userId", auth, async (req, res) => {
    try {
      if (req.user?.rol !== "admin") {
        return res.status(403).json({ error: "Solo accesible para administradores" });
      }
  
      const { duracion, unidad } = req.body; // ej. 2, 'horas'
      const multiplicador = {
        minutos: 60 * 1000,
        horas: 60 * 60 * 1000,
        dias: 24 * 60 * 60 * 1000
      };
  
      if (!duracion || !unidad || !multiplicador[unidad]) {
        return res.status(400).json({ error: "Duración o unidad inválida" });
      }
  
      const hasta = new Date(Date.now() + duracion * multiplicador[unidad]);
  
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { baneadoHasta: hasta },
        { new: true }
      );
  
      res.json({ message: `Usuario baneado hasta ${hasta}`, user });
    } catch (err) {
      console.error("Error al aplicar baneo:", err);
      res.status(500).json({ error: "Error al aplicar baneo" });
    }
  });
  

module.exports = router;
