const express = require("express");
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const User = require("../models/User");

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
    await User.findByIdAndUpdate(id, { verificado: estado });
    res.json({ message: `Acompañante ${estado} correctamente.` });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar verificación" });
  }
});

module.exports = router;


  
