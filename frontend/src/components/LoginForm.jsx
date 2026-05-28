import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authAPI from '../api/authAPI';
import useAuthStore from '../store/authStore';
import ForgotPasswordForm from './ForgotPasswordForm';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData.email, formData.password);
      setUser(response.user, response.token);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Error al iniciar sesión. Verifica tus credenciales.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm
        onSuccess={() => {
          setShowForgotPassword(false);
          navigate('/login');
        }}
        onBack={() => setShowForgotPassword(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          required
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">
          Contraseña
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          className="input-field"
        />
        
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-primary hover:underline text-xs mt-2"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Iniciando sesión...' : '🔐 Iniciar Sesión'}
      </button>

      <p className="text-center text-text-light text-sm">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-primary hover:underline font-semibold">
          Regístrate aquí
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
