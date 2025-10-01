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

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [numOfPages, setNumOfPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemOfPage, setItemOfPage] = useState(25);
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [refresh, setRefresh] = useState(Date.now());

    // Filter states
    const [filterValues, setFilterValues] = useState({
        status: 'all',
        paymentMethod: 'all',
        orderDate: { from: null, to: null },
        customer: 'all'
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);

    // Sort states
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    // Data for filters
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [customers, setCustomers] = useState([]);


    const updateFilter = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(prev => !prev);
    };

    // Load filter data
    useEffect(() => {
        // Load payment methods
        requestApi('api/admin/payment-methods?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setPaymentMethods(response.data.data);
            }
        }).catch(() => {
            setPaymentMethods([
                { id: 1, name: 'Tiền mặt' },
                { id: 2, name: 'Chuyển khoản' },
                { id: 3, name: 'Thẻ tín dụng' }
            ]);
        });

        // Load customers
        requestApi('api/admin/customers?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setCustomers(response.data.data);
            }
        }).catch(() => {
            setCustomers([
                { id: 1, name: 'Khách lẻ' },
                { id: 2, name: 'Khách VIP' }
            ]);
        });
    }, []);

    // Lấy danh sách đơn hàng với filter
    useEffect(() => {
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        
        // New filter panel filters
        if (filterValues.status && filterValues.status !== 'all') {
            query += `&status=${filterValues.status}`;
        }
        if (filterValues.paymentMethod && filterValues.paymentMethod !== 'all') {
            query += `&payment_method_code=${filterValues.paymentMethod}`;
        }
        if (filterValues.orderDate?.from && filterValues.orderDate?.to) {
            query += `&start_date=${moment(filterValues.orderDate.from).format('YYYY-MM-DD')}`;
            query += `&end_date=${moment(filterValues.orderDate.to).format('YYYY-MM-DD')}`;
        }
        if (filterValues.customer && filterValues.customer !== 'all') {
            query += `&customer_id=${filterValues.customer}`;
        }

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/orders${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setOrders(response.data.data);
            setNumOfPages(response.data.last_page || 1);
        }).catch(() => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, searchText, filterValues, refresh]);

    // Sort logic
    const sortedOrders = [...orders].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'total_amount') {
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
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('order_code')}>
                    Mã đơn hàng{renderSortIcon('order_code')}
                </span>
            ),
            element: row => row.order_code,
            width: "8%"
        },
        
        {
            title: "Khách hàng",
            element: row => (
                <div>
                    <div>{row.client_name}</div>
                    <div className="text-muted" style={{ fontSize: 13 }}>{row.client_phone}</div>
                 
                </div>
            ),
            width: "16%"
        },
        {
            title: "Địa chỉ giao",
            element: row => row.shipping_address,
            width: "18%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('total_amount')}>
                    Tổng tiền {renderSortIcon('total_amount')}
                </span>
            ),
            element: row => (
                <span className="fw-bold text-danger">{formatVND(row.total_amount)} ₫</span>
            ),
            width: "12%",
            summarizable: true
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('order_date')}>
                    Thời gian đặt hàng {renderSortIcon('order_date')}
                </span>
            ),
            element: row => (
                <>
                    <span>{moment(row.order_date).format('HH:mm')}</span><br />
                    <span>{moment(row.order_date).format('DD-MM-YYYY')}</span>
                </>
            ),
            width: "12%"
        },
                {
            title: "Người tạo đơn",
            element: row => row.user ? row.user.name : "",
            width: "11%"
        },
        {
            title: "Trạng thái",
            element: row => {
                let color = "secondary";
                let text = "Chờ xử lý";
                switch (row.status) {
                    case "pending":
                        color = "warning";
                        text = "Chờ xử lý";
                        break;
                    case "processing":
                        color = "info";
                        text = "Đang xử lý";
                        break;
                    case "shipped":
                        color = "primary";
                        text = "Đã gửi hàng";
                        break;
                    case "delivered":
                        color = "success";
                        text = "Đã giao";
                        break;
                    case "cancelled":
                        color = "danger";
                        text = "Đã hủy";
                        break;
                    default:
                        color = "secondary";
                        text = row.status;
                }
                return <span className={`badge bg-${color}`}>{text}</span>;
            },
            width: "10%"
        },

        {
            title: "Hành động",
            element: row => (
                <div className="d-flex align-items-center flex-wrap gap-2">
                    {/* Xem chi tiết: ORDERS_VIEW */}
                    <Permission permission={PERMISSIONS.ORDERS_VIEW}>
                        <Link
                            className="btn btn-primary btn-sm px-2 py-1"
                            to={`/order/detail/${row.id}`}
                            title="Xem chi tiết"
                        >
                            <i className="fas fa-eye"></i>
                        </Link>
                    </Permission>
                    {/* Duyệt đơn (pending -> processing): ORDERS_UPDATE_STATUS */}
                    {row.status === 'pending' && (
                        <>
                            <Permission permission={PERMISSIONS.ORDERS_UPDATE_STATUS}>
                                <button
                                    className="btn btn-success btn-sm px-2 py-1"
                                    onClick={() => handleUpdateStatus(row.id, 'processing')}
                                    title="Duyệt đơn hàng"
                                >
                                    <i className="fas fa-check me-1"></i> Duyệt
                                </button>
                            </Permission>
                            <Permission permission={PERMISSIONS.ORDERS_CANCEL}>
                                <button
                                    className="btn btn-danger btn-sm px-2 py-1"
                                    onClick={() => handleUpdateStatus(row.id, 'cancelled')}
                                    title="Hủy đơn hàng"
                                >
                                    <i className="fas fa-times me-1"></i> Hủy
                                </button>
                            </Permission>
                        </>
                    )}
                    {/* Xác nhận giao hàng (processing -> shipped): ORDERS_UPDATE_STATUS */}
                    {row.status === 'processing' && (
                        <>
                            <Permission permission={PERMISSIONS.ORDERS_UPDATE_STATUS}>
                                <button
                                    className="btn btn-warning btn-sm px-2 py-1"
                                    onClick={() => handleUpdateStatus(row.id, 'shipped')}
                                    title="Xác nhận đã gửi hàng"
                                >
                                    <i className="fas fa-truck me-1"></i> Gửi hàng
                                </button>
                            </Permission>
                            <Permission permission={PERMISSIONS.ORDERS_CANCEL}>
                                <button
                                    className="btn btn-danger btn-sm px-2 py-1"
                                    onClick={() => handleUpdateStatus(row.id, 'cancelled')}
                                    title="Hủy đơn hàng"
                                >
                                    <i className="fas fa-times me-1"></i> Hủy
                                </button>
                            </Permission>
                        </>
                    )}
                    {/* Xác nhận giao thành công (shipped -> delivered): ORDERS_UPDATE_STATUS */}
                    {row.status === 'shipped' && (
                        <>
                            <Permission permission={PERMISSIONS.ORDERS_UPDATE_STATUS}>
                                <button
                                    className="btn btn-info btn-sm px-2 py-1"
                                    onClick={() => handleUpdateStatus(row.id, 'delivered')}
                                    title="Xác nhận đã giao"
                                >
                                    <i className="fas fa-box-open me-1"></i> Đã giao
                                </button>
                            </Permission>
                            <Permission permission={PERMISSIONS.ORDERS_CANCEL}>
                                <button
                                    className="btn btn-danger btn-sm px-2 py-1"
                                    onClick={() => handleUpdateStatus(row.id, 'cancelled')}
                                    title="Hủy đơn hàng"
                                >
                                    <i className="fas fa-times me-1"></i> Hủy
                                </button>
                            </Permission>
                        </>
                    )}
                </div>
            ),
            width: "20%"
        }
    ];

    // // Delete logic
    // const handleDelete = (id) => {
    //     setItemDelete(id);
    //     setTypeDelete('single');
    //     setShowModal(true);
    // };
    // const multiDelete = () => {
    //     setTypeDelete('multi');
    //     setShowModal(true);
    // };
    // const requestApiDelete = () => {
    //     dispatch(actions.controlLoading(true));
    //     if (typeDelete === 'single') {
    //         requestApi(`api/orders/${itemDelete}`, 'DELETE', []).then((response) => {
    //             dispatch(actions.controlLoading(false));
    //             setShowModal(false);
    //             if (response.data && response.data.success) {
    //                 toast.success(response.data.message || "Xóa đơn hàng thành công!", toastSuccessConfig);
    //                 setRefresh(Date.now());
    //             } else {
    //                 toast.error(response.data.message || "Xóa đơn hàng thất bại", toastErrorConfig);
    //             }
    //         }).catch((e) => {
    //             dispatch(actions.controlLoading(false));
    //             setShowModal(false);
    //             if (e.response && e.response.data && e.response.data.message) {
    //                 toast.error(e.response.data.message, toastErrorConfig);
    //             } else {
    //                 toast.error("Server error", toastErrorConfig);
    //             }
    //         });
    //     } else {
    //         requestApi(`api/orders/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
    //             dispatch(actions.controlLoading(false));
    //             setShowModal(false);
    //             if (response.data && response.data.success) {
    //                 toast.success(response.data.message || "Xóa đơn hàng thành công!", toastSuccessConfig);
    //                 setRefresh(Date.now());
    //             } else {
    //                 toast.error(response.data.message || "Xóa đơn hàng thất bại", toastErrorConfig);
    //             }
    //         }).catch((e) => {
    //             dispatch(actions.controlLoading(false));
    //             setShowModal(false);
    //             if (e.response && e.response.data && e.response.data.message) {
    //                 toast.error(e.response.data.message, toastErrorConfig);
    //             } else {
    //                 toast.error("Server error", toastErrorConfig);
    //             }
    //         });
    //     }
    // };

    // Thêm hàm xử lý duyệt đơn hàng
    const handleApproveOrder = async (orderId) => {
        try {
            dispatch(actions.controlLoading(true));
            const res = await requestApi(`api/admin/orders/${orderId}/approve`, 'POST', {});
            dispatch(actions.controlLoading(false));
            if (res.data && res.data.success) {
                toast.success(res.data.message || "Duyệt đơn hàng thành công!");
                setRefresh(Date.now());
            } else {
                toast.error(res.data.message || "Duyệt đơn hàng thất bại!");
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            toast.error("Lỗi khi duyệt đơn hàng!");
        }
    };

    // Hàm cập nhật trạng thái đơn hàng
    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            dispatch(actions.controlLoading(true));
            const res = await requestApi(`api/admin/orders/${orderId}/status`, 'PUT', { status: newStatus });
            dispatch(actions.controlLoading(false));
            if (res.data && res.data.success) {
                toast.success(res.data.message || "Cập nhật trạng thái thành công!",  toastSuccessConfig);
                setRefresh(Date.now());
            } else {
                toast.error(res.data.message || "Cập nhật trạng thái thất bại!", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            toast.error("Lỗi khi cập nhật trạng thái!", toastErrorConfig);
        }
    };

    // Lấy danh sách phương thức thanh toán từ API khi load trang
    useEffect(() => {
        requestApi('api/payment-methods', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                const activeMethods = response.data.data.filter(m => m.is_active);
                setPaymentMethods(activeMethods);
            }
        });
    }, []);

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Danh sách đơn hàng</li>
                    </ol>
                    
                    {/* Layout chính với FilterPanel và nội dung */}
                    <div className="row g-0">
                        {/* Filter Panel */}
                        <div className={`position-relative filter-panel ${isFilterVisible ? 'col-md-2' : 'col-md-0'} transition-all d-flex flex-column`}>
                            {isFilterVisible && (
                                <div className="p-3 filter-content">
                                    {/* <h6 className="fw-bold mb-3 text-primary text-center" style={{ fontSize: '0.9rem' }}>
                                        <i className="fas fa-filter me-1"></i>
                                        Đơn hàng
                                    </h6> */}

                                    {/* Trạng thái đơn hàng */}
                                    <FilterSelectSingle
                                        label="Trạng thái đơn hàng"
                                        value={filterValues.status ? {
                                            value: filterValues.status,
                                            label: filterValues.status === 'all' ? 'Tất cả' :
                                                   filterValues.status === 'pending' ? 'Chờ xử lý' :
                                                   filterValues.status === 'processing' ? 'Đang xử lý' :
                                                   filterValues.status === 'shipped' ? 'Đã gửi hàng' :
                                                   filterValues.status === 'delivered' ? 'Đã giao' :
                                                   filterValues.status === 'cancelled' ? 'Đã hủy' : filterValues.status
                                        } : { value: 'all', label: 'Tất cả' }}
                                        onChange={(selected) => updateFilter('status', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: 'pending', label: 'Chờ xử lý' },
                                            { value: 'processing', label: 'Đang xử lý' },
                                            { value: 'shipped', label: 'Đã gửi hàng' },
                                            { value: 'delivered', label: 'Đã giao' },
                                            { value: 'cancelled', label: 'Đã hủy' }
                                        ]}
                                        placeholder="Chọn trạng thái"
                                    />

                                    {/* Phương thức thanh toán */}
                                    <FilterSelectSingle
                                        label="Phương thức thanh toán"
                                        value={filterValues.paymentMethod ? {
                                            value: filterValues.paymentMethod,
                                            label: filterValues.paymentMethod === 'all' ? 'Tất cả' : 
                                                   paymentMethods.find(pm => pm.id == filterValues.paymentMethod)?.name || filterValues.paymentMethod
                                        } : { value: 'all', label: 'Tất cả' }}
                                        onChange={(selected) => updateFilter('paymentMethod', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            ...paymentMethods.map(pm => ({
                                                value: pm.id,
                                                label: pm.name
                                            }))
                                        ]}
                                        placeholder="Chọn phương thức"
                                    />

                                    {/* Thời gian đặt hàng */}
                                    <FilterDateRange
                                        label="Thời gian đặt hàng"
                                        value={filterValues.orderDate || { from: null, to: null }}
                                        onChange={(dateRange) => updateFilter('orderDate', dateRange)}
                                    />

                                    {/* Khách hàng */}
                                    <FilterSelectSingle
                                        label="Khách hàng"
                                        value={filterValues.customer ? {
                                            value: filterValues.customer,
                                            label: filterValues.customer === 'all' ? 'Tất cả' : 
                                                   customers.find(c => c.id == filterValues.customer)?.name || filterValues.customer
                                        } : { value: 'all', label: 'Tất cả' }}
                                        onChange={(selected) => updateFilter('customer', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            ...customers.map(customer => ({
                                                value: customer.id,
                                                label: customer.name
                                            }))
                                        ]}
                                        placeholder="Chọn khách hàng"
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
                                                placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="d-flex justify-content-end gap-2">
                                            {/* Nút tạo mới */}
                                            <Permission permission={PERMISSIONS.ORDERS_CREATE}>
                                                <Link className="btn btn-primary" to="/order/add">
                                                    <i className="fas fa-plus me-1"></i> Tạo mới
                                                </Link>
                                            </Permission>
                                            
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
                                            Đang tìm kiếm: "<strong>{searchText}</strong>" - Tìm thấy {sortedOrders.length} kết quả
                                        </small>
                                    </div>
                                )}
                            </div>

                            {/* Header với tiêu đề */}
                            <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white flex-shrink-0">
                                <div className="d-flex align-items-center gap-2">
                                    <h4 className="mb-0 fw-bold text-primary">Danh sách đơn hàng</h4>
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
                                        name="Danh sách đơn hàng"
                                        columns={columns}
                                        data={sortedOrders}
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
        </div>
    );
};

export default OrderList;