import { PublicRoute } from '../components/ProtectedRoute';
import RegisterForm from '../components/RegisterForm';

export const RegisterPage = () => {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 animate-fadeIn">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🍽️</div>
            <h1 className="text-3xl font-bold text-primary mb-2">Catering PYME</h1>
            <p className="text-text-light">Crear Nueva Cuenta</p>
          </div>

          {/* Form */}
          <RegisterForm />

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-gray-300">
            <p className="text-xs font-semibold text-text-dark mb-4">✨ Beneficios de Registrarse:</p>
            <ul className="text-xs text-text-light space-y-2">
              <li>✅ Acceso al catálogo completo de productos</li>
              <li>✅ Chat en tiempo real con soporte</li>
              <li>✅ Historial de pedidos</li>
              <li>✅ Notificaciones personalizadas</li>
            </ul>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
};

export default RegisterPage;
