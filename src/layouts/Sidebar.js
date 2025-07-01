import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Permission from '../components/common/Permission';
import { PERMISSIONS } from '../constants/permissions';


const Sidebar = () => {
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
  ];
  const systemPermissions = [PERMISSIONS.USERS_MANAGE, PERMISSIONS.ROLES_MANAGE];

  return (
    <div id="layoutSidenav_nav">
      <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
        <div className="sb-sidenav-menu">
          <div className="nav">
            {hasAnyPermission(mainPermissions) && (
              <>
                <div className="sb-sidenav-menu-heading">Chính</div>
                <Permission permission={PERMISSIONS.DASHBOARD_VIEW}>
                  <Link className="nav-link" to="/">
                    <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt"></i></div>
                    Tổng quan
                  </Link>
                </Permission>
              </>
            )}

            {hasAnyPermission(salePermissions) && (
              <>
                <div className="sb-sidenav-menu-heading">Quản lý bán hàng</div>
                <Permission permission={PERMISSIONS.ORDERS_VIEW}>
                  <Link className="nav-link" to="/order">
                    <div className="sb-nav-link-icon"><i className="fas fa-shopping-cart"></i></div>
                    Quản lý đơn hàng
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.PROMOTIONS_VIEW}>
                  <Link className="nav-link" to="/promotion">
                    <div className="sb-nav-link-icon"><i className="fas fa-tag"></i></div>
                    Quản lý khuyến mãi
                  </Link>
                </Permission>
              </>
            )}

            {hasAnyPermission(contentPermissions) && (
              <>
                <div className="sb-sidenav-menu-heading">Quản lý nội dung</div>
                <Permission permission={PERMISSIONS.CATEGORIES_MANAGE}>
                  <Link className="nav-link" to="/category">
                    <div className="sb-nav-link-icon"><i className="fas fa-list"></i></div>
                    Quản lý danh mục
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.PRODUCTS_VIEW}>
                  <Link className="nav-link" to="/product">
                    <div className="sb-nav-link-icon"><i className="fas fa-box"></i></div>
                    Quản lý sản phẩm
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.POSTS_MANAGE}>
                  <Link className="nav-link" to="/post">
                    <div className="sb-nav-link-icon"><i className="fas fa-newspaper"></i></div>
                    Quản lý bài viết
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.SLIDERS_MANAGE}>
                  <Link className="nav-link" to="/slider">
                    <div className="sb-nav-link-icon"><i className="fas fa-sliders-h"></i></div>
                    Quản lý slider
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.COMBOS_MANAGE}>
                  <Link className="nav-link" to="/combo">
                    <div className="sb-nav-link-icon"><i className="fas fa-gift"></i></div>
                    Quản lý combo
                  </Link>
                </Permission>
              </>
            )}

            {hasAnyPermission(systemPermissions) && (
              <>
                <div className="sb-sidenav-menu-heading">Hệ thống</div>
                <Permission permission={PERMISSIONS.USERS_MANAGE}>
                  <Link className="nav-link" to="/user">
                    <div className="sb-nav-link-icon"><i className="fas fa-users"></i></div>
                    Quản lý khách hàng
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.ROLES_MANAGE}>
                  <Link className="nav-link" to="/admin">
                    <div className="sb-nav-link-icon"><i className="fas fa-user"></i></div>
                    Tài khoản quản trị
                  </Link>
                </Permission>
                <Permission permission={PERMISSIONS.ROLES_MANAGE}>
                  <Link className="nav-link" to="/rule">
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