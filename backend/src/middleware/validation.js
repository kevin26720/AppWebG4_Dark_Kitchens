import { validationResult } from 'express-validator';

/**
 * Middleware para manejar errores de validación de express-validator
 * Retorna 400 con detalles de los errores
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  
  next();
};

/**
 * Middleware para capturar errores no controlados
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error no controlado:', err);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(isDevelopment && { stack: err.stack }),
  });
};

/**
 * Middleware 404
 */
export const notFound = (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    code: 'NOT_FOUND',
    path: req.path,
    method: req.method,
  });
};

export default { handleValidationErrors, errorHandler, notFound };
