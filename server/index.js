const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const matchRoutes = require('./routes/matches');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const solicitudRoutes = require('./routes/solicitudes');
const nominatimRoutes = require("./routes/nominatim");
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)

.then(() => console.log('MongoDB conectado a Atlas'))
.catch((err) => console.error(err));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use("/api/nominatim", nominatimRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080", // Cambia si usas otro frontend
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Usuario conectado:', socket.id);

  socket.on('unirseSala', ({ usuario1, usuario2 }) => {
    const room = [usuario1, usuario2].sort().join("-");
    socket.join(room);
  });  

  socket.on('enviarMensaje', ({ de, para, texto }) => {
    const room = [de, para].sort().join("-");
    const mensaje = {
      remitente: de,
      texto,
      timestamp: new Date()
    };
    io.to(room).emit('mensajeRecibido', mensaje);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Usuario desconectado:', socket.id);
  });
});


app.get("/", (req, res) => {
    res.send("¡Servidor backend funcionando!");
  });
  
