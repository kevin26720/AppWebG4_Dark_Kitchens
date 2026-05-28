import { useState, useEffect, useRef } from 'react';
import useSocket from '../hooks/useSocket';
import useAuthStore from '../store/authStore';
import messagesAPI from '../api/messagesAPI';

export const ChatWindow = ({ room = 'general' }) => {
  const socket = useSocket();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Agregar mensaje de bienvenida inicial
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      content: '👋 ¡Bienvenido al chat de soporte en tiempo real!',
      userId: 'system',
      room: room,
      user: { id: 'system', name: 'Sistema', email: 'system@catering.com', role: 'ADMIN' },
      createdAt: new Date(),
      isSystem: true,
    };
    
    setMessages([welcomeMessage]);
  }, [room]);

  // Cargar historial al conectar
  useEffect(() => {
    if (!socket || !user) return;

    const loadHistory = async () => {
      try {
        setLoading(true);
        const response = await messagesAPI.getByRoom(room);
        
        // Agregar mensaje de bienvenida primero, luego los mensajes
        const welcomeMessage = {
          id: 'welcome',
          content: '👋 ¡Bienvenido al chat de soporte en tiempo real!',
          userId: 'system',
          room: room,
          user: { id: 'system', name: 'Sistema', email: 'system@catering.com', role: 'ADMIN' },
          createdAt: new Date(),
          isSystem: true,
        };
        
        setMessages([welcomeMessage, ...response.messages]);
        setHasLoadedHistory(true);
      } catch (err) {
        setError('Error al cargar mensajes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();

    // Socket events
    socket.off('chat:message');
    socket.off('chat:history');

    socket.on('chat:message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('chat:history', (history) => {
      // Si ya cargamos via API, no sobrescribir
      if (!hasLoadedHistory) {
        const welcomeMessage = {
          id: 'welcome',
          content: '👋 ¡Bienvenido al chat de soporte en tiempo real!',
          userId: 'system',
          room: room,
          user: { id: 'system', name: 'Sistema', email: 'system@catering.com', role: 'ADMIN' },
          createdAt: new Date(),
          isSystem: true,
        };
        setMessages([welcomeMessage, ...history]);
        setHasLoadedHistory(true);
      }
    });

    return () => {
      socket.off('chat:message');
      socket.off('chat:history');
    };
  }, [socket, room, user, hasLoadedHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    try {
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
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-primary text-white p-4 shadow-md">
        <h2 className="text-xl font-bold">💬 Chat - {room}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div key={index}>
            {message.isSystem ? (
              // Mensaje de sistema (bienvenida, etc)
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-2 text-center max-w-md">
                  <p className="text-sm text-blue-900 font-semibold">{message.content}</p>
                </div>
              </div>
            ) : (
              // Mensaje de usuario
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
      </div>

      {/* Input */}
      <div className="border-t border-gray-300 p-4 bg-white">
        {error && <p className="error-text mb-2 text-center">{error}</p>}

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
            disabled={!inputValue.trim()}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📤 Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
