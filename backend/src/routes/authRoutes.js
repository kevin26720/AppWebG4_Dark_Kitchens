import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

/**
 * Validaciones de entrada
 */
const registerValidations = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nombre es requerido')
    .isLength({ max: 100 })
    .withMessage('Nombre no puede exceder 100 caracteres'),
];

const loginValidations = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Contraseña es requerida'),
];

const changePasswordValidations = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Nueva contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('Nueva contraseña debe ser diferente de la actual');
      }
      return true;
    }),
];

const forgotPasswordValidations = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
];

const resetPasswordValidations = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Nueva contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'),
  body('resetToken')
    .notEmpty()
    .withMessage('Token de reset es requerido'),
];

/**
 * RUTAS PÚBLICAS
 */

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post(
  '/register',
  registerValidations,
  handleValidationErrors,
  authController.register
);

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post(
  '/login',
  loginValidations,
  handleValidationErrors,
  authController.login
);

/**
 * POST /api/auth/forgot-password
 * Solicitar reset de contraseña
 */
router.post(
  '/forgot-password',
  forgotPasswordValidations,
  handleValidationErrors,
  authController.forgotPassword
);

/**
 * POST /api/auth/reset-password
 * Confirmar reset de contraseña
 */
router.post(
  '/reset-password',
  resetPasswordValidations,
  handleValidationErrors,
  authController.resetPassword
);

/**
 * RUTAS PROTEGIDAS (requieren JWT)
 */

/**
 * GET /api/auth/profile
 * Obtener perfil del usuario autenticado
 */
router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

/**
 * POST /api/auth/change-password
 * Cambiar contraseña
 */
router.post(
  '/change-password',
  authenticate,
  changePasswordValidations,
  handleValidationErrors,
  authController.changePassword
);

export default router;
