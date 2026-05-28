import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import config from '../config/index.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../utils/email.js';

/**
 * Registrar nuevo usuario
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Verificar si el email ya está registrado
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'El email ya está registrado',
        code: 'EMAIL_ALREADY_EXISTS',
      });
    }

    // Hash de contraseña (bcrypt SSDLC)
    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role: 'CLIENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name,
        role: user.role 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        resource: 'User',
        status: 'SUCCESS',
        details: JSON.stringify({ email: user.email }),
      },
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Error al registrar usuario',
      code: 'REGISTRATION_FAILED',
    });
  }
};

/**
 * Iniciar sesión
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // No exponer si el email existe o no (seguridad)
      return res.status(401).json({
        error: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          resource: 'User',
          status: 'FAILURE',
          details: JSON.stringify({ reason: 'Invalid password' }),
        },
      });

      return res.status(401).json({
        error: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name,
        role: user.role 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    // Registrar login exitoso
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        resource: 'User',
        status: 'SUCCESS',
      },
    });

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login exitoso',
      user: {
        ...userWithoutPassword,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión',
      code: 'LOGIN_FAILED',
    });
  }
};

/**
 * Obtener perfil del usuario autenticado
 * GET /api/auth/profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Error al obtener perfil',
      code: 'PROFILE_FETCH_FAILED',
    });
  }
};

/**
 * Cambiar contraseña
 * POST /api/auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Contraseña actual incorrecta',
        code: 'INVALID_CURRENT_PASSWORD',
      });
    }

    // Hash de nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    // Registrar cambio
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'PASSWORD_CHANGED',
        resource: 'User',
        status: 'SUCCESS',
      },
    });

    res.json({
      message: 'Contraseña cambiada exitosamente',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Error al cambiar contraseña',
      code: 'PASSWORD_CHANGE_FAILED',
    });
  }
};

/**
 * Solicitar reset de contraseña
 * POST /api/auth/forgot-password
 * Body: { email: "user@example.com" }
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // No exponer si el email existe o no (seguridad)
      return res.status(200).json({
        message: 'Si el email existe, recibirá instrucciones de reset',
        code: 'FORGOT_PASSWORD_SENT',
      });
    }

    // Generar token temporal (válido por 30 minutos)
    const resetToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        type: 'password_reset'
      },
      config.jwtSecret,
      { expiresIn: '30m' }
    );

    // Intentar enviar email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
      console.log(`✅ Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error(`⚠️ Email sending failed: ${emailError.message}`);
      // En desarrollo, retornamos el token de todas formas
      // En producción, esto debería fallar
      if (process.env.NODE_ENV === 'production') {
        throw emailError;
      }
    }

    // Registrar intento de reset
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        resource: 'User',
        status: 'SUCCESS',
        details: JSON.stringify({ email: user.email }),
      },
    });

    res.json({
      message: 'Si el email es válido, recibirás instrucciones de reset',
      code: 'FORGOT_PASSWORD_SENT',
      // Solo en desarrollo sin email configurado, retornar token:
      ...(process.env.NODE_ENV === 'development' && !process.env.SMTP_USER && { resetToken }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Error al procesar reset de contraseña',
      code: 'FORGOT_PASSWORD_FAILED',
    });
  }
};

/**
 * Confirmar reset de contraseña
 * POST /api/auth/reset-password
 * Body: { email: "user@example.com", newPassword: "NewPass123!", resetToken: "..." }
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, config.jwtSecret);
    } catch (error) {
      return res.status(401).json({
        error: 'Link de reset expirado o inválido',
        code: 'INVALID_RESET_TOKEN',
      });
    }

    // Verificar que el token sea de reset
    if (decoded.type !== 'password_reset') {
      return res.status(401).json({
        error: 'Token inválido',
        code: 'INVALID_RESET_TOKEN',
      });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND',
      });
    }

    // Verificar que el token sea para este usuario
    if (decoded.id !== user.id) {
      return res.status(401).json({
        error: 'Token inválido para este usuario',
        code: 'INVALID_RESET_TOKEN',
      });
    }

    // Hash de nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Registrar reset
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_COMPLETED',
        resource: 'User',
        status: 'SUCCESS',
      },
    });

    res.json({
      message: 'Contraseña reseteada exitosamente',
      code: 'PASSWORD_RESET_SUCCESS',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Error al resetear contraseña',
      code: 'PASSWORD_RESET_FAILED',
    });
  }
};

export default {
  register,
  login,
  getProfile,
  changePassword,
};
