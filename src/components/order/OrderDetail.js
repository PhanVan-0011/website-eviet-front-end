import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import requestApi from '../../helpers/api';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';

const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const statusMap = {
    pending: { color: 'warning', text: 'Chờ xử lý' },
    processing: { color: 'info', text: 'Đang xử lý' },
    shipped: { color: 'primary', text: 'Đã gửi hàng' },
    delivered: { color: 'success', text: 'Đã giao' },
    cancelled: { color: 'danger', text: 'Đã hủy' }
};

const formatVND = (value) => {
    if (!value) return '0';
    return Number(value).toLocaleString('vi-VN');
};

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        dispatch(actions.controlLoading(true));
        requestApi(`api/orders/${id}`, 'GET', [])
            .then(res => {
                setOrder(res.data.data);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            })
            .catch(() => {
                setOrder(null);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            });
    }, [id, dispatch]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
                <div className="spinner-border text-primary" role="status"></div>
                <span className="ms-3 fs-5">Đang tải dữ liệu...</span>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container-fluid px-4">
                <div className="mt-4 mb-3">
                    <h1 className="mt-4">Chi tiết đơn hàng</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/order">Đơn hàng</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>
                </div>
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                        alt="Không tìm thấy đơn hàng"
                        style={{ width: 120, marginBottom: 24, opacity: 0.85 }}
                    />
                    <h2 className="text-danger mb-2" style={{ fontWeight: 700 }}>
                        Không tìm thấy đơn hàng!
                    </h2>
                    <p className="text-secondary mb-4 fs-5 text-center" style={{ maxWidth: 400 }}>
                        Đơn hàng bạn tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.<br />
                        Vui lòng kiểm tra lại hoặc quay về trang danh sách đơn hàng.
                    </p>
                    <Link to="/order" className="btn btn-outline-primary px-4 py-2">
                        <i className="fas fa-arrow-left me-2"></i>Quay về danh sách đơn hàng
                    </Link>
                </div>
            </div>
        );
    }

    const status = statusMap[order.status] || { color: 'secondary', text: order.status };

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <div className="d-flex align-items-center justify-content-between mt-4 mb-2">
                        <h2 className="mb-0">Chi tiết đơn hàng #{order.id}</h2>
                    </div>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/order">Đơn hàng</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>

                    <div className="row g-4">
                        {/* Thông tin đơn hàng */}
                        <div className="col-lg-4">
                            <div className="card shadow-sm border-0 mb-3">
                                <div className="card-header bg-white border-bottom-0 pb-0">
                                    <h5 className="mb-0 fw-bold text-primary">
                                        <i className="fas fa-file-invoice me-2"></i>Thông tin đơn hàng
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="mb-2">
                                        <span className="fw-semibold">Mã đơn:</span> #{order.id}
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Ngày đặt:</span> {moment(order.order_date).format('HH:mm DD/MM/YYYY')}
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Trạng thái:</span>{' '}
                                        <span className={`badge bg-${status.color}`}>{status.text}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Tổng tiền:</span>{' '}
                                        <span className="fw-bold text-danger">{formatVND(order.total_amount)} ₫</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Phí giao hàng:</span> {formatVND(order.shipping_fee)} ₫
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Địa chỉ giao:</span> {order.shipping_address}
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Khách hàng:</span> {order.client_name}
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">SĐT khách:</span> {order.client_phone}
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Người tạo:</span> {order.user ? order.user.name : ''}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Danh sách sản phẩm */}
                        <div className="col-lg-8">
                            <div className="card shadow-sm border-0 mb-3">
                                <div className="card-header bg-white border-bottom-0 pb-0">
                                    <h5 className="mb-0 fw-bold text-success">
                                        <i className="fas fa-box-open me-2"></i>Sản phẩm trong đơn
                                    </h5>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: 60 }}>#</th>
                                                    <th style={{ width: 80 }}>Ảnh</th>
                                                    <th>Tên sản phẩm</th>
                                                    <th className="text-center" style={{ width: 100 }}>Đơn giá</th>
                                                    <th className="text-center" style={{ width: 80 }}>SL</th>
                                                    <th className="text-end" style={{ width: 120 }}>Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.order_details && order.order_details.length > 0 ? (
                                                    order.order_details.map((item, idx) => (
                                                        <tr key={item.id}>
                                                            <td>{idx + 1}</td>
                                                            <td>
                                                                <img
                                                                    src={item.product && item.product.image_url ? urlImage + item.product.image_url : '/no-image.png'}
                                                                    alt={item.product ? item.product.name : ''}
                                                                    className="img-thumbnail"
                                                                    style={{ width: 56, height: 56, objectFit: 'cover' }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <div className="fw-semibold">{item.product ? item.product.name : ''}</div>
                                                                <div className="text-muted small" dangerouslySetInnerHTML={{ __html: item.product ? item.product.description : '' }} />
                                                            </td>
                                                            <td className="text-center">{formatVND(item.unit_price)} ₫</td>
                                                            <td className="text-center">{item.quantity}</td>
                                                            <td className="text-end fw-bold">{formatVND(item.unit_price * item.quantity)} ₫</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="text-center text-muted">Không có sản phẩm</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan={5} className="text-end fw-bold">Tổng cộng:</td>
                                                    <td className="text-end fw-bold text-danger">{formatVND(order.total_amount)} ₫</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin thanh toán */}
                    <div className="row mb-4">
                        <div className="col-lg-4">
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-white border-bottom-0 pb-0">
                                    <h5 className="mb-0 fw-bold text-info">
                                        <i className="fas fa-credit-card me-2"></i>Thanh toán
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {order.payment ? (
                                        <>
                                            <div className="mb-2">
                                                <span className="fw-semibold">Phương thức:</span> {order.payment.gateway}
                                            </div>
                                            <div className="mb-2">
                                                <span className="fw-semibold">Trạng thái:</span> {order.payment.status}
                                            </div>
                                            <div className="mb-2">
                                                <span className="fw-semibold">Số tiền:</span> {order.payment.amount}
                                            </div>
                                            <div className="mb-2">
                                                <span className="fw-semibold">Mã giao dịch:</span> {order.payment.transaction_id}
                                            </div>
                                            <div className="mb-2">
                                                <span className="fw-semibold">Thanh toán lúc:</span> {order.payment.paid_at || 'Chưa thanh toán'}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-muted">Chưa có thông tin thanh toán</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nút thao tác nằm giữa giao diện */}
                    <div className="row mb-4">
                        <div className="col-12 d-flex justify-content-center gap-3">
                            {/* <Link className="btn btn-primary px-4" to={`/order/${order.id}`}>
                                <i className="fas fa-edit"></i> Sửa đơn hàng
                            </Link> */}
                            <button className="btn btn-outline-secondary px-4" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left"></i> Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderDetail;