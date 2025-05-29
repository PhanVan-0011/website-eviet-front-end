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
            <div className="sb-sidenav-menu-heading">Core</div>
            <a className="nav-link" href="/">
              <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt"></i></div>
              Dashboard
            </a>
            <div className="sb-sidenav-menu-heading">Interface</div>
            <a
              className={`nav-link${open.user ? '' : ' collapsed'}`}
              href="#"
              onClick={e => { e.preventDefault(); toggle('user'); }}
              aria-expanded={open.user}
              aria-controls="collapseUser"
            >
              <div className="sb-nav-link-icon"><i className="fas fa-user"></i></div>
              Users
              <div className="sb-sidenav-collapse-arrow">
                <i className={`fas fa-angle-${open.user ? 'up' : 'down'}`}></i>
              </div>
            </a>
            <div className={`collapse${open.user ? ' show' : ''}`} id="collapseUser">
              <nav className="sb-sidenav-menu-nested nav">
                <Link className="nav-link" to="/user">User List</Link>
                <Link className="nav-link" to="/user/add">Create User</Link>
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
              Categories
              <div className="sb-sidenav-collapse-arrow">
                <i className={`fas fa-angle-${open.category ? 'up' : 'down'}`}></i>
              </div>
            </a>
            <div className={`collapse${open.category ? ' show' : ''}`} id="collapseCategory">
              <nav className="sb-sidenav-menu-nested nav">
                <Link className="nav-link" to="/category">Category List</Link>
                <Link className="nav-link" to="/category/add">Create Category</Link>
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
              Products
              <div className="sb-sidenav-collapse-arrow">
                <i className={`fas fa-angle-${open.product ? 'up' : 'down'}`}></i>
              </div>
            </a>
            <div className={`collapse${open.product ? ' show' : ''}`} id="collapseProduct">
              <nav className="sb-sidenav-menu-nested nav">
                <Link className="nav-link" to="/product">Product List</Link>
                <Link className="nav-link" to="/product/add">Create Product</Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="sb-sidenav-footer">
          <div className="small">Logged in as:</div>
          Start Bootstrap
        </div>
      </nav>
    </div>
  )
}

export default Sidebar