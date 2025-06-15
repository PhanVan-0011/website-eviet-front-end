import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Sidebar = () => {
  const [open, setOpen] = useState({
    user: false,
    category: false,
    product: false,
    order: false,
    post: false,
    slider: false,
    combo: false,
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
            <a
              className={`nav-link${open.order ? '' : ' collapsed'}`}
              href="#"
              onClick={e => { e.preventDefault(); toggle('order'); }}
              aria-expanded={open.order}
              aria-controls="collapseOrder"
            >
              <div className="sb-nav-link-icon"><i className="fas fa-shopping-cart"></i></div>
              Quản lý đơn hàng
              <div className="sb-sidenav-collapse-arrow">
                <i className={`fas fa-angle-${open.order ? 'up' : 'down'}`}></i>
              </div>
            </a>
            <div className={`collapse${open.order ? ' show' : ''}`} id="collapseOrder">
              <nav className="sb-sidenav-menu-nested nav">
                <Link className="nav-link" to="/order">Danh sách đơn hàng</Link>
                {/* <Link className="nav-link" to="/order/add">Tạo đơn hàng</Link> */}
              </nav>
            </div>
            <a
              className={`nav-link${open.post ? '' : ' collapsed'}`}
              href="#"
              onClick={e => { e.preventDefault(); toggle('post'); }}
              aria-expanded={open.post}
              aria-controls="collapsePost"
            >
              <div className="sb-nav-link-icon"><i className="fas fa-newspaper"></i></div>
              Quản lý bài viết
              <div className="sb-sidenav-collapse-arrow">
                <i className={`fas fa-angle-${open.post ? 'up' : 'down'}`}></i>
              </div>
            </a>
            <div className={`collapse${open.post ? ' show' : ''}`} id="collapsePost">
              <nav className="sb-sidenav-menu-nested nav">
                <Link className="nav-link" to="/post">Danh sách bài viết</Link>
                <Link className="nav-link" to="/post/add">Tạo bài viết</Link>
              </nav>
            </div>
            <a
              className={`nav-link${open.slider ? '' : ' collapsed'}`}
              href="#"
              onClick={e => { e.preventDefault(); toggle('slider'); }}
              aria-expanded={open.slider}
              aria-controls="collapseSlider"
            >
              <div className="sb-nav-link-icon"><i className="fas fa-images"></i></div>
              Quản lý slider
              <div className="sb-sidenav-collapse-arrow">
                <i className={`fas fa-angle-${open.slider ? 'up' : 'down'}`}></i>
              </div>
            </a>
            <div className={`collapse${open.slider ? ' show' : ''}`} id="collapseSlider">
              <nav className="sb-sidenav-menu-nested nav">
                <Link className="nav-link" to="/slider">Danh sách slider</Link>
                <Link className="nav-link" to="/slider/add">Tạo slider</Link>
              </nav>
            </div>
            <a
              className={`nav-link${open.combo ? '' : ' collapsed'}`}
              href="#"
              onClick={e => { e.preventDefault(); toggle('combo'); }}
              aria-expanded={open.combo}
              aria-controls="collapseCombo"
            >
              <div className="sb-nav-link-icon"><i className="fas fa-gift"></i></div>
              Quản lý combo
              <div className="sb-sidenav-collapse-arrow">
                <i className={`fas fa-angle-${open.combo ? 'up' : 'down'}`}></i>
              </div>
            </a>
            <div className={`collapse${open.combo ? ' show' : ''}`} id="collapseCombo">
              <nav className="sb-sidenav-menu-nested nav">
                <Link className="nav-link" to="/combo">Danh sách combo</Link>
                <Link className="nav-link" to="/combo/add">Tạo combo</Link>
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