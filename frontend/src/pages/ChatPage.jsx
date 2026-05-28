import { ProtectedRoute } from '../components/ProtectedRoute';
import ChatInterface from '../components/ChatInterface';

export const ChatPage = () => {
  return (
    <ProtectedRoute>
      <ChatInterface />
    </ProtectedRoute>
  );
};

export default ChatPage;
