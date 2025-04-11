const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const matchRoutes = require('./routes/matches');

dotenv.config();

const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)

.then(() => console.log('MongoDB conectado a Atlas'))
.catch((err) => console.error(err));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

app.get("/", (req, res) => {
    res.send("¡Servidor backend funcionando!");
  });
  
