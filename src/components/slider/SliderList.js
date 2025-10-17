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
import {
    FilterSelectSingle,
    FilterSelectMulti,
    FilterButtonGroup,
    FilterDateRange,
    FilterToggleButton
} from '../common/FilterComponents';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const SliderList = () => {
    const [sliders, setSliders] = useState([]);
    const [numOfPages, setNumOfPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemOfPage, setItemOfPage] = useState(25);
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemDelete, setItemDelete] = useState(null);
    const [typeDelete, setTypeDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(Date.now());
    const [previewImage, setPreviewImage] = useState(null);

    // Filter states
    const [filterValues, setFilterValues] = useState({
        status: 'all',
        type: 'all'
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);

    // Sort states
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    // Debounce search text
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchText]);

    const updateFilter = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(prev => !prev);
    };

    // Lấy danh sách slider với filter
    useEffect(() => {
        const filterTypeMap = {
            product: "App\\Models\\Product",
            combo: "App\\Models\\Combo",
            post: "App\\Models\\Post"
        };
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${debouncedSearchText}`;
        
        // New filter panel filters
        if (filterValues.status && filterValues.status !== 'all') {
            query += `&is_active=${filterValues.status}`;
        }
        if (filterValues.type && filterValues.type !== 'all') {
            query += `&linkable_type=${filterTypeMap[filterValues.type]}`;
        }

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/sliders${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setSliders(response.data.data);
            setNumOfPages(response.data.pagination ? response.data.pagination.last_page : 1);
        }).catch(() => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, debouncedSearchText, filterValues, refresh, dispatch]);

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
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('is_active')}>
                    Trạng thái {renderSortIcon('is_active')}
                </span>
            ),
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
                    setSelectedRows([]); // Clear selected rows after successful deletion
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
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Danh sách slider</li>
                    </ol>
                    
                    {/* Layout chính với FilterPanel và nội dung */}
                    <div className="row g-0">
                        {/* Filter Panel */}
                        <div className={`position-relative filter-panel ${isFilterVisible ? 'col-md-2' : 'col-md-0'} transition-all d-flex flex-column`}>
                            {isFilterVisible && (
                                <div className="p-3 filter-content">
                                    {/* <h6 className="fw-bold mb-3 text-primary text-center" style={{ fontSize: '0.9rem' }}>
                                        <i className="fas fa-images me-1"></i>
                                        Slider
                                    </h6> */}

                                    {/* Trạng thái */}
                                    <FilterSelectSingle
                                        label="Trạng thái"
                                        value={filterValues.status ? {
                                            value: filterValues.status,
                                            label: filterValues.status === 'all' ? 'Tất cả' : 
                                                   filterValues.status === '1' ? 'Hiển thị' : 'Ẩn'
                                        } : null}
                                        onChange={(selected) => updateFilter('status', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: '1', label: 'Hiển thị' },
                                            { value: '0', label: 'Ẩn' }
                                        ]}
                                        placeholder="Chọn trạng thái"
                                    />

                                    {/* Loại liên kết */}
                                    <FilterSelectSingle
                                        label="Loại liên kết"
                                        value={filterValues.type ? {
                                            value: filterValues.type,
                                            label: filterValues.type === 'all' ? 'Tất cả' : 
                                                   filterValues.type === 'product' ? 'Sản phẩm' :
                                                   filterValues.type === 'combo' ? 'Combo' :
                                                   filterValues.type === 'post' ? 'Khuyến mãi' : filterValues.type
                                        } : null}
                                        onChange={(selected) => updateFilter('type', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: 'product', label: 'Sản phẩm' },
                                            { value: 'combo', label: 'Combo' },
                                            { value: 'post', label: 'Khuyến mãi' }
                                        ]}
                                        placeholder="Chọn loại liên kết"
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
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Tìm kiếm theo tiêu đề, mô tả..."
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
                                            {/* Nút xóa nhiều */}
                                            {selectedRows.length > 0 && (
                                                <button className="btn btn-danger" onClick={multiDelete}>
                                                    <i className="fas fa-trash me-1"></i> Xóa ({selectedRows.length})
                                                </button>
                                            )}
                                            
                                            {/* Nút tạo mới */}
                                            <Link className="btn btn-primary" to="/slider/add">
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
                                            Đang tìm kiếm: "<strong>{searchText}</strong>" - Tìm thấy {sortedSliders.length} kết quả
                                        </small>
                                    </div>
                                )}
                            </div>

                            {/* Header với tiêu đề */}
                            <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white flex-shrink-0">
                                <div className="d-flex align-items-center gap-2">
                                    <h4 className="mb-0 fw-bold text-primary">Danh sách slider</h4>
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
                                        name="Danh sách slider"
                                        columns={columns}
                                        data={sortedSliders}
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