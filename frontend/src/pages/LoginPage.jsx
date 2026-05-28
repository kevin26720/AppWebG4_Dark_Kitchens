import { PublicRoute } from '../components/ProtectedRoute';
import LoginForm from '../components/LoginForm';

export const LoginPage = () => {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 animate-fadeIn">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🍽️</div>
            <h1 className="text-3xl font-bold text-primary mb-2">Catering PYME</h1>
            <p className="text-text-light">Gestión de Pedidos y Soporte en Tiempo Real</p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2">📝 Credenciales de Prueba:</p>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Admin:</strong> admin@catering.com / Admin123!</p>
              <p><strong>Cliente:</strong> cliente@example.com / Client123!</p>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
};

export default LoginPage;
