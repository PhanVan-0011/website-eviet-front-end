import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { initSidebarToggle } from '../js/scripts';


const Header = () => {
    const navigate = useNavigate();
    useEffect(() => {
        initSidebarToggle();
    }, []);
    const handleLogout = () => {
        // Xóa token khỏi localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('roles');
        localStorage.removeItem('permissions');
        localStorage.removeItem('access_token');
        

        // Điều hướng về trang đăng nhập
        navigate('/login');
    };
  return (
    <nav className="sb-topnav navbar navbar-expand navbar-light bg-light shadow-sm border-bottom">
           
            <a className="navbar-brand ps-3 brand-link gradient-logo-text" href="/">EVIET SOLUTION</a>
         
            <button className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" id="sidebarToggle" href="#!"><i className="fas fa-bars"></i></button>
          
            <form className="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">
                {/* <div className="input-group">
                    <input className="form-control" type="text" placeholder="Tìm kiếm..." aria-label="Search for..." aria-describedby="btnNavbarSearch" />
                    <button className="btn btn-primary" id="btnNavbarSearch" type="button"><i className="fas fa-search"></i></button>
                </div> */}
            </form>
        
            <ul className="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
                <li className="nav-item dropdown">
                    <a className=" dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="fas fa-user fa-fw"></i></a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li><a className="dropdown-item" href="#!">Cài đặt</a></li>
                        <li><a className="dropdown-item" href="#!">Lịch sử hoạt động</a></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><a className="dropdown-item" onClick={handleLogout} href='#!'>Đăng xuất</a></li>
                    </ul>
                </li>
            </ul>
        </nav>
  )
}

export default Header