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

    // Bộ lọc mới
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPayment, setFilterPayment] = useState('');

    // Sort states
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    // Lấy danh sách đơn hàng với filter
    useEffect(() => {
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        if (filterStatus) query += `&status=${filterStatus}`;
        if (filterPayment) query += `&payment_method=${filterPayment}`;
        dispatch(actions.controlLoading(true));
        requestApi(`api/orders${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setOrders(response.data.data);
            setNumOfPages(response.data.last_page || 1);
        }).catch(() => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, searchText, filterStatus, filterPayment, refresh]);

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
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('id')}>
                    Mã đơn hàng{renderSortIcon('id')}
                </span>
            ),
            element: row => row.id,
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
            width: "12%"
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
            title: "Người tạo",
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
                <div className="d-flex align-items-center justify-content-center">
                    <Link className="btn btn-info btn-sm me-1" to={`/order/detail/${row.id}`}>
                        <i className="fas fa-eye"></i>
                    </Link>
           
                </div>
            ),
            width: "9%"
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

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4">Danh sách đơn hàng</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Đơn hàng</li>
                    </ol>
                    {/* Bộ lọc */}
                    <div className="row mb-3 g-2 align-items-end">
                        {/* Trạng thái */}
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-primary mb-1" htmlFor="filterStatus">
                                <i className="fas fa-toggle-on me-1"></i>Trạng thái
                            </label>
                            <select
                                id="filterStatus"
                                className="form-select form-select-sm border-primary shadow-sm"
                                style={{ backgroundColor: '#f8f9fa', fontWeight: 500, cursor: 'pointer' }}
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="pending">Chờ xử lý</option>
                                <option value="processing">Đang xử lý</option>
                                <option value="shipped">Đã gửi hàng</option>
                                <option value="delivered">Đã giao</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                        {/* Phương thức thanh toán */}
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-success mb-1" htmlFor="filterPayment">
                                <i className="fas fa-credit-card me-1"></i>Phương thức thanh toán
                            </label>
                            <select
                                id="filterPayment"
                                className="form-select form-select-sm border-success shadow-sm"
                                style={{ backgroundColor: '#f8f9fa', fontWeight: 500, cursor: 'pointer' }}
                                value={filterPayment}
                                onChange={e => setFilterPayment(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="COD">COD</option>
                                <option value="MoMo">MoMo</option>
                                <option value="VnPay">VnPay</option>
                            </select>
                        </div>
                    </div>
                    {/* ...actions, DataTables... */}
                    {/* <div className='mb-3'>
                        <Link className="btn btn-primary me-2" to="/order/add">
                            <i className="fas fa-plus"></i> Thêm đơn hàng
                        </Link>
                        {selectedRows.length > 0 && (
                            <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}>
                                <i className="fas fa-trash"></i> Xóa
                            </button>
                        )}
                    </div> */}
                    <DataTables
                        name="Dữ liệu đơn hàng"
                        columns={columns}
                        data={sortedOrders}
                        numOfPages={numOfPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        setItemOfPage={setItemOfPage}
                        changeKeyword={setSearchText}
                        onSelectedRows={setSelectedRows}
                        hideSelected={true}
                    />
                </div>
            </main>
            {/* ...modal... */}
        </div>
    );
};

export default OrderList;