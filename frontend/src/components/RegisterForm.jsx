import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authAPI from '../api/authAPI';
import useAuthStore from '../store/authStore';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name) return 'El nombre es requerido';
    if (!formData.email) return 'El email es requerido';
    if (formData.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      return 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register(
        formData.email,
        formData.password,
        formData.name,
      );
      setUser(response.user, response.token);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Error al registrarse. Intenta de nuevo.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">
          Nombre Completo
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Juan Pérez"
          required
          className="input-field"
        />
      </div>

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
        <p className="text-xs text-text-light mt-1">
          Mín. 8 caracteres, incluir mayúsculas, números y símbolos
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-dark mb-2">
          Confirmar Contraseña
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          required
          className="input-field"
        />
      </div>

      {error && <p className="error-text text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Registrando...' : '✅ Registrarse'}
      </button>

      <p className="text-center text-text-light text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-primary hover:underline font-semibold">
          Inicia sesión aquí
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
