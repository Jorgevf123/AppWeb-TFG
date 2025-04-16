const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User'); // AÑADIR ESTO
const auth = require('../middleware/auth');
const router = express.Router();

// Obtener todos los mensajes entre usuario actual y otro usuario
router.get('/:userId', auth, async (req, res) => {
  const currentUserId = req.user.userId;
  const targetUserId = req.params.userId;

  try {
    const chat = await Chat.findOne({
      participantes: { $all: [currentUserId, targetUserId] }
    }).populate('mensajes.remitente', 'nombre');

    // También obtener el nombre del receptor
    const receptor = await User.findById(targetUserId).select('nombre');

    res.json({
      mensajes: chat?.mensajes || [],
      nombreReceptor: receptor?.nombre || "Usuario"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener chat' });
  }
});

// Enviar mensaje (guardar en base de datos)
router.post('/:userId', auth, async (req, res) => {
  const currentUserId = req.user.userId;
  const targetUserId = req.params.userId;
  const { texto } = req.body;

  try {
    let chat = await Chat.findOne({
      participantes: { $all: [currentUserId, targetUserId] }
    });

    if (!chat) {
      chat = new Chat({
        participantes: [currentUserId, targetUserId],
        mensajes: []
      });
    }

    chat.mensajes.push({
      remitente: currentUserId,
      texto,
      timestamp: new Date()
    });

    await chat.save();

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});

module.exports = router;

