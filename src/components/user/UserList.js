import React, { useEffect, useState } from 'react'
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
import ImageWithZoom from '../common/ImageWithZoom';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';


const UserList = () => {
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

    // Filter states
    const [filterValues, setFilterValues] = useState({
        status: 'all',
        gender: 'all',
        dateRange: { from: null, to: null }
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);
    const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);

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
        } else if (sortField === 'gender') {
            aValue = a.gender || '';
            bValue = b.gender || '';
        } else if (sortField === 'is_active') {
            aValue = a.is_active ? 1 : 0;
            bValue = b.is_active ? 1 : 0;
        } else if (sortField === 'created_at') {
            aValue = new Date(a.created_at);
            bValue = new Date(b.created_at);
        } else if (sortField === 'updated_at') {
            aValue = new Date(a.updated_at);
            bValue = new Date(b.updated_at);
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
                    Khách hàng {renderSortIcon('name')}
                </span>
            ), 
            element: row => (
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
                        {row.image_url && row.image_url.thumb_url ? (
                        <div style={{ marginRight: 10 }}>
                            <ImageWithZoom
                                src={urlImage + row.image_url.thumb_url}
                                zoomSrc={row.image_url.main_url ? urlImage + row.image_url.main_url : urlImage + row.image_url.thumb_url}
                                alt={row.name}
                            />
                        </div>
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
            width: '13%' 
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
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('gender')}>
                    Giới tính {renderSortIcon('gender')}
                </span>
            ), 
            element: row => row.gender === "male" ? "Nam" : row.gender === "female" ? "Nữ" : "Khác", 
            width: '5%' 
        },
        {
            title: "Ngày sinh",
            element: row => {
                if (!row.date_of_birth) return "";
                // Thử parse với nhiều định dạng
                const m = moment(row.date_of_birth, ["DD/MM/YYYY", "YYYY-MM-DD", "YYYY/MM/DD"], true);
                return m.isValid() ? m.format("DD/MM/YYYY") : "";
            },
            width: '8%'
        },
        { 
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
                    Ngày tạo {renderSortIcon('created_at')}
                </span>
            ), 
            element: row => formatDate(row.created_at), 
            width: '9%' 
        },
        { 
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('updated_at')}>
                    Ngày cập nhật {renderSortIcon('updated_at')}
                </span>
            ), 
            element: row => formatDate(row.updated_at), 
            width: '9%' 
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
            width: '6%'
        },
        {
            title: "Hành động", 
            element: row => (
                <div className="d-flex align-items-center">
                    <Link className="btn btn-primary btn-sm me-1" to={`/user/${row.id}`} title="Chỉnh sửa">
                        <i className="fas fa-edit"></i>
                    </Link>
                    <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(row.id)} title="Xóa">
                        <i className="fas fa-trash"></i>
                    </button>
                    {/* <button className="btn btn-warning btn-sm me-1" onClick={() => { setAssignUserId(row.id); setShowAssignRole(true); }}><i className="fas fa-user-tag"></i> Gán vai trò</button> */}
                </div>
            ), 
            width: '8%'
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
            requestApi(`api/admin/users/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa khách hàng thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa khách hàng thất bại", toastErrorConfig);
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
            requestApi(`api/admin/users/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa khách hàng thành công!", toastSuccessConfig);
                    setSelectedRows([]); // Clear selected rows after successful deletion
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa khách hàng thất bại", toastErrorConfig);
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


    // Lấy danh sách users với filter
    useEffect(() => {
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        
        // New filter panel filters
        if (filterValues.status && filterValues.status !== 'all') {
            query += `&is_active=${filterValues.status}`;
        }
        if (filterValues.gender && filterValues.gender !== 'all') {
            query += `&gender=${filterValues.gender}`;
        }
        if (filterValues.dateRange?.from && filterValues.dateRange?.to) {
            query += `&start_date=${moment(filterValues.dateRange.from).format('YYYY-MM-DD')}`;
            query += `&end_date=${moment(filterValues.dateRange.to).format('YYYY-MM-DD')}`;
        }

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/users${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setUsers(response.data.data);
            setNumOfPages(response.data.last_page);
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
            console.log("Error fetching users: ", error);
        });
    }, [currentPage, itemOfPage, searchText, filterValues, refresh, dispatch]);
  return (
    <div id="layoutSidenav_content">
        <main>
            <div className="container-fluid px-4">
                {/* Header row: Breadcrumb + Search + Actions */}
                <div className="d-flex align-items-center py-2 mt-2 mb-2 border-bottom user-header-row" style={{ justifyContent: 'space-between', gap: '0.5rem' }}>
                    {/* Left section: Breadcrumb / Filter button */}
                    <div className="d-flex align-items-center flex-shrink-0">
                        {/* Breadcrumb - ẩn trên tablet */}
                        <ol className="breadcrumb mb-0 d-none d-md-flex" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                            <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                            <li className="breadcrumb-item active">Danh sách tài khoản</li>
                        </ol>
                        
                        {/* Nút Bộ lọc - chỉ hiện trên tablet/mobile */}
                        <button 
                            className="btn btn-outline-secondary btn-sm d-md-none"
                            onClick={() => setShowFilterOffcanvas(true)}
                            title="Bộ lọc"
                        >
                            <i className="fas fa-filter me-1"></i>
                            <span className="d-none d-sm-inline">Bộ lọc</span>
                        </button>
                    </div>
                    
                    {/* Search - ở giữa */}
                    <div className="user-search-bar" style={{ margin: '0 auto' }}>
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
                        
                    {/* Actions - bên phải */}
                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                        {/* Nút xóa khi có tài khoản được chọn */}
                        {selectedRows.length > 0 && (
                            <button className="btn btn-danger btn-sm" onClick={multiDelete}>
                                <i className="fas fa-trash me-1"></i>
                                <span className="d-none d-sm-inline">Xóa ({selectedRows.length})</span>
                            </button>
                        )}
                        
                        {/* Nút tạo mới */}
                        <Link className="btn btn-primary btn-sm" to="/user/add">
                            <i className="fas fa-plus me-1"></i>
                            <span className="d-none d-sm-inline">Tạo mới</span>
                        </Link>
                        
                        {/* Các button riêng lẻ - hiện trên >= 1280px */}
                        <div className="user-action-buttons">
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
                        <div className="user-action-dropdown">
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

                                    {/* Giới tính */}
                                    <FilterSelectSingle
                                        label="Giới tính"
                                        value={filterValues.gender ? {
                                            value: filterValues.gender,
                                            label: filterValues.gender === 'all' ? 'Tất cả' : 
                                                   filterValues.gender === 'male' ? 'Nam' :
                                                   filterValues.gender === 'female' ? 'Nữ' : 'Khác'
                                        } : null}
                                        onChange={(selected) => updateFilter('gender', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: 'male', label: 'Nam' },
                                            { value: 'female', label: 'Nữ' },
                                            { value: 'other', label: 'Khác' }
                                        ]}
                                        placeholder="Chọn giới tính"
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
                                name="Danh sách tài khoản"
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

                                {/* Giới tính */}
                                <FilterSelectSingle
                                    label="Giới tính"
                                    value={filterValues.gender ? {
                                        value: filterValues.gender,
                                        label: filterValues.gender === 'all' ? 'Tất cả' : 
                                               filterValues.gender === 'male' ? 'Nam' :
                                               filterValues.gender === 'female' ? 'Nữ' : 'Khác'
                                    } : null}
                                    onChange={(selected) => updateFilter('gender', selected ? selected.value : 'all')}
                                    options={[
                                        { value: 'all', label: 'Tất cả' },
                                        { value: 'male', label: 'Nam' },
                                        { value: 'female', label: 'Nữ' },
                                        { value: 'other', label: 'Khác' }
                                    ]}
                                    placeholder="Chọn giới tính"
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
        {/* <AssignRoleModal
            show={showAssignRole}
            onHide={() => setShowAssignRole(false)}
            userId={assignUserId}
            onSuccess={() => setRefresh(Date.now())}
        /> */}
        <Modal show={showModal} onHide={() => {setShowModal(false); setItemDelete(null); setTypeDelete(null)}}>
            <Modal.Header closeButton>
                <Modal.Title>Xác nhận xóa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {typeDelete === 'single' ? (
                    <p>Bạn chắc chắn muốn xóa tài khoản này?</p>
                ) : (
                    <p>Bạn chắc chắn muốn xóa các tài khoản này?</p>
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

export default UserList