const express = require('express');
const User = require('../models/User');
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/Admin");
const { enviarEmailBaneo } = require("../utils/emailUtils");


const router = express.Router();

router.get('/test', (req, res) => {
    res.send("Ruta /api/users/test funcionando");
  });
  
  router.get('/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('nombre bio imagenPerfil');
  
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
  
      res.json(user);
    } catch (err) {
      console.error('Error al buscar usuario:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });
// PUT /api/users/:id/viaje
router.put('/:id/viaje', async (req, res) => {
  try {
    const { tipo, origen, destino, fecha, precio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          viajes: {
            tipo,
            origen,
            destino,
            fecha: new Date(fecha),
            precio
          }
        }
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el viaje' });
  }
});

// PUT /api/users/ubicacion/:id
router.put('/ubicacion/:id', async (req, res) => {
  const { lat, lng } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ubicacion: { lat, lng } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar ubicación' });
  }
});
router.put("/banear/:id", auth, async (req, res) => {
  if (req.user?.rol !== "admin") {
    return res.status(403).json({ error: "Solo los administradores pueden banear." });
  }

  const { baneadoHasta } = req.body;
  if (!baneadoHasta) return res.status(400).json({ error: "Debe indicar hasta cuándo." });

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { baneadoHasta },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });

    const minutos = Math.ceil((new Date(baneadoHasta) - new Date()) / 60000);
    await enviarEmailBaneo(user.email, minutos); // ✅ ENVÍA EL EMAIL

    res.json({ message: "Usuario baneado temporalmente y notificado por correo." });
  } catch (err) {
    console.error("Error al aplicar baneo:", err);
    res.status(500).json({ error: "Error al aplicar baneo." });
  }
});


module.exports = router;
