const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const matchRoutes = require('./routes/matches');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const solicitudRoutes = require('./routes/solicitudes');
const nominatimRoutes = require("./routes/nominatim");
const chatRoutes = require('./routes/chat');
const orsRoutes = require('./routes/openrouteservice');
const reportesRoutes = require("./routes/reportes");
const adminRoutes = require("./routes/admin");

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
      callback(new Error("CORS no permitido"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

const app = express();
app.use(cors(corsOptions));
app.options('/', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use("/api/nominatim", nominatimRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/openrouteservice", orsRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/usuarios", require("./routes/user"));

app.get("/", (req, res) => {
  res.send("¡Servidor backend funcionando!");
});

module.exports = app;
