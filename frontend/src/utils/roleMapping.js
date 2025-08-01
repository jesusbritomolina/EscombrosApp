// Mapeo de roles para compatibilidad
export const ROLE_MAPPING = {
  // Roles antiguos -> Roles nuevos
  'Propietario': 'Cliente',
  'Trabajador': 'Transportista',
  'Administrador': 'Administrador'
};

// Roles nuevos
export const NEW_ROLES = {
  CLIENTE: 'Cliente',
  TRANSPORTISTA: 'Transportista',
  ADMINISTRADOR: 'Administrador'
};

// Función para mapear roles antiguos a nuevos
export const mapOldRoleToNew = (oldRole) => {
  return ROLE_MAPPING[oldRole] || NEW_ROLES.CLIENTE;
};

// Función para verificar si un rol es válido
export const isValidRole = (role) => {
  return Object.values(NEW_ROLES).includes(role) || Object.keys(ROLE_MAPPING).includes(role);
};

// Función para obtener el rol correcto (nuevo o mapeado)
export const getCorrectRole = (role) => {
  if (Object.values(NEW_ROLES).includes(role)) {
    return role; // Ya es un rol nuevo
  }
  return mapOldRoleToNew(role); // Mapear rol antiguo
}; 