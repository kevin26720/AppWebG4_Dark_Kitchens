# 🍽️ Catering PYME — Frontend React

Frontend moderno con React 18, Vite y Tailwind CSS para la aplicación de Gestión de Pedidos y Soporte en Tiempo Real.

---

## 📋 Requisitos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

---

## 🚀 Instalación Rápida

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Crear archivo .env
cp .env.example .env

# 3. Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en **http://localhost:5173**

---

## 📁 Estructura de Carpetas

```
frontend/
├── src/
│   ├── api/                    # Servicios HTTP
│   │   ├── axiosInstance.js    # Configuración Axios
│   │   ├── authAPI.js          # API de autenticación
│   │   ├── productsAPI.js      # API de productos
│   │   └── messagesAPI.js      # API de mensajes
│   ├── components/             # Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── ChatWindow.jsx
│   │   └── ProtectedRoute.jsx
│   ├── hooks/                  # Hooks personalizados
│   │   └── useSocket.js        # Hook para Socket.IO
│   ├── pages/                  # Páginas principales
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── ChatPage.jsx
│   ├── store/                  # Estado global (Zustand)
│   │   └── authStore.js
│   ├── index.css               # Estilos globales
│   ├── App.jsx                 # Componente raíz
│   └── main.jsx                # Punto de entrada
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🎨 Diseño

El frontend sigue el diseño inspirado en las imágenes compartidas:

- **Paleta de Colores:**
  - Rojo Principal: `#E63946`
  - Rojo Oscuro: `#D62828`
  - Gris Claro: `#F5F5F5`
  - Texto Oscuro: `#333333`

- **Componentes:**
  - Tarjetas de productos responsivas
  - Formularios validados
  - Chat en tiempo real
  - Navegación clara

---

## 📚 Páginas Principales

### 🏠 **Página de Inicio** (`/`)
- Hero section con CTA
- Descripción de servicios
- Características de la empresa

### 🔐 **Login** (`/login`)
- Autenticación con email/password
- Credenciales de prueba disponibles
- Link a registro

### 📝 **Registro** (`/register`)
- Validación de contraseña fuerte
- Confirmación de contraseña
- Términos y condiciones

### 🛒 **Dashboard** (`/dashboard`)
- Catálogo completo de productos
- Filtrado por categoría
- Búsqueda en tiempo real
- Panel admin para ADMIN users

### 💬 **Chat** (`/chat`)
- Chat en tiempo real con Socket.IO
- Historial de mensajes
- Indicador de usuarios conectados

---

## 🔌 Integración con API

Todos los endpoints están configurados para comunicarse con el backend en `http://localhost:3000`.

### Endpoints Utilizados

```javascript
// Autenticación
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
POST   /api/auth/change-password

// Productos
GET    /api/products
GET    /api/products/:id
GET    /api/products/search
GET    /api/products/categories/list
POST   /api/products              (ADMIN)
PUT    /api/products/:id          (ADMIN)
DELETE /api/products/:id          (ADMIN)

// Mensajes
GET    /api/messages
GET    /api/messages/:room
POST   /api/messages
GET    /api/messages/user/conversations
```

---

## 🔌 Socket.IO

### Eventos de Escucha

```javascript
// Recibir mensaje
socket.on('chat:message', (message) => { ... });

// Historial cargado
socket.on('chat:history', (messages) => { ... });

// Usuario se conectó
socket.on('chat:user-joined', (data) => { ... });

// Usuario se desconectó
socket.on('chat:user-left', (data) => { ... });

// Usuario está escribiendo
socket.on('chat:user-typing', (data) => { ... });
```

### Eventos para Emitir

```javascript
// Enviar mensaje
socket.emit('chat:message', { content, room });

// Unirse a sala
socket.emit('chat:join-room', { room });

// Salir de sala
socket.emit('chat:leave-room', { room });

// Escribiendo
socket.emit('chat:typing', { room });

// Dejar de escribir
socket.emit('chat:stop-typing', { room });
```

---

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor local con hot reload
npm run build            # Build para producción
npm run preview          # Preview del build

# Linting
npm run lint             # Verificar ESLint
npm run lint:fix         # Corregir errores automáticos
```

---

## 🔐 Autenticación

### Almacenamiento Local

El token y datos de usuario se guardan en `localStorage`:

```javascript
localStorage.getItem('token');     // JWT token
localStorage.getItem('user');      // Datos del usuario
```

### Interceptors

- Automáticamente agrega token a cada request
- Redirige a login si token expira (401)

---

## 📦 Dependencias Principales

| Librería | Versión | Propósito |
|----------|---------|----------|
| **React** | 18.2.0 | Framework UI |
| **React Router** | 6.21.0 | Ruteo |
| **Axios** | 1.6.5 | HTTP client |
| **Socket.IO Client** | 4.7.2 | WebSocket |
| **Zustand** | 4.4.2 | State management |
| **Tailwind CSS** | 3.4.1 | Styling |
| **Vite** | 5.0.7 | Build tool |

---

## 🌐 Variables de Entorno

```env
# API
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000

# App
VITE_APP_NAME=Catering PYME
VITE_APP_VERSION=1.0.0
```

---

## 🧪 Testing (Futuro)

```bash
# Tests con Vitest
npm run test

# Con cobertura
npm run test:coverage
```

---

## 📱 Responsividad

El diseño es **100% responsive** con breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## 🚀 Build para Producción

```bash
# Build
npm run build

# Genera carpeta 'dist/' lista para desplegar
# Tamaño optimizado con tree-shaking y minificación
```

---

## 🐳 Docker (Opcional)

```bash
# Construir
docker build -t catering-pyme-frontend .

# Ejecutar
docker run -p 80:80 catering-pyme-frontend
```

---

## 📝 Credenciales de Prueba

**Admin:**
- Email: `admin@catering.com`
- Password: `Admin123!`

**Cliente:**
- Email: `cliente@example.com`
- Password: `Client123!`

---

## 🎯 Mejoras Futuras

- [ ] Carrito de compras
- [ ] Pasarela de pagos
- [ ] Notificaciones push
- [ ] Dark mode
- [ ] PWA (Progressive Web App)
- [ ] Tests automatizados
- [ ] Análisis y reportes

---

## 📞 Soporte

Para problemas:
1. Verifica que el backend esté corriendo en puerto 3000
2. Revisa la consola del navegador (F12)
3. Comprueba que las credenciales sean correctas

---

**Versión:** 1.0.0  
**Última Actualización:** Mayo 27, 2026
