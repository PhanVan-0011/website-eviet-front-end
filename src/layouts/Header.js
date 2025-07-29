import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { initSidebarToggle } from '../js/scripts';

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        initSidebarToggle();
        // Lấy user từ localStorage
        const userData = localStorage.getItem('user');
        console.log(userData);
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('roles');
        localStorage.removeItem('permissions');
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    return (
        <nav className="sb-topnav navbar navbar-expand navbar-light bg-light shadow-sm border-bottom">
            <a className="navbar-brand ps-3 brand-link gradient-logo-text" href="/">EVIET SOLUTION</a>
            <button className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" id="sidebarToggle" href="#!"><i className="fas fa-bars"></i></button>
            <form className="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0"></form>
            <ul className="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
                <li className="nav-item dropdown d-flex align-items-center">
                    {/* Tên user trước, avatar sau, bọc cả hai trong a.dropdown-toggle */}
                    {user && (
                        <a className="dropdown-toggle d-flex align-items-center" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <span className="me-2 fw-bold">{user.name || user.username}</span>
                            {user.image_url ? (
                                <img
                                    src={process.env.REACT_APP_API_URL + 'api/images/' + user.image_url.thumb_url}
                                    alt="avatar"
                                    style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", marginRight: 8 }}
                                />
                            ) : (
                                <i className="fas fa-user-circle fa-2x me-2" style={{ color: "#888", marginRight: 8 }}></i>
                            )}
                        </a>
                    )}
                    {/* Không còn thẻ a.dropdown-toggle riêng biệt nữa */}
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