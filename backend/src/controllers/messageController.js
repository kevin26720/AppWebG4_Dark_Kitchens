import { prisma } from '../db.js';

/**
 * Obtener mensajes de una sala
 * GET /api/messages/:room
 */
export const getMessagesByRoom = async (req, res) => {
  try {
    const { room = 'general' } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await prisma.message.findMany({
      where: { room },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      skip: parseInt(offset),
      take: parseInt(limit),
    });

    const total = await prisma.message.count({
      where: { room },
    });

    res.json({
      room,
      messages,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: 'Error al obtener mensajes',
      code: 'MESSAGES_FETCH_FAILED',
    });
  }
};

/**
 * Obtener historial reciente de mensajes
 * GET /api/messages
 */
export const getRecentMessages = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const messages = await prisma.message.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    res.json({
      count: messages.length,
      messages: messages.reverse(), // Invertir para mantener orden cronológico
    });
  } catch (error) {
    console.error('Get recent messages error:', error);
    res.status(500).json({
      error: 'Error al obtener mensajes recientes',
      code: 'RECENT_MESSAGES_FETCH_FAILED',
    });
  }
};

/**
 * Crear mensaje manualmente (para fallback cuando WebSocket no funciona)
 * POST /api/messages
 */
export const createMessage = async (req, res) => {
  try {
    const { content, room = 'general' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'El contenido del mensaje no puede estar vacío',
        code: 'EMPTY_MESSAGE',
      });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        userId: req.user.id,
        room,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Mensaje enviado exitosamente',
      data: message,
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({
      error: 'Error al crear mensaje',
      code: 'MESSAGE_CREATION_FAILED',
    });
  }
};

/**
 * Obtener conversaciones del cliente (para admin)
 * GET /api/messages/admin/conversations
 * Solo accesible para ADMIN
 */
export const getAdminConversations = async (req, res) => {
  try {
    // Si es admin, obtener todos los clientes únicos que enviaron mensajes
    const messages = await prisma.message.findMany({
      where: {
        room: {
          startsWith: 'support-',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Agrupar por cliente (usuario que envió el mensaje, no el admin)
    const conversations = {};

    messages.forEach(msg => {
      // Solo incluir mensajes de clientes (no de admin)
      if (msg.user.role === 'CLIENT') {
        const clientId = msg.userId;

        if (!conversations[clientId]) {
          conversations[clientId] = {
            clientId: msg.userId,
            clientName: msg.user.name,
            clientEmail: msg.user.email,
            lastMessage: msg.content.substring(0, 100),
            lastMessageTime: msg.createdAt,
            unreadCount: 0,
          };
        }
      }
    });

    res.json({
      count: Object.keys(conversations).length,
      conversations: Object.values(conversations)
        .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)),
    });
  } catch (error) {
    console.error('Get admin conversations error:', error);
    res.status(500).json({
      error: 'Error al obtener conversaciones',
      code: 'ADMIN_CONVERSATIONS_FETCH_FAILED',
    });
  }
};

/**
 * Obtener conversaciones por usuario
 * GET /api/messages/user/conversations
 */
export const getUserConversations = async (req, res) => {
  try {
    const conversations = await prisma.message.findMany({
      where: { userId: req.user.id },
      distinct: ['room'],
      select: { room: true },
    });

    res.json({
      rooms: conversations.map(c => c.room),
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      error: 'Error al obtener conversaciones',
      code: 'CONVERSATIONS_FETCH_FAILED',
    });
  }
};

export default {
  getMessagesByRoom,
  getRecentMessages,
  createMessage,
  getUserConversations,
};
