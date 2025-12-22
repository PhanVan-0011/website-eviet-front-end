import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Permission from '../components/common/Permission';
import { PERMISSIONS } from '../constants/permissions';


const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  const userPermissions = useSelector(state =>
    state.auth?.permissions && state.auth.permissions.length > 0
      ? state.auth.permissions
      : []);

  const hasAnyPermission = (permissionList) =>
    permissionList.some((p) => userPermissions?.includes(p));

  const mainPermissions = [PERMISSIONS.DASHBOARD_VIEW];
  const salePermissions = [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.PROMOTIONS_VIEW];
  const contentPermissions = [
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.POSTS_VIEW,
    PERMISSIONS.SLIDERS_VIEW,
    PERMISSIONS.COMBOS_VIEW,
  ];
  const systemPermissions = [
    PERMISSIONS.BRANCHES_VIEW,
    PERMISSIONS.SUPPLIERS_VIEW,
    PERMISSIONS.GROUP_SUPPLIERS_VIEW,
    PERMISSIONS.PURCHASE_INVOICES_VIEW,
    PERMISSIONS.USERS_VIEW, 
    PERMISSIONS.ADMIN_USERS_VIEW,
    PERMISSIONS.ROLES_VIEW
  ];

  return (
    <div id="layoutSidenav_nav">
      <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
        <div className="sb-sidenav-menu">
          <div className="nav">
            
            {hasAnyPermission(mainPermissions) && (
              <>
                <div className="sb-sidenav-menu-heading">Chính</div>
                <Permission permission={PERMISSIONS.DASHBOARD_VIEW}>
                  <Link className={`nav-link ${isActive('/') ? 'active' : ''}`} to="/">
                  
                    <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt"></i></div>
                    Tổng quan
                  </Link>
                </Permission>
              </>
            )}

            {/* Menu chi nhánh */}
            <Permission permission={PERMISSIONS.BRANCHES_VIEW}>
              <div className="sb-sidenav-menu-heading">Quản lý chi nhánh</div>
              <Link className={`nav-link ${isActive('/branch') ? 'active' : ''}`} to="/branch">
                <div className="sb-nav-link-icon"><i className="fas fa-building"></i></div>
                Quản lý chi nhánh
              </Link>
            </Permission>

            {hasAnyPermission(salePermissions) && (
              <>
                <div className="sb-sidenav-menu-heading">Quản lý bán hàng</div>
                <Permission permission={PERMISSIONS.ORDERS_VIEW}>
                  <Link className={`nav-link ${isActive('/order') ? 'active' : ''}`} to="/order">
                    <div className="sb-nav-link-icon"><i className="fas fa-shopping-cart"></i></div>
                    Quản lý đơn hàng
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.PROMOTIONS_VIEW}>
                  <Link className={`nav-link ${isActive('/promotion') ? 'active' : ''}`} to="/promotion">
                    <div className="sb-nav-link-icon"><i className="fas fa-tag"></i></div>
                    Quản lý khuyến mãi
                  </Link>
                </Permission>
              </>
            )}

            {hasAnyPermission(contentPermissions) && (
              <>
                <div className="sb-sidenav-menu-heading">Quản lý nội dung</div>
                <Permission permission={PERMISSIONS.CATEGORIES_VIEW}>
                  <Link className={`nav-link ${isActive('/category') ? 'active' : ''}`} to="/category">
                    <div className="sb-nav-link-icon"><i className="fas fa-list"></i></div>
                    Quản lý danh mục
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.PRODUCTS_VIEW}>
                  <Link className={`nav-link ${isActive('/product') ? 'active' : ''}`} to="/product">
                    <div className="sb-nav-link-icon"><i className="fas fa-box"></i></div>
                    Quản lý sản phẩm
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.POSTS_VIEW}>
                  <Link className={`nav-link ${isActive('/post') ? 'active' : ''}`} to="/post">
                    <div className="sb-nav-link-icon"><i className="fas fa-newspaper"></i></div>
                    Quản lý bài viết
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.SLIDERS_VIEW}>
                  <Link className={`nav-link ${isActive('/slider') ? 'active' : ''}`} to="/slider">
                    <div className="sb-nav-link-icon"><i className="fas fa-sliders-h"></i></div>
                    Quản lý slider
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.COMBOS_VIEW}>
                  <Link className={`nav-link ${isActive('/combo') ? 'active' : ''}`} to="/combo">
                    <div className="sb-nav-link-icon"><i className="fas fa-gift"></i></div>
                    Quản lý combo
                  </Link>
                </Permission>
              </>
            )}

            {hasAnyPermission(systemPermissions) && (
              <>
                <div className="sb-sidenav-menu-heading">Hệ thống</div>
                <Permission permission={PERMISSIONS.SUPPLIERS_VIEW}>
                  <Link className={`nav-link ${isActive('/supplier') ? 'active' : ''}`} to="/supplier">
                    <div className="sb-nav-link-icon"><i className="fas fa-truck"></i></div>
                    Nhà cung cấp
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.GROUP_SUPPLIERS_VIEW}>
                  <Link className={`nav-link ${isActive('/group-supplier') ? 'active' : ''}`} to="/group-supplier">
                    <div className="sb-nav-link-icon"><i className="fas fa-users"></i></div>
                    Nhóm nhà cung cấp
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.PURCHASE_INVOICES_VIEW}>
                  <Link className={`nav-link ${isActive('/import') ? 'active' : ''}`} to="/import">
                    <div className="sb-nav-link-icon"><i className="fas fa-box-open"></i></div>
                    Nhập hàng
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.USERS_VIEW}>
                  <Link className={`nav-link ${isActive('/user') ? 'active' : ''}`} to="/user">
                    <div className="sb-nav-link-icon"><i className="fas fa-users"></i></div>
                    Quản lý khách hàng
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.ADMIN_USERS_VIEW}>
                  <Link className={`nav-link ${isActive('/admin') ? 'active' : ''}`} to="/admin">
                    <div className="sb-nav-link-icon"><i className="fas fa-user"></i></div>
                    Tài khoản quản trị
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.ROLES_VIEW}>
                  <Link className={`nav-link ${isActive('/rule') ? 'active' : ''}`} to="/rule">
                    <div className="sb-nav-link-icon"><i className="fas fa-user-shield"></i></div>
                    Phân quyền (vai trò)
                  </Link>
                </Permission>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
