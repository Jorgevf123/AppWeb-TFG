const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  const { nombre, email, password, rol, ubicacion } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ nombre, email, password: hashedPassword, rol, ubicacion });
    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { userId: user._id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        nombre: user.nombre,
        rol: user.rol,
        userId: user._id,
        imagenPerfil: user.imagenPerfil || ""
      }
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/acompanantes', async (req, res) => {
  try {
    const acompanantes = await User.find({ rol: 'Acompañante' });
    res.json(acompanantes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('imagenPerfil');
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

module.exports = router;
