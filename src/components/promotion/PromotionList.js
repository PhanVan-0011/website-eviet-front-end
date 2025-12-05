import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTables from '../common/DataTables';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button, Dropdown } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';
import moment from 'moment';
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

const PromotionList = () => {
    const [promotions, setPromotions] = useState([]);
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
        type: 'all',
        applicationType: 'all',
        dateRange: { from: null, to: null }
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

    // Lấy danh sách promotion với filter
    useEffect(() => {
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${debouncedSearchText}`;
        
        // New filter panel filters
        if (filterValues.status && filterValues.status !== 'all') {
            query += `&is_active=${filterValues.status}`;
        }
        if (filterValues.type && filterValues.type !== 'all') {
            query += `&type=${filterValues.type}`;
        }
        if (filterValues.applicationType && filterValues.applicationType !== 'all') {
            query += `&application_type=${filterValues.applicationType}`;
        }
        if (filterValues.dateRange?.from && filterValues.dateRange?.to) {
            query += `&start_date=${moment(filterValues.dateRange.from).format('YYYY-MM-DD')}`;
            query += `&end_date=${moment(filterValues.dateRange.to).format('YYYY-MM-DD')}`;
        }

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/promotions${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setPromotions(response.data.data);
            setNumOfPages(response.data.pagination ? response.data.pagination.last_page : 1);
        }).catch(() => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, debouncedSearchText, filterValues, refresh, dispatch]);

    // Sort logic
    const sortedPromotions = [...promotions].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'value') {
            aValue = Number(aValue);
            bValue = Number(bValue);
        } else if (sortField === 'name') {
            aValue = a.name || '';
            bValue = b.name || '';
        } else if (sortField === 'code') {
            aValue = a.code || '';
            bValue = b.code || '';
        } else if (sortField === 'application_type') {
            aValue = a.application_type || '';
            bValue = b.application_type || '';
        } else if (sortField === 'type') {
            aValue = a.type || '';
            bValue = b.type || '';
        } else if (sortField === 'is_active') {
            aValue = a.is_active ? 1 : 0;
            bValue = b.is_active ? 1 : 0;
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
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Tên khuyến mãi {renderSortIcon('name')}
                </span>
            ),
            element: row => row.name,
            width: "14%"
        },
        {
            title: "Hình ảnh",
            element: row => (
                row.image && row.image.thumb_url ? (
                    <ImageWithZoom
                        src={urlImage + row.image.thumb_url}
                        zoomSrc={row.image.main_url ? urlImage + row.image.main_url : urlImage + row.image.thumb_url}
                        alt={row.name}
                    />
                ) : (
                    <ImageWithZoom icon alt="Không có ảnh" />
                )
            ),
            width: "12%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('code')}>
                    Mã code {renderSortIcon('code')}
                </span>
            ),
            element: row => <span className="badge bg-info text-dark">{row.code}</span>,
            width: "10%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('application_type')}>
                    Áp dụng cho {renderSortIcon('application_type')}
                </span>
            ),
            element: row => {
                if (row.application_type === "orders") return <span className="badge bg-secondary">Đơn hàng</span>;
                if (row.application_type === "products") return <span className="badge bg-primary">Sản phẩm</span>;
                if (row.application_type === "categories") return <span className="badge bg-warning text-dark">Danh mục</span>;
                if (row.application_type === "combos") return <span className="badge bg-success">Combo</span>;
                return <span className="badge bg-secondary">-</span>;
            },
            width: "12%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('type')}>
                    Hình thức {renderSortIcon('type')}
                </span>
            ),
            element: row => {
                if (row.type === 'percentage') return <span className="badge bg-success">%</span>;
                if (row.type === 'fixed_amount') return <span className="badge bg-info text-dark">VNĐ</span>;
                if (row.type === 'free_shipping') return <span className="badge bg-primary">Miễn phí ship</span>;
                return <span className="badge bg-secondary">-</span>;
            },
            width: "10%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('value')}>
                    Giá trị {renderSortIcon('value')}
                </span>
            ),
            element: row => {
                if (row.type === 'percentage') return `${row.value}%`;
                if (row.type === 'fixed_amount') return <span className="fw-bold text-danger">{row.value?.toLocaleString()} ₫</span>;
                if (row.type === 'free_shipping') return <span className="text-success">Miễn phí vận chuyển</span>;
                return '-';
            },
            width: "10%"
        },
        {
            title: "Thời gian",
            element: row => (
                <div>
                    <div>
                        <span className="text-secondary small">Từ: </span>
                        {row.dates?.start_date ? moment(row.dates.start_date).format('HH:mm DD/MM/YYYY') : '-'}
                    </div>
                    <div>
                        <span className="text-secondary small">Đến: </span>
                        {row.dates?.end_date ? moment(row.dates.end_date).format('HH:mm DD/MM/YYYY') : '-'}
                    </div>
                </div>
            ),
            width: "16%"
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
            width: "8%"
        },
        {
            title: "Tình trạng",
            element: row => (
                <span className="badge bg-info text-dark">{row.status_text}</span>
            ),
            width: "8%"
        },
        {
            title: "Hành động",
            element: row => (
                <div className="d-flex align-items-center">
                    <Permission permission={PERMISSIONS.PROMOTIONS_VIEW}>
                        <Link className="btn btn-info btn-sm me-1" to={`/promotion/detail/${row.id}`}>
                            <i className="fas fa-eye"></i>
                        </Link>
                    </Permission>
                    <Permission permission={PERMISSIONS.PROMOTIONS_UPDATE}>
                        <Link className="btn btn-primary btn-sm me-1" to={`/promotion/${row.id}`}>
                            <i className="fas fa-edit"></i>
                        </Link>
                    </Permission>
                    <Permission permission={PERMISSIONS.PROMOTIONS_DELETE}>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
                            <i className="fas fa-trash"></i>
                        </button>
                    </Permission>
                </div>
            ),
            width: "14%"
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
            requestApi(`api/admin/promotions/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa khuyến mãi thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa khuyến mãi thất bại", toastErrorConfig);
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
            requestApi(`api/admin/promotions/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa khuyến mãi thành công!", toastSuccessConfig);
                    setSelectedRows([]); // Clear selected rows after successful deletion
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa khuyến mãi thất bại", toastErrorConfig);
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
                    <div className="d-flex align-items-center py-2 mt-2 mb-2 border-bottom order-header-row" style={{ justifyContent: 'space-between', gap: '0.5rem' }}>
                        {/* Left section: Breadcrumb */}
                        <div className="d-flex align-items-center flex-shrink-0">
                            <ol className="breadcrumb mb-0 d-none d-md-flex" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                                <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                                <li className="breadcrumb-item active">Danh sách khuyến mãi</li>
                            </ol>
                        </div>
                        
                        {/* Search - ở giữa */}
                        <div className="order-search-bar" style={{ margin: '0 auto' }}>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text" style={{ backgroundColor: '#fff' }}>
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <LiveSearch 
                                    changeKeyword={setSearchText}
                                    placeholder="Tìm theo tên, mã khuyến mãi..."
                                />
                            </div>
                        </div>
                        
                        {/* Actions - bên phải */}
                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                            {/* Nút xóa khi có khuyến mãi được chọn */}
                            <Permission permission={PERMISSIONS.PROMOTIONS_DELETE}>
                                {selectedRows.length > 0 && (
                                    <button className="btn btn-danger btn-sm" onClick={() => multiDelete(selectedRows)}>
                                        <i className="fas fa-trash me-1"></i> Xóa ({selectedRows.length})
                                    </button>
                                )}
                            </Permission>
                            
                            {/* Nút tạo mới */}
                            <Permission permission={PERMISSIONS.PROMOTIONS_CREATE}>
                                <Link className="btn btn-primary btn-sm" to="/promotion/add">
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
                                    {/* Trạng thái khuyến mãi */}
                                    <FilterSelectSingle
                                        label="Trạng thái"
                                        value={filterValues.status ? {
                                            value: filterValues.status,
                                            label: filterValues.status === 'all' ? 'Tất cả' : 
                                                   filterValues.status === 'true' ? 'Hiển thị' : 'Ẩn'
                                        } : null}
                                        onChange={(selected) => updateFilter('status', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: 'true', label: 'Hiển thị' },
                                            { value: 'false', label: 'Ẩn' }
                                        ]}
                                        placeholder="Chọn trạng thái"
                                    />

                                    {/* Loại khuyến mãi */}
                                    <FilterSelectSingle
                                        label="Loại khuyến mãi"
                                        value={filterValues.type ? {
                                            value: filterValues.type,
                                            label: filterValues.type === 'all' ? 'Tất cả' : 
                                                   filterValues.type === 'percentage' ? 'Phần trăm (%)' :
                                                   filterValues.type === 'fixed_amount' ? 'Tiền cố định (VNĐ)' :
                                                   filterValues.type === 'free_shipping' ? 'Miễn phí ship' : filterValues.type
                                        } : null}
                                        onChange={(selected) => updateFilter('type', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: 'percentage', label: 'Phần trăm (%)' },
                                            { value: 'fixed_amount', label: 'Tiền cố định (VNĐ)' },
                                            { value: 'free_shipping', label: 'Miễn phí ship' }
                                        ]}
                                        placeholder="Chọn loại"
                                    />

                                    {/* Áp dụng cho */}
                                    <FilterSelectSingle
                                        label="Áp dụng cho"
                                        value={filterValues.applicationType ? {
                                            value: filterValues.applicationType,
                                            label: filterValues.applicationType === 'all' ? 'Tất cả' : 
                                                   filterValues.applicationType === 'orders' ? 'Đơn hàng' :
                                                   filterValues.applicationType === 'products' ? 'Sản phẩm' :
                                                   filterValues.applicationType === 'categories' ? 'Danh mục' :
                                                   filterValues.applicationType === 'combos' ? 'Combo' : filterValues.applicationType
                                        } : null}
                                        onChange={(selected) => updateFilter('applicationType', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: 'orders', label: 'Đơn hàng' },
                                            { value: 'products', label: 'Sản phẩm' },
                                            { value: 'categories', label: 'Danh mục' },
                                            { value: 'combos', label: 'Combo' }
                                        ]}
                                        placeholder="Chọn loại áp dụng"
                                    />

                                    {/* Thời gian áp dụng */}
                                    <FilterDateRange
                                        label="Thời gian áp dụng"
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
                                        name="Danh sách khuyến mãi"
                                        columns={columns}
                                        data={sortedPromotions}
                                        numOfPages={numOfPages}
                                        currentPage={currentPage}
                                        setCurrentPage={setCurrentPage}
                                        setItemOfPage={setItemOfPage}
                                        selectedRows={selectedRows}
                                        onSelectedRows={setSelectedRows}
                                        hideSearch={true}
                                        showSummary={true}
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
                        <p>Bạn có chắc chắn muốn xóa khuyến mãi này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các khuyến mãi này?</p>
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

export default PromotionList;