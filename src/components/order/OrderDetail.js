import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { toast } from 'react-toastify';
import requestApi from '../../helpers/api';
import {formatVNDWithUnit, formatVND } from '../../helpers/formatMoney';

const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

// Helper function để lấy ảnh featured từ API mới hoặc fallback về cấu trúc cũ
const getProductImage = (product) => {
    if (!product) return null;
    
    // Cấu trúc mới: image_urls array với is_featured
    if (product.image_urls && Array.isArray(product.image_urls)) {
        const featuredImage = product.image_urls.find(img => img.is_featured === 1);
        if (featuredImage && featuredImage.thumb_url) {
            return featuredImage.thumb_url;
        }
    }
    
    // Fallback về cấu trúc cũ
    if (product.image_url) {
        return product.image_url;
    }
    
    return null;
};

const statusMap = {
    pending: { color: 'warning', text: 'Chờ xử lý' },
    processing: { color: 'info', text: 'Đang xử lý' },
    shipped: { color: 'primary', text: 'Đã gửi hàng' },
    delivered: { color: 'success', text: 'Đã giao' },
    cancelled: { color: 'danger', text: 'Đã hủy' }
};

// Thêm map trạng thái payment
const paymentStatusMap = {
    pending: 'Chờ thanh toán',
    success: 'Đã thanh toán',
    failed: 'Thanh toán thất bại'
};

// Thêm map màu cho payment status
const paymentStatusColorMap = {
    pending: 'warning',
    success: 'success',
    failed: 'danger'
};

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(Date.now());

    useEffect(() => {
        setLoading(true);
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/orders/${id}`, 'GET', [])
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
    }, [id, dispatch, refresh]);

    // Hàm cập nhật trạng thái đơn hàng
    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            dispatch(actions.controlLoading(true));
            const res = await requestApi(`api/admin/orders/${orderId}/status`, 'PUT', { status: newStatus });
            dispatch(actions.controlLoading(false));
            if (res.data && res.data.success) {
                toast.success(res.data.message || "Cập nhật trạng thái thành công!");
                setRefresh(Date.now());
                // Có thể gọi lại API lấy chi tiết đơn hàng nếu muốn cập nhật giao diện ngay
            } else {
                toast.error(res.data.message || "Cập nhật trạng thái thất bại!");
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            toast.error("Lỗi khi cập nhật trạng thái!");
        }
    };

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="d-flex justify-content-center align-items-center vh-100">
                {/* <span className="fs-5">Đang tải dữ liệu...</span> */}
            </div>
        </div> 
        );
    }

    if (!order) {
        return (
            <div className="container-fluid px-4">
                <div className="mt-4 mb-3">
                    <h1 className="mt-4"></h1>
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
                <div className="container-fluid px-3 px-md-4">
                    <div className="d-flex align-items-center justify-content-between mt-3 mt-md-4 mb-2">
                        <h2 className="mb-0 detail-page-header">Chi tiết đơn hàng #{order.id}</h2>
                    </div>
                    <ol className="breadcrumb mb-3 mb-md-4 detail-breadcrumb">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/order">Đơn hàng</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>

                    <div className="row g-2 g-md-3 align-items-stretch">
                        {/* Thông tin đơn hàng & thanh toán */}
                        <div className="col-12 col-lg-6 d-flex">
                            <div className="card shadow-sm border-0 flex-fill">
                                <div className="card-header py-2 background-detail detail-card-header">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="fas fa-file-invoice me-2"></i>Thông tin đơn hàng & thanh toán
                                    </h6>
                                </div>
                                <div className="card-body p-2 p-md-3 detail-card">
                                    {/* Thông tin đơn hàng - Compact */}
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <small className="text-muted d-block">Mã đơn</small>
                                            <span className="fw-semibold">#{order.order_code}</span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Ngày đặt</small>
                                            <span>{moment(order.order_date).format('HH:mm DD/MM/YYYY')}</span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Trạng thái</small>
                                            <span className={`badge bg-${status.color}`}>{status.text}</span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Tổng tiền</small>
                                            <span className="fw-bold text-danger">{formatVNDWithUnit(order.total_amount)}</span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Phí ship</small>
                                            <span>{formatVNDWithUnit(order.shipping_fee)}</span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Khách hàng</small>
                                            <span>{order.client_name}</span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">SĐT</small>
                                            <span>{order.client_phone}</span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Người tạo</small>
                                            <span>{order.user ? order.user.name : '-'}</span>
                                        </div>
                                        <div className="col-12">
                                            <small className="text-muted d-block">Địa chỉ giao</small>
                                            <span className="small">{order.shipping_address}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Thông tin thanh toán - Compact */}
                                    <div className="border-top pt-3">
                                        <h6 className="fw-bold text-info mb-2">
                                            <i className="fas fa-credit-card me-2"></i>Thanh toán
                                        </h6>
                                        {order.payment ? (
                                            <div className="row g-2">
                                                <div className="col-6">
                                                    <small className="text-muted d-block">Phương thức</small>
                                                    <span className="small">{order.payment.method.name}</span>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block">Trạng thái</small>
                                                    <span className={`badge bg-${paymentStatusColorMap[order.payment.status] || 'secondary'} small`}>
                                                        {paymentStatusMap[order.payment.status] || order.payment.status}
                                                    </span>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block">Số tiền</small>
                                                    <span className="fw-bold text-danger">{formatVNDWithUnit(order.payment.amount)}</span>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block">Thanh toán lúc</small>
                                                    <span className="small">{order.payment.paid_at ? moment(order.payment.paid_at).format('HH:mm DD/MM/YYYY') : '-'}</span>
                                                </div>
                                                <div className="col-12">
                                                    <small className="text-muted d-block">Mã giao dịch</small>
                                                    <span className="small">{order.payment.transaction_id || 'Chưa có thông tin giao dịch'}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-muted small">Chưa có thông tin thanh toán</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Danh sách sản phẩm */}
                        <div className="col-12 col-lg-6 d-flex">
                            <div className="card shadow-sm border-0 flex-fill">
                                <div className="card-header py-2 background-detail detail-card-header">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="fas fa-box-open me-2"></i>Sản phẩm trong đơn ({order.order_details?.length || 0} sản phẩm)
                                    </h6>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0 table-sm detail-table">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: 40 }}>#</th>
                                                    <th style={{ width: 60 }}>Ảnh</th>
                                                    <th>Sản phẩm</th>
                                                    <th className="text-center" style={{ width: 80 }}>Giá</th>
                                                    <th className="text-center" style={{ width: 50 }}>SL</th>
                                                    <th className="text-end" style={{ width: 90 }}>Tổng</th>
                                                    <th className="text-center" style={{ width: 100 }}>Loại</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.order_details && order.order_details.length > 0 ? (
                                                    order.order_details.map((item, idx) => {
                                                        // Xác định loại sản phẩm và màu viền
                                                        let borderStyle = '';
                                                        let typeLabel = '';
                                                        let badgeColor = '';
                                                        if (item.combo_id) {
                                                            borderStyle = '2px solid #0d6efd'; // xanh dương cho combo
                                                            typeLabel = 'Sản phẩm thuộc combo';
                                                            badgeColor = '#0d6efd';
                                                        } else {
                                                            borderStyle = '2px solid #198754'; // xanh lá cho thường
                                                            typeLabel = 'Sản phẩm thường';
                                                            badgeColor = '#198754';
                                                        }
                                                        return (
                                                            <tr key={item.id} style={{ borderLeft: borderStyle }}>
                                                                <td>{idx + 1}</td>
                                                                <td>
                                                                    {(() => {
                                                                        const imageUrl = getProductImage(item.product);
                                                                        return imageUrl ? (
                                                                            <img
                                                                                src={imageUrl.startsWith('http')
                                                                                    ? imageUrl
                                                                                    : urlImage + imageUrl}
                                                                                alt={item.product ? item.product.name : ''}
                                                                                className="img-thumbnail"
                                                                                style={{
                                                                                    width: 40,
                                                                                    height: 40,
                                                                                    objectFit: 'cover',
                                                                                    borderRadius: 6,
                                                                                    border: '1px solid #eee'
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', border: '1px solid #eee', borderRadius: 6 }}>
                                                                                <i className="fas fa-image" style={{ fontSize: 16, color: '#bbb' }}></i>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </td>
                                                                <td>
                                                                    <div className="fw-semibold small">{item.product ? item.product.name : ''}</div>
                                                                    {item.product?.size && (
                                                                        <span className="badge bg-secondary small me-1">{item.product.size}</span>
                                                                    )}
                                                                </td>
                                                                <td className="text-center">
                                                                    <span className="fw-bold text-primary small">{formatVND(item.unit_price)}</span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <span className="fw-bold">{item.quantity}</span>
                                                                </td>
                                                                <td className="text-end fw-bold">
                                                                    <span className="text-danger small">{formatVND(item.unit_price * item.quantity)}</span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <span
                                                                        className={`badge small`}
                                                                        style={{
                                                                            backgroundColor: item.combo_id ? '#e3f2fd' : '#e8f5e8',
                                                                            color: item.combo_id ? '#1976d2' : '#2e7d32',
                                                                            fontWeight: 500,
                                                                            fontSize: 10,
                                                                            padding: '3px 6px'
                                                                        }}
                                                                    >
                                                                        {item.combo_id ? 'Combo' : 'Thường'}
                                                                    </span>
                                                                    {/* Hiển thị tên combo nếu có */}
                                                                    {item.combo_id && item.combo && (
                                                                        <div className="small mt-1 text-primary" style={{ fontSize: 10 }}>
                                                                            <i className="fas fa-cubes me-1"></i>
                                                                            {item.combo.name}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="text-center text-muted">Không có sản phẩm</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            <tfoot className="table-light">
                                                <tr>
                                                    <td colSpan={6} className="text-end fw-bold">Tổng cộng:</td>
                                                    <td className="text-end fw-bold text-danger">{formatVNDWithUnit(order.total_amount)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nút thao tác - Compact */}
                    <div className="row mb-3 mb-md-4">
                        <div className="col-12 d-flex justify-content-center detail-action-buttons" style={{ marginTop: 20 }}>
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left me-1"></i><span className="d-none d-sm-inline">Quay lại</span>
                            </button>
                                    {order.status === 'pending' && (
                                <>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                        title="Hủy đơn hàng"
                                    >
                                        <i className="fas fa-times me-1"></i><span className="d-none d-sm-inline">Hủy</span>
                                    </button>
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleUpdateStatus(order.id, 'processing')}
                                        title="Duyệt đơn hàng"
                                    >
                                        <i className="fas fa-check me-1"></i><span className="d-none d-sm-inline">Duyệt</span>
                                    </button>
                                </>
                            )}
                            {order.status === 'processing' && (
                                <>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                        title="Hủy đơn hàng"
                                    >
                                        <i className="fas fa-times me-1"></i><span className="d-none d-sm-inline">Hủy</span>
                                    </button>
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                        title="Xác nhận đã gửi hàng"
                                    >
                                        <i className="fas fa-truck me-1"></i><span className="d-none d-sm-inline">Gửi hàng</span>
                                    </button>
                                </>
                            )}
                            {order.status === 'shipped' && (
                                <>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                        title="Hủy đơn hàng"
                                    >
                                        <i className="fas fa-times me-1"></i><span className="d-none d-sm-inline">Hủy</span>
                                    </button>
                                    <button
                                        className="btn btn-info btn-sm"
                                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                        title="Xác nhận đã giao"
                                    >
                                        <i className="fas fa-box-open me-1"></i><span className="d-none d-sm-inline">Đã giao</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderDetail;