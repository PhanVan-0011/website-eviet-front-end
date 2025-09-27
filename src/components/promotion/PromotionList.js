import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTables from '../common/DataTables';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';
import moment from 'moment';
import ImageList from '../common/ImageList';
import {
    FilterSelectSingle,
    FilterSelectMulti,
    FilterButtonGroup,
    FilterDateRange,
    FilterToggleButton
} from '../common/FilterComponents';
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
            element: row => {
                return row.image && row.image.thumb_url ? (
                    <ImageList src={urlImage + row.image.thumb_url} alt={row.name} />
                ) : (
                    <ImageList icon alt="Không có ảnh" />
                );
            },
            width: "8%"
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
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Danh sách khuyến mãi</li>
                    </ol>
                    
                    {/* Layout chính với FilterPanel và nội dung */}
                    <div className="row g-0">
                        {/* Filter Panel */}
                        <div className={`position-relative filter-panel ${isFilterVisible ? 'col-md-2' : 'col-md-0'} transition-all d-flex flex-column`}>
                            {isFilterVisible && (
                                <div className="p-3 filter-content">
                                    {/* <h6 className="fw-bold mb-3 text-primary text-center" style={{ fontSize: '0.9rem' }}>
                                        <i className="fas fa-percent me-1"></i>
                                        Khuyến mãi
                                    </h6> */}

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
                            )}
                        </div>

                        {/* Nội dung chính */}
                        <div className={`main-content-area ${isFilterVisible ? 'col-md-10' : 'col-md-12'} transition-all d-flex flex-column ${!isFilterVisible ? 'expanded' : ''}`}>
                            {/* Header với nút thêm khuyến mãi */}
                            <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white flex-shrink-0">
                                <div className="d-flex align-items-center gap-2">
                                    <h4 className="mb-0 fw-bold text-primary">Danh sách khuyến mãi</h4>
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
                                <div className="d-flex gap-2">
                                    {/* Nút tạo mới */}
                                    <Permission permission={PERMISSIONS.PROMOTIONS_CREATE}>
                                        <Link className="btn btn-primary" to="/promotion/add">
                                            <i className="fas fa-plus me-1"></i> Tạo mới
                                        </Link>
                                    </Permission>
                                    
                                    {/* Nút xóa nhiều */}
                                    {selectedRows.length > 0 && (
                                        <Permission permission={PERMISSIONS.PROMOTIONS_DELETE}>
                                            <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}>
                                                <i className="fas fa-trash me-1"></i> Xóa ({selectedRows.length})
                                            </button>
                                        </Permission>
                                    )}
                                    
                                    {/* Các nút khác */}
                                    <button className="btn btn-outline-secondary">
                                        <i className="fas fa-upload me-1"></i> Import file
                                    </button>
                                    <button className="btn btn-outline-secondary">
                                        <i className="fas fa-download me-1"></i> Xuất file
                                    </button>
                                    <button className="btn btn-outline-secondary">
                                        <i className="fas fa-cog"></i>
                                    </button>
                                    <button className="btn btn-outline-secondary">
                                        <i className="fas fa-question-circle"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Search bar */}
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
                                                placeholder="Tìm kiếm theo tên, mã khuyến mãi..."
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
                                    <div className="col-md-4 text-end">
                                        {/* Có thể thêm các nút khác ở đây nếu cần */}
                                    </div>
                                </div>

                                {/* Search results info */}
                                {searchText && (
                                    <div className="search-results-info">
                                        <small>
                                            <i className="fas fa-info-circle me-1"></i>
                                            Đang tìm kiếm: "<strong>{searchText}</strong>" - Tìm thấy {sortedPromotions.length} kết quả
                                        </small>
                                    </div>
                                )}
                            </div>

                            {/* Data Table */}
                            <div className="flex-grow-1 overflow-auto">
                                <div className="p-3">
                                    <DataTables
                                        name="Danh sách khuyến mãi"
                                        columns={columns}
                                        data={sortedPromotions}
                                        numOfPages={numOfPages}
                                        currentPage={currentPage}
                                        setCurrentPage={setCurrentPage}
                                        setItemOfPage={setItemOfPage}
                                        onSelectedRows={setSelectedRows}
                                        hideSearch={true}
                                        showSummary={true}
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