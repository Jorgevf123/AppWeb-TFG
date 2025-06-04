const express = require('express');
const Chat = require('../models/Chat');
const Mensaje = require('../models/Mensaje');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { isUserOnline } = require('../connectedUsers');
const { enviarEmailNotificacionChat } = require('../utils/emailUtils');

const router = express.Router();

router.get('/:matchId', auth, async (req, res) => {
  const currentUserId = req.user.userId;
  const matchId = req.params.matchId;

  try {
    const chat = await Chat.findOne({
      matchId,
      participantes: currentUserId
    });

    let mensajes = [];
    if (chat) {
      mensajes = await Mensaje.find({ chatId: chat._id })
        .populate('remitente', 'nombre')
        .sort({ timestamp: 1 });
    }

    const receptorId = chat?.participantes.find(id => id.toString() !== currentUserId);
    const receptor = receptorId ? await User.findById(receptorId).select('nombre') : null;

    res.json({
      mensajes,
      nombreReceptor: receptor?.nombre || "Usuario"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener chat' });
  }
});

router.post('/:matchId', auth, (req, res, next) => {
  upload.single('archivo')(req, res, function (err) {
    if (err?.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: "El archivo supera el tamaño máximo permitido (5MB)" });
    } else if (err) {
      return res.status(500).json({ error: "Error al subir archivo" });
    }
    next();
  });
}, async (req, res) => {
  const currentUserId = req.user.userId;
  const matchId = req.params.matchId;
  const { texto, receptorId } = req.body;

  try {
    let chat = await Chat.findOne({
      matchId,
      participantes: currentUserId
    });

    if (!chat) {
      chat = new Chat({
        participantes: [currentUserId, receptorId],
        matchId
      });
      await chat.save();
    }

    const nuevoMensaje = new Mensaje({
      chatId: chat._id,
      remitente: currentUserId,
      texto,
      archivo: req.file?.filename
    });
    await nuevoMensaje.save();

    const ultimoMensaje = await Mensaje.findOne({ _id: nuevoMensaje._id })
      .populate('remitente', 'nombre');

    if (!isUserOnline(receptorId)) {
      const destinatario = await User.findById(receptorId);
      if (destinatario && destinatario.email) {
        const remitente = await User.findById(currentUserId);
        const mensaje = `Has recibido un nuevo mensaje de ${remitente?.nombre || "otro usuario"}${texto ? `: "${texto}"` : " con archivo adjunto"}`;
        await enviarEmailNotificacionChat(destinatario.email, mensaje);
      }
    }

    res.status(201).json({ success: true, mensaje: ultimoMensaje });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});

module.exports = router;
