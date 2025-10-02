import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Permission from '../components/common/Permission';
import { PERMISSIONS } from '../constants/permissions';

const NavigationBar = () => {
  
  const userPermissions = useSelector(state =>
    state.auth?.permissions && state.auth.permissions.length > 0
      ? state.auth.permissions
      : []);

  const hasAnyPermission = (permissionList) =>
    permissionList.some((p) => userPermissions?.includes(p));

  const mainPermissions = [PERMISSIONS.DASHBOARD_VIEW];
  const salePermissions = [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.PROMOTIONS_VIEW];
  const contentPermissions = [
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.POSTS_MANAGE,
    PERMISSIONS.SLIDERS_MANAGE,
    PERMISSIONS.COMBOS_MANAGE,
    PERMISSIONS.BRANCHES_MANAGE,
  ];
  const supplierPermissions = [
    PERMISSIONS.SUPPLIERS_VIEW,
    PERMISSIONS.GROUP_SUPPLIERS_MANAGE,
  ];
  const systemPermissions = [
    PERMISSIONS.USERS_MANAGE, 
    PERMISSIONS.ROLES_MANAGE,
    PERMISSIONS.BRANCHES_MANAGE,
    PERMISSIONS.SUPPLIERS_VIEW,
    PERMISSIONS.GROUP_SUPPLIERS_MANAGE,
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid px-5">
        <div className="navbar-nav me-auto">
          {hasAnyPermission(mainPermissions) && (
            <Permission permission={PERMISSIONS.DASHBOARD_VIEW}>
              <Link className="nav-link px-4 py-2 d-flex align-items-center" to="/">
                <i className="fas fa-tachometer-alt me-2"></i>
                Tổng quan
              </Link>
            </Permission>
          )}

          {hasAnyPermission(salePermissions) && (
            <>
              <div className="nav-item dropdown">
                <a className="nav-link dropdown-toggle px-4 py-2 d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="fas fa-shopping-cart me-2"></i>
                  Bán hàng
                </a>
                <ul className="dropdown-menu">
                  <Permission permission={PERMISSIONS.ORDERS_VIEW}>
                    <li>
                      <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/order">
                        <i className="fas fa-shopping-cart me-2"></i>
                        Quản lý đơn hàng
                      </Link>
                    </li>
                  </Permission>
                  <Permission permission={PERMISSIONS.PROMOTIONS_VIEW}>
                    <li>
                      <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/promotion">
                        <i className="fas fa-tag me-2"></i>
                        Quản lý khuyến mãi
                      </Link>
                    </li>
                  </Permission>
                </ul>
              </div>
            </>
          )}

          {hasAnyPermission(contentPermissions) && (
            <>
              <div className="nav-item dropdown">
                <a className="nav-link dropdown-toggle px-4 py-2 d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="fas fa-file-alt me-2"></i>
                  Nội dung
                </a>
                <ul className="dropdown-menu">
                  <Permission permission={PERMISSIONS.CATEGORIES_MANAGE}>
                    <li>
                      <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/category">
                        <i className="fas fa-list me-2"></i>
                        Quản lý danh mục
                      </Link>
                    </li>
                  </Permission>
                  <Permission permission={PERMISSIONS.PRODUCTS_VIEW}>
                    <li>
                      <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/product">
                        <i className="fas fa-box me-2"></i>
                        Quản lý sản phẩm
                      </Link>
                    </li>
                  </Permission>
                  <Permission permission={PERMISSIONS.POSTS_MANAGE}>
                    <li>
                      <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/post">
                        <i className="fas fa-newspaper me-2"></i>
                        Quản lý bài viết
                      </Link>
                    </li>
                  </Permission>
                  <Permission permission={PERMISSIONS.SLIDERS_MANAGE}>
                    <li>
                      <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/slider">
                        <i className="fas fa-sliders-h me-2"></i>
                        Quản lý slider
                      </Link>
                    </li>
                  </Permission>
                  <Permission permission={PERMISSIONS.COMBOS_MANAGE}>
                    <li>
                      <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/combo">
                        <i className="fas fa-gift me-2"></i>
                        Quản lý combo
                      </Link>
                    </li>
                  </Permission>
                </ul>
              </div>
            </>
          )}


          {hasAnyPermission(systemPermissions) && (
            <>
              <div className="nav-item dropdown">
                <a className="nav-link dropdown-toggle px-4 py-2 d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="fas fa-cog me-2"></i>
                  Hệ thống
                </a>
                <ul className="dropdown-menu">
                  {/* Chi nhánh - hiển thị luôn không cần permission */}
                  <li>
                    <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/branch">
                      <i className="fas fa-building me-2"></i>
                      Quản lý chi nhánh
                    </Link>
                  </li>
                  
                  {/* Nhà cung cấp - hiển thị luôn không cần permission */}
                  <li>
                    <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/supplier">
                      <i className="fas fa-truck me-2"></i>
                      Nhà cung cấp
                    </Link>
                  </li>
                  
                  {/* Nhóm nhà cung cấp - hiển thị luôn không cần permission */}
                  <li>
                    <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/group-supplier">
                      <i className="fas fa-users me-2"></i>
                      Nhóm nhà cung cấp
                    </Link>
                  </li>
                  
                  {/* Nhập hàng */}
                  <li>
                    <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/import">
                      <i className="fas fa-box-open me-2"></i>
                      Nhập hàng
                    </Link>
                  </li>
                  
                  <li><hr className="dropdown-divider" /></li>
                  
                  <Permission permission={PERMISSIONS.USERS_MANAGE}>
                    <li>
                      <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/user">
                        <i className="fas fa-users me-2"></i>
                        Quản lý khách hàng
                      </Link>
                    </li>
                  </Permission>
                  <Permission permission={PERMISSIONS.ROLES_MANAGE}>
                    <li>
                      <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/admin">
                        <i className="fas fa-user me-2"></i>
                        Tài khoản quản trị
                      </Link>
                    </li>
                  </Permission>
                  <Permission permission={PERMISSIONS.ROLES_MANAGE}>
                    <li>
                      <Link className="dropdown-item px-3 py-2 d-flex align-items-center" to="/rule">
                        <i className="fas fa-user-shield me-2"></i>
                        Phân quyền (vai trò)
                      </Link>
                    </li>
                  </Permission>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
