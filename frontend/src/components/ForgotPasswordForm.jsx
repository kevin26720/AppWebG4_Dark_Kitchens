import { useState, useEffect } from 'react';
import authAPI from '../api/authAPI';

export const ForgotPasswordForm = ({ onSuccess, onBack }) => {
  const [step, setStep] = useState(1); // 1: solicitar email, 2: ingresar nueva contraseña
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Detectar token y email desde URL (cuando hace click en el link del email)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const emailFromUrl = params.get('email');

    if (tokenFromUrl && emailFromUrl) {
      // Cargar directamente al paso 2 con datos desde URL
      setResetToken(tokenFromUrl);
      setEmail(decodeURIComponent(emailFromUrl));
      setStep(2);
      setSuccess('✅ Link validado. Ingresa tu nueva contraseña.');
    }
  }, []);

  // Paso 1: Solicitar reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      
      // Mostrar mensaje de éxito - NO cambiar de paso
      setSuccess('✅ Instrucciones de reset enviadas a tu email. Revisa tu bandeja (y spam).');
      
      // Limpiar el formulario
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
      
      // NO cambiar a step 2 - esperar a que haga click en el link del email
    } catch (err) {
      setError(err.response?.data?.error || 'Error al solicitar reset');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Confirmar nueva contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      setError('Debe contener mayúsculas, minúsculas, números y caracteres especiales');
      setLoading(false);
      return;
    }

    try {
      // En desarrollo, usa el token retornado. En producción, vendrá de la URL
      const token = resetToken || new URLSearchParams(window.location.search).get('token');
      
      if (!token) {
        setError('Token inválido. Por favor solicita un nuevo reset.');
        return;
      }

      await authAPI.resetPassword(email, newPassword, token);
      setSuccess('✅ Contraseña reseteada exitosamente. Redirigiendo a login...');
      
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al resetear contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Paso 1: Solicitar Email */}
      {step === 1 && (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <h2 className="text-2xl font-bold text-text-dark mb-4">🔐 Recuperar Contraseña</h2>
          
          <p className="text-text-light text-sm mb-4">
            Ingresa tu email y te enviaremos instrucciones para resetear tu contraseña.
          </p>

          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">
              📧 Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="input-field w-full"
              required
            />
          </div>

          {error && <p className="error-text text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2 disabled:opacity-50"
          >
            {loading ? '⏳ Enviando...' : '📧 Enviar Instrucciones'}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 text-primary hover:underline text-sm"
          >
            ← Volver a Login
          </button>
        </form>
      )}

      {/* Paso 2: Nueva Contraseña */}
      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <h2 className="text-2xl font-bold text-text-dark mb-4">🔑 Nueva Contraseña</h2>

          {/* Info del email */}
          <div className="bg-blue-50 border border-blue-300 rounded p-3 text-sm">
            <p className="text-blue-900">
              <strong>📧 Reseteando para:</strong> {email}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">
              🔐 Nueva Contraseña
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-dark mb-2">
              ✓ Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="input-field w-full"
              required
            />
          </div>

          {/* Requisitos de contraseña */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900">
            <p className="font-semibold mb-2">📋 Requisitos:</p>
            <ul className="space-y-1">
              <li>✓ Mínimo 8 caracteres</li>
              <li>✓ Mayúsculas (A-Z)</li>
              <li>✓ Minúsculas (a-z)</li>
              <li>✓ Números (0-9)</li>
              <li>✓ Caracteres especiales (@$!%*?&)</li>
            </ul>
          </div>

          {error && <p className="error-text text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm font-semibold">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2 disabled:opacity-50"
          >
            {loading ? '⏳ Reseteando...' : '✓ Resetear Contraseña'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep(1);
              setEmail('');
              setResetToken('');
              setNewPassword('');
              setConfirmPassword('');
              setError('');
              setSuccess('');
            }}
            className="w-full py-2 text-primary hover:underline text-sm"
          >
            ← Solicitar reset para otro email
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
