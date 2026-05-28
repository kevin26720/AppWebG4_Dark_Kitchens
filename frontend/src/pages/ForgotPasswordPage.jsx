import { PublicRoute } from '../components/ProtectedRoute';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import { useNavigate } from 'react-router-dom';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 animate-fadeIn">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-primary mb-2">Recuperar Contraseña</h1>
            <p className="text-text-light">Reestablece tu acceso fácilmente</p>
          </div>

          {/* Form */}
          <ForgotPasswordForm
            onSuccess={() => navigate('/login')}
            onBack={() => navigate('/login')}
          />

          {/* Support Info */}
          <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-green-900 mb-2">💡 Ayuda:</p>
            <p className="text-xs text-green-800">
              Si no recibes el email de recuperación, verifica tu carpeta de spam o contacta al soporte.
            </p>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
};

export default ForgotPasswordPage;
