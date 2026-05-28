import express from 'express';
import { body } from 'express-validator';
import * as messageController from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

/**
 * Validaciones de entrada
 */
const createMessageValidations = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('El contenido del mensaje no puede estar vacío')
    .isLength({ max: 1000 })
    .withMessage('El mensaje no puede exceder 1000 caracteres'),
  body('room')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Sala no puede estar vacía')
    .isLength({ max: 50 })
    .withMessage('Nombre de sala muy largo'),
];

/**
 * RUTAS PROTEGIDAS (requieren JWT)
 */

/**
 * GET /api/messages
 * Obtener mensajes recientes
 */
router.get(
  '/',
  authenticate,
  messageController.getRecentMessages
);

/**
 * GET /api/messages/admin/conversations
 * Obtener todas las conversaciones de clientes (solo para admin)
 */
router.get(
  '/admin/conversations',
  authenticate,
  messageController.getAdminConversations
);

/**
 * GET /api/messages/user/conversations
 * Obtener conversaciones del usuario actual
 */
router.get(
  '/user/conversations',
  authenticate,
  messageController.getUserConversations
);

/**
 * GET /api/messages/:room
 * Obtener mensajes de una sala específica
 */
router.get(
  '/:room',
  authenticate,
  messageController.getMessagesByRoom
);

/**
 * POST /api/messages
 * Crear nuevo mensaje (fallback REST si WebSocket no funciona)
 */
router.post(
  '/',
  authenticate,
  createMessageValidations,
  handleValidationErrors,
  messageController.createMessage
);

export default router;
