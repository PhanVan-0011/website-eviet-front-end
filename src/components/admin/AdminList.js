import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import DataTables from '../common/DataTables'
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button, Offcanvas, Dropdown } from 'react-bootstrap';
import { formatDate } from '../../tools/formatData';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import moment from 'moment';
import {
    FilterSelectSingle,
    FilterSelectMulti,
    FilterButtonGroup,
    FilterDateRange,
    FilterToggleButton
} from '../common/FilterComponents';
import LiveSearch from '../common/LiveSearch';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const AssignRoleModal = ({ show, onHide, userId, onSuccess }) => {
    const dispatch = useDispatch();
    const [roles, setRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (show) {
            dispatch(actions.controlLoading(true));
            Promise.all([
                requestApi('api/admin/roles?limit=1000', 'GET', []),
                requestApi(`api/admin/admins/${userId}`, 'GET', [])
            ]).then(([rolesRes, userRes]) => {
                if (rolesRes.data && rolesRes.data.data) setRoles(rolesRes.data.data);
                if (userRes.data && userRes.data.data && userRes.data.data.roles) {
                    setSelectedRoles(userRes.data.data.roles.map(r => r.name));
                }
            }).finally(() => {
                dispatch(actions.controlLoading(false));
            });
        }
    }, [show, userId]);

    const handleChange = (roleName) => {
        setSelectedRoles(prev =>
            prev.includes(roleName)
                ? prev.filter(r => r !== roleName)
                : [...prev, roleName]
        );
    };

    const handleSubmit = async () => {
        dispatch(actions.controlLoading(true));
        setLoading(true);
        try {
            const res = await requestApi(
                `api/admin/assign-role/${userId}`,
                'POST',
                { roles: selectedRoles },
                'json',
                'application/json'
            );
            if (res.data && res.data.success) {
                dispatch(actions.controlLoading(false));
                toast.success(res.data.message || 'Cập nhật vai trò thành công!', toastSuccessConfig);
                onSuccess && onSuccess();
                onHide();
            } else {
                dispatch(actions.controlLoading(false));
                toast.error(res.data.message || 'Cập nhật vai trò thất bại!', toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(true));
            toast.error('Lỗi server!', toastErrorConfig);
        }
        setLoading(false);
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Cập nhật vai trò cho nhân viên</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {roles.map(role => (
                    <div className="form-check" key={role.name}>
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id={`role_${role.name}`}
                            checked={selectedRoles.includes(role.name)}
                            onChange={() => handleChange(role.name)}
                        />
                        <label className="form-check-label" htmlFor={`role_${role.name}`}>
                            {role.display_name || role.name}
                        </label>
                    </div>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Hủy</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const AdminList = () => {
    const [users, setUsers] = useState([]);
    const [numOfPages, setNumOfPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemOfPage, setItemOfPage] = useState(25);
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemDelete, setItemDelete] = useState(null);
    const [typeDelete, setTypeDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(Date.now());
    const [showAssignRole, setShowAssignRole] = useState(false);
    const [assignUserId, setAssignUserId] = useState(null);
    const [roles, setRoles] = useState([]);
    // Khởi tạo selectedBranchId từ localStorage NGAY LẬP TỨC để tránh hiển thị "all" rồi mới load branch_id
    const [selectedBranchId, setSelectedBranchId] = useState(() => {
        const savedBranchId = localStorage.getItem('selectedBranchId');
        // Nếu là 'null' hoặc null thì không có branch_id (Tất cả chi nhánh)
        if (!savedBranchId || savedBranchId === 'null' || savedBranchId === '0') {
            return null;
        }
        return parseInt(savedBranchId);
    });

    // Filter states
    const [filterValues, setFilterValues] = useState({
        status: 'all',
        role: 'all',
        dateRange: { from: null, to: null }
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);
    const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);
    
    // Ref để track itemOfPage trước đó, tránh reset ở lần đầu mount
    const prevItemOfPageRef = useRef(itemOfPage);

    // Sort states
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');


    const updateFilter = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(prev => !prev);
    };
    // Sort logic
    const sortedUsers = [...users].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'name') {
            aValue = a.name || '';
            bValue = b.name || '';
        } else if (sortField === 'email') {
            aValue = a.email || '';
            bValue = b.email || '';
        } else if (sortField === 'phone') {
            aValue = a.phone || '';
            bValue = b.phone || '';
        } else if (sortField === 'is_active') {
            aValue = a.is_active ? 1 : 0;
            bValue = b.is_active ? 1 : 0;
        } else if (sortField === 'created_at') {
            aValue = new Date(a.created_at);
            bValue = new Date(b.created_at);
        } else if (sortField === 'updated_at') {
            aValue = new Date(a.updated_at);
            bValue = new Date(b.updated_at);
        } else if (sortField === 'roles') {
            aValue = Array.isArray(a.roles) ? a.roles.map(r => r.display_name || r.name).join(', ') : '';
            bValue = Array.isArray(b.roles) ? b.roles.map(r => r.display_name || r.name).join(', ') : '';
        } else if (sortField === 'branch') {
            aValue = a.branch ? (a.branch.name || '') : '';
            bValue = b.branch ? (b.branch.name || '') : '';
        } else {
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const renderSortIcon = (field) => {
        if (sortField !== field) return <i className="fas fa-sort text-secondary ms-1"></i>;
        return sortOrder === 'asc'
            ? <i className="fas fa-sort-up text-primary ms-1"></i>
            : <i className="fas fa-sort-down text-primary ms-1"></i>;
    };

    const columns = [
        { 
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Tên {renderSortIcon('name')}
                </span>
            ), 
            element: row => (
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
                        {row.image_url && row.image_url.thumb_url ? (
                            <img
                            src={urlImage + row.image_url.thumb_url}
                            alt={row.name}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1px solid #eee',
                                marginRight: 10,
                                flexShrink: 0
                            }}
                            />
                        ) : (
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', marginRight: 10 }}>
                                <i className="fas fa-user fa-sm text-secondary"></i>
                            </div>
                        )}
                    <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</span>
                </div>
            ),
            width: '18%'
        },
        { 
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('email')}>
                    Email {renderSortIcon('email')}
                </span>
            ), 
            element: row => row.email, 
            width: '15%' 
        },
        { 
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('phone')}>
                    Số điện thoại {renderSortIcon('phone')}
                </span>
            ), 
            element: row => row.phone, 
            width: '12%' 
        },
        { 
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
                    Ngày tạo {renderSortIcon('created_at')}
                </span>
            ), 
            element: row => formatDate(row.created_at), 
            width: '10%' 
        },
        { 
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('updated_at')}>
                    Ngày cập nhật {renderSortIcon('updated_at')}
                </span>
            ), 
            element: row => formatDate(row.updated_at), 
            width: '10%' 
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('roles')}>
                    Vai trò {renderSortIcon('roles')}
                </span>
            ),
            element: row => Array.isArray(row.roles) && row.roles.length > 0
                ? row.roles.map(r => r.display_name || r.name).join(", ")
                : <span className="text-muted">Chưa có</span>,
            width: '12%'
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('branch')}>
                    Chi nhánh {renderSortIcon('branch')}
                </span>
            ),
            element: row => row.branch ? row.branch.name : <span className="text-muted">Chưa có</span>,
            width: '12%'
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('is_active')}>
                    Trạng thái {renderSortIcon('is_active')}
                </span>
            ),
            element: row =>
                row.is_active
                    ? <span className="badge bg-success">Hoạt động</span>
                    : <span className="badge bg-secondary">Không hoạt động</span>,
            width: '8%'
        },
        {
            title: "Hành động", 
            element: row => (
                <div className="d-flex align-items-center">
                    <Link className="btn btn-info btn-sm me-1" to={`/admin/detail/${row.id}`} title="Xem chi tiết">
                        <i className="fas fa-eye"></i>
                    </Link>
                    <Link className="btn btn-primary btn-sm me-1" to={`/admin/${row.id}`} title="Chỉnh sửa">
                        <i className="fas fa-edit"></i>
                    </Link>
                    <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(row.id)} title="Xóa">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ), 
            width: '13%'
        }
    ];
    // Handle single Delete
    const handleDelete = (id) => {
        setItemDelete(id);
        setTypeDelete('single');
        setShowModal(true);
    }
    // Handle Multi Delete
    const multiDelete = () => {
        setTypeDelete('multi');
        setShowModal(true);
    }
    // Delete
    const requestApiDelete = () => {
        dispatch(actions.controlLoading(true));
        if(typeDelete === 'single'){
            requestApi(`api/admin/admins/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa nhân viên thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa nhân viên thất bại", toastErrorConfig);
                }
            }).catch((e) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (e.response && e.response.data && e.response.data.message) {
                    toast.error(e.response.data.message, toastErrorConfig);
                } else {
                    toast.error("Server error", toastErrorConfig);
                }
            });
        } else {
            requestApi(`api/admin/admins/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa nhân viên thành công!", toastSuccessConfig);
                    setSelectedRows([]); // Clear selected rows after successful deletion
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa nhân viên thất bại", toastErrorConfig);
                }
            }).catch((e) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (e.response && e.response.data && e.response.data.message) {
                    toast.error(e.response.data.message, toastErrorConfig);
                } else {
                    toast.error("Server error", toastErrorConfig);
                }
            });
        }
    }

    // Load roles for filter
    useEffect(() => {
        requestApi('api/admin/roles?limit=1000', 'GET', []).then((res) => {
            if (res.data && res.data.data) setRoles(res.data.data);
        });
    }, []);

    // Lắng nghe sự kiện thay đổi chi nhánh từ Header
    useEffect(() => {
        // Lắng nghe sự kiện branchChanged từ Header để cập nhật real-time
        const handleBranchChange = (event) => {
            const branch = event.detail;
            if (branch && branch.id !== null) {
                setSelectedBranchId(branch.id);
            } else {
                // "Tất cả chi nhánh" - không có branch_id
                setSelectedBranchId(null);
            }
            // Trigger refresh để fetch lại data với branch_id mới
            // KHÔNG clear data cũ, chỉ trigger fetch - data sẽ được update khi fetch xong
            setRefresh(Date.now());
        };

        window.addEventListener('branchChanged', handleBranchChange);
        return () => {
            window.removeEventListener('branchChanged', handleBranchChange);
        };
    }, []);

    // Lấy danh sách admins với filter
    useEffect(() => {
        // Reset về trang 1 khi thay đổi số items/trang (không phải lần đầu mount)
        const itemOfPageChanged = prevItemOfPageRef.current !== itemOfPage && prevItemOfPageRef.current !== null;
        let pageToUse = currentPage;
        
        if (itemOfPageChanged && currentPage !== 1) {
            // Nếu itemOfPage thay đổi và đang không ở trang 1, reset về trang 1
            pageToUse = 1;
            setCurrentPage(1);
        }
        prevItemOfPageRef.current = itemOfPage;
        
        let query = `?limit=${itemOfPage}&page=${pageToUse}&keyword=${searchText}`;
        
        // New filter panel filters
        if (filterValues.status && filterValues.status !== 'all') {
            query += `&is_active=${filterValues.status}`;
        }
        if (filterValues.role && filterValues.role !== 'all') {
            query += `&role_name=${filterValues.role}`;
        }
        // Lọc theo chi nhánh từ Header - ĐỌC TRỰC TIẾP TỪ LOCALSTORAGE để tránh race condition
        // Đảm bảo luôn có giá trị đúng ngay từ đầu, không phải đợi state update
        const currentBranchId = localStorage.getItem('selectedBranchId');
        // Chỉ thêm branch_id vào query nếu không phải "Tất cả chi nhánh" (null hoặc 'null')
        if (currentBranchId && currentBranchId !== 'null' && currentBranchId !== '0') {
            query += `&branch_id=${currentBranchId}`;
        }
        if (filterValues.dateRange?.from && filterValues.dateRange?.to) {
            query += `&start_date=${moment(filterValues.dateRange.from).format('YYYY-MM-DD')}`;
            query += `&end_date=${moment(filterValues.dateRange.to).format('YYYY-MM-DD')}`;
        }

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/admins${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            // Update users khi có data mới
            // KHÔNG clear data cũ trước khi có data mới để tránh flash "không có dữ liệu"
            if (response.data && response.data.data) {
                setUsers(response.data.data);
            } else {
                // Chỉ clear khi thực sự không có data (không phải đang loading)
                setUsers([]);
            }
            if (response.data && response.data.last_page) {
                setNumOfPages(response.data.last_page);
            }
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
            console.log("Error fetching admins: ", error);
            // Không clear data khi có lỗi để tránh flash - giữ data cũ
        });
    }, [currentPage, itemOfPage, searchText, filterValues, refresh, dispatch]);
    
    // Thêm useEffect riêng để trigger reload khi branch thay đổi (từ event hoặc localStorage)
    useEffect(() => {
        // Khi selectedBranchId thay đổi, trigger refresh để fetch lại data
        // Nhưng vì đã đọc trực tiếp từ localStorage trong query, nên chỉ cần trigger refresh
        setRefresh(Date.now());
    }, [selectedBranchId]);
  return (
    <div id="layoutSidenav_content">
        <main>
            <div className="container-fluid px-4">
                {/* Header row: Breadcrumb + Search + Actions */}
                <div className="d-flex align-items-center py-2 mt-2 mb-2 border-bottom admin-header-row">
                    {/* Left section: Breadcrumb + Search - chiếm 50% */}
                    <div className="admin-left-section d-flex align-items-center gap-3">
                        {/* Breadcrumb - ẩn trên tablet */}
                        <ol className="breadcrumb mb-0 d-none d-md-flex flex-shrink-0" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                            <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                            <li className="breadcrumb-item active">Danh sách nhân viên</li>
                        </ol>
                        
                        {/* Nút Bộ lọc - chỉ hiện trên tablet/mobile */}
                        <button 
                            className="btn btn-outline-secondary btn-sm d-md-none flex-shrink-0"
                            onClick={() => setShowFilterOffcanvas(true)}
                            title="Bộ lọc"
                        >
                            <i className="fas fa-filter me-1"></i>
                            <span className="d-none d-sm-inline">Bộ lọc</span>
                        </button>
                        
                        {/* Search - rộng hơn và canh trái */}
                        <div className="admin-search-bar flex-grow-1">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text" style={{ backgroundColor: '#fff' }}>
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <LiveSearch 
                                    changeKeyword={setSearchText}
                                    placeholder="Tìm theo tên, email, số điện thoại..."
                                />
                            </div>
                        </div>
                    </div>
                        
                    {/* Actions - bên phải - chiếm 50% */}
                    <div className="admin-right-section d-flex align-items-center gap-2 justify-content-end">
                        {/* Nút xóa khi có nhân viên được chọn */}
                        {selectedRows.length > 0 && (
                            <button className="btn btn-danger btn-sm" onClick={multiDelete}>
                                <i className="fas fa-trash me-1"></i>
                                <span className="d-none d-sm-inline">Xóa ({selectedRows.length})</span>
                            </button>
                        )}
                        
                        {/* Nút tạo mới */}
                        <Link className="btn btn-primary btn-sm" to="/admin/add">
                            <i className="fas fa-plus me-1"></i>
                            <span className="d-none d-sm-inline">Tạo mới</span>
                        </Link>
                        
                        {/* Các button riêng lẻ - hiện trên >= 1280px */}
                        <div className="admin-action-buttons">
                            <button className="btn btn-outline-secondary btn-sm">
                                <i className="fas fa-upload me-1"></i> Import
                            </button>
                            <button className="btn btn-outline-secondary btn-sm">
                                <i className="fas fa-download me-1"></i> Xuất file
                            </button>
                            <button className="btn btn-outline-secondary btn-sm" title="Cài đặt">
                                <i className="fas fa-cog"></i>
                            </button>
                            <button className="btn btn-outline-secondary btn-sm" title="Trợ giúp">
                                <i className="fas fa-question-circle"></i>
                            </button>
                        </div>
                        
                        {/* Dropdown menu cho các nút phụ - chỉ hiện khi < 1280px */}
                        <div className="admin-action-dropdown">
                            <Dropdown>
                                <Dropdown.Toggle 
                                    variant="outline-secondary" 
                                    size="sm" 
                                    className="d-flex align-items-center"
                                    id="actions-dropdown"
                                >
                                    <i className="fas fa-ellipsis-v"></i>
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end">
                                    <Dropdown.Item>
                                        <i className="fas fa-upload me-2"></i> Import
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        <i className="fas fa-download me-2"></i> Xuất file
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item>
                                        <i className="fas fa-cog me-2"></i> Cài đặt
                                    </Dropdown.Item>
                                    <Dropdown.Item>
                                        <i className="fas fa-question-circle me-2"></i> Trợ giúp
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </div>
                
                {/* Layout chính với FilterPanel và nội dung */}
                <div className="d-flex gap-4" style={{ gap: '16px' }}>
                    {/* Filter Panel Card - Hiển thị trên tablet và desktop, ẩn trên mobile */}
                    {isFilterVisible && (
                        <div className="filter-card-wrapper d-none d-md-block" style={{ width: '240px', flexShrink: 0 }}>
                            <div className="filter-card">
                                <div className="filter-card-content">
                                    {/* Trạng thái */}
                                    <FilterSelectSingle
                                        label="Trạng thái"
                                        value={filterValues.status ? {
                                            value: filterValues.status,
                                            label: filterValues.status === 'all' ? 'Tất cả' : 
                                                   filterValues.status === 'true' ? 'Hoạt động' : 'Không hoạt động'
                                        } : null}
                                        onChange={(selected) => updateFilter('status', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: 'true', label: 'Hoạt động' },
                                            { value: 'false', label: 'Không hoạt động' }
                                        ]}
                                        placeholder="Chọn trạng thái"
                                    />

                                    {/* Vai trò */}
                                    <FilterSelectSingle
                                        label="Vai trò"
                                        value={filterValues.role ? {
                                            value: filterValues.role,
                                            label: filterValues.role === 'all' ? 'Tất cả vai trò' : 
                                                   roles.find(r => r.name === filterValues.role)?.display_name || filterValues.role
                                        } : null}
                                        onChange={(selected) => updateFilter('role', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả vai trò' },
                                            ...roles.map(role => ({
                                                value: role.name,
                                                label: role.display_name || role.name
                                            }))
                                        ]}
                                        placeholder="Chọn vai trò"
                                    />

                                    {/* Thời gian tạo tài khoản */}
                                    <FilterDateRange
                                        label="Thời gian tạo tài khoản"
                                        value={filterValues.dateRange || { from: null, to: null }}
                                        onChange={(dateRange) => updateFilter('dateRange', dateRange)}
                                    />
                                </div>

                                {/* Toggle Button - Pill button ở mép phải */}
                                <button
                                    className="filter-toggle-btn"
                                    onClick={() => setIsFilterVisible(false)}
                                    title="Thu gọn bộ lọc"
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table Card */}
                    <div className="table-card-wrapper flex-grow-1">
                        {/* Nút mở lại filter khi đã thu gọn - hiện trên tablet và desktop */}
                        {!isFilterVisible && (
                            <button
                                className="filter-toggle-btn-open d-none d-md-flex"
                                onClick={() => setIsFilterVisible(true)}
                                title="Mở bộ lọc"
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        )}
                        
                        <div className="table-card">
                            <DataTables
                                name="Danh sách nhân viên"
                                columns={columns}
                                data={sortedUsers}
                                numOfPages={numOfPages}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                setItemOfPage={setItemOfPage}
                                selectedRows={selectedRows}
                                onSelectedRows={setSelectedRows}
                                hideSearch={true}
                                showSummary={false}
                                tableHeight="calc(100vh - 220px)"
                            />
                        </div>
                    </div>

                    {/* Offcanvas Filter cho Tablet/Mobile */}
                    <Offcanvas 
                        show={showFilterOffcanvas} 
                        onHide={() => setShowFilterOffcanvas(false)}
                        placement="start"
                        className="d-lg-none"
                    >
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Bộ lọc</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <div className="filter-card-content">
                                {/* Trạng thái */}
                                <FilterSelectSingle
                                    label="Trạng thái"
                                    value={filterValues.status ? {
                                        value: filterValues.status,
                                        label: filterValues.status === 'all' ? 'Tất cả' : 
                                               filterValues.status === 'true' ? 'Hoạt động' : 'Không hoạt động'
                                    } : null}
                                    onChange={(selected) => updateFilter('status', selected ? selected.value : 'all')}
                                    options={[
                                        { value: 'all', label: 'Tất cả' },
                                        { value: 'true', label: 'Hoạt động' },
                                        { value: 'false', label: 'Không hoạt động' }
                                    ]}
                                    placeholder="Chọn trạng thái"
                                />

                                {/* Vai trò */}
                                <FilterSelectSingle
                                    label="Vai trò"
                                    value={filterValues.role ? {
                                        value: filterValues.role,
                                        label: filterValues.role === 'all' ? 'Tất cả vai trò' : 
                                               roles.find(r => r.name === filterValues.role)?.display_name || filterValues.role
                                    } : null}
                                    onChange={(selected) => updateFilter('role', selected ? selected.value : 'all')}
                                    options={[
                                        { value: 'all', label: 'Tất cả vai trò' },
                                        ...roles.map(role => ({
                                            value: role.name,
                                            label: role.display_name || role.name
                                        }))
                                    ]}
                                    placeholder="Chọn vai trò"
                                />

                                {/* Thời gian tạo tài khoản */}
                                <FilterDateRange
                                    label="Thời gian tạo tài khoản"
                                    value={filterValues.dateRange || { from: null, to: null }}
                                    onChange={(dateRange) => updateFilter('dateRange', dateRange)}
                                />
                            </div>
                        </Offcanvas.Body>
                    </Offcanvas>

                </div>
            </div>
        </main>
        <AssignRoleModal
            show={showAssignRole}
            onHide={() => setShowAssignRole(false)}
            userId={assignUserId}
            onSuccess={() => setRefresh(Date.now())}
        />
        <Modal show={showModal} onHide={() => {setShowModal(false); setItemDelete(null); setTypeDelete(null)}}>
            <Modal.Header closeButton>
                <Modal.Title>Xác nhận xóa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {typeDelete === 'single' ? (
                    <p>Bạn chắc chắn muốn xóa nhân viên này?</p>
                ) : (
                    <p>Bạn chắc chắn muốn xóa các nhân viên này?</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => {setShowModal(false)}}>
                    Hủy
                </Button>
                <Button variant="danger" onClick={() => {requestApiDelete()}}>
                    Xóa
                </Button>
            </Modal.Footer>
        </Modal>
    </div>
  )
}

export default AdminList