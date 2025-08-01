const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚛 Configurando Plataforma de Escombros...\n');

// 1. Verificar estructura del proyecto
console.log('📁 Verificando estructura del proyecto...');
if (!fs.existsSync('./backend') || !fs.existsSync('./frontend')) {
  console.error('❌ Error: No se encontró la estructura del proyecto (backend/frontend)');
  process.exit(1);
}

// 2. Crear archivo .env si no existe
console.log('🔧 Configurando variables de entorno...');
const envPath = './backend/.env';
if (!fs.existsSync(envPath)) {
  const envContent = `# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=escombros_db
DB_PORT=3306

# Configuración del Servidor
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=escombros_jwt_secret_2024

# Email (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Google Drive (opcional)
GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3001/auth/google/callback
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env creado en backend/');
} else {
  console.log('✅ Archivo .env ya existe');
}

// 3. Instalar dependencias del backend
console.log('\n📦 Instalando dependencias del backend...');
try {
  execSync('cd backend && npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias del backend instaladas');
} catch (error) {
  console.error('❌ Error instalando dependencias del backend:', error.message);
}

// 4. Instalar dependencias del frontend
console.log('\n📦 Instalando dependencias del frontend...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias del frontend instaladas');
} catch (error) {
  console.error('❌ Error instalando dependencias del frontend:', error.message);
}

// 5. Ejecutar migraciones
console.log('\n🗄️ Ejecutando migraciones de base de datos...');
try {
  execSync('cd backend && npm start', { stdio: 'inherit', timeout: 30000 });
  console.log('✅ Migraciones ejecutadas');
} catch (error) {
  console.log('⚠️ No se pudo ejecutar las migraciones automáticamente');
  console.log('   Ejecuta manualmente: cd backend && npm start');
}

// 6. Actualizar componentes del frontend
console.log('\n🔄 Actualizando componentes del frontend...');
try {
  execSync('node update-components.js', { stdio: 'inherit' });
  console.log('✅ Componentes actualizados');
} catch (error) {
  console.log('⚠️ No se pudo actualizar componentes automáticamente');
  console.log('   Ejecuta manualmente: node update-components.js');
}

console.log('\n🎉 ¡Configuración completada!');
console.log('\n📋 Próximos pasos:');
console.log('1. Configura tu base de datos MySQL');
console.log('2. Actualiza las variables en backend/.env');
console.log('3. Ejecuta: cd backend && npm start');
console.log('4. En otra terminal: cd frontend && npm run dev');
console.log('5. Accede a http://localhost:5173');

console.log('\n🔗 URLs importantes:');
console.log('- Frontend: http://localhost:5173');
console.log('- Backend API: http://localhost:3001');
console.log('- Registro: http://localhost:5173/register');
console.log('- Login: http://localhost:5173/login');
console.log('- Solicitar servicio: http://localhost:5173/service-request');

console.log('\n📚 Documentación:');
console.log('- README.md: Instrucciones completas');
console.log('- API Endpoints: Ver README.md');
console.log('- Roles: Cliente, Transportista, Administrador'); 