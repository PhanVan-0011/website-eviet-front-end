import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Sidebar = () => {
  const [open, setOpen] = useState({
    user: false,
    category: false,
    product: false,
  });

  const toggle = (menu) => {
    setOpen(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <div id="layoutSidenav_nav">
      <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
        <div className="sb-sidenav-menu">
          <div className="nav">
            <div className="sb-sidenav-menu-heading">Chính</div>
            <a className="nav-link" href="/">
              <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt"></i></div>
              Tổng quan
            </a>
            <div className="sb-sidenav-menu-heading">Giao diện</div>
            <a
              className={`nav-link${open.user ? '' : ' collapsed'}`}
              href="#"
              onClick={e => { e.preventDefault(); toggle('user'); }}
              aria-expanded={open.user}
              aria-controls="collapseUser"
            >
              <div className="sb-nav-link-icon"><i className="fas fa-user"></i></div>
             Quản lý người dùng
              <div className="sb-sidenav-collapse-arrow">
                <i className={`fas fa-angle-${open.user ? 'up' : 'down'}`}></i>
              </div>
            </a>
            <div className={`collapse${open.user ? ' show' : ''}`} id="collapseUser">
              <nav className="sb-sidenav-menu-nested nav">
                <Link className="nav-link" to="/user">Danh sách người dùng</Link>
                <Link className="nav-link" to="/user/add">Tạo người dùng</Link>
              </nav>
            </div>
            <a
              className={`nav-link${open.category ? '' : ' collapsed'}`}
              href="#"
              onClick={e => { e.preventDefault(); toggle('category'); }}
              aria-expanded={open.category}
              aria-controls="collapseCategory"
            >
              <div className="sb-nav-link-icon"><i className="fas fa-list"></i></div>
              Quản lý danh mục
              <div className="sb-sidenav-collapse-arrow">
                <i className={`fas fa-angle-${open.category ? 'up' : 'down'}`}></i>
              </div>
            </a>
            <div className={`collapse${open.category ? ' show' : ''}`} id="collapseCategory">
              <nav className="sb-sidenav-menu-nested nav">
                <Link className="nav-link" to="/category">Danh sách danh mục</Link>
                <Link className="nav-link" to="/category/add">Tạo danh mục</Link>
              </nav>
            </div>
            <a
              className={`nav-link${open.product ? '' : ' collapsed'}`}
              href="#"
              onClick={e => { e.preventDefault(); toggle('product'); }}
              aria-expanded={open.product}
              aria-controls="collapseProduct"
            >
              <div className="sb-nav-link-icon"><i className="fas fa-box"></i></div>
              Quản lý sản phẩm
              <div className="sb-sidenav-collapse-arrow">
                <i className={`fas fa-angle-${open.product ? 'up' : 'down'}`}></i>
              </div>
            </a>
            <div className={`collapse${open.product ? ' show' : ''}`} id="collapseProduct">
              <nav className="sb-sidenav-menu-nested nav">
                <Link className="nav-link" to="/product">Danh sách sản phẩm</Link>
                <Link className="nav-link" to="/product/add">Tạo sản phẩm</Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="sb-sidenav-footer">
          <div className="small"></div>
          
        </div>
      </nav>
    </div>
  )
}

export default Sidebar