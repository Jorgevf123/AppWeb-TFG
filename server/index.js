const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// Rutas
const matchRoutes = require('./routes/matches');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const solicitudRoutes = require('./routes/solicitudes');
const nominatimRoutes = require("./routes/nominatim");
const chatRoutes = require('./routes/chat');

// Funciones para detectar usuarios conectados
const { addUser, removeUser } = require("./connectedUsers");

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado a Atlas'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use("/api/nominatim", nominatimRoutes);
app.use('/api/chat', chatRoutes);

// Servidor WebSocket
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080", // Ajusta si usas otro frontend
    methods: ["GET", "POST"]
  }
});

// Lógica de conexión por socket
io.on('connection', (socket) => {
  console.log('🔌 Usuario conectado:', socket.id);

  // Unirse a sala de chat entre dos usuarios
  socket.on('unirseSala', ({ usuario1, usuario2 }) => {
    const room = [usuario1, usuario2].sort().join("-");
    socket.join(room);
  });  

  // Notificar que un usuario está online
  socket.on("usuarioOnline", (userId) => {
    addUser(userId);
    console.log(`✅ Usuario en línea: ${userId}`);
  });

  // Notificar que un usuario se ha ido (por navegación o cerrar pestaña)
  socket.on("usuarioOffline", (userId) => {
    removeUser(userId);
    console.log(`❌ Usuario fuera de línea: ${userId}`);
  });

  // Manejar mensajes de chat entre usuarios
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
    // Nota: no podemos remover el userId aquí porque no lo tenemos en el socket.
  });
});

// Endpoint simple para comprobar servidor
app.get("/", (req, res) => {
  res.send("¡Servidor backend funcionando!");
});

// Lanzar el servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));

  
