const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const matchRoutes = require('./routes/matches');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const solicitudRoutes = require('./routes/solicitudes');
const nominatimRoutes = require("./routes/nominatim");
const chatRoutes = require('./routes/chat');
const orsRoutes = require('./routes/openrouteservice');
const reportesRoutes = require("./routes/reportes");

const { addUser, removeUser } = require("./connectedUsers");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",        
  "http://localhost:3000",  
  "http://localhost:8080",      
  "https://pettravelbuddy.vercel.app",
  "https://appweb-tfg.vercel.app",
  "https://pettravelbuddy-jorgeangelv979-gmailcoms-projects.vercel.app",
  "https://pettravelbuddy-git-main-jorgeangelv979-gmailcoms-projects.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("❌ Bloqueado por CORS:", origin);
      callback(new Error("CORS no permitido"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('/', cors(corsOptions));


/*app.options('*', (req, res) => {
  res.sendStatus(204);
}); */
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado a Atlas'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err));

const User = require("./models/User");
const { enviarEmailDesbaneo } = require("./utils/emailUtils");

setInterval(async () => {
  const ahora = new Date();

  const usuarios = await User.find({
    baneadoHasta: { $lte: ahora, $ne: null }
  });

  for (const u of usuarios) {
+
    await enviarEmailDesbaneo(u.email);
+
    await User.findByIdAndUpdate(u._id, {
      $unset: { baneadoHasta: "" }
    });
  }
}, 60 * 1000); +


app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use("/api/nominatim", nominatimRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/admin", require("./routes/admin"));
app.use("/api/openrouteservice", orsRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/usuarios", require("./routes/user"));


const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS socket no permitido: " + origin));
      }
    },
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Usuario conectado:', socket.id);

  socket.on('unirseSala', ({ usuario1, usuario2 }) => {
    const room = [usuario1, usuario2].sort().join("-");
    socket.join(room);
  });  


  socket.on("usuarioOnline", (userId) => {
    addUser(userId);
    socket.join(userId);
    console.log(`✅ Usuario en línea: ${userId}`);
  });


  socket.on("usuarioOffline", (userId) => {
    removeUser(userId);
    console.log(`❌ Usuario fuera de línea: ${userId}`);
  });


  socket.on('enviarMensaje', (mensaje) => {
    const { remitente, para } = mensaje;
    const room = [remitente._id || remitente, para].sort().join("-");
    console.log("📨 Enviando mensaje a sala:", room);
    io.to(room).emit('mensajeRecibido', mensaje);
    //io.to(para).emit('mensajeRecibido', mensaje);
  });  

  socket.on('disconnect', () => {
    console.log('🔌 Usuario desconectado:', socket.id);
  });
});


app.get("/", (req, res) => {
  res.send("¡Servidor backend funcionando!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

  
