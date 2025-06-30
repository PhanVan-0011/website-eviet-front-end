import { Outlet, Navigate, useLocation } from 'react-router-dom';
import React from 'react';
import { useSelector } from 'react-redux';
import { hasPermission } from '../helpers/permission';
import { ROUTE_PERMISSIONS } from '../constants/routePermissions';
import { ALL_PERMISSIONS } from '../constants/permissions';

// Hàm so khớp path động (ví dụ: /product/123 -> /product/:id)
function matchRoutePermission(pathname) {
  // Loại bỏ query string
  const cleanPath = pathname.split('?')[0];
  // Tìm key khớp nhất
  for (const route in ROUTE_PERMISSIONS) {
    // Chuyển :id, :slug ... thành regex
    const regex = new RegExp('^' + route.replace(/:[^/]+/g, '[^/]+') + '$');
    if (regex.test(cleanPath)) {
      return ROUTE_PERMISSIONS[route];
    }
  }
  return null;
}

const PrivateRoutes = () => {
  const accessToken = localStorage.getItem('access_token') || false;
//   const permissions = useSelector(state => state.auth?.permissions || []);
const permissions = useSelector(state =>
    state.auth?.permissions && state.auth.permissions.length > 0
      ? state.auth.permissions
      : ALL_PERMISSIONS
  );
  const location = useLocation();

  if (!accessToken) return <Navigate to="/login" />;

  // Tự động kiểm tra quyền theo route
  const requiredPermission = matchRoutePermission(location.pathname);
  if (requiredPermission && !hasPermission(permissions, requiredPermission)) {
    return <Navigate to="/not-found" />;
  }

  return <Outlet />;
};

export default PrivateRoutes;