import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { prisma } from '../db.js';

/**
 * Middleware para autenticar JWT
 * Extrae el token del header Authorization y verifica su validez
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token requerido',
        code: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "
    
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({ 
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Middleware para requerir rol ADMIN
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requiere rol Administrator',
      code: 'INSUFFICIENT_PERMISSION'
    });
  }
  next();
};

/**
 * Middleware para verificar propiedad de recurso
 * Asegura que un usuario solo pueda acceder a sus propios recursos
 */
export const checkResourceOwnership = (resourceUserId) => {
  return (req, res, next) => {
    if (req.user.id !== resourceUserId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'No tienes permiso para acceder a este recurso',
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};

/**
 * Middleware para registrar auditoría
 */
export const auditLog = async (req, res, next) => {
  // Capturar el IP
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  // Guardar info original de response
  const originalJson = res.json;
  
  res.json = function(data) {
    // Registrar en auditoría si el usuario está autenticado
    if (req.user) {
      prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: `${req.method}_${req.path.split('/').pop()}`,
          resource: req.path.split('/')[2] || 'Unknown',
          status: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
          ipAddress,
          details: JSON.stringify({
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
          }),
        },
      }).catch(err => console.error('Audit log error:', err));
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

export default { authenticate, requireAdmin, checkResourceOwnership, auditLog };
