import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl">🍽️</div>
            <span className="text-xl font-bold text-primary">Catering PYME</span>
          </Link>

          {/* Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Links autenticado */}
                <Link
                  to="/dashboard"
                  className="text-text-dark hover:text-primary transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/chat"
                  className="text-text-dark hover:text-primary transition"
                >
                  Chat
                </Link>

                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin/products"
                    className="text-text-dark hover:text-primary transition"
                  >
                    Admin
                  </Link>
                )}

                {/* Perfil y Logout */}
                <div className="flex items-center space-x-3 border-l border-gray-300 pl-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-dark">{user.name}</p>
                    <p className="text-xs text-text-light">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-text-dark hover:text-primary transition">
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
