const express = require("express");
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const User = require("../models/User");
const { enviarEmailNotificacionSolicitud } = require("../utils/emailUtils");


const router = express.Router();

router.get("/acompanantes-pendientes", auth, adminMiddleware, async (req, res) => {
  try {
    const pendientes = await User.find({ rol: "acompanante", verificado: "pendiente" });
    res.json(pendientes);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener acompañantes pendientes" });
  }
});

router.put("/verificar-acompanante/:id", auth, adminMiddleware, async (req, res) => {
    const { estado } = req.body;
    const { id } = req.params;
  
    if (!["aprobado", "rechazado"].includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" });
    }
  
    try {
      const user = await User.findByIdAndUpdate(id, { verificado: estado }, { new: true });
  
      if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  
      // ✅ Enviar correo según el estado
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


  
