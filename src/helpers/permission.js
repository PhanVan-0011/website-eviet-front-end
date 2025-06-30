// src/helpers/permission.js
export function hasPermission(userPermissions, required) {
    if (!userPermissions) return false;
    if (Array.isArray(required)) {
      return required.some(p => userPermissions.includes(p));
    }
    return userPermissions.includes(required);
  }

// Kiểm tra role
export function hasRole(userRoles, required) {
  if (!userRoles) return false;
  if (Array.isArray(required)) {
    return required.some(r => userRoles.includes(r));
  }
  return userRoles.includes(required);
}