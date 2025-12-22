import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import DataTables from '../common/DataTables';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button, Dropdown } from 'react-bootstrap';
import { formatDate } from '../../tools/formatData';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import LiveSearch from '../common/LiveSearch';
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';

const RuleList = () => {
    const [roles, setRoles] = useState([]);
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
    
    // Ref để track itemOfPage trước đó, tránh reset ở lần đầu mount
    const prevItemOfPageRef = useRef(itemOfPage);

    const columns = [
        { title: "Tên vai trò", element: row => row.display_name ? `${row.display_name} (${row.name})` : row.name, width: '20%'},
        { 
            title: "Danh sách quyền", 
            element: row => row.permissions && row.permissions.length > 0
                ? row.permissions.map(p => {
                    let color = 'secondary';
                    if (p.action === 'delete') color = 'danger';
                    else if (p.action === 'manage') color = 'primary';
                    else if (p.action === 'update') color = 'warning';
                    else if (p.action === 'create') color = 'success';
                    else if (p.action === 'view') color = 'info';
                    return (
                        <span key={p.id} className={`badge bg-${color} me-1 mb-1`}>
                            {p.display_name || p.name}
                        </span>
                    );
                })
                : '',
            width: '40%'
        },
        { title: "Số người dùng", element: row => row.users_count || 0, width: '10%' },
        { title: "Ngày tạo", element: row => formatDate(row.created_at), width: '10%' },
        { title: "Ngày cập nhật", element: row => formatDate(row.updated_at), width: '10%' },
        {
            title: "Hành động", element: row => (
                <div className="d-flex align-items-center gap-1" style={{ flexWrap: 'nowrap' }}>
                    <Permission permission={PERMISSIONS.ROLES_UPDATE}>
                        <Link className="btn btn-primary btn-sm px-2 py-1" to={`/rule/${row.id}`} title="Chỉnh sửa">
                            <i className="fas fa-edit"></i>
                        </Link>
                    </Permission>
                    <Permission permission={PERMISSIONS.ROLES_DELETE}>
                        <button className="btn btn-danger btn-sm px-2 py-1" onClick={() => handleDelete(row.id)} title="Xóa">
                            <i className="fas fa-trash"></i>
                        </button>
                    </Permission>
                </div>
            ),
            width: '18%'
        }
    ];

    // Xử lý xóa 1 vai trò
    const handleDelete = (id) => {
        setItemDelete(id);
        setTypeDelete('single');
        setShowModal(true);
   
    };
    // Xử lý xóa nhiều vai trò
    const multiDelete = () => {
        setTypeDelete('multi');
        setShowModal(true);
    };
    // Gọi API xóa
    const requestApiDelete = () => {
        dispatch(actions.controlLoading(true));
        if(typeDelete === 'single'){
            requestApi(`api/admin/roles/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa vai trò thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa vai trò thất bại", toastErrorConfig);
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
            requestApi(`api/admin/roles/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa vai trò thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa vai trò thất bại", toastErrorConfig);
                }
                setSelectedRows([]);
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
    };

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
        
        const query = `?limit=${itemOfPage}&page=${pageToUse}&keyword=${searchText}`;
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/roles${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            // Chỉ update roles khi có data, không clear nếu data rỗng
            if (response.data && response.data.data) {
                setRoles(response.data.data);
            }
            if (response.data && response.data.pagination && response.data.pagination.last_page) {
                setNumOfPages(response.data.pagination.last_page);
            }
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
            console.log("Error fetching roles: ", error);
        });
    }, [currentPage, itemOfPage, searchText, refresh]);

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    {/* Header row: Breadcrumb + Search + Actions */}
                    <div className="d-flex align-items-center py-2 mt-2 mb-2 border-bottom rule-header-row">
                        {/* Left section: Breadcrumb + Search - chiếm 50% */}
                        <div className="rule-left-section d-flex align-items-center gap-3">
                            {/* Breadcrumb - ẩn trên tablet */}
                            <ol className="breadcrumb mb-0 d-none d-md-flex flex-shrink-0" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                                <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                                <li className="breadcrumb-item active">Danh sách vai trò</li>
                            </ol>
                            
                            {/* Search - rộng hơn và canh trái */}
                            <div className="rule-search-bar flex-grow-1">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text" style={{ backgroundColor: '#fff' }}>
                                        <i className="fas fa-search text-muted"></i>
                                    </span>
                                    <LiveSearch 
                                        changeKeyword={setSearchText}
                                        placeholder="Tìm theo tên vai trò..."
                                    />
                                </div>
                            </div>
                        </div>
                            
                        {/* Actions - bên phải - chiếm 50% */}
                        <div className="rule-right-section d-flex align-items-center gap-2 justify-content-end">
                            {/* Nút xóa khi có vai trò được chọn */}
                            {selectedRows.length > 0 && (
                                <Permission permission={PERMISSIONS.ROLES_DELETE}>
                                    <button className="btn btn-danger btn-sm" onClick={() => multiDelete(selectedRows)}>
                                        <i className="fas fa-trash me-1"></i>
                                        <span className="d-none d-sm-inline">Xóa ({selectedRows.length})</span>
                                    </button>
                                </Permission>
                            )}
                            
                            {/* Nút tạo mới */}
                            <Permission permission={PERMISSIONS.ROLES_CREATE}>
                                <Link className="btn btn-primary btn-sm" to="/rule/add">
                                    <i className="fas fa-plus me-1"></i>
                                    <span className="d-none d-sm-inline">Tạo mới</span>
                                </Link>
                            </Permission>
                            
                            {/* Các button riêng lẻ - hiện trên >= 1280px */}
                            <div className="rule-action-buttons">
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
                            <div className="rule-action-dropdown">
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
                    
                    {/* Table Card */}
                    <div className="table-card-wrapper">
                        <div className="table-card">
                            <DataTables
                                name="Danh sách vai trò"
                                columns={columns}
                                data={roles}
                                numOfPages={numOfPages}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                setItemOfPage={setItemOfPage}
                                hideSearch={true}
                                selectedRows={selectedRows}
                                onSelectedRows={ (selectedRows) => setSelectedRows(selectedRows)}
                                tableHeight="calc(100vh - 220px)"
                            />
                        </div>
                    </div>
                </div>
            </main>
            <Modal show={showModal} onHide={() => {setShowModal(false); setItemDelete(null); setTypeDelete(null)}}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {typeDelete === 'single' ? (
                        <p>Bạn chắc chắn muốn xóa vai trò này?</p>
                    ) : (
                        <p>Bạn chắc chắn muốn xóa các vai trò này?</p>
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
    );
};

export default RuleList;
