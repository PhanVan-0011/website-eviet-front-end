import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTables from '../common/DataTables';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import ImageList from '../common/ImageList';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const SliderList = () => {
    const [sliders, setSliders] = useState([]);
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
    const [previewImage, setPreviewImage] = useState(null);

    // Bộ lọc
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');

    // Sort states
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    // Lấy danh sách slider với filter
    useEffect(() => {
        const filterTypeMap = {
            product: "App\\Models\\Product",
            combo: "App\\Models\\Combo",
            post: "App\\Models\\Post"
        };
         let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        if (filterStatus !== '') query += `&is_active=${filterStatus}`;
        if (filterType) query += `&linkable_type=${filterType}`;

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/sliders${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setSliders(response.data.data);
            setNumOfPages(response.data.pagination ? response.data.pagination.last_page : 1);
        }).catch(() => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, searchText, filterStatus, filterType, refresh, dispatch]);

    // Sort logic
    const sortedSliders = [...sliders].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'display_order') {
            aValue = Number(aValue);
            bValue = Number(bValue);
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

    // Columns
    const columns = [
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('title')}>
                    Tiêu đề {renderSortIcon('title')}
                </span>
            ),
            element: row => row.title,
            width: "18%"
        },
        {
            title: "Hình ảnh",
            element: row => {
                // Lấy ảnh đầu tiên từ mảng image_urls hoặc ảnh featured
                const imageUrl = row.image_urls && row.image_urls.length > 0 
                    ? (() => {
                        const featuredImg = row.image_urls.find(img => img.is_featured === 1);
                        const firstImg = featuredImg || row.image_urls[0];
                        return firstImg.thumb_url || firstImg.main_url;
                    })()
                    : null;
                
                const fullImageUrl = imageUrl 
                    ? (imageUrl.startsWith('http') ? imageUrl : urlImage + imageUrl)
                    : null;

                return (
                    <>
                        {fullImageUrl ? (
                            <ImageList 
                                src={fullImageUrl} 
                                alt={row.title}  
                                onClick={() => setPreviewImage(fullImageUrl)} 
                            />
                        ) : (
                            <div style={{ 
                                width: 60, 
                                height: 40, 
                                background: '#f8f9fa', 
                                border: '1px solid #dee2e6',
                                borderRadius: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i className="fas fa-image text-muted"></i>
                            </div>
                        )}
                        {/* Modal xem ảnh lớn */}
                        {previewImage && (
                            <div
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100vw',
                                    height: '100vh',
                                    background: 'rgba(0,0,0,0.7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 9999
                                }}
                                onClick={() => setPreviewImage(null)}
                            >
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '90vw',
                                        maxHeight: '90vh',
                                        borderRadius: 8,
                                        boxShadow: '0 2px 16px rgba(0,0,0,0.3)'
                                    }}
                                    onClick={e => e.stopPropagation()}
                                />
                            </div>
                        )}
                    </>
                );
            },
            width: "12%"
        },
        {
            title: "Mô tả",
            element: row => row.description,
            width: "20%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('display_order')}>
                    Thứ tự {renderSortIcon('display_order')}
                </span>
            ),
            element: row => row.display_order,
            width: "10%"
        },
        {
            title: "Trạng thái",
            element: row => row.is_active
                ? <span className="badge bg-success">Hiển thị</span>
                : <span className="badge bg-secondary">Ẩn</span>,
            width: "10%"
        },
        {
            title: "Loại liên kết",
            element: row => {
                if (row.linkable_type === "App\\Models\\Product") {
                    return <span className="badge bg-info text-dark">Sản phẩm</span>;
                }
                if (row.linkable_type === "App\\Models\\Combo") {
                    return <span className="badge bg-warning text-dark">Combo</span>;
                }
                if (row.linkable_type === "App\\Models\\Post") {
                    return <span className="badge bg-primary">Khuyến mãi</span>;
                }
                return <span className="badge bg-secondary">-</span>;
            },
            width: "12%"
        },
        {
            title: "Hành động",
            element: row => (
                <div className="d-flex align-items-center">
                    <Link className="btn btn-primary btn-sm me-1" to={`/slider/${row.id}`}>
                        <i className="fas fa-edit"></i>
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ),
            width: "10%"
        }
    ];

    // Delete logic
    const handleDelete = (id) => {
        setItemDelete(id);
        setTypeDelete('single');
        setShowModal(true);
    };
    const multiDelete = () => {
        setTypeDelete('multi');
        setShowModal(true);
    };
    const requestApiDelete = () => {
        dispatch(actions.controlLoading(true));
        if (typeDelete === 'single') {
            requestApi(`api/admin/sliders/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa slider thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa slider thất bại", toastErrorConfig);
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
            requestApi(`api/admin/sliders/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa slider thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa slider thất bại", toastErrorConfig);
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
    };

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4">Danh sách slider</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Slider</li>
                    </ol>
                    <div className='mb-3'>
                        <Link className="btn btn-primary me-2 add-custom-btn" to="/slider/add">
                            <i className="fas fa-plus"></i> Thêm slider
                        </Link>
                        {selectedRows.length > 0 && (
                            <button className="btn btn-danger add-custom-btn" onClick={() => multiDelete(selectedRows)}>
                                <i className="fas fa-trash"></i> Xóa ({selectedRows.length})
                            </button>
                        )}
                    </div>
                    {/* Bộ lọc */}
                    <div className="row mb-3 g-2 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label fw-semibold mb-1" htmlFor="filterStatus">
                                <i className="fas fa-toggle-on me-1"></i>Trạng thái
                            </label>
                            <select
                                id="filterStatus"
                                className="form-select form-select-sm shadow-sm form-rounded-sm"
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="1">Hiển thị</option>
                                <option value="0">Ẩn</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold mb-1" htmlFor="filterType">
                                <i className="fas fa-link me-1"></i>Loại liên kết
                            </label>
                            <select
                                id="filterType"
                                className="form-select form-select-sm shadow-sm form-rounded-sm"
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="product">Sản phẩm</option>
                                <option value="combo">Combo</option>
                                <option value="post">Khuyến mãi</option>
                            </select>
                        </div>
                    </div>
                    <DataTables
                        name="Dữ liệu slider"
                        columns={columns}
                        data={sortedSliders}
                        numOfPages={numOfPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        setItemOfPage={setItemOfPage}
                        changeKeyword={setSearchText}
                        onSelectedRows={setSelectedRows}
                    />
                </div>
            </main>
            <Modal show={showModal} onHide={() => { setShowModal(false); setItemDelete(null); setTypeDelete(null); }}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {typeDelete === 'single' ? (
                        <p>Bạn có chắc chắn muốn xóa slider này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các slider này?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={requestApiDelete}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SliderList;