import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';

import config from './config/index.js';
import { setupChatSocket } from './sockets/chatSocket.js';
import { errorHandler, notFound, handleValidationErrors } from './middleware/validation.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Crear instancia de Express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Log de requests (solo en desarrollo)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// RUTAS DE LA API
// ============================================

/**
 * Health check - Verificar estado del servidor
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

/**
 * Raíz de la API
 */
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API de Catering PYME',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      messages: '/api/messages',
    },
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de productos
app.use('/api/products', productRoutes);

// Rutas de mensajes (REST fallback)
app.use('/api/messages', messageRoutes);

// ============================================
// SOCKET.IO SETUP
// ============================================

setupChatSocket(io);

// ============================================
// MANEJO DE ERRORES Y 404
// ============================================

app.use(notFound);
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

const PORT = config.port;

server.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════╗
    ║   🍽️  CATERING PYME - API SERVER      ║
    ║   Puerto: ${PORT}                        ║
    ║   Entorno: ${config.nodeEnv.toUpperCase()}                    ║
    ║   CORS: ${config.corsOrigin}              ║
    ╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido. Cerrando servidor gracefully...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

export { app, server, io };
