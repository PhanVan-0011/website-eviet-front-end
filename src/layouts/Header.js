import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import requestApi from '../helpers/api';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false); // Kiểm tra user có phải admin không
    const [branches, setBranches] = useState([]);
    // Khởi tạo selectedBranch từ localStorage NGAY LẬP TỨC để tránh hiển thị "Tất cả chi nhánh" khi reload
    const [selectedBranch, setSelectedBranch] = useState(() => {
        const savedBranch = localStorage.getItem('selectedBranch');
        if (savedBranch) {
            try {
                return JSON.parse(savedBranch);
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [userBranchId, setUserBranchId] = useState(null); // branch_id của user

    useEffect(() => {
        // Lấy user từ localStorage
        const userData = localStorage.getItem('user');
        console.log(userData);
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            // Lưu branch_id của user nếu có
            if (parsedUser.branch_id) {
                setUserBranchId(parsedUser.branch_id);
            } else {
                setUserBranchId(null);
            }
        }
    }, []);

    useEffect(() => {
        // Lấy danh sách chi nhánh sau khi đã có user data
        const fetchBranches = async () => {
            try {
                // Sử dụng API endpoint thật từ hệ thống
                const response = await requestApi('api/admin/branches?limit=1000', 'GET');
                if (response.data) {
                    // Lấy is_admin từ API response (có thể ở response.data.is_admin hoặc response.data.data.is_admin)
                    const adminStatus = response.data.is_admin !== undefined 
                        ? response.data.is_admin 
                        : (response.data.data?.is_admin !== undefined ? response.data.data.is_admin : false);
                    const isAdminValue = adminStatus === true || adminStatus === 1;
                    setIsAdmin(isAdminValue);
                    
                    if (response.data.data) {
                        setBranches(response.data.data);
                    
                        // Nếu user thuộc 1 chi nhánh cụ thể
                        if (userBranchId) {
                            const userBranch = response.data.data.find(b => b.id === parseInt(userBranchId));
                            if (userBranch) {
                                // Tự động chọn chi nhánh của user
                                setSelectedBranch(userBranch);
                                localStorage.setItem('selectedBranchId', userBranch.id.toString());
                                localStorage.setItem('selectedBranch', JSON.stringify(userBranch));
                                window.dispatchEvent(new CustomEvent('branchChanged', { detail: userBranch }));
                                return;
                            }
                        }
                        
                        // Nếu user không thuộc chi nhánh nào (userBranchId = null)
                        // Kiểm tra xem đã có lựa chọn chi nhánh trước đó chưa
                        const savedBranchId = localStorage.getItem('selectedBranchId');
                        if (savedBranchId && savedBranchId !== 'null' && savedBranchId !== '0') {
                            // Đã có lựa chọn trước đó, load lại
                            const savedBranch = response.data.data.find(b => b.id === parseInt(savedBranchId));
                            if (savedBranch) {
                                setSelectedBranch(savedBranch);
                                const savedBranchData = localStorage.getItem('selectedBranch');
                                if (savedBranchData) {
                                    window.dispatchEvent(new CustomEvent('branchChanged', { detail: JSON.parse(savedBranchData) }));
                                } else {
                                    localStorage.setItem('selectedBranch', JSON.stringify(savedBranch));
                                    window.dispatchEvent(new CustomEvent('branchChanged', { detail: savedBranch }));
                                }
                                return;
                            }
                        } else if ((savedBranchId === 'null' || savedBranchId === '0') && isAdminValue) {
                            // Đã chọn "Tất cả chi nhánh" trước đó và user là admin
                            const allBranch = { id: null, name: 'Tất cả chi nhánh' };
                            setSelectedBranch(allBranch);
                            localStorage.setItem('selectedBranchId', 'null');
                            localStorage.setItem('selectedBranch', JSON.stringify(allBranch));
                            window.dispatchEvent(new CustomEvent('branchChanged', { detail: null }));
                            return;
                        } else if ((savedBranchId === 'null' || savedBranchId === '0') && !isAdminValue) {
                            // User không phải admin nhưng đã chọn "Tất cả" trước đó, chuyển về chi nhánh đầu tiên
                            if (response.data.data.length > 0) {
                                const firstBranch = response.data.data[0];
                                setSelectedBranch(firstBranch);
                                localStorage.setItem('selectedBranchId', firstBranch.id.toString());
                                localStorage.setItem('selectedBranch', JSON.stringify(firstBranch));
                                window.dispatchEvent(new CustomEvent('branchChanged', { detail: firstBranch }));
                                return;
                            }
                        }
                        
                        // Lần đầu tiên: chọn mặc định
                        if (isAdminValue) {
                            // Nếu là admin: tự động chọn "Tất cả chi nhánh"
                            const allBranch = { id: null, name: 'Tất cả chi nhánh' };
                            setSelectedBranch(allBranch);
                            localStorage.setItem('selectedBranchId', 'null');
                            localStorage.setItem('selectedBranch', JSON.stringify(allBranch));
                            window.dispatchEvent(new CustomEvent('branchChanged', { detail: null }));
                        } else {
                            // Nếu không phải admin: chọn chi nhánh đầu tiên
                            if (response.data.data.length > 0) {
                                const firstBranch = response.data.data[0];
                                setSelectedBranch(firstBranch);
                                localStorage.setItem('selectedBranchId', firstBranch.id.toString());
                                localStorage.setItem('selectedBranch', JSON.stringify(firstBranch));
                                window.dispatchEvent(new CustomEvent('branchChanged', { detail: firstBranch }));
                            }
                        }
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
                
                // Nếu user thuộc 1 chi nhánh cụ thể
                if (userBranchId) {
                    const userBranch = fallbackBranches.find(b => b.id === parseInt(userBranchId));
                    if (userBranch) {
                        setSelectedBranch(userBranch);
                        localStorage.setItem('selectedBranchId', userBranch.id.toString());
                        localStorage.setItem('selectedBranch', JSON.stringify(userBranch));
                        window.dispatchEvent(new CustomEvent('branchChanged', { detail: userBranch }));
                        return;
                    }
                }
                
                // Kiểm tra xem đã có lựa chọn chi nhánh trước đó chưa
                const savedBranchId = localStorage.getItem('selectedBranchId');
                if (savedBranchId && savedBranchId !== 'null' && savedBranchId !== '0') {
                    // Đã có lựa chọn trước đó, load lại
                    const savedBranch = fallbackBranches.find(b => b.id === parseInt(savedBranchId));
                    if (savedBranch) {
                        setSelectedBranch(savedBranch);
                        const savedBranchData = localStorage.getItem('selectedBranch');
                        if (savedBranchData) {
                            window.dispatchEvent(new CustomEvent('branchChanged', { detail: JSON.parse(savedBranchData) }));
                        } else {
                            localStorage.setItem('selectedBranch', JSON.stringify(savedBranch));
                            window.dispatchEvent(new CustomEvent('branchChanged', { detail: savedBranch }));
                        }
                        return;
                    }
                } else if ((savedBranchId === 'null' || savedBranchId === '0') && isAdmin) {
                    // Đã chọn "Tất cả chi nhánh" trước đó và user là admin
                    const allBranch = { id: null, name: 'Tất cả chi nhánh' };
                    setSelectedBranch(allBranch);
                    localStorage.setItem('selectedBranchId', 'null');
                    localStorage.setItem('selectedBranch', JSON.stringify(allBranch));
                    window.dispatchEvent(new CustomEvent('branchChanged', { detail: null }));
                    return;
                } else if ((savedBranchId === 'null' || savedBranchId === '0') && !isAdmin) {
                    // User không phải admin nhưng đã chọn "Tất cả" trước đó, chuyển về chi nhánh đầu tiên
                    if (fallbackBranches.length > 0) {
                        const firstBranch = fallbackBranches[0];
                        setSelectedBranch(firstBranch);
                        localStorage.setItem('selectedBranchId', firstBranch.id.toString());
                        localStorage.setItem('selectedBranch', JSON.stringify(firstBranch));
                        window.dispatchEvent(new CustomEvent('branchChanged', { detail: firstBranch }));
                        return;
                    }
                }
                
                // Lần đầu tiên: chọn mặc định
                if (isAdmin) {
                    // Nếu là admin: tự động chọn "Tất cả chi nhánh"
                    const allBranch = { id: null, name: 'Tất cả chi nhánh' };
                    setSelectedBranch(allBranch);
                    localStorage.setItem('selectedBranchId', 'null');
                    localStorage.setItem('selectedBranch', JSON.stringify(allBranch));
                    window.dispatchEvent(new CustomEvent('branchChanged', { detail: null }));
                } else {
                    // Nếu không phải admin: chọn chi nhánh đầu tiên
                    if (fallbackBranches.length > 0) {
                        const firstBranch = fallbackBranches[0];
                        setSelectedBranch(firstBranch);
                        localStorage.setItem('selectedBranchId', firstBranch.id.toString());
                        localStorage.setItem('selectedBranch', JSON.stringify(firstBranch));
                        window.dispatchEvent(new CustomEvent('branchChanged', { detail: firstBranch }));
                    }
                }
            }
        };
        
        fetchBranches();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userBranchId]);

    const handleBranchChange = (branch) => {
        // Nếu user không phải admin, không cho phép chọn "Tất cả chi nhánh"
        if ((!branch || branch.id === null) && !isAdmin) {
            // Nếu không phải admin nhưng cố chọn "Tất cả", chọn chi nhánh đầu tiên
            if (branches.length > 0) {
                branch = branches[0];
            } else {
                return; // Không có chi nhánh nào, không làm gì
            }
        }
        
        // LƯU VÀO LOCALSTORAGE TRƯỚC KHI SET STATE để tránh flash "Tất cả chi nhánh"
        if (branch && branch.id !== null) {
            localStorage.setItem('selectedBranchId', branch.id.toString());
            localStorage.setItem('selectedBranch', JSON.stringify(branch));
        } else {
            // Nếu chọn "Tất cả chi nhánh" (branch = null hoặc id = null) - chỉ admin mới được
            if (isAdmin) {
                localStorage.setItem('selectedBranchId', 'null');
                const allBranch = { id: null, name: 'Tất cả chi nhánh' };
                localStorage.setItem('selectedBranch', JSON.stringify(allBranch));
            } else {
                return; // Không phải admin, không cho phép
            }
        }
        
        // Set state sau khi đã lưu vào localStorage
        setSelectedBranch(branch);
        
        // Trigger custom event để các component khác có thể lắng nghe và reload data
        // KHÔNG reload toàn bộ trang để tránh flash dữ liệu
        window.dispatchEvent(new CustomEvent('branchChanged', { 
            detail: branch,
            // Thêm timestamp để force các component reload
            timestamp: Date.now()
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('roles');
        localStorage.removeItem('permissions');
        localStorage.removeItem('access_token');
        localStorage.removeItem('selectedBranchId');
        localStorage.removeItem('selectedBranch');
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
                        {userBranchId ? (
                            // Nếu user thuộc 1 chi nhánh, chỉ hiển thị tên chi nhánh (không có dropdown)
                            <li className="nav-item me-3 d-flex align-items-center">
                                <span className="nav-link d-flex align-items-center" style={{ textDecoration: 'none', color: 'inherit', cursor: 'default' }}>
                                    <i className="fas fa-building me-2"></i>
                                    <span>{selectedBranch ? selectedBranch.name : 'Tất cả chi nhánh'}</span>
                                </span>
                            </li>
                        ) : (
                            // Nếu user không thuộc chi nhánh nào, hiển thị dropdown với tất cả chi nhánh
                            <li className="nav-item dropdown me-3">
                                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <i className="fas fa-building me-2"></i>
                                    <span>
                                        {(() => {
                                            // Đọc trực tiếp từ localStorage để tránh flash khi reload
                                            // Ưu tiên state, nếu không có thì đọc từ localStorage
                                            if (selectedBranch) {
                                                return selectedBranch.name;
                                            }
                                            const savedBranch = localStorage.getItem('selectedBranch');
                                            if (savedBranch) {
                                                try {
                                                    const branch = JSON.parse(savedBranch);
                                                    return branch.name || (isAdmin ? 'Tất cả chi nhánh' : (branches.length > 0 ? branches[0].name : 'Tất cả chi nhánh'));
                                                } catch (e) {
                                                    return isAdmin ? 'Tất cả chi nhánh' : (branches.length > 0 ? branches[0].name : 'Tất cả chi nhánh');
                                                }
                                            }
                                            return isAdmin ? 'Tất cả chi nhánh' : (branches.length > 0 ? branches[0].name : 'Tất cả chi nhánh');
                                        })()}
                                    </span>
                                </a>
                                <ul className="dropdown-menu">
                                    {/* Option "Tất cả chi nhánh" chỉ hiển thị nếu user là admin */}
                                    {isAdmin && (
                                        <>
                                            <li>
                                                <a 
                                                    className={`dropdown-item ${selectedBranch?.id === null ? 'active' : ''}`} 
                                                    href="#!" 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleBranchChange({ id: null, name: 'Tất cả chi nhánh' });
                                                    }}
                                                >
                                                    <i className="fas fa-globe me-2"></i>
                                                    Tất cả chi nhánh
                                                </a>
                                            </li>
                                            <li><hr className="dropdown-divider" /></li>
                                        </>
                                    )}
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
                        )}
                        
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