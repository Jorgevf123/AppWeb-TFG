const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();
const crypto = require('crypto');
const { enviarEmailRecuperacion } = require('../utils/emailUtils');

const tokensReset = new Map();

router.post('/register', upload.fields([
  { name: 'dniFrontal', maxCount: 1 },
  { name: 'dniTrasero', maxCount: 1 }
]), async (req, res) => {
  const { nombre, apellidos, email, password, rol, fechaNacimiento } = req.body;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*\-_\.\,])[A-Za-z\d!@#\$%\^&\*\-_\.\,]{8,}$/;
if (!passwordRegex.test(password)) {
  return res.status(400).json({
    error: "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, un número y un símbolo."
  });
}
  let ubicacion;

  try {
    ubicacion = JSON.parse(req.body.ubicacion);
  } catch {
    return res.status(400).json({ error: "Ubicación inválida." });
  }

  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  if (edad < 18) {
    return res.status(400).json({ error: "Debes tener al menos 18 años para registrarte." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      nombre,
      apellidos,
      email,
      password: hashedPassword,
      rol,
      fechaNacimiento,
      ubicacion
    });

    if (rol === 'acompanante') {
      if (!req.files?.dniFrontal || !req.files?.dniTrasero) {
        return res.status(400).json({ error: 'DNI frontal y trasero requeridos para acompañantes.' });
      }

      const frontal = req.files.dniFrontal[0];
      const trasero = req.files.dniTrasero[0];

      newUser.dniFrontal = frontal.filename;
      newUser.dniTrasero = trasero.filename;
      newUser.verificado = 'pendiente'; 
    }

    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado' });

  } catch (err) {
    if (err.code === 11000 && err.keyValue?.email) {
      return res.status(400).json({ error: 'Este email ya está registrado.' });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.baneadoHasta && new Date(user.baneadoHasta) > new Date()) {
      const minutos = Math.ceil((new Date(user.baneadoHasta) - new Date()) / 60000);
      return res.status(403).json({ error: `Has sido baneado. Tiempo restante: ${minutos} minutos.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Contraseña incorrecta' });

    if (user.rol === 'acompanante') {
      if (user.verificado === 'pendiente') {
        return res.status(403).json({ error: 'Tu cuenta como acompañante está pendiente de verificación por el administrador.' });
      }
      if (user.verificado === 'rechazado') {
        return res.status(403).json({ error: 'Tu cuenta como acompañante ha sido rechazada. Contacta con soporte.' });
      }
    }

    const secret = process.env.JWT_SECRET || "claveTemporalParaProbar";

    const token = jwt.sign(
      { userId: user._id, rol: user.rol },
      secret,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        nombre: user.nombre,
        apellidos: user.apellidos,
        rol: user.rol,
        fechaNacimiento: user.fechaNacimiento,
        userId: user._id,
        imagenPerfil: user.imagenPerfil || ""
      }
    });

  } catch (err) {
    console.error("Error en /login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get('/acompanantes', async (_req, res) => {
  try {
    const acompanantes = await User.find({ rol: 'acompanante', verificado: 'aprobado' });
    res.json(acompanantes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("nombre apellidos email fechaNacimiento rol imagenPerfil bio");
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener datos del usuario" });
  }
});

router.put('/actualizar-foto', auth, async (req, res) => {
  const userId = req.user.userId;
  const { imagenPerfil } = req.body;

  if (!imagenPerfil) return res.status(400).json({ error: "Imagen no proporcionada" });

  try {
    await User.findByIdAndUpdate(userId, { imagenPerfil });
    res.status(200).json({ message: "Imagen actualizada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar la imagen" });
  }
});

router.put('/actualizar-perfil', auth, async (req, res) => {
  const userId = req.user.userId;
  const { nombre, apellidos, email, fechaNacimiento, rol, bio } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail && existingEmail._id.toString() !== userId) {
      return res.status(400).json({ error: "Este email ya está en uso." });
    }

    await User.findByIdAndUpdate(userId, {
      nombre,
      apellidos,
      email,
      fechaNacimiento,
      rol,
      bio
    });

    res.status(200).json({ message: "Perfil actualizado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
});
router.post('/olvide-contrasena', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  const token = crypto.randomBytes(32).toString('hex');
  tokensReset.set(token, { userId: user._id.toString(), expira: Date.now() + 15 * 60 * 1000 }); // 15 minutos

  const link = `${process.env.FRONTEND_URL || "http://localhost:8080"}/restablecer-contrasena/${token}`;
  await enviarEmailRecuperacion(email, link);
  res.json({ message: "Correo de recuperación enviado." });
});
router.post('/restablecer-contrasena', async (req, res) => {
  const { token, nuevaPassword } = req.body;
  const info = tokensReset.get(token);

  if (!info || Date.now() > info.expira) {
    return res.status(400).json({ error: "Token inválido o expirado" });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*\-_\.\,])[A-Za-z\d!@#\$%\^&\*\-_\.\,]{8,}$/;

  if (!passwordRegex.test(nuevaPassword)) {
    return res.status(400).json({
      error: "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, un número y un símbolo."
    });
  }

  const hashed = await bcrypt.hash(nuevaPassword, 10);
  await User.findByIdAndUpdate(info.userId, { password: hashed });
  tokensReset.delete(token);
  res.json({ message: "Contraseña actualizada correctamente" });
});
router.post("/solicitar-cambio-rol", auth, upload.fields([
  { name: "dniFrontal" },
  { name: "dniTrasero" }
]), async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.rolPendiente = "acompanante";
    user.verificado = "pendiente";
    if (req.files?.dniFrontal?.[0]) user.dniFrontal = req.files.dniFrontal[0].filename;
    if (req.files?.dniTrasero?.[0]) user.dniTrasero = req.files.dniTrasero[0].filename;
    await user.save();

    res.json({ message: "Solicitud enviada. A la espera de verificación." });
  } catch (err) {
    console.error("Error en solicitud de cambio de rol:", err);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
});

module.exports = router;

