import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import requestApi from '../helpers/api';

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);

    useEffect(() => {
        // Lấy user từ localStorage
        const userData = localStorage.getItem('user');
        console.log(userData);
        if (userData) {
            setUser(JSON.parse(userData));
        }
        
        // Lấy danh sách chi nhánh
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            // Sử dụng API endpoint thật từ hệ thống
            const response = await requestApi('api/admin/branches?limit=1000', 'GET');
            if (response.data && response.data.data) {
                setBranches(response.data.data);
                // Mặc định chọn chi nhánh đầu tiên
                if (response.data.data.length > 0) {
                    setSelectedBranch(response.data.data[0]);
                }
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách chi nhánh:', error);
            // Fallback data nếu API lỗi
            const fallbackBranches = [
                { id: 1, name: 'Chi nhánh 1' },
                { id: 2, name: 'Chi nhánh 2' },
                { id: 3, name: 'Chi nhánh 3' }
            ];
            setBranches(fallbackBranches);
            setSelectedBranch(fallbackBranches[0]);
        }
    };

    const handleBranchChange = (branch) => {
        setSelectedBranch(branch);
        // Có thể thêm logic để lưu chi nhánh đã chọn vào localStorage hoặc Redux
        localStorage.setItem('selectedBranch', JSON.stringify(branch));
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('roles');
        localStorage.removeItem('permissions');
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    return (
        <div>
            {/* Top Header với logo và user menu */}
            <nav className="navbar navbar-expand navbar-light bg-light shadow-sm border-bottom">
                <div className="container-fluid">
                    <a className="navbar-brand brand-link gradient-logo-text" href="/">EVIET SOLUTION</a>
                    <ul className="navbar-nav ms-auto">
                        {/* Bộ lọc chi nhánh */}
                        <li className="nav-item dropdown me-3">
                            <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <i className="fas fa-building me-2"></i>
                                <span>{selectedBranch ? selectedBranch.name : 'Chọn chi nhánh'}</span>
                            </a>
                            <ul className="dropdown-menu">
                                {branches.map((branch) => (
                                    <li key={branch.id}>
                                        <a 
                                            className={`dropdown-item ${selectedBranch?.id === branch.id ? 'active' : ''}`} 
                                            href="#!" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleBranchChange(branch);
                                            }}
                                        >
                                            <i className="fas fa-building me-2"></i>
                                            {branch.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </li>
                        
                        {/* Chuông thông báo */}
                        <li className="nav-item dropdown me-3">
                            <a className="nav-link position-relative" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <i className="fas fa-bell fa-lg"></i>
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ 
                                    fontSize: '0.5rem', 
                                    minWidth: '16px', 
                                    height: '16px', 
                                    lineHeight: '16px',
                                    padding: '0 4px'
                                }}>
                                    3
                                    <span className="visually-hidden">thông báo chưa đọc</span>
                                </span>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end" style={{ width: '300px' }}>
                                <li><h6 className="dropdown-header">Thông báo</h6></li>
                                <li><a className="dropdown-item" href="#!">
                                    <div className="d-flex">
                                        <div className="flex-shrink-0">
                                            <i className="fas fa-info-circle text-primary"></i>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <div className="fw-bold">Đơn hàng mới</div>
                                            <div className="small text-muted">Có đơn hàng mới cần xử lý</div>
                                        </div>
                                    </div>
                                </a></li>
                                <li><a className="dropdown-item" href="#!">
                                    <div className="d-flex">
                                        <div className="flex-shrink-0">
                                            <i className="fas fa-exclamation-triangle text-warning"></i>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <div className="fw-bold">Sản phẩm sắp hết</div>
                                            <div className="small text-muted">Một số sản phẩm sắp hết hàng</div>
                                        </div>
                                    </div>
                                </a></li>
                                <li><a className="dropdown-item" href="#!">
                                    <div className="d-flex">
                                        <div className="flex-shrink-0">
                                            <i className="fas fa-check-circle text-success"></i>
                                        </div>
                                        <div className="flex-grow-1 ms-3">
                                            <div className="fw-bold">Cập nhật thành công</div>
                                            <div className="small text-muted">Hệ thống đã được cập nhật</div>
                                        </div>
                                    </div>
                                </a></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><a className="dropdown-item text-center" href="#!">Xem tất cả thông báo</a></li>
                            </ul>
                        </li>
                        
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
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                <li><a className="dropdown-item" href="#!">Cài đặt</a></li>
                                <li><a className="dropdown-item" href="#!">Lịch sử hoạt động</a></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><a className="dropdown-item" onClick={handleLogout} href='#!'>Đăng xuất</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>
            
            {/* Navigation Menu */}
            <NavigationBar />
        </div>
    )
}

export default Header