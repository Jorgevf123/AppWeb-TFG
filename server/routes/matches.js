const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const User = require('../models/User');

// Obtener acompañantes disponibles
router.get('/acompanantes', async (req, res) => {
  try {
    const acompanantes = await User.find({ rol: 'Acompañante' });
    res.json(acompanantes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener acompañantes pasados para un cliente
router.get('/historial/:clienteId', async (req, res) => {
  try {
    const historial = await Match.find({ clienteId: req.params.clienteId, estado: 'completado' }).populate('acompananteId');
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo match
router.post('/', async (req, res) => {
  const { clienteId, acompananteId } = req.body;
  try {
    const nuevoMatch = new Match({ clienteId, acompananteId });
    await nuevoMatch.save();
    res.status(201).json(nuevoMatch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
