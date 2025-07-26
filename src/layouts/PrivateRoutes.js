import { Outlet, Navigate, useLocation } from 'react-router-dom';
import React from 'react';
import { useSelector } from 'react-redux';
import { hasPermission } from '../helpers/permission';
import { ROUTE_PERMISSIONS } from '../constants/routePermissions';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../tools/toastConfig';


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

// Hàm tìm route đầu tiên mà user có quyền
function findFirstAccessibleRoute(userPermissions) {
    // Duyệt qua các route, tìm route đầu tiên mà user có quyền
    for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
      if (userPermissions.includes(permission)) {
        return route;
      }
    }
    // Nếu không có route nào, trả về /login
    localStorage.removeItem('access_token');
    toast.error("Tài khoản không có quyền truy cập", toastErrorConfig);
    return '/login';
  }

const PrivateRoutes = () => {

  const accessToken = localStorage.getItem('access_token') || false;

  const permissions = useSelector(state =>
      state.auth?.permissions && state.auth.permissions.length > 0
        ? state.auth.permissions
        : []
    );
  const location = useLocation();

  if (!accessToken) return <Navigate to="/login" />;

  // Tự động kiểm tra quyền theo route
  const requiredPermission = matchRoutePermission(location.pathname);
  if (requiredPermission && !hasPermission(permissions, requiredPermission)) {
     // Nếu là trang dashboard ("/") và không có quyền, chuyển đến route đầu tiên có quyền
    if (location.pathname === '/') {
        const firstRoute = findFirstAccessibleRoute(permissions);
        return <Navigate to={firstRoute} replace />;
    }
    // Các route khác vẫn chuyển về not-found 
    localStorage.removeItem('access_token');
    toast.error("Tài khoản không có quyền truy cập", toastErrorConfig);
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoutes;