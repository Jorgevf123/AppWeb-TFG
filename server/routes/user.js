const express = require('express');
const User = require('../models/User');
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");


const router = express.Router();

router.get('/test', (req, res) => {
    res.send("Ruta /api/users/test funcionando");
  });
  
// PUT /api/users/:id/viaje
router.put('/:id/viaje', async (req, res) => {
  try {
    const { tipo, origen, destino, fecha } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        viaje: {
          tipo,
          origen,
          destino,
          fecha: new Date(fecha)
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

module.exports = router;
