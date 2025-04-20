const express = require('express');
const Chat = require('../models/Chat');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { isUserOnline } = require('../connectedUsers');
const { enviarEmailNotificacionChat } = require('../utils/emailUtils');

const router = express.Router();

// Obtener todos los mensajes entre usuario actual y otro usuario
router.get('/:userId', auth, async (req, res) => {
  const currentUserId = req.user.userId;
  const targetUserId = req.params.userId;

  try {
    const chat = await Chat.findOne({
      participantes: { $all: [currentUserId, targetUserId] }
    }).populate('mensajes.remitente', 'nombre');

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

// Enviar mensaje (texto y/o archivo)
router.post('/:userId', auth, upload.single('archivo'), async (req, res) => {
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

    const nuevoMensaje = {
      remitente: currentUserId,
      texto,
      timestamp: new Date()
    };

    if (req.file) {
      nuevoMensaje.archivo = req.file.filename;
    }

    chat.mensajes.push(nuevoMensaje);
    await chat.save();

    // Obtener el último mensaje ya populado
    const chatActualizado = await Chat.findOne(
      { _id: chat._id },
      { mensajes: { $slice: -1 } }
    ).populate('mensajes.remitente', 'nombre');

    const ultimoMensaje = chatActualizado?.mensajes?.[0];

    // Solo enviar email si el destinatario NO está conectado
    if (!isUserOnline(targetUserId)) {
      const destinatario = await User.findById(targetUserId);
      if (destinatario && destinatario.email) {
        const remitente = await User.findById(currentUserId);
        const mensaje = `Has recibido un nuevo mensaje de ${remitente?.nombre || "otro usuario"}${texto ? `: "${texto}"` : " con archivo adjunto"}`;
        await enviarEmailNotificacionChat(destinatario.email, mensaje);
      }
    }

    // Devolver al frontend
    res.status(201).json({ success: true, mensaje: ultimoMensaje });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});

module.exports = router;




