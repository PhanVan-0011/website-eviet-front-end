import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTables from '../common/DataTables'
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import { formatDate } from '../../tools/formatData';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig'
const CategoriesList = () => {
    const [categories, setCategories] = useState([]);
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
        // { title: "ID", element: row => row.id },
        { 
            title: "Tên danh mục", 
            element: row => row.name,
            width: "18%"
        },
        { 
            title: "Mô tả", 
            element: row => row.description,
            width: "20%"
        },
        // { title: "Danh mục cha", element: row => row.parent ? row.parent.name : "" },
        { 
            title: "Ngày tạo", 
            element: row => formatDate(row.created_at),
            width: "13%"
        },
        { 
            title: "Ngày cập nhật", 
            element: row => formatDate(row.updated_at),
            width: "13%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }}>
                    Sản phẩm
                </span>
            ),
            element: row => (
                <Link
                    to={`/product?category_id=${row.id}`}
                    className="text-decoration-underline text-primary"
                    title="Xem danh sách sản phẩm"
                    style={{ cursor: 'pointer' }}
                >
                    {row.products_count} sản phẩm
                </Link>
            ),
            width: "14%"
        },
        {
            title: "Trạng thái",
            element: row => row.status === 1
                ? <span className="badge bg-success">Hiển thị</span>
                : <span className="badge bg-secondary">Ẩn</span>,
            width: "10%"
        },
        {
            title: "Hành động", 
            element: row => (
                <>
                    <Link className="btn btn-primary btn-sm me-1" to={`/category/${row.id}`}><i className="fas fa-edit"></i></Link>
                    <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(row.id)}><i className="fas fa-trash"></i></button>
                </>
            ),
            width: "12%"
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
            requestApi(`api/admin/categories/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa danh mục thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa danh mục thất bại", toastErrorConfig);
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
            requestApi(`api/admin/categories/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa danh mục thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa danh mục thất bại", toastErrorConfig);
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
        const query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/categories${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setCategories(response.data.data);
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
                        <li className="breadcrumb-item active">Danh sách danh mục</li>
                    </ol>
                    {/* Search bar với các nút action */}
                    <div className="p-3 border-bottom bg-light search-bar">
                        <div className="row align-items-center">
                            <div className="col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="fas fa-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tìm kiếm theo tên danh mục..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                    {searchText && (
                                        <button 
                                            className="btn btn-outline-secondary btn-sm"
                                            type="button"
                                            onClick={() => setSearchText('')}
                                            title="Xóa tìm kiếm"
                                            style={{
                                                borderLeft: 'none',
                                                borderRadius: '0 0.375rem 0.375rem 0',
                                                backgroundColor: '#f8f9fa',
                                                color: '#6c757d'
                                            }}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="d-flex justify-content-end gap-2">
                                    {/* Nút tạo mới */}
                                    <Link className="btn btn-primary" to="/category/add">
                                        <i className="fas fa-plus me-1"></i> Tạo mới
                                    </Link>
                                    
                                    {/* Nút xóa nhiều */}
                                    {selectedRows.length > 0 && (
                                        <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}>
                                            <i className="fas fa-trash me-1"></i> Xóa ({selectedRows.length})
                                        </button>
                                    )}
                                    
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
                                    Đang tìm kiếm: "<strong>{searchText}</strong>" - Tìm thấy {categories.length} kết quả
                                </small>
                            </div>
                        )}
                    </div>

                    {/* Header với tiêu đề */}
                    <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white flex-shrink-0">
                        <div className="d-flex align-items-center gap-2">
                            <h4 className="mb-0 fw-bold text-primary">Danh sách danh mục</h4>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="flex-grow-1 overflow-auto">
                        <div className="p-3">
                            <DataTables 
                                name="Danh sách danh mục"
                                columns={columns}
                                data={categories}
                                numOfPages={numOfPages}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                setItemOfPage={setItemOfPage}
                                hideSearch={true}
                                onSelectedRows={ (selectedRows) => setSelectedRows(selectedRows)}
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
                        <p>Bạn có chắc chắn muốn xóa danh mục này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các danh mục này?</p>
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

export default CategoriesList