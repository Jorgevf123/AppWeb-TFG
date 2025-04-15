const express = require('express');
const Solicitud = require('../models/Solicitud');
const router = express.Router();
const auth = require('../middleware/auth');


// ✅ Crear nueva solicitud
router.post('/', auth, async (req, res) => {
  try {
    const clienteId = req.user.userId;
    const { acompananteId, tipoAnimal, raza, dimensiones, vacunasAlDia } = req.body;

    const nuevaSolicitud = new Solicitud({
      clienteId,
      acompananteId,
      tipoAnimal,
      raza,
      dimensiones,
      vacunasAlDia
    });

    await nuevaSolicitud.save();
    res.status(201).json(nuevaSolicitud);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la solicitud' });
  }
});


// ✅ Obtener solicitudes por acompañante
router.get('/:acompananteId', async (req, res) => {
  try {
    const solicitudes = await Solicitud.find({ acompananteId: req.params.acompananteId })
      .populate('clienteId', 'nombre email'); // puedes cambiar los campos que quieres mostrar
    res.json(solicitudes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las solicitudes' });
  }
});

// ✅ Obtener solicitudes de un cliente
router.get('/cliente/:clienteId', async (req, res) => {
    try {
      const solicitudes = await Solicitud.find({ clienteId: req.params.clienteId });
      res.json(solicitudes);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener solicitudes del cliente' });
    }
  });  

// ✅ Actualizar estado de una solicitud
router.put('/:id', async (req, res) => {
    try {
      const { estado } = req.body;
      const solicitud = await Solicitud.findByIdAndUpdate(req.params.id, { estado }, { new: true });
      res.json(solicitud);
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar la solicitud' });
    }
  });
  

module.exports = router;


  