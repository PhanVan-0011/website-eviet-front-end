import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTables from '../common/DataTables';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import moment from 'moment';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';
import {
    FilterSelectSingle,
    FilterSelectMulti,
    FilterButtonGroup,
    FilterDateRange,
    FilterToggleButton
} from '../common/FilterComponents';
import LiveSearch from '../common/LiveSearch';

const formatVND = (value) => {
    if (typeof value !== 'number' && typeof value !== 'string') return '';
    value = value.toString().replace(/\D/g, '');
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const SupplierList = () => {
    const [suppliers, setSuppliers] = useState([]);
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
        group: 'all',
        creationTime: { from: null, to: null },
        status: 'all',
        balanceDue: 'all'
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);

    // Data for filters
    const [groupSuppliers, setGroupSuppliers] = useState([]);

    const updateFilter = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(prev => !prev);
    };

    // Load filter data
    useEffect(() => {
        // Load groups từ API thật sự
        requestApi('api/admin/supplier-groups?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setGroupSuppliers(response.data.data);
            }
        }).catch((error) => {
            console.error('Lỗi khi tải danh sách nhóm nhà cung cấp:', error);
            setGroupSuppliers([]);
        });
    }, []);

    // Lấy danh sách nhà cung cấp với filter
    useEffect(() => {
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        
        // Filter panel filters
        if (filterValues.group && filterValues.group !== 'all') {
            query += `&group_id=${filterValues.group}`;
        }
        if (filterValues.creationTime?.from && filterValues.creationTime?.to) {
            query += `&start_date=${moment(filterValues.creationTime.from).format('YYYY-MM-DD')}`;
            query += `&end_date=${moment(filterValues.creationTime.to).format('YYYY-MM-DD')}`;
        }
        if (filterValues.status && filterValues.status !== 'all') {
            query += `&active=${filterValues.status === 'active' ? 1 : 0}`;
        }
        if (filterValues.balanceDue && filterValues.balanceDue !== 'all') {
            if (filterValues.balanceDue === 'has_debt') {
                query += `&balance_due_min=1`;
            } else if (filterValues.balanceDue === 'no_debt') {
                query += `&balance_due_max=0`;
            } else if (filterValues.balanceDue === 'overdue') {
                query += `&balance_due_min=1000000`; // Nợ trên 1 triệu
            }
        }

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/suppliers${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setSuppliers(response.data.data || []);
            setNumOfPages(response.data.pagination?.last_page || response.data.last_page || 1);
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, searchText, filterValues, refresh]);

    // Sort states
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    // Sort logic
    const sortedSuppliers = [...suppliers].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Xử lý sort cho các field đặc biệt
        if (sortField === 'total_purchase_amount' || sortField === 'balance_due') {
            aValue = Number(aValue) || 0;
            bValue = Number(bValue) || 0;
        } else if (sortField === 'created_at') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (sortField === 'name' || sortField === 'code' || sortField === 'email') {
            aValue = aValue ? aValue.toLowerCase() : '';
            bValue = bValue ? bValue.toLowerCase() : '';
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
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('code')}>
                    Mã NCC {renderSortIcon('code')}
                </span>
            ),
            element: row => row?.code || "",
            width: "8%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Tên nhà cung cấp {renderSortIcon('name')}
                </span>
            ),
            element: row => row?.name || "",
            width: "16%"
        },
        {
            title: "Nhóm",
            element: row => row?.group?.name || "Chưa phân nhóm",
            width: "9%"
        },
        {
            title: "Số điện thoại",
            element: row => row?.phone_number || "",
            width: "9%"
        },
        {
            title: "Email",
            element: row => row?.email || "",
            width: "11%"
        },
        {
            title: "Mã số thuế",
            element: row => row?.tax_code || "",
            width: "7%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('total_purchase_amount')}>
                    Tổng mua {renderSortIcon('total_purchase_amount')}
                </span>
            ),
            element: row => {
                if (!row || !row.total_purchase_amount) return <span>0 ₫</span>;
                return <span>{formatVND(parseInt(row.total_purchase_amount))} ₫</span>;
            },
            width: "12%",
            summarizable: true
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('balance_due')}>
                    Nợ cần trả {renderSortIcon('balance_due')}
                </span>
            ),
            element: row => {
                if (!row || !row.balance_due) return <span>0 ₫</span>;
                const amount = parseInt(row.balance_due);
                return <span>{formatVND(amount)} ₫</span>;
            },
            width: "12%",
            summarizable: true
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
                    Ngày tạo {renderSortIcon('created_at')}
                </span>
            ),
            element: row => {
                if (!row || !row.created_at) return <span>-</span>;
                return <span>{moment(row.created_at).format('DD/MM/YYYY')}</span>;
            },
            width: "8%"
        },
        {
            title: "Trạng thái",
            element: row => {
                if (!row) return <span className="badge bg-secondary">Không xác định</span>;
                return row.active === 1
                    ? <span className="badge bg-success">Hoạt động</span>
                    : <span className="badge bg-secondary">Không hoạt động</span>;
            },
            width: "7%"
        },
        {
            title: "Hành động",
            element: row => {
                if (!row || !row.id) return <div></div>;
                return (
                    <div className="d-flex align-items-center gap-1">
                        <Link
                            className="btn btn-info btn-sm px-2 py-1"
                            to={`/supplier/detail/${row.id}`}
                            title="Xem chi tiết"
                        >
                            <i className="fas fa-eye"></i>
                        </Link>
                        <Link
                            className="btn btn-primary btn-sm px-2 py-1"
                            to={`/supplier/${row.id}`}
                            title="Chỉnh sửa"
                        >
                            <i className="fas fa-edit"></i>
                        </Link>
                        <button
                            className="btn btn-danger btn-sm px-2 py-1"
                            onClick={() => handleDelete(row.id)}
                            title="Xóa"
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                );
            },
            width: "12%"
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
            requestApi(`api/admin/suppliers/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa nhà cung cấp thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa nhà cung cấp thất bại", toastErrorConfig);
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
            requestApi(`api/admin/suppliers/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa nhà cung cấp thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa nhà cung cấp thất bại", toastErrorConfig);
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
                        <li className="breadcrumb-item active">Danh sách nhà cung cấp</li>
                    </ol>
                    
                    {/* Layout chính với FilterPanel và nội dung */}
                    <div className="row g-0">
                        {/* Filter Panel */}
                        <div className={`position-relative filter-panel ${isFilterVisible ? 'col-md-2' : 'col-md-0'} transition-all d-flex flex-column`}>
                            {isFilterVisible && (
                                <div className="p-3 filter-content">
                                    {/* Nhóm nhà cung cấp */}
                                    <FilterSelectSingle
                                        label="Nhóm nhà cung cấp"
                                        value={filterValues.group ? {
                                            value: filterValues.group,
                                            label: filterValues.group === 'all' ? 'Tất cả' : 
                                                   groupSuppliers.find(g => g.id == filterValues.group)?.name || filterValues.group
                                        } : { value: 'all', label: 'Tất cả' }}
                                        onChange={(selected) => updateFilter('group', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            ...groupSuppliers.map(group => ({
                                                value: group.id,
                                                label: group.name
                                            }))
                                        ]}
                                        placeholder="Chọn nhóm"
                                    />

                                    {/* Thời gian tạo */}
                                    <FilterDateRange
                                        label="Thời gian tạo"
                                        value={filterValues.creationTime || { from: null, to: null }}
                                        onChange={(dateRange) => updateFilter('creationTime', dateRange)}
                                    />

                                    {/* Trạng thái */}
                                    <FilterSelectSingle
                                        label="Trạng thái"
                                        value={filterValues.status ? {
                                            value: filterValues.status,
                                            label: filterValues.status === 'all' ? 'Tất cả' : 
                                                   filterValues.status === 'active' ? 'Hoạt động' : 'Không hoạt động'
                                        } : { value: 'all', label: 'Tất cả' }}
                                        onChange={(selected) => updateFilter('status', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: 'active', label: 'Hoạt động' },
                                            { value: 'inactive', label: 'Không hoạt động' }
                                        ]}
                                        placeholder="Chọn trạng thái"
                                    />

                                    {/* Nợ cần trả */}
                                    <FilterSelectSingle
                                        label="Nợ cần trả"
                                        value={filterValues.balanceDue ? {
                                            value: filterValues.balanceDue,
                                            label: filterValues.balanceDue === 'all' ? 'Tất cả' : 
                                                   filterValues.balanceDue === 'has_debt' ? 'Có nợ' :
                                                   filterValues.balanceDue === 'no_debt' ? 'Không nợ' : 'Nợ lớn (>1M)'
                                        } : { value: 'all', label: 'Tất cả' }}
                                        onChange={(selected) => updateFilter('balanceDue', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: 'has_debt', label: 'Có nợ' },
                                            { value: 'no_debt', label: 'Không nợ' },
                                            { value: 'overdue', label: 'Nợ lớn (>1M)' }
                                        ]}
                                        placeholder="Chọn mức nợ"
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
                                            <LiveSearch 
                                                changeKeyword={setSearchText}
                                                placeholder="Tìm kiếm theo tên, mã NCC..."
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="d-flex justify-content-end gap-2">
                                            {/* Nút xóa khi có nhà cung cấp được chọn */}
                                            {selectedRows.length > 0 && (
                                                <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}>
                                                    <i className="fas fa-trash me-1"></i> Xóa ({selectedRows.length})
                                                </button>
                                            )}
                                            
                                            {/* Nút tạo mới */}
                                            <Link className="btn btn-primary" to="/supplier/add">
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
                                            Đang tìm kiếm: "<strong>{searchText}</strong>" - Tìm thấy {sortedSuppliers.length} kết quả
                                        </small>
                                    </div>
                                )}
                            </div>

                            {/* Header với tiêu đề */}
                            <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white flex-shrink-0">
                                <div className="d-flex align-items-center gap-2">
                                    <h4 className="mb-0 fw-bold text-primary">Danh sách nhà cung cấp</h4>
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
                                        name="Danh sách nhà cung cấp"
                                        columns={columns}
                                        data={sortedSuppliers}
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
            
            {/* Delete Modal */}
            <Modal show={showModal} onHide={() => {setShowModal(false); setItemDelete(null); setTypeDelete(null)}}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {typeDelete === 'single' ? (
                        <p>Bạn có chắc chắn muốn xóa nhà cung cấp này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các nhà cung cấp này?</p>
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
    );
};

export default SupplierList;
