import { useState, useEffect, useRef } from 'react';
import useSocket from '../hooks/useSocket';
import useAuthStore from '../store/authStore';
import messagesAPI from '../api/messagesAPI';
import ChatListAdmin from './ChatListAdmin';

export const ChatInterface = () => {
  const socket = useSocket();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const isAdmin = user?.role === 'ADMIN';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar mensajes de bienvenida al iniciar
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      content: '👋 ¡Bienvenido al chat de soporte en tiempo real!',
      userId: 'system',
      user: { id: 'system', name: 'Sistema', email: 'system@catering.com', role: 'ADMIN' },
      createdAt: new Date(),
      isSystem: true,
    };
    setMessages([welcomeMessage]);
  }, []);

  // Si es admin, cargar conversaciones y escuchar nuevos mensajes
  useEffect(() => {
    if (!isAdmin || !socket) return;

    const loadConversations = async () => {
      try {
        setLoading(true);
        // Obtener conversaciones del admin (clientes que han escribido)
        const response = await messagesAPI.getAdminConversations();
        
        setConversations(response.conversations || []);
      } catch (err) {
        console.error('Error loading conversations:', err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Escuchar nuevos mensajes de clientes en tiempo real
    socket.on('chat:new-client-message', (clientInfo) => {
      setConversations(prev => {
        // Verificar si el cliente ya existe en la lista
        const existingIndex = prev.findIndex(c => c.clientId === clientInfo.clientId);
        
        if (existingIndex > -1) {
          // Actualizar conversación existente y moverla al inicio
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: clientInfo.lastMessage,
            lastMessageTime: clientInfo.lastMessageTime,
          };
          // Mover al inicio
          const [moved] = updated.splice(existingIndex, 1);
          return [moved, ...updated];
        } else {
          // Agregar nuevo cliente al inicio
          return [clientInfo, ...prev];
        }
      });
      console.log(`✨ Lista actualizada con mensaje de ${clientInfo.clientEmail}`);
    });

    return () => {
      socket?.off('chat:new-client-message');
    };
  }, [isAdmin, socket, user.id]);

  // Cargar mensajes de conversación seleccionada (solo para admin)
  useEffect(() => {
    if (isAdmin && !selectedConversation) return;

    const room = isAdmin 
      ? `support-${selectedConversation}` 
      : `support-${user.id}`;

    // Si es admin, unirse a la sala del cliente
    if (isAdmin && selectedConversation) {
      socket?.emit('chat:join-room', { room });
      console.log(`👨‍💼 Admin unido a sala: ${room}`);
    }

    const loadChatMessages = async () => {
      try {
        setLoading(true);
        // Para clientes, obtener del Socket (chat:history)
        // Para admin, obtener via HTTP
        if (!isAdmin) {
          // Cliente: esperar el historial del Socket
          return;
        }
        
        const response = await messagesAPI.getByRoom(room);
        
        const welcomeMessage = {
          id: 'welcome',
          content: '👋 ¡Bienvenido al chat de soporte en tiempo real!',
          userId: 'system',
          user: { id: 'system', name: 'Sistema' },
          createdAt: new Date(),
          isSystem: true,
        };
        
        setMessages([welcomeMessage, ...response.messages]);
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChatMessages();

    // Socket events
    socket?.off('chat:message');
    socket?.off('chat:history');

    // Recibir historial inicial (solo para clientes)
    socket?.on('chat:history', (historyMessages) => {
      const welcomeMessage = {
        id: 'welcome',
        content: '👋 ¡Bienvenido al chat de soporte en tiempo real!',
        userId: 'system',
        user: { id: 'system', name: 'Sistema' },
        createdAt: new Date(),
        isSystem: true,
      };
      
      setMessages([welcomeMessage, ...historyMessages]);
      setLoading(false);
    });

    socket?.on('chat:message', (message) => {
      if (message.room === room) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socket?.off('chat:message');
      socket?.off('chat:history');
    };
  }, [selectedConversation, isAdmin, user.id, socket]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    try {
      // Cliente envía a su propia sala
      // Admin envía a la sala del cliente seleccionado
      if (isAdmin && !selectedConversation) {
        setError('Selecciona un cliente primero');
        return;
      }

      const room = isAdmin 
        ? `support-${selectedConversation}` 
        : `support-${user.id}`;

      socket?.emit('chat:message', {
        content: inputValue,
        room,
      });
      setInputValue('');
      setError('');
    } catch (err) {
      setError('Error al enviar mensaje');
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Lista de conversaciones (Admin) */}
      {isAdmin && (
        <ChatListAdmin
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          isLoading={loading}
        />
      )}

      {/* Panel de Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-4 shadow-md">
          <h2 className="text-xl font-bold">
            {isAdmin && selectedConversation
              ? `💬 Chat - ${conversations.find(c => c.clientId === selectedConversation)?.clientName || 'Cliente'}`
              : '💬 Chat de Soporte'}
          </h2>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {isAdmin && selectedConversation === null && (
            <div className="flex flex-col items-center justify-center h-full text-text-light">
              <p className="text-lg">👋 Selecciona un cliente para ver la conversación</p>
            </div>
          )}

          {(selectedConversation !== null || !isAdmin) && (
            <>
              {messages.map((message, index) => (
                <div key={index}>
                  {message.isSystem ? (
                    <div className="flex justify-center mb-4">
                      <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-2 text-center max-w-md">
                        <p className="text-sm text-blue-900 font-semibold">{message.content}</p>
                      </div>
                    </div>
                  ) : message.isWelcome ? (
                    <div className="flex justify-start mb-4">
                      <div className="max-w-sm px-4 py-3 rounded-lg bg-green-50 border border-green-300">
                        <p className="text-xs font-semibold mb-2 text-green-900">
                          🎉 {message.user?.name || 'Admin'}
                        </p>
                        <p className="text-sm text-green-800">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`flex ${
                        message.userId === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.userId === user?.id
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white border border-gray-300 rounded-bl-none'
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1">
                          {message.user?.name || 'Usuario'}
                        </p>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        {(selectedConversation !== null || !isAdmin) && (
          <div className="border-t border-gray-300 p-4 bg-white">
            {error && <p className="error-text mb-2 text-center text-sm">{error}</p>}

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="input-field flex-1 py-2"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || (isAdmin && !selectedConversation)}
                className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📤 Enviar
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
