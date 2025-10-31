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
import moment from 'moment';

const formatVND = (value) => {
    if (typeof value !== 'number' && typeof value !== 'string') return '';
    value = value.toString().replace(/\D/g, '');
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const ImportList = () => {
    const [invoices, setInvoices] = useState([]);
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
    const [suppliers, setSuppliers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [users, setUsers] = useState([]);
   
    // Filter states
    const [filterValues, setFilterValues] = useState({
        suppliers: [],
        branches: [],
        users: [],
        creationTime: { from: null, to: null },
        invoiceStatus: 'all'
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);

    // Sort states
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    const updateFilter = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(prev => !prev);
    };

    // Lấy dữ liệu cho filter
    useEffect(() => {
        // Lấy nhà cung cấp
        requestApi('api/admin/suppliers?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setSuppliers(response.data.data);
        });

        // Lấy chi nhánh
        requestApi('api/admin/branches?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setBranches(response.data.data);
        });

        // Lấy người dùng
        requestApi('api/admin/users?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setUsers(response.data.data);
        });
    }, []);

    // Gọi lại API khi filter thay đổi
    useEffect(() => {
        let query = `?page=${currentPage}&limit=${itemOfPage}`;
        
        // Tìm kiếm keyword (mã phiếu)
        if (searchText) query += `&keyword=${searchText}`;
        
        // Lọc nhà cung cấp
        if (filterValues.suppliers && filterValues.suppliers.length > 0) {
            query += `&supplier_id=${filterValues.suppliers[0].value}`;
        }
        
        // Lọc chi nhánh
        if (filterValues.branches && filterValues.branches.length > 0) {
            query += `&branch_id=${filterValues.branches[0].value}`;
        }
        
        // Lọc người nhập
        if (filterValues.users && filterValues.users.length > 0) {
            query += `&user_id=${filterValues.users[0].value}`;
        }
        
        // Lọc trạng thái
        if (filterValues.invoiceStatus && filterValues.invoiceStatus !== 'all') {
            query += `&status=${filterValues.invoiceStatus}`;
        }
        
        // Lọc khoảng ngày tạo
        if (filterValues.creationTime?.from && filterValues.creationTime?.to) {
            query += `&start_date=${filterValues.creationTime.from.toISOString().split('T')[0]}`;
            query += `&end_date=${filterValues.creationTime.to.toISOString().split('T')[0]}`;
        }

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/purchase-invoices${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setInvoices(response.data.data);
            setNumOfPages(response.data.pagination.last_page);
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
            console.log('Error:', error);
        });
    }, [
        currentPage,
        itemOfPage,
        searchText,
        filterValues,
        refresh
    ]);

    // Sort products
    const sortedInvoices = [...invoices].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'supplier') {
            aValue = a.supplier ? a.supplier.name : '';
            bValue = b.supplier ? b.supplier.name : '';
        }
        if (sortField === 'branch') {
            aValue = a.branch ? a.branch.name : '';
            bValue = b.branch ? b.branch.name : '';
        }
        if (sortField === 'status') {
            aValue = a.status;
            bValue = b.status;
        }

        if (sortField === 'total_amount' || sortField === 'amount_owed' || sortField === 'paid_amount' || 
            sortField === 'subtotal_amount' || sortField === 'discount_amount' || 
            sortField === 'total_quantity' || sortField === 'total_items') {
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

    // Tính tổng cho các cột
    const calculateTotals = () => {
        return sortedInvoices.reduce((totals, invoice) => {
            return {
                totalQuantity: totals.totalQuantity + (Number(invoice.total_quantity) || 0),
                totalItems: totals.totalItems + (Number(invoice.total_items) || 0),
                totalSubtotalAmount: totals.totalSubtotalAmount + (Number(invoice.subtotal_amount) || 0),
                totalDiscountAmount: totals.totalDiscountAmount + (Number(invoice.discount_amount) || 0),
                totalAmount: totals.totalAmount + (Number(invoice.total_amount) || 0),
                totalPaidAmount: totals.totalPaidAmount + (Number(invoice.paid_amount) || 0)
            };
        }, {
            totalQuantity: 0,
            totalItems: 0,
            totalSubtotalAmount: 0,
            totalDiscountAmount: 0,
            totalAmount: 0,
            totalPaidAmount: 0
        });
    };

    const totals = calculateTotals();

    // Handle sort
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Icon sort
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
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('invoice_code')}>
                    Mã phiếu nhập {renderSortIcon('invoice_code')}
                </span>
            ),
            element: row => (
                <span className="text-primary fw-bold">{row?.invoice_code || '-'}</span>
            ),
            width: "10%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('invoice_date')}>
                    Thời gian {renderSortIcon('invoice_date')}
                </span>
            ),
            element: row => {
                if (!row?.invoice_date) return '-';
                // Parse và cộng thêm 7 giờ
                return moment(row.invoice_date).add(7, 'hours').format('DD/MM/YYYY HH:mm');
            },
            width: "12%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('supplier')}>
                    Mã NCC {renderSortIcon('supplier')}
                </span>
            ),
            element: row => row?.supplier?.code || '-',
            width: "8%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('supplier')}>
                    Nhà cung cấp {renderSortIcon('supplier')}
                </span>
            ),
            element: row => row?.supplier?.name || '-',
            width: "12%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('branch')}>
                    Chi nhánh {renderSortIcon('branch')}
                </span>
            ),
            element: row => row?.branch?.name || '-',
            width: "10%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('total_quantity')}>
                    Tổng số lượng {renderSortIcon('total_quantity')}
                </span>
            ),
            element: row => row?.total_quantity ? `${row.total_quantity}` : '0',
            width: "8%",
            summarizable: true
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('total_items')}>
                    Số mặt hàng {renderSortIcon('total_items')}
                </span>
            ),
            element: row => row?.total_items ? `${row.total_items}` : '0',
            width: "8%",
            summarizable: true
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('subtotal_amount')}>
                    Tổng tiền hàng {renderSortIcon('subtotal_amount')}
                </span>
            ),
            element: row => row?.subtotal_amount ? `${formatVND(parseInt(row.subtotal_amount))} ₫` : '0 ₫',
            width: "10%",
            summarizable: true
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('discount_amount')}>
                    Giảm giá {renderSortIcon('discount_amount')}
                </span>
            ),
            element: row => row?.discount_amount ? `${formatVND(parseInt(row.discount_amount))} ₫` : '0 ₫',
            width: "8%",
            summarizable: true
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('total_amount')}>
                    Cần trả NCC {renderSortIcon('total_amount')}
                </span>
            ),
            element: row => row?.total_amount ? `${formatVND(parseInt(row.total_amount))} ₫` : '0 ₫',
            width: "10%",
            summarizable: true
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('paid_amount')}>
                    Tiền trả NCC {renderSortIcon('paid_amount')}
                </span>
            ),
            element: row => row?.paid_amount ? `${formatVND(parseInt(row.paid_amount))} ₫` : '0 ₫',
            width: "10%",
            summarizable: true
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('amount_owed')}>
                    Nợ cần trả {renderSortIcon('amount_owed')}
                </span>
            ),
            element: row => row?.amount_owed ? `${formatVND(parseInt(row.amount_owed))} ₫` : '0 ₫',
            width: "10%",
            summarizable: true
        },
        {
            title: "Trạng thái",
            element: row => {
                const statusMap = {
                    'draft': { label: 'Nháp', class: 'bg-secondary' },
                    'received': { label: 'Đã nhập hàng', class: 'bg-success' },
                    'cancelled': { label: 'Đã hủy', class: 'bg-danger' }
                };
                const status = statusMap[row?.status] || { label: row?.status || '-', class: 'bg-secondary' };
                return <span className={`badge ${status.class}`}>{status.label}</span>;
            },
            width: "10%"
        },
        {
            title: "Hành động", 
            element: row => (
                <div className="d-flex align-items-center gap-1">
                    {/* Xem chi tiết - luôn hiển thị */}
                    <Link className="btn btn-info btn-sm" to={`/import/detail/${row.id}`} title="Xem chi tiết">
                        <i className="fas fa-eye"></i>
                    </Link>
                    
                    {/* Sửa - hiển thị cả draft và received */}
                    {(row?.status === 'draft' || row?.status === 'received') && (
                        <Link className="btn btn-primary btn-sm" to={`/import/edit/${row.id}`} title="Chỉnh sửa">
                            <i className="fas fa-edit"></i>
                        </Link>
                    )}
                    
                    {/* Xóa - hiển thị cả draft và received */}
                    {(row?.status === 'draft' || row?.status === 'received') && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)} title="Xóa">
                            <i className="fas fa-trash"></i>
                        </button>
                    )}

                    {/* Hủy phiếu nếu đã nhập hàng */}
                    {row?.status === 'received' && (
                        <button className="btn btn-warning btn-sm" onClick={() => handleCancel(row.id)} title="Hủy phiếu">
                            <i className="fas fa-times-circle"></i>
                        </button>
                    )}
                </div>
            ),
            width: "8%"
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
        // Kiểm tra xem có phiếu nào ở trạng thái 'draft' được chọn không
        const draftInvoices = selectedRows.filter(id => {
            const invoice = sortedInvoices.find(inv => String(inv.id) === String(id));
            return invoice && invoice.status === 'draft';
        });
        
        if (draftInvoices.length === 0) {
            toast.error("Chỉ có thể xóa phiếu ở trạng thái Nháp!", toastErrorConfig);
            return;
        }
        
        if (draftInvoices.length !== selectedRows.length) {
            toast.warning("Chỉ các phiếu ở trạng thái Nháp mới có thể được xóa!", toastSuccessConfig);
        }
        
        setTypeDelete('multi');
        setShowModal(true);
    }

    // Delete
    const requestApiDelete = () => {
        dispatch(actions.controlLoading(true));
        if(typeDelete === 'single'){
            requestApi(`api/admin/purchase-invoices/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa phiếu nhập hàng thành công!", toastSuccessConfig);
                    setSelectedRows([]);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa phiếu nhập hàng thất bại", toastErrorConfig);
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
            // Lọc chỉ các phiếu ở trạng thái 'draft'
            const draftInvoiceIds = selectedRows.filter(id => {
                const invoice = invoices.find(inv => String(inv.id) === String(id));
                return invoice && invoice.status === 'draft';
            });
            
            if (draftInvoiceIds.length === 0) {
                toast.error("Không có phiếu nào ở trạng thái Nháp để xóa!", toastErrorConfig);
                setShowModal(false);
                return;
            }
            
            requestApi(`api/admin/purchase-invoices/multi-delete?ids=${draftInvoiceIds.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa phiếu nhập hàng thành công!", toastSuccessConfig);
                    setSelectedRows([]);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa phiếu nhập hàng thất bại", toastErrorConfig);
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

    // Handle Cancel Invoice
    const handleCancel = (id) => {
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/purchase-invoices/${id}/cancel`, 'PUT', {}).then((response) => {
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Hủy phiếu nhập hàng thành công!", toastSuccessConfig);
                setRefresh(Date.now());
            } else {
                toast.error(response.data.message || "Hủy phiếu nhập hàng thất bại", toastErrorConfig);
            }
        }).catch((e) => {
            dispatch(actions.controlLoading(false));
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Server error", toastErrorConfig);
            }
        });
    }

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Danh sách nhập hàng</li>
                    </ol>
                    
                    {/* Layout chính với FilterPanel và nội dung */}
                    <div className="row g-0">
                        {/* Filter Panel */}
                        <div className={`position-relative filter-panel ${isFilterVisible ? 'col-md-2' : 'col-md-0'} transition-all d-flex flex-column`}>
                            {isFilterVisible && (
                                <div className="p-3 filter-content">
                                    {/* Nhà cung cấp */}
                                    <FilterSelectMulti
                                        label="Nhà cung cấp"
                                        value={filterValues.suppliers || []}
                                        onChange={(selected) => updateFilter('suppliers', selected || [])}
                                        options={suppliers.map(supplier => ({
                                            value: supplier.id,
                                            label: supplier.name
                                        }))}
                                        placeholder="Chọn nhà cung cấp"
                                    />

                                    {/* Chi nhánh */}
                                    <FilterSelectMulti
                                        label="Chi nhánh"
                                        value={filterValues.branches || []}
                                        onChange={(selected) => updateFilter('branches', selected || [])}
                                        options={branches.map(branch => ({
                                            value: branch.id,
                                            label: branch.name
                                        }))}
                                        placeholder="Chọn chi nhánh"
                                    />

                                    {/* Người nhập */}
                                    <FilterSelectMulti
                                        label="Người nhập"
                                        value={filterValues.users || []}
                                        onChange={(selected) => updateFilter('users', selected || [])}
                                        options={users.map(user => ({
                                            value: user.id,
                                            label: user.name
                                        }))}
                                        placeholder="Chọn người nhập"
                                    />

                                    {/* Trạng thái */}
                                    <FilterSelectSingle
                                        label="Trạng thái"
                                        value={filterValues.invoiceStatus ? {
                                            value: filterValues.invoiceStatus,
                                            label: filterValues.invoiceStatus === 'all' ? 'Nháp và đã nhập hàng' : 
                                                   filterValues.invoiceStatus === 'draft' ? 'Nháp' : 
                                                   filterValues.invoiceStatus === 'received' ? 'Đã nhập hàng' : 'Đã hủy'
                                        } : null}
                                        onChange={(selected) => updateFilter('invoiceStatus', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Nháp và đã nhập hàng' },
                                            { value: 'draft', label: 'Nháp' },
                                            { value: 'received', label: 'Đã nhập hàng' },
                                            { value: 'cancelled', label: 'Đã hủy' }
                                        ]}
                                        placeholder="Chọn trạng thái"
                                    />

                                    {/* Thời gian tạo */}
                                    <FilterDateRange
                                        label="Thời gian tạo"
                                        value={filterValues.creationTime || { from: null, to: null }}
                                        onChange={(dateRange) => updateFilter('creationTime', dateRange)}
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
                                                placeholder="Tìm kiếm theo mã phiếu..."
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="d-flex justify-content-end gap-2">
                                            {/* Nút xóa khi có phiếu draft được chọn */}
                                            {selectedRows.length > 0 && selectedRows.some(id => {
                                                const invoice = invoices.find(inv => String(inv.id) === String(id));
                                                return invoice && invoice.status === 'draft';
                                            }) && (
                                                <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}>
                                                    <i className="fas fa-trash me-1"></i> Xóa ({selectedRows.length})
                                                </button>
                                            )}
                                            
                                            {/* Nút tạo mới */}
                                            <Link className="btn btn-primary" to="/import/add">
                                                <i className="fas fa-plus me-1"></i> Tạo mới
                                            </Link>
                                            
                                            {/* Các nút khác */}
                                            <button className="btn btn-secondary">
                                                <i className="fas fa-download me-1"></i> Xuất file
                                            </button>
                                            <button className="btn btn-secondary">
                                                <i className="fas fa-cog"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Search results info */}
                                {searchText && (
                                    <div className="search-results-info">
                                        <small>
                                            <i className="fas fa-info-circle me-1"></i>
                                            Đang tìm kiếm: "<strong>{searchText}</strong>" - Tìm thấy {sortedInvoices.length} kết quả
                                        </small>
                                    </div>
                                )}
                            </div>

                            {/* Header với tiêu đề */}
                            <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white flex-shrink-0">
                                <div className="d-flex align-items-center gap-2">
                                    <h4 className="mb-0 fw-bold text-primary">Danh sách nhập hàng</h4>
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
                                        name="Danh sách nhập hàng"
                                        columns={columns}
                                        data={sortedInvoices}
                                        numOfPages={numOfPages}
                                        currentPage={currentPage}
                                        setCurrentPage={setCurrentPage}
                                        setItemOfPage={setItemOfPage}
                                        selectedRows={selectedRows}
                                        onSelectedRows={selectedRows => setSelectedRows(selectedRows)}
                                        hideSearch={true}
                                        showSummary={true}
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
                        <p>Bạn có chắc chắn muốn xóa phiếu nhập hàng này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các phiếu nhập hàng này?</p>
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

export default ImportList
