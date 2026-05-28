import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  // Servidor
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // Seguridad
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  
  // Email (opcional)
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Validar configuración crítica en producción
if (config.nodeEnv === 'production') {
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
}

export default config;
