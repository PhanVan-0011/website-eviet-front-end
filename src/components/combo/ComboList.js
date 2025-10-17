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
import moment from 'moment';
import { cleanHtml } from '../../helpers/formatData';
import {
    FilterSelectSingle,
    FilterSelectMulti,
    FilterButtonGroup,
    FilterDateRange,
    FilterToggleButton
} from '../common/FilterComponents';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const ComboList = () => {
    const [combos, setCombos] = useState([]);
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
        priceRange: 'all',
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

    // Lấy danh sách combo với filter
    useEffect(() => {
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${debouncedSearchText}`;
        
        // New filter panel filters
        if (filterValues.status && filterValues.status !== 'all') {
            query += `&is_active=${filterValues.status}`;
        }
        if (filterValues.dateRange?.from && filterValues.dateRange?.to) {
            query += `&start_date=${moment(filterValues.dateRange.from).format('YYYY-MM-DD')}`;
            query += `&end_date=${moment(filterValues.dateRange.to).format('YYYY-MM-DD')}`;
        }
        if (filterValues.priceRange && filterValues.priceRange !== 'all') {
            const [min, max] = filterValues.priceRange.split('-');
            if (min) query += `&min_price=${min}`;
            if (max) query += `&max_price=${max}`;
        }

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/combos${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setCombos(response.data.data);
            setNumOfPages(response.data.pagination ? response.data.pagination.last_page : 1);
        }).catch(() => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, debouncedSearchText, filterValues, refresh, dispatch]);

    // Sort logic
    const sortedCombos = [...combos].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'price') {
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
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Tên combo {renderSortIcon('name')}
                </span>
            ),
            element: row => row.name,
            width: "18%"
        },
    
         {
          title: "Hình ảnh",
          element: row => {
            let featured = null;
            if (Array.isArray(row.image_urls) && row.image_urls.length > 0) {
              featured = row.image_urls.find(img => img.is_featured) || row.image_urls[0];
            }
            return featured && featured.thumb_url ? (
              <ImageList src={urlImage + featured.thumb_url} alt={row.name} />
            ) : (
              <ImageList icon alt="Không có ảnh" />
            );
          },
          width: '12%'
        },
        {
            title: "Mô tả",
            element: row => (
                <div
                    style={{
                        maxWidth: 320,
                        maxHeight: 120,
                        overflow: 'auto',
                        whiteSpace: 'pre-line',
                        textOverflow: 'ellipsis'
                    }}
                    dangerouslySetInnerHTML={{ __html: cleanHtml(row.description) }}
                />
            ),
            width: "20%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('price')}>
                    Giá {renderSortIcon('price')}
                </span>
            ),
            element: row => (
                <div>
                    {Number(row.price).toLocaleString()} ₫
                </div>
            ),
            width: "10%"
        },
        {
            title: "Thời gian bắt đầu",
            element: row => row.start_date ? moment(row.start_date).format('HH:mm DD/MM/YYYY') : '',
            width: "12%"
        },
        {
            title: "Thời gian kết thúc",
            element: row => row.end_date ? moment(row.end_date).format('HH:mm DD/MM/YYYY') : '',
            width: "12%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('is_active')}>
                    Trạng thái {renderSortIcon('is_active')}
                </span>
            ),
            element: row => row.is_active
                ? <span className="badge bg-success">Hiển thị</span>
                : <span className="badge bg-secondary">Không hiển thị</span>,
            width: "10%"
        },
        {
            title: "Hành động",
            element: row => (
                
                <div className="d-flex align-items-center">
                     <Link className="btn btn-info btn-sm me-1" to={`/combo/detail/${row.id}`}>
                        <i className="fas fa-eye"></i>
                    </Link>
                    <Link className="btn btn-primary btn-sm me-1" to={`/combo/${row.id}`}>
                        <i className="fas fa-edit"></i>
                    </Link>
                    <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(row.id)}>
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ),
            width: "8%"
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
            requestApi(`api/admin/combos/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa combo thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa combo thất bại", toastErrorConfig);
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
            requestApi(`api/admin/combos/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa combo thành công!", toastSuccessConfig);
                    setSelectedRows([]); // Clear selected rows after successful deletion
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa combo thất bại", toastErrorConfig);
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
                        <li className="breadcrumb-item active">Danh sách combo</li>
                    </ol>
                    
                    {/* Layout chính với FilterPanel và nội dung */}
                    <div className="row g-0">
                        {/* Filter Panel */}
                        <div className={`position-relative filter-panel ${isFilterVisible ? 'col-md-2' : 'col-md-0'} transition-all d-flex flex-column`}>
                            {isFilterVisible && (
                                <div className="p-3 filter-content">
                                    {/* <h6 className="fw-bold mb-3 text-primary text-center" style={{ fontSize: '0.9rem' }}>
                                        <i className="fas fa-layer-group me-1"></i>
                                        Combo
                                    </h6> */}

                                    {/* Trạng thái */}
                                    <FilterSelectSingle
                                        label="Trạng thái"
                                        value={filterValues.status ? {
                                            value: filterValues.status,
                                            label: filterValues.status === 'all' ? 'Tất cả' : 
                                                   filterValues.status === 'true' ? 'Hiển thị' : 'Không hiển thị'
                                        } : null}
                                        onChange={(selected) => updateFilter('status', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: 'true', label: 'Hiển thị' },
                                            { value: 'false', label: 'Không hiển thị' }
                                        ]}
                                        placeholder="Chọn trạng thái"
                                    />

                                    {/* Khoảng giá */}
                                    <FilterSelectSingle
                                        label="Khoảng giá"
                                        value={filterValues.priceRange ? {
                                            value: filterValues.priceRange,
                                            label: filterValues.priceRange === 'all' ? 'Tất cả' : 
                                                   filterValues.priceRange === '0-10000' ? 'Dưới 10.000 ₫' :
                                                   filterValues.priceRange === '10000-20000' ? '10.000 ₫ - 20.000 ₫' :
                                                   filterValues.priceRange === '20000-40000' ? '20.000 ₫ - 40.000 ₫' :
                                                   filterValues.priceRange === '40000-70000' ? '40.000 ₫ - 70.000 ₫' :
                                                   filterValues.priceRange === '70000-100000' ? '70.000 ₫ - 100.000 ₫' :
                                                   filterValues.priceRange === '100000-200000' ? '100.000 ₫ - 200.000 ₫' :
                                                   filterValues.priceRange === '200000-' ? 'Trên 200.000 ₫' : filterValues.priceRange
                                        } : null}
                                        onChange={(selected) => updateFilter('priceRange', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: '0-10000', label: 'Dưới 10.000 ₫' },
                                            { value: '10000-20000', label: '10.000 ₫ - 20.000 ₫' },
                                            { value: '20000-40000', label: '20.000 ₫ - 40.000 ₫' },
                                            { value: '40000-70000', label: '40.000 ₫ - 70.000 ₫' },
                                            { value: '70000-100000', label: '70.000 ₫ - 100.000 ₫' },
                                            { value: '100000-200000', label: '100.000 ₫ - 200.000 ₫' },
                                            { value: '200000-', label: 'Trên 200.000 ₫' }
                                        ]}
                                        placeholder="Chọn khoảng giá"
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
                                                placeholder="Tìm kiếm theo tên combo, mô tả..."
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
                                            <Link className="btn btn-primary" to="/combo/add">
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
                                            Đang tìm kiếm: "<strong>{searchText}</strong>" - Tìm thấy {sortedCombos.length} kết quả
                                        </small>
                                    </div>
                                )}
                            </div>

                            {/* Header với tiêu đề */}
                            <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white flex-shrink-0">
                                <div className="d-flex align-items-center gap-2">
                                    <h4 className="mb-0 fw-bold text-primary">Danh sách combo</h4>
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
                                        name="Danh sách combo"
                                        columns={columns}
                                        data={sortedCombos}
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
                        <p>Bạn có chắc chắn muốn xóa combo này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các combo này?</p>
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

export default ComboList;