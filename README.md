# 🚛 Plataforma de Transporte de Escombros

Sistema web para conectar clientes con transportistas de escombros y materiales de construcción.

## 📋 Características Principales

### Para Clientes:
- ✅ Registro y autenticación de usuarios
- ✅ Solicitud de servicios de transporte
- ✅ Cálculo automático de precios
- ✅ Seguimiento de servicios en tiempo real
- ✅ Sistema de calificaciones y reseñas

### Para Transportistas:
- ✅ Perfil completo con datos del vehículo
- ✅ Gestión de zona de cobertura
- ✅ Aceptación de servicios disponibles
- ✅ Actualización de estado de servicios
- ✅ Historial de servicios completados

### Para Administradores:
- ✅ Panel de administración completo
- ✅ Verificación de documentos de transportistas
- ✅ Gestión de usuarios y servicios
- ✅ Estadísticas y reportes

## 🛠️ Tecnologías Utilizadas

### Backend:
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de datos
- **Sequelize** - ORM para MySQL
- **JWT** - Autenticación
- **Multer** - Manejo de archivos
- **Nodemailer** - Envío de emails

### Frontend:
- **React.js** - Biblioteca de UI
- **Material-UI** - Componentes de diseño
- **Axios** - Cliente HTTP
- **React Router** - Enrutamiento
- **Vite** - Build tool

## 🚀 Instalación y Configuración

### Prerrequisitos:
- Node.js (v16 o superior)
- MySQL (v8.0 o superior)
- Git

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd EscombrosApp
```

### 2. Configurar Base de Datos
```sql
-- Crear base de datos
CREATE DATABASE escombros_db;
USE escombros_db;
```

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la carpeta `backend/`:

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=escombros_db
DB_PORT=3306

# Configuración del Servidor
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# Email (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Google Drive (opcional)
GOOGLE_DRIVE_CLIENT_ID=tu_client_id
GOOGLE_DRIVE_CLIENT_SECRET=tu_client_secret
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

### 4. Instalar Dependencias

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd frontend
npm install
```

### 5. Ejecutar Migraciones
```bash
cd backend
npm start
```

### 6. Iniciar el Servidor de Desarrollo

#### Backend:
```bash
cd backend
npm start
```

#### Frontend:
```bash
cd frontend
npm run dev
```

El servidor backend estará disponible en `http://localhost:3001`
El frontend estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
EscombrosApp/
├── backend/
│   ├── config/           # Configuración de BD y scripts SQL
│   ├── controllers/      # Lógica de negocio
│   ├── middleware/       # Middlewares (auth, etc.)
│   ├── migrations/       # Migraciones de BD
│   ├── models/          # Modelos de datos
│   ├── routes/          # Rutas de la API
│   ├── uploads/         # Archivos subidos
│   ├── utils/           # Utilidades (Google Drive, etc.)
│   └── app.js           # Archivo principal del servidor
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── assets/      # Imágenes y recursos
│   │   └── App.jsx      # Componente principal
│   └── package.json
└── README.md
```

## 🔧 Configuración Adicional

### Configurar Email (Gmail):
1. Habilitar autenticación de 2 factores en Gmail
2. Generar contraseña de aplicación
3. Usar esa contraseña en EMAIL_PASS

### Configurar Google Drive (Opcional):
1. Crear proyecto en Google Cloud Console
2. Habilitar Google Drive API
3. Crear credenciales OAuth 2.0
4. Configurar las variables de entorno correspondientes

## 🧪 Pruebas

### Crear Usuario de Prueba:
1. Ir a `http://localhost:5173/register`
2. Registrar un usuario cliente
3. Verificar email (en desarrollo, revisar consola del servidor)

### Crear Transportista:
1. Registrar usuario con rol "Transportista"
2. Completar perfil con datos del vehículo
3. Un administrador debe verificar los documentos

## 📱 API Endpoints

### Autenticación:
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/forgot-password` - Recuperar contraseña

### Servicios:
- `POST /api/services/create` - Crear solicitud de servicio
- `GET /api/services/available` - Servicios disponibles para transportistas
- `PUT /api/services/:id/accept` - Aceptar servicio
- `PUT /api/services/:id/status` - Actualizar estado
- `GET /api/services/my-services` - Servicios del usuario

### Usuarios:
- `GET /api/owners/users` - Listar usuarios (admin)
- `PUT /api/owners/users/:id` - Actualizar usuario
- `DELETE /api/owners/users/:id` - Eliminar usuario

## 🔒 Seguridad

- Autenticación JWT
- Validación de roles y permisos
- Sanitización de datos
- CORS configurado
- Variables de entorno para datos sensibles

## 🚀 Despliegue

### Opciones Recomendadas:
1. **Railway** - Fácil despliegue con GitHub
2. **Vercel** - Para frontend
3. **Heroku** - Para backend
4. **VPS** - Control total

### Variables de Producción:
- Cambiar `NODE_ENV=production`
- Configurar base de datos de producción
- Configurar dominio en CORS_ORIGINS
- Usar certificados SSL

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@escombrosapp.com
- Documentación: [Wiki del proyecto]

## 🔄 Próximas Características

- [ ] Integración con Google Maps
- [ ] Sistema de pagos con Nequi/PSE
- [ ] Notificaciones push
- [ ] App móvil (React Native)
- [ ] Sistema de chat en tiempo real
- [ ] Reportes avanzados
- [ ] Integración con GPS en tiempo real 