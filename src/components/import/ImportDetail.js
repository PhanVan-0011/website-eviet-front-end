import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import moment from 'moment';

// Component hiển thị từng field thông tin
const InfoItem = ({ label, value, isLink = false, linkTo = null }) => (
    <div className="mb-3">
        <div className="text-muted small mb-1">{label}</div>
        <div className="fw-semibold border-bottom pb-2">
            {isLink && linkTo ? (
                <Link to={linkTo} className="text-primary text-decoration-none">
                    {value ?? 'N/A'}
                </Link>
            ) : (
                value ?? 'N/A'
            )}
        </div>
    </div>
);

const ImportDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('thong-tin');

    useEffect(() => {
        setLoading(true);
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/purchase-invoices/${id}`, 'GET')
            .then(res => {
                setInvoice(res.data.data);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            })
            .catch(() => {
                setInvoice(null);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            });
    }, [id, dispatch]);

    // Hàm format VND
    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Hàm lấy badge status
    const getStatusBadge = (status) => {
        const statusMap = {
            'draft': { label: 'Nháp', class: 'bg-secondary' },
            'received': { label: 'Đã nhập hàng', class: 'bg-success' },
            'cancelled': { label: 'Đã hủy', class: 'bg-danger' }
        };
        const statusInfo = statusMap[status] || { label: status, class: 'bg-secondary' };
        return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
    };

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="d-flex justify-content-center align-items-center vh-100">
                    {/* Loading */}
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="container-fluid px-4">
                <div className="mt-4 mb-3">
                    <h1 className="mt-4">Chi tiết phiếu nhập</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/import">Danh sách nhập hàng</Link></li>
                        <li className="breadcrumb-item active">Chi tiết phiếu nhập</li>
                    </ol>
                </div>

                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                        alt="Không tìm thấy phiếu nhập"
                        style={{ width: 120, marginBottom: 24, opacity: 0.85 }}
                    />
                    <h2 className="text-danger mb-2" style={{ fontWeight: 700 }}>
                        Không tìm thấy phiếu nhập!
                    </h2>
                    <p className="text-secondary mb-4 fs-5 text-center" style={{ maxWidth: 400 }}>
                        Phiếu nhập bạn tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.
                    </p>
                    <Link to="/import" className="btn btn-outline-primary px-4 py-2">
                        <i className="fas fa-arrow-left me-2"></i>Quay về danh sách
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <div className="d-flex align-items-center justify-content-between mt-4 mb-2">
                        <h2 className="mb-0">Chi tiết phiếu nhập</h2>
                    </div>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/import">Nhập hàng</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>

                    <div className="card border">
                        {/* Tab Navigation */}
                        <ul className="nav nav-tabs" id="importDetailTabs" role="tablist" style={{ borderBottom: '2px solid #dee2e6' }}>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === 'thong-tin' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setActiveTab('thong-tin')}
                                    style={{
                                        color: activeTab === 'thong-tin' ? '#007bff' : '#6c757d',
                                        borderBottomColor: activeTab === 'thong-tin' ? '#007bff' : 'transparent',
                                        borderBottomWidth: activeTab === 'thong-tin' ? '2px' : '1px',
                                        textDecoration: 'none',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === 'thong-tin' ? '500' : 'normal'
                                    }}
                                >
                                    Thông tin
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === 'lich-su' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setActiveTab('lich-su')}
                                    style={{
                                        color: activeTab === 'lich-su' ? '#007bff' : '#6c757d',
                                        borderBottomColor: activeTab === 'lich-su' ? '#007bff' : 'transparent',
                                        borderBottomWidth: activeTab === 'lich-su' ? '2px' : '1px',
                                        textDecoration: 'none',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === 'lich-su' ? '500' : 'normal'
                                    }}
                                >
                                    Lịch sử thanh toán
                                </button>
                            </li>
                        </ul>

                        <div style={{ padding: '1.5rem' }}>
                            {/* Tab Thông tin */}
                            {activeTab === 'thong-tin' && (
                                <div>
                                    {/* Mã phiếu nhập, Trạng thái, Chi nhánh */}
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <div className="text-muted small mb-1">Mã phiếu nhập</div>
                                                <div className="fw-semibold border-bottom pb-2">
                                                    {invoice.invoice_code} {getStatusBadge(invoice.status)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <InfoItem 
                                                label="Chi nhánh" 
                                                value={invoice.branch?.name || 'N/A'}
                                            />
                                        </div>
                                    </div>

                                    {/* Thông tin người tạo, ngày, NCC */}
                                    <div className="row mb-4">
                                        <div className="col-md-4">
                                            <InfoItem 
                                                label="Người tạo" 
                                                value={invoice.user?.name || 'N/A'}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <InfoItem 
                                                label="Ngày nhập" 
                                                value={moment(invoice.invoice_date).format('DD/MM/YYYY HH:mm')}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <div className="mb-3">
                                                <div className="text-muted small mb-1">Tên NCC</div>
                                                <div className="fw-semibold border-bottom pb-2">
                                                    <Link to={`/supplier/detail/${invoice.supplier?.id}`} className="text-dark text-decoration-none">
                                                        {invoice.supplier?.name || 'N/A'}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bảng sản phẩm */}
                                    <div className="mb-4">
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Mã hàng</th>
                                                        <th>Tên hàng</th>
                                                        <th className="text-center">Số lượng</th>
                                                        <th className="text-end">Đơn giá</th>
                                                        <th className="text-end">Thành tiền</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {invoice.details && invoice.details.map((item, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <Link 
                                                                    to={`/product/detail/${item.product_id}`}
                                                                    className="text-dark text-decoration-none"
                                                                >
                                                                    {item.product?.product_code || 'N/A'}
                                                                </Link>
                                                            </td>
                                                            <td>
                                                                {item.product?.name || 'N/A'}
                                                                <small className="text-muted d-block">
                                                                    ({item.unit_of_measure})
                                                                </small>
                                                            </td>
                                                            <td className="text-center">
                                                                {parseFloat(item.quantity).toLocaleString('vi-VN')}
                                                            </td>
                                                            <td className="text-end">
                                                                {formatVND(item.unit_price)}
                                                            </td>
                                                            <td className="text-end fw-bold">
                                                                {formatVND(item.subtotal)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Ghi chú và Tổng tiền */}
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="border rounded p-3" style={{ minHeight: '200px' }}>
                                                <div className="text-muted small mb-2">Ghi chú</div>
                                                <div>{invoice.notes || ''}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <table className="table table-borderless">
                                                <tbody>
                                                    <tr>
                                                        <td className="text-end">Số lượng mặt hàng</td>
                                                        <td className="text-end fw-bold">{invoice.total_items || 0}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="text-end">
                                                            Tổng tiền hàng ({invoice.total_quantity || 0})
                                                        </td>
                                                        <td className="text-end fw-bold">
                                                            {formatVND(invoice.subtotal_amount)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="text-end">
                                                            Giảm giá
                                                            <i className="fas fa-info-circle ms-1 text-muted"></i>
                                                        </td>
                                                        <td className="text-end fw-bold">
                                                            {formatVND(invoice.discount_amount)}
                                                        </td>
                                                    </tr>
                                                    <tr className="border-top">
                                                        <td className="text-end">Cần trả NCC</td>
                                                        <td className="text-end fw-bold">
                                                            {formatVND(invoice.total_amount)}
                                                        </td>
                                                    </tr>
                                                    <tr className="border-top">
                                                        <td className="text-end">Tiền đã trả NCC</td>
                                                        <td className="text-end fw-bold">
                                                            {formatVND(invoice.paid_amount)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab Lịch sử thanh toán */}
                            {activeTab === 'lich-su' && (
                                <div className="tab-pane fade show active">
                                    <div className="text-center text-muted py-5">
                                        <i className="fas fa-history fa-3x mb-3 opacity-50"></i>
                                        <p className="mb-0">Chưa có lịch sử thanh toán</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nút thao tác */}
                    <div className="row mt-4 mb-4">
                        <div className="col-12 d-flex justify-content-center gap-2">
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/import')}>
                                <i className="fas fa-arrow-left me-1"></i>Quay lại
                            </button>
                            {invoice.status === 'draft' && (
                                <>
                                    <Link className="btn btn-primary btn-sm" to={`/import/edit/${invoice.id}`}>
                                        <i className="fas fa-edit me-1"></i>Sửa phiếu nhập
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ImportDetail;

