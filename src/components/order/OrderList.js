import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import DataTables from '../common/DataTables';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button, Offcanvas, Dropdown } from 'react-bootstrap';
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
    const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);
    
    // Ref để track itemOfPage trước đó, tránh reset ở lần đầu mount
    const prevItemOfPageRef = useRef(itemOfPage);

    // Sort states
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    // Data for filters - Phương thức thanh toán cố định
    const paymentMethods = [
        { id: 'COD', name: 'COD' },
        { id: 'VNPAY', name: 'VNPAY' },
        { id: 'MOMO', name: 'MOMO' },
        { id: 'ZALOPAY', name: 'ZALOPAY' }
    ];
    // const [customers, setCustomers] = useState([]);


    const updateFilter = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(prev => !prev);
    };

    // Load filter data - Không cần load payment methods nữa vì đã cố định
    useEffect(() => {
        // // Load customers
        // requestApi('api/admin/customers?limit=1000', 'GET', []).then((response) => {
        //     if (response.data && response.data.data) {
        //         setCustomers(response.data.data);
        //     }
        // }).catch(() => {
        //     // setCustomers([
        //     //     { id: 1, name: 'Khách lẻ' },
        //     //     { id: 2, name: 'Khách VIP' }
        //     // ]);
        // });
    }, []);

    // Lấy danh sách đơn hàng với filter
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
        // if (filterValues.customer && filterValues.customer !== 'all') {
        //     query += `&customer_id=${filterValues.customer}`;
        // }

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/orders${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            // Chỉ update orders khi có data, không clear nếu data rỗng
            if (response.data && response.data.data) {
                setOrders(response.data.data);
            }
            if (response.data && response.data.last_page) {
                setNumOfPages(response.data.last_page);
            }
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
                <div className="d-flex align-items-center order-actions-cell" style={{ flexWrap: 'nowrap', gap: '0.25rem' }}>
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
                                Gửi hàng
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
            width: "25%"
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


    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    {/* Header row: Breadcrumb + Search + Actions */}
                    <div className="d-flex align-items-center py-2 mt-2 mb-2 border-bottom order-header-row">
                        {/* Left section: Breadcrumb + Search - chiếm 50% */}
                        <div className="order-left-section d-flex align-items-center gap-3">
                            {/* Breadcrumb - ẩn trên tablet */}
                            <ol className="breadcrumb mb-0 d-none d-md-flex flex-shrink-0" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                                <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                                <li className="breadcrumb-item active">Danh sách đơn hàng</li>
                            </ol>
                            
                            {/* Nút Bộ lọc - chỉ hiện trên tablet/mobile */}
                            <button 
                                className="btn btn-outline-secondary btn-sm d-md-none flex-shrink-0"
                                onClick={() => setShowFilterOffcanvas(true)}
                                title="Bộ lọc"
                            >
                                <i className="fas fa-filter me-1"></i>
                                <span className="d-none d-sm-inline">Bộ lọc</span>
                            </button>
                            
                            {/* Search - rộng hơn và canh trái */}
                            <div className="order-search-bar flex-grow-1">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text" style={{ backgroundColor: '#fff' }}>
                                        <i className="fas fa-search text-muted"></i>
                                    </span>
                                    <LiveSearch 
                                        changeKeyword={setSearchText}
                                        placeholder="Tìm mã đơn, tên khách hàng..."
                                    />
                                </div>
                            </div>
                        </div>
                            
                        {/* Actions - bên phải - chiếm 50% */}
                        <div className="order-right-section d-flex align-items-center gap-2 justify-content-end">
                            {/* Nút tạo mới */}
                            <Permission permission={PERMISSIONS.ORDERS_CREATE}>
                                <Link className="btn btn-primary btn-sm" to="/order/add">
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
                        {/* Filter Panel Card - Hiển thị trên tablet và desktop, ẩn trên mobile */}
                        {isFilterVisible && (
                            <div className="filter-card-wrapper d-none d-md-block" style={{ width: '240px', flexShrink: 0 }}>
                                <div className="filter-card">
                                    <div className="filter-card-content">
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
                                                   paymentMethods.find(pm => pm.id === filterValues.paymentMethod)?.name || filterValues.paymentMethod
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
                                    name="Danh sách đơn hàng"
                                    columns={columns}
                                    data={sortedOrders}
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

                        {/* Offcanvas Filter cho Tablet/Mobile */}
                        <Offcanvas 
                            show={showFilterOffcanvas} 
                            onHide={() => setShowFilterOffcanvas(false)}
                            placement="start"
                            className="d-lg-none"
                        >
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title>Bộ lọc</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body>
                                <div className="filter-card-content">
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
                                        onChange={(selected) => {
                                            updateFilter('status', selected ? selected.value : 'all');
                                        }}
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
                                                   paymentMethods.find(pm => pm.id === filterValues.paymentMethod)?.name || filterValues.paymentMethod
                                        } : { value: 'all', label: 'Tất cả' }}
                                        onChange={(selected) => {
                                            updateFilter('paymentMethod', selected ? selected.value : 'all');
                                        }}
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
                                </div>
                            </Offcanvas.Body>
                        </Offcanvas>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderList;