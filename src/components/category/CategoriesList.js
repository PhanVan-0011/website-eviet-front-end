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
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';
import {
    FilterButtonGroup,
    FilterDateRange,
    FilterToggleButton
} from '../common/FilterComponents';
import ImageWithZoom from '../common/ImageWithZoom';
import LiveSearch from '../common/LiveSearch';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

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

    // Filter states
    const [filterValues, setFilterValues] = useState({
        status: 'all',
        dateRange: { from: null, to: null }
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);
    
    // Ref để track itemOfPage trước đó, tránh reset ở lần đầu mount
    const prevItemOfPageRef = useRef(itemOfPage);

    const updateFilter = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(prev => !prev);
    };

    const columns = [
        // { title: "ID", element: row => row.id },
        { 
            title: "Tên danh mục", 
            element: row => row.name,
            width: "18%"
        },
        { 
            title: "Icon", 
            element: row => {
                // Kiểm tra xem có icon không
                if (row.icon) {
                    return (
                        <ImageWithZoom
                            src={urlImage + row.icon}
                            zoomSrc={urlImage + row.icon}
                            alt={row.name}
                        />
                    );
                } else {
                    return <ImageWithZoom icon alt="Không có icon" />;
                }
            },
            width: "12%"
        },
        { 
            title: "Mô tả", 
            element: row => row.description,
            width: "18%"
        },
        { 
            title: "Loại danh mục", 
            element: row => {
                const typeLabels = {
                    'product': 'Sản phẩm',
                    'post': 'Bài viết',
                    'all': 'Tất cả'
                };
                const typeBadges = {
                    'product': 'bg-primary',
                    'post': 'bg-info',
                    'all': 'bg-secondary'
                };
                const type = row.type || 'all';
                return (
                    <span className={`badge ${typeBadges[type] || 'bg-secondary'}`}>
                        {typeLabels[type] || type}
                    </span>
                );
            },
            width: "12%"
        },
        // { title: "Danh mục cha", element: row => row.parent ? row.parent.name : "" },
        { 
            title: "Ngày tạo", 
            element: row => formatDate(row.created_at),
            width: "10%"
        },
        { 
            title: "Ngày cập nhật", 
            element: row => formatDate(row.updated_at),
            width: "10%"
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
            width: "12%"
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
                <div className="d-flex gap-1">
                    <Permission permission={PERMISSIONS.CATEGORIES_UPDATE}>
                        <Link className="btn btn-primary btn-sm" to={`/category/${row.id}`} title="Chỉnh sửa">
                            <i className="fas fa-edit"></i>
                        </Link>
                    </Permission>
                    <Permission permission={PERMISSIONS.CATEGORIES_DELETE}>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)} title="Xóa">
                            <i className="fas fa-trash"></i>
                        </button>
                    </Permission>
                </div>
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
                    setSelectedRows([]); // Clear selected rows after successful deletion
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
        
        // Thêm filter status
        if (filterValues.status !== 'all') {
            query += `&status=${filterValues.status === 'active' ? '1' : '0'}`;
        }
        
        // Thêm filter date range
        if (filterValues.dateRange.from && filterValues.dateRange.to) {
            const startDate = filterValues.dateRange.from.toISOString().split('T')[0];
            const endDate = filterValues.dateRange.to.toISOString().split('T')[0];
            query += `&start_date=${startDate}&end_date=${endDate}`;
        }
        
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/categories${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            // Chỉ update categories khi có data, không clear nếu data rỗng
            if (response.data && response.data.data) {
                setCategories(response.data.data);
            }
            if (response.data && response.data.pagination && response.data.pagination.last_page) {
                setNumOfPages(response.data.pagination.last_page);
            }
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, searchText, refresh, filterValues]);

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    {/* Header row: Breadcrumb + Search + Actions */}
                    <div className="d-flex align-items-center py-2 mt-2 mb-2 border-bottom category-header-row">
                        {/* Left section: Breadcrumb + Search - chiếm 50% */}
                        <div className="category-left-section d-flex align-items-center gap-3">
                            <ol className="breadcrumb mb-0 d-none d-md-flex flex-shrink-0" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                                <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                                <li className="breadcrumb-item active">Danh sách danh mục</li>
                            </ol>
                            
                            {/* Search - rộng hơn và canh trái */}
                            <div className="category-search-bar flex-grow-1">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text" style={{ backgroundColor: '#fff' }}>
                                        <i className="fas fa-search text-muted"></i>
                                    </span>
                                    <LiveSearch 
                                        changeKeyword={setSearchText}
                                        placeholder="Tìm theo tên danh mục..."
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Actions - bên phải - chiếm 50% */}
                        <div className="category-right-section d-flex align-items-center gap-2 justify-content-end">
                            {/* Nút xóa khi có danh mục được chọn */}
                            {selectedRows.length > 0 && (
                                <Permission permission={PERMISSIONS.CATEGORIES_DELETE}>
                                    <button className="btn btn-danger btn-sm" onClick={() => multiDelete(selectedRows)}>
                                        <i className="fas fa-trash me-1"></i> Xóa ({selectedRows.length})
                                    </button>
                                </Permission>
                            )}
                            
                            {/* Nút tạo mới */}
                            <Permission permission={PERMISSIONS.CATEGORIES_CREATE}>
                                <Link className="btn btn-primary btn-sm" to="/category/add">
                                    <i className="fas fa-plus me-1"></i>
                                    <span className="d-none d-sm-inline">Tạo mới</span>
                                </Link>
                            </Permission>
                            
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
                                        <FilterButtonGroup
                                            label="Trạng thái"
                                            value={filterValues.status || 'all'}
                                            onChange={(value) => updateFilter('status', value)}
                                            options={[
                                                { value: 'all', label: 'Tất cả' },
                                                { value: 'active', label: 'Hiển thị' },
                                                { value: 'inactive', label: 'Không hiển thị' }
                                            ]}
                                        />

                                        {/* Thời gian tạo */}
                                        <FilterDateRange
                                            label="Thời gian tạo"
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
                                    name="Danh sách danh mục"
                                    columns={columns}
                                    data={categories}
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