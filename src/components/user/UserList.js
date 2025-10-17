import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTables from '../common/DataTables'
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
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
    const [hoveredUserId, setHoveredUserId] = useState(null);

    // Filter states
    const [filterValues, setFilterValues] = useState({
        status: 'all',
        gender: 'all',
        dateRange: { from: null, to: null }
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);

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
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 120, position: 'relative' }}>
                    <div
                        onMouseEnter={() => row.image_url && row.image_url.thumb_url && setHoveredUserId(row.id)}
                        onMouseLeave={() => setHoveredUserId(null)}
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        {row.image_url && row.image_url.thumb_url ? (
                            <img
                                src={process.env.REACT_APP_API_URL + 'api/images/' + row.image_url.thumb_url}
                                alt="avatar"
                                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'contain', border: '1px solid #eee', background: '#fafbfc', marginRight: 10, cursor: 'pointer' }}
                            />
                        ) : (
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', marginRight: 10 }}>
                                <i className="fas fa-user fa-sm text-secondary"></i>
                            </div>
                        )}
                        {/* Popup preview */}
                        {hoveredUserId === row.id && row.image_url && row.image_url.main_url && (
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: -110,
                                    left: 0,
                                    zIndex: 100,
                                    background: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: 8,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                    padding: 6,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 100,
                                    minHeight: 100
                                }}
                            >
                                <img
                                    src={process.env.REACT_APP_API_URL + 'api/images/' + row.image_url.main_url}
                                    alt="avatar-large"
                                    style={{ width: 96, height: 96, borderRadius: '12px', objectFit: 'contain', border: '1px solid #eee', background: '#fafbfc' }}
                                />
                            </div>
                        )}
                    </div>
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
                <h1 className="mt-4"></h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                    <li className="breadcrumb-item active">Danh sách tài khoản</li>
                </ol>
                
                {/* Layout chính với FilterPanel và nội dung */}
                <div className="row g-0">
                    {/* Filter Panel */}
                    <div className={`position-relative filter-panel ${isFilterVisible ? 'col-md-2' : 'col-md-0'} transition-all d-flex flex-column`}>
                        {isFilterVisible && (
                            <div className="p-3 filter-content">
                                {/* <h6 className="fw-bold mb-3 text-primary text-center" style={{ fontSize: '0.9rem' }}>
                                    <i className="fas fa-users me-1"></i>
                                    Tài khoản
                                </h6> */}

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
                        )}
                    </div>

                    {/* Nội dung chính */}
                    <div className={`main-content-area ${isFilterVisible ? 'col-md-10' : 'col-md-12'} transition-all d-flex flex-column ${!isFilterVisible ? 'expanded' : ''}`}>
                        {/* Search bar với các nút action */}
                        <div className="p-3 border-bottom bg-light search-bar">
                            <div className="row align-items-center">
                                <div className="col-md-4">
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="fas fa-search"></i>
                                            </span>
                                            <LiveSearch 
                                                changeKeyword={setSearchText}
                                                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                                            />
                                        </div>
                                </div>
                                <div className="col-md-8">
                                    <div className="d-flex justify-content-end gap-2">
                                        {/* Nút xóa nhiều */}
                                        {selectedRows.length > 0 && (
                                            <button className="btn btn-danger" onClick={multiDelete}>
                                                <i className="fas fa-trash me-1"></i> Xóa ({selectedRows.length})
                                            </button>
                                        )}
                                        
                                        {/* Nút tạo mới */}
                                        <Link className="btn btn-primary" to="/user/add">
                                            <i className="fas fa-plus me-1"></i> Tạo mới
                                        </Link>
                                        
                                        {/* Các nút khác */}
                                        <button className="btn btn-secondary">
                                            <i className="fas fa-upload me-1"></i> Import file
                                        </button>
                                        <button className="btn btn-secondary">
                                            <i className="fas fa-download me-1"></i> Xuất file
                                        </button>
                                        <button className="btn btn-secondary">
                                            <i className="fas fa-cog"></i>
                                        </button>
                                        <button className="btn btn-secondary">
                                            <i className="fas fa-question-circle"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Search results info */}
                            {searchText && (
                                <div className="search-results-info">
                                    <small>
                                        <i className="fas fa-info-circle me-1"></i>
                                        Đang tìm kiếm: "<strong>{searchText}</strong>" - Tìm thấy {sortedUsers.length} kết quả
                                    </small>
                                </div>
                            )}
                        </div>

                        {/* Header với tiêu đề */}
                        <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white flex-shrink-0">
                            <div className="d-flex align-items-center gap-2">
                                <h4 className="mb-0 fw-bold text-primary">Danh sách tài khoản</h4>
                                {/* Filter Toggle Button */}
                                <FilterToggleButton
                                    key={`toggle-${isFilterVisible}`}
                                    isVisible={isFilterVisible}
                                    onToggle={() => {
                                        setIsPulsing(true);
                                        setTimeout(() => setIsPulsing(false), 600);
                                        toggleFilterVisibility();
                                    }}
                                    isPulsing={isPulsing}
                                />
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="flex-grow-1 overflow-auto">
                            <div className="p-3">
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
                />
                            </div>
                        </div>
                    </div>
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