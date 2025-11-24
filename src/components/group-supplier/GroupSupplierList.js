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
                    <Link className="btn btn-primary btn-sm" to={`/group-supplier/${row.id}/edit`} title="Chỉnh sửa">
                        <i className="fas fa-edit"></i>
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)} title="Xóa">
                        <i className="fas fa-trash"></i>
                    </button>
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
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/supplier-groups${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setGroupSuppliers(response.data.data);
            setNumOfPages(response.data.pagination.last_page);
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, searchText, refresh]);

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Danh sách nhóm nhà cung cấp</li>
                    </ol>
                    
                    {/* Layout chính */}
                    <div className="row g-0">
                        {/* Nội dung chính */}
                        <div className="col-md-12 d-flex flex-column">
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
                                        placeholder="Tìm kiếm theo tên nhóm nhà cung cấp..."
                                    />
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="d-flex justify-content-end gap-2">
                                    {/* Nút xóa nhiều */}
                                    {selectedRows.length > 0 && (
                                        <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}>
                                            <i className="fas fa-trash me-1"></i> Xóa ({selectedRows.length})
                                        </button>
                                    )}
                                    
                                    {/* Nút tạo mới */}
                                    <Link className="btn btn-primary" to="/group-supplier/add">
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
                                    Đang tìm kiếm: "<strong>{searchText}</strong>" - Tìm thấy {groupSuppliers.length} kết quả
                                </small>
                            </div>
                        )}
                    </div>

                            {/* Data Table */}
                            <div className="flex-grow-1 overflow-auto">
                                <div className="p-3">
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
                                    />
                                </div>
                            </div>
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
