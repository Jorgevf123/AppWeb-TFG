const express = require('express');
const User = require('../models/User');
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
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
router.get('/perfil/:id', auth, async (req, res) => {
  if (req.user?.rol !== "cliente") {
    return res.status(403).json({ error: "Acceso denegado. Solo los clientes pueden acceder a esta información." });
  }

  try {
    const user = await User.findById(req.params.id)
      .select('nombre bio imagenPerfil viajes');

    if (!user) {
      return res.status(404).json({ error: "Acompañante no encontrado." });
    }

    res.json(user);
  } catch (err) {
    console.error('Error al obtener perfil del acompañante:', err);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

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
    await enviarEmailBaneo(user.email, minutos);

    res.json({ message: "Usuario baneado temporalmente y notificado por correo." });
  } catch (err) {
    console.error("Error al aplicar baneo:", err);
    res.status(500).json({ error: "Error al aplicar baneo." });
  }
});
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId !== req.user.userId) {
      return res.status(403).json({ error: "No autorizado para eliminar esta cuenta." });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "Cuenta eliminada correctamente." });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ error: "Error al eliminar cuenta." });
  }
});

router.put("/:id/imagen", async (req, res) => {
  const { id } = req.params;
  const { imagen } = req.body;

  if (!imagen) {
    return res.status(400).json({ error: "Falta la imagen" });
  }

  try {
    const usuario = await User.findByIdAndUpdate(
      id,
      { imagenPerfil: imagen },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Imagen actualizada", usuario });
  } catch (err) {
    console.error("Error al actualizar imagen:", err);
    res.status(500).json({ error: "Error al actualizar la imagen" });
  }
});



module.exports = router;
