import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import DataTables from '../common/DataTables';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button, Dropdown } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import ImageWithZoom from '../common/ImageWithZoom';
import {
    FilterSelectSingle,
    FilterSelectMulti,
    FilterButtonGroup,
    FilterDateRange,
    FilterToggleButton
} from '../common/FilterComponents';
import LiveSearch from '../common/LiveSearch';
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

    // Filter states
    const [filterValues, setFilterValues] = useState({
        status: 'all',
        type: 'all'
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);
    
    // Ref để track itemOfPage trước đó, tránh reset ở lần đầu mount
    const prevItemOfPageRef = useRef(itemOfPage);

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
        // Reset về trang 1 khi thay đổi số items/trang (không phải lần đầu mount)
        const itemOfPageChanged = prevItemOfPageRef.current !== itemOfPage && prevItemOfPageRef.current !== null;
        let pageToUse = currentPage;
        
        if (itemOfPageChanged && currentPage !== 1) {
            // Nếu itemOfPage thay đổi và đang không ở trang 1, reset về trang 1
            pageToUse = 1;
            setCurrentPage(1);
        }
        prevItemOfPageRef.current = itemOfPage;
        
        const filterTypeMap = {
            product: "App\\Models\\Product",
            combo: "App\\Models\\Combo",
            post: "App\\Models\\Post"
        };
        let query = `?limit=${itemOfPage}&page=${pageToUse}&keyword=${debouncedSearchText}`;
        
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
            // Chỉ update sliders khi có data, không clear nếu data rỗng
            if (response.data && response.data.data) {
                setSliders(response.data.data);
            }
            if (response.data && response.data.pagination && response.data.pagination.last_page) {
                setNumOfPages(response.data.pagination.last_page);
            }
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
                        return firstImg;
                    })()
                    : null;
                
                if (imageUrl && imageUrl.thumb_url) {
                    const thumbUrl = imageUrl.thumb_url.startsWith('http') ? imageUrl.thumb_url : urlImage + imageUrl.thumb_url;
                    const mainUrl = imageUrl.main_url 
                        ? (imageUrl.main_url.startsWith('http') ? imageUrl.main_url : urlImage + imageUrl.main_url)
                        : thumbUrl;
                    
                    return (
                        <ImageWithZoom
                            src={thumbUrl}
                            zoomSrc={mainUrl}
                            alt={row.title}
                        />
                    );
                }
                
                return <ImageWithZoom icon alt="Không có ảnh" />;
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
                return <span></span>;
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
                    {/* Header row: Breadcrumb + Search + Actions */}
                    <div className="d-flex align-items-center py-2 mt-2 mb-2 border-bottom slider-header-row">
                        {/* Left section: Breadcrumb + Search - chiếm 50% */}
                        <div className="slider-left-section d-flex align-items-center gap-3">
                            <ol className="breadcrumb mb-0 d-none d-md-flex flex-shrink-0" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                                <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                                <li className="breadcrumb-item active">Danh sách slider</li>
                            </ol>
                            
                            {/* Search - rộng hơn và canh trái */}
                            <div className="slider-search-bar flex-grow-1">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text" style={{ backgroundColor: '#fff' }}>
                                        <i className="fas fa-search text-muted"></i>
                                    </span>
                                    <LiveSearch 
                                        changeKeyword={setSearchText}
                                        placeholder="Tìm theo tiêu đề, mô tả..."
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Actions - bên phải - chiếm 50% */}
                        <div className="slider-right-section d-flex align-items-center gap-2 justify-content-end">
                            {/* Nút xóa khi có slider được chọn */}
                            {selectedRows.length > 0 && (
                                <button className="btn btn-danger btn-sm" onClick={multiDelete}>
                                    <i className="fas fa-trash me-1"></i> Xóa ({selectedRows.length})
                                </button>
                            )}
                            
                            {/* Nút tạo mới */}
                            <Link className="btn btn-primary btn-sm" to="/slider/add">
                                <i className="fas fa-plus me-1"></i>
                                <span className="d-none d-sm-inline">Tạo mới</span>
                            </Link>
                            
                            {/* Các button riêng lẻ - hiện trên >= 1280px */}
                            <div className="order-action-buttons">
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
                            <div className="order-action-dropdown">
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
                        {/* Filter Panel Card */}
                        {isFilterVisible && (
                            <div className="filter-card-wrapper" style={{ width: '240px', flexShrink: 0 }}>
                                <div className="filter-card">
                                    <div className="filter-card-content">
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
                                    tableHeight="calc(100vh - 220px)"
                                />
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