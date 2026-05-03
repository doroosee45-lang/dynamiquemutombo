// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const path = require('path');

// const connectDB = require('./config/db');
// const { errorHandler, apiLimiter } = require('./middleware/error');
// const { initSocket } = require('./services/socketService');

// const app = express();
// const server = http.createServer(app);

// // Socket.io
// const io = new Server(server, {
//   cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] }
// });
// global.socketEmitter = initSocket(io);

// // Connexion DB
// connectDB();

// // Middlewares
// app.use(helmet({ crossOriginEmbedderPolicy: false }));
// app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
// app.use(morgan('dev'));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/api', apiLimiter);

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/signalements', require('./routes/signalements'));
// app.use('/api', require('./routes/index'));

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({
//     success: true,
//     message: '🇨🇩 Dynamique Israël Mutombo API — Opérationnelle',
//     version: '2.0.0',
//     timestamp: new Date().toISOString()
//   });
// });

// // 404
// app.use('*', (req, res) => {
//   res.status(404).json({ success: false, message: 'Route introuvable' });
// });

// // Error handler
// app.use(errorHandler);

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`\n🚀 Serveur lancé sur le port ${PORT}`);
//   console.log(`📡 API: http://localhost:${PORT}/api`);
//   console.log(`🔌 Socket.io actif`);
//   console.log(`🇨🇩 Dynamique Israël Mutombo v2.0\n`);
// });


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { errorHandler, apiLimiter } = require('./middleware/error');

const app = express();

// ✅ Indique à Express qu'il est derrière un proxy (Vercel, etc.)
// Valeur 1 = seul le premier proxy est fiable. Adaptez si besoin.
app.set('trust proxy', 1);

// Connexion DB immédiate
connectDB();

// Middlewares

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/signalements', require('./routes/signalements'));
app.use('/api', require('./routes/index'));

// Health check
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'OK', version: '2.0.0', timestamp: new Date().toISOString() });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable' });
});

app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Local server on ${PORT}`));
}