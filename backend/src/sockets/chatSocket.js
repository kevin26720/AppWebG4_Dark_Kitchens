import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import config from '../config/index.js';

/**
 * Configurar Socket.IO para chat en tiempo real
 * Autentica usuarios y maneja eventos de mensajes
 */
export const setupChatSocket = (io) => {
  /**
   * Middleware de autenticación para WebSocket
   * Verifica el token JWT antes de permitir conexión
   */
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token requerido'));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error: Token inválido o expirado'));
    }
  });

  /**
   * Manejar conexión de usuario
   */
  io.on('connection', async (socket) => {
    console.log(`✅ Usuario conectado: ${socket.user.email} (${socket.id})`);

    try {
      const isAdmin = socket.user.role === 'ADMIN';
      
      if (!isAdmin) {
        // Cliente se une a sala privada con su ID
        socket.join(`support-${socket.user.id}`);
        console.log(`👤 Cliente ${socket.user.email} conectado a support-${socket.user.id}`);
      } else {
        // Admin NO se une a ninguna sala inicialmente
        console.log(`👨‍💼 Admin ${socket.user.email} conectado (esperando selección de cliente)`);
      }

      // Enviar historial de últimos 50 mensajes al conectarse (solo para clientes)
      try {
        if (!isAdmin) {
          const room = `support-${socket.user.id}`;
          const history = await prisma.message.findMany({
            where: { room: room },
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true }
              }
            },
            orderBy: { createdAt: 'asc' },
            take: 50,
          });
          
          // Verificar si no hay mensaje de bienvenida en el historial
          const hasWelcomeMessage = history.some(msg => 
            msg.content?.includes('Bienvenido al chat de soporte de Catering PYME')
          );
          
          if (!hasWelcomeMessage) {
            // Obtener el primer admin en la BD
            const adminUser = await prisma.user.findFirst({
              where: { role: 'ADMIN' },
              select: { id: true, name: true, email: true, role: true }
            });
            
            if (adminUser && socket.user.name) {
              const welcomeMessage = {
                id: 'welcome-' + socket.user.id,
                content: `¡Hola ${socket.user.name}! 👋 Bienvenido al chat de soporte de Catering PYME. Aquí puedes comunicarte directamente con nuestro equipo administrativo. ¿En qué podemos ayudarte hoy?`,
                userId: adminUser.id,
                user: adminUser,
                room: room,
                createdAt: new Date(),
                isWelcome: true,
              };
              
              // Guardar mensaje de bienvenida en BD
              try {
                await prisma.message.create({
                  data: {
                    content: welcomeMessage.content,
                    userId: adminUser.id,
                    room: room,
                  },
                });
              } catch (saveError) {
                console.warn('No se pudo guardar mensaje de bienvenida:', saveError.message);
              }
              
              history.unshift(welcomeMessage);
              console.log(`💌 Mensaje de bienvenida enviado a ${socket.user.email}`);
            }
          }
          
          socket.emit('chat:history', history);
        }
      } catch (historyError) {
        console.error('Error fetching history:', historyError);
        socket.emit('chat:error', { 
          message: 'No se pudo cargar el historial',
          code: 'HISTORY_LOAD_FAILED'
        });
      }

      // Notificar a otros usuarios que alguien se conectó
      socket.broadcast.emit('chat:user-joined', {
        userId: socket.user.id,
        userName: socket.user.email,
        timestamp: new Date(),
      });

    } catch (error) {
      console.error('Error en inicialización de conexión:', error);
      socket.emit('chat:error', {
        message: 'Error al conectar',
        code: 'CONNECTION_INIT_FAILED'
      });
    }

    /**
     * Escuchar nuevo mensaje
     * Guardar en BD y emitir a todos en la sala
     */
    socket.on('chat:message', async (data) => {
      try {
        const { content, room = 'general' } = data;

        // Validaciones básicas
        if (!content || content.trim().length === 0) {
          socket.emit('chat:error', {
            message: 'El mensaje no puede estar vacío',
            code: 'EMPTY_MESSAGE'
          });
          return;
        }

        if (content.length > 1000) {
          socket.emit('chat:error', {
            message: 'El mensaje no puede exceder 1000 caracteres',
            code: 'MESSAGE_TOO_LONG'
          });
          return;
        }

        // Guardar mensaje en BD
        const message = await prisma.message.create({
          data: {
            content: content.trim(),
            userId: socket.user.id,
            room,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              }
            }
          }
        });

        // Emitir a TODOS en la sala
        io.to(room).emit('chat:message', message);

        // Si el mensaje es de un cliente a admin, notificar a admin de nueva conversación
        if (socket.user.role === 'CLIENT') {
          // Obtener info completa del cliente
          const clientInfo = {
            clientId: socket.user.id,
            clientName: socket.user.name,
            clientEmail: socket.user.email,
            lastMessage: content.substring(0, 100),
            lastMessageTime: new Date(),
          };

          // Notificar a TODOS los admins en tiempo real
          io.emit('chat:new-client-message', clientInfo);
          console.log(`📨 Nuevo mensaje de cliente ${socket.user.email} notificado a admins`);
        }

      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        socket.emit('chat:error', {
          message: 'Error al enviar mensaje',
          code: 'MESSAGE_SEND_FAILED'
        });
      }
    });

    /**
     * Unirse a una sala específica
     */
    socket.on('chat:join-room', (data) => {
      try {
        const { room } = data;

        if (!room || room.length === 0 || room.length > 50) {
          socket.emit('chat:error', {
            message: 'Nombre de sala inválido',
            code: 'INVALID_ROOM_NAME'
          });
          return;
        }

        socket.join(room);
        console.log(`📍 Usuario ${socket.user.email} se unió a sala: ${room}`);

        // Notificar en la sala
        io.to(room).emit('chat:user-joined', {
          userId: socket.user.id,
          userName: socket.user.email,
          room,
          timestamp: new Date(),
        });

      } catch (error) {
        console.error('Error al unirse a sala:', error);
        socket.emit('chat:error', {
          message: 'Error al unirse a la sala',
          code: 'JOIN_ROOM_FAILED'
        });
      }
    });

    /**
     * Salir de una sala
     */
    socket.on('chat:leave-room', (data) => {
      try {
        const { room } = data;
        socket.leave(room);
        console.log(`📍 Usuario ${socket.user.email} salió de sala: ${room}`);

        io.to(room).emit('chat:user-left', {
          userId: socket.user.id,
          userName: socket.user.email,
          room,
          timestamp: new Date(),
        });

      } catch (error) {
        console.error('Error al salir de sala:', error);
      }
    });

    /**
     * Escribiendo (indicador de actividad)
     */
    socket.on('chat:typing', (data) => {
      const { room = 'general' } = data;
      
      socket.broadcast.to(room).emit('chat:user-typing', {
        userId: socket.user.id,
        userName: socket.user.email,
        room,
      });
    });

    /**
     * Dejar de escribir
     */
    socket.on('chat:stop-typing', (data) => {
      const { room = 'general' } = data;
      
      socket.broadcast.to(room).emit('chat:user-stop-typing', {
        userId: socket.user.id,
        room,
      });
    });

    /**
     * Desconexión
     */
    socket.on('disconnect', () => {
      console.log(`❌ Usuario desconectado: ${socket.user.email} (${socket.id})`);

      // Notificar desconexión en la sala general
      io.to('general').emit('chat:user-left', {
        userId: socket.user.id,
        userName: socket.user.email,
        timestamp: new Date(),
      });
    });

    /**
     * Manejo de errores de socket
     */
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

export default setupChatSocket;
