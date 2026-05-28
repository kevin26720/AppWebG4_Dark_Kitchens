import { Link } from 'react-router-dom';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-7xl mb-6">🍽️</div>
          <h1 className="text-5xl font-bold mb-4">Catering PYME</h1>
          <p className="text-xl mb-8 opacity-90">
            Gestión Completa de Pedidos y Soporte en Tiempo Real
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/dashboard" className="btn-primary px-8 py-3">
              Ver Catálogo
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-white text-primary font-semibold rounded-full hover:bg-gray-100 transition"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-center">¿Por qué elegirnos?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {/* Feature 1 */}
            <div className="card p-6 text-center">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="font-bold text-lg mb-2 text-primary">Puntualidad</h3>
              <p className="text-text-light text-sm">
                Garantizamos entregas puntuales para tu evento
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 text-center">
              <div className="text-5xl mb-4">🏡</div>
              <h3 className="font-bold text-lg mb-2 text-primary">Calidad Artesanal</h3>
              <p className="text-text-light text-sm">
                Todo preparado con ingredientes frescos y de calidad
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 text-center">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="font-bold text-lg mb-2 text-primary">Flexibilidad</h3>
              <p className="text-text-light text-sm">
                Creamos pedidos personalizados según tu necesidad
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card p-6 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="font-bold text-lg mb-2 text-primary">Experiencia</h3>
              <p className="text-text-light text-sm">
                10+ años sirviendo eventos corporativos y sociales
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-center">Nuestros Servicios</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            {/* Service 1 */}
            <div className="card overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <div className="text-6xl">📦</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-text-dark mb-2">
                  Listo para Servir
                </h3>
                <p className="text-text-light mb-4">
                  La solución práctica y elegante. Llevamos todo listo, caliente y presentado
                  profesionalmente.
                </p>
                <p className="text-sm font-semibold text-primary mb-4">Ideal para:</p>
                <p className="text-sm text-text-light">
                  Oficinas, reuniones, coffee breaks y almuerzos ejecutivos
                </p>
              </div>
            </div>

            {/* Service 2 */}
            <div className="card overflow-hidden hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <div className="text-6xl">🔥</div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-text-dark mb-2">
                  Preparado en el Sitio
                </h3>
                <p className="text-text-light mb-4">
                  Llevamos e instalamos el equipo profesional. Todo se elabora al instante,
                  garantizando calidad y frescura.
                </p>
                <p className="text-sm font-semibold text-primary mb-4">Ideal para:</p>
                <p className="text-sm text-text-light">
                  Fiestas, eventos sociales, cumpleaños y celebraciones especiales
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para Ordenar?</h2>
          <p className="text-lg mb-8 opacity-90">
            Explora nuestro catálogo completo y haz tu pedido ahora
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/dashboard" className="btn-primary px-8 py-3">
              Ver Catálogo
            </Link>
            <a
              href="https://wa.me/593"
              className="px-8 py-3 bg-white text-primary font-semibold rounded-full hover:bg-gray-100 transition"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-dark text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="opacity-70">
            © 2026 Catering PYME. Todos los derechos reservados.
          </p>
          <p className="opacity-70 text-sm mt-2">
            Desarrollado con ❤️ por AppWebG4
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
