import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import DataTables from '../common/DataTables'
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

const GroupSupplierList = () => {
    const [groupSuppliers, setGroupSuppliers] = useState([]);
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
        { 
            title: "Tên nhóm nhà cung cấp", 
            element: row => row.name,
            width: "25%"
        },
        { 
            title: "Mô tả", 
            element: row => row.description || 'Không có mô tả',
            width: "30%"
        },
        { 
            title: "Ngày tạo", 
            element: row => formatDate(row.created_at),
            width: "15%"
        },
        { 
            title: "Ngày cập nhật", 
            element: row => formatDate(row.updated_at),
            width: "20%"
        },
        {
            title: "Hành động", 
            element: row => (
                <div className="d-flex gap-1">
                    {/* Ẩn nút xem chi tiết */}
                    {/* <Link className="btn btn-info btn-sm" to={`/group-supplier/${row.id}`} title="Xem chi tiết">
                        <i className="fas fa-eye"></i>
                    </Link> */}
                    <Permission permission={PERMISSIONS.GROUP_SUPPLIERS_UPDATE}>
                        <Link className="btn btn-primary btn-sm" to={`/group-supplier/${row.id}/edit`} title="Chỉnh sửa">
                            <i className="fas fa-edit"></i>
                        </Link>
                    </Permission>
                    <Permission permission={PERMISSIONS.GROUP_SUPPLIERS_DELETE}>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)} title="Xóa">
                            <i className="fas fa-trash"></i>
                        </button>
                    </Permission>
                </div>
            ),
            width: "15%"
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
            requestApi(`api/admin/supplier-groups/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa nhóm nhà cung cấp thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa nhóm nhà cung cấp thất bại", toastErrorConfig);
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
            requestApi(`api/admin/supplier-groups/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa nhóm nhà cung cấp thành công!", toastSuccessConfig);
                    setSelectedRows([]); // Clear selected rows after successful deletion
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa nhóm nhà cung cấp thất bại", toastErrorConfig);
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
        
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/supplier-groups${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            // Chỉ update groupSuppliers khi có data, không clear nếu data rỗng
            if (response.data && response.data.data) {
                setGroupSuppliers(response.data.data);
            }
            if (response.data && response.data.pagination && response.data.pagination.last_page) {
                setNumOfPages(response.data.pagination.last_page);
            }
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, searchText, refresh]);

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    {/* Header row: Breadcrumb + Search + Actions */}
                    <div className="d-flex align-items-center py-2 mt-2 mb-2 border-bottom group-supplier-header-row">
                        {/* Left section: Breadcrumb + Search - chiếm 50% */}
                        <div className="group-supplier-left-section d-flex align-items-center gap-3">
                            {/* Breadcrumb - ẩn trên tablet */}
                            <ol className="breadcrumb mb-0 d-none d-md-flex flex-shrink-0" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                                <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                                <li className="breadcrumb-item active">Danh sách nhóm nhà cung cấp</li>
                            </ol>
                            
                            {/* Search - rộng hơn và canh trái */}
                            <div className="group-supplier-search-bar flex-grow-1">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text" style={{ backgroundColor: '#fff' }}>
                                        <i className="fas fa-search text-muted"></i>
                                    </span>
                                    <LiveSearch 
                                        changeKeyword={setSearchText}
                                        placeholder="Tìm theo tên nhóm nhà cung cấp..."
                                    />
                                </div>
                            </div>
                        </div>
                            
                        {/* Actions - bên phải - chiếm 50% */}
                        <div className="group-supplier-right-section d-flex align-items-center gap-2 justify-content-end">
                            {/* Nút xóa khi có nhóm được chọn */}
                            {selectedRows.length > 0 && (
                                <Permission permission={PERMISSIONS.GROUP_SUPPLIERS_DELETE}>
                                    <button className="btn btn-danger btn-sm" onClick={() => multiDelete(selectedRows)}>
                                        <i className="fas fa-trash me-1"></i>
                                        <span className="d-none d-sm-inline">Xóa ({selectedRows.length})</span>
                                    </button>
                                </Permission>
                            )}
                            
                            {/* Nút tạo mới */}
                            <Permission permission={PERMISSIONS.GROUP_SUPPLIERS_CREATE}>
                                <Link className="btn btn-primary btn-sm" to="/group-supplier/add">
                                    <i className="fas fa-plus me-1"></i>
                                    <span className="d-none d-sm-inline">Tạo mới</span>
                                </Link>
                            </Permission>
                            
                            {/* Các button riêng lẻ - hiện trên >= 1280px */}
                            <div className="group-supplier-action-buttons">
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
                            <div className="group-supplier-action-dropdown">
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
                                name="Danh sách nhóm nhà cung cấp"
                                columns={columns}
                                data={groupSuppliers}
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
                        <p>Bạn có chắc chắn muốn xóa nhóm nhà cung cấp này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các nhóm nhà cung cấp này?</p>
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

export default GroupSupplierList
