import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div id="layoutSidenav_nav">
      <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
        <div className="sb-sidenav-menu">
          <div className="nav">
            <div className="sb-sidenav-menu-heading">Chính</div>
            <Link className="nav-link" to="/">
              <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt"></i></div>
              Tổng quan
            </Link>
            <div className="sb-sidenav-menu-heading">Quản lý</div>
            <Link className="nav-link" to="/user">
              <div className="sb-nav-link-icon"><i className="fas fa-user"></i></div>
              Quản lý người dùng
            </Link>
            <Link className="nav-link" to="/rule">
              <div className="sb-nav-link-icon"><i className="fas fa-user-shield"></i></div>
              Quản lý phân quyền
            </Link>
            <Link className="nav-link" to="/category">
              <div className="sb-nav-link-icon"><i className="fas fa-list"></i></div>
              Quản lý danh mục
            </Link>
            <Link className="nav-link" to="/product">
              <div className="sb-nav-link-icon"><i className="fas fa-box"></i></div>
              Quản lý sản phẩm
            </Link>
            <Link className="nav-link" to="/order">
              <div className="sb-nav-link-icon"><i className="fas fa-shopping-cart"></i></div>
              Quản lý đơn hàng
            </Link>
            <Link className="nav-link" to="/post">
              <div className="sb-nav-link-icon"><i className="fas fa-newspaper"></i></div>
              Quản lý bài viết
            </Link>
            <Link className="nav-link" to="/slider">
              <div className="sb-nav-link-icon"><i className="fas fa-sliders-h"></i></div>
              Quản lý slider
            </Link>
            <Link className="nav-link" to="/combo">
              <div className="sb-nav-link-icon"><i className="fas fa-gift"></i></div>
              Quản lý combo
            </Link>
            <Link className="nav-link" to="/promotion">
              <div className="sb-nav-link-icon"><i className="fas fa-tag"></i></div>
              Quản lý khuyến mãi
            </Link>

            {/* <div className="sb-sidenav-menu-heading">Cài đặt</div>
            <Link className="nav-link" to="/settings">
              <div className="sb-nav-link-icon"><i className="fas fa-cog"></i></div>
              Cài đặt hệ thống
            </Link> */}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;