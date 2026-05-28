import { useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import useAuthStore from '../store/authStore';
import messagesAPI from '../api/messagesAPI';

export const ChatListAdmin = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  isLoading 
}) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) return null;

  return (
    <div className="w-full md:w-80 border-r border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-primary text-white">
        <h2 className="text-lg font-bold">💬 Conversaciones</h2>
        <p className="text-xs opacity-75">{conversations.length} cliente(s)</p>
      </div>

      {/* Lista de Conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-text-light">
            ⏳ Cargando...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-text-light text-sm">
            Sin conversaciones aún
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.clientId}
              onClick={() => onSelectConversation(conv.clientId)}
              className={`w-full px-4 py-3 text-left border-b hover:bg-gray-100 transition ${
                selectedConversation === conv.clientId
                  ? 'bg-blue-50 border-l-4 border-l-primary'
                  : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-dark truncate">
                    {conv.clientName}
                  </p>
                  <p className="text-xs text-text-light truncate">
                    {conv.clientEmail}
                  </p>
                  <p className="text-xs text-text-light mt-1 truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                <div className="text-xs text-text-light ml-2">
                  {conv.lastMessageTime}
                </div>
              </div>
              {conv.unreadCount > 0 && (
                <div className="mt-2 inline-block bg-primary text-white rounded-full px-2 py-0.5 text-xs font-bold">
                  {conv.unreadCount}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatListAdmin;
