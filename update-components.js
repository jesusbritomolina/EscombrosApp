const fs = require('fs');
const path = require('path');

// Función para actualizar archivos JSX
function updateJSXFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Reemplazar verificaciones de roles antiguos
  const roleChecks = [
    {
      old: "storedUserRole !== 'Propietario' && storedUserRole !== 'Administrador' && storedUserRole !== 'Trabajador'",
      new: "!storedUserRole"
    },
    {
      old: "rol === 'Trabajador'",
      new: "correctRole === NEW_ROLES.TRANSPORTISTA"
    },
    {
      old: "rol === 'Propietario'",
      new: "correctRole === NEW_ROLES.CLIENTE"
    },
    {
      old: "rol === 'Administrador'",
      new: "correctRole === NEW_ROLES.ADMINISTRADOR"
    },
    {
      old: "userRole === 'Propietario'",
      new: "userRole === NEW_ROLES.CLIENTE"
    },
    {
      old: "userRole === 'Trabajador'",
      new: "userRole === NEW_ROLES.TRANSPORTISTA"
    },
    {
      old: "userRole === 'Administrador'",
      new: "userRole === NEW_ROLES.ADMINISTRADOR"
    }
  ];

  roleChecks.forEach(check => {
    if (content.includes(check.old)) {
      content = content.replace(new RegExp(check.old, 'g'), check.new);
      updated = true;
    }
  });

  // Agregar import si no existe
  if (!content.includes('roleMapping') && (content.includes('NEW_ROLES') || content.includes('getCorrectRole'))) {
    const importStatement = "import { getCorrectRole, NEW_ROLES } from '../utils/roleMapping';";
    const lastImportIndex = content.lastIndexOf('import');
    const insertIndex = content.indexOf('\n', lastImportIndex) + 1;
    content = content.slice(0, insertIndex) + importStatement + '\n' + content.slice(insertIndex);
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Actualizado: ${filePath}`);
  }
}

// Función para procesar directorio
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.jsx')) {
      updateJSXFile(filePath);
    }
  });
}

// Ejecutar actualización
console.log('🔄 Actualizando componentes para compatibilidad con nuevos roles...');
processDirectory('./frontend/src/components');
console.log('✅ Actualización completada!'); 