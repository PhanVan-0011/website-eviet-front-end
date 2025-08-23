import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Modal, Button } from 'react-bootstrap';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import { cleanHtml,oembedToIframe} from '../../helpers/formatData';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';
const PromotionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [promotion, setPromotion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        setLoading(true);
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/promotions/${id}`, 'GET')
            .then(res => {
                // Xử lý dữ liệu trả về cho phù hợp
                const data = res.data.data;
                // Lấy ảnh chính
                let mainImage = '';
                if (data.image && data.image.main_url) {
                    mainImage = data.image.main_url;
                }
                setPromotion({
                    ...data,
                    mainImage,
                });
                setLoading(false);
                dispatch(actions.controlLoading(false));
            })
            .catch(() => {
                setPromotion(null);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            });
    }, [id, dispatch]);

    // Thay thế handleDelete bằng mở modal xác nhận
    const handleDelete = () => {
        setShowModal(true);
    };

    const requestApiDelete = async () => {
        dispatch(actions.controlLoading(true));
        try {
            const res = await requestApi(`api/admin/promotions/${id}`, 'DELETE');
            dispatch(actions.controlLoading(false));
            setShowModal(false);
            toast.success(res.data?.message || 'Xóa khuyến mãi thành công!', toastSuccessConfig);
            navigate('/promotion');
        } catch (e) {
            dispatch(actions.controlLoading(false));
            setShowModal(false);
            toast.error(
                e?.response?.data?.message || 'Xóa khuyến mãi thất bại!', toastErrorConfig
            );
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
    if (!promotion) {
        return (
            <div className="container-fluid px-4">
                <div className="mt-4 mb-3">
                    <h1 className="mt-4">Chi tiết khuyến mãi</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/promotion">Danh sách khuyến mãi</Link></li>
                        <li className="breadcrumb-item active">Chi tiết khuyến mãi</li>
                    </ol>
                </div>
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                        alt="Không tìm thấy khuyến mãi"
                        style={{ width: 120, marginBottom: 24, opacity: 0.85 }}
                    />
                    <h2 className="text-danger mb-2" style={{ fontWeight: 700 }}>
                        Không tìm thấy khuyến mãi!
                    </h2>
                    <p className="text-secondary mb-4 fs-5 text-center" style={{ maxWidth: 400 }}>
                        Khuyến mãi bạn tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.<br />
                        Vui lòng kiểm tra lại hoặc quay về trang danh sách khuyến mãi.
                    </p>
                    <Link to="/promotion" className="btn btn-outline-primary px-4 py-2">
                        <i className="fas fa-arrow-left me-2"></i>Quay về danh sách khuyến mãi
                    </Link>
                </div>
            </div>
        );
    }

    // Helper hiển thị loại áp dụng
    const renderApplicationType = (type) => {
        if (type === "orders") return <span className="badge bg-secondary">Đơn hàng</span>;
        if (type === "products") return <span className="badge bg-primary">Sản phẩm</span>;
        if (type === "categories") return <span className="badge bg-warning text-dark">Danh mục</span>;
        if (type === "combos") return <span className="badge bg-success">Combo</span>;
        return <span className="badge bg-secondary">-</span>;
    };

    // Helper hiển thị hình thức
    const renderType = (type) => {
        if (type === 'percentage') return <span className="badge bg-success">Phần trăm (%)</span>;
        if (type === 'fixed_amount') return <span className="badge bg-info text-dark">Tiền cố định (VNĐ)</span>;
        if (type === 'free_shipping') return <span className="badge bg-primary">Miễn phí ship</span>;
        return <span className="badge bg-secondary">-</span>;
    };

    // Helper hiển thị giá trị
    const renderValue = (promotion) => {
        if (promotion.type === 'percentage') return `${promotion.value}%`;
        if (promotion.type === 'fixed_amount') return promotion.value?.toLocaleString() + ' ₫';
        if (promotion.type === 'free_shipping') return <span className="text-success">Miễn phí vận chuyển</span>;
        return '-';
    };

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <div className="mt-4 mb-3">
                        <h1 className="mt-4">Chi tiết khuyến mãi</h1>
                        <ol className="breadcrumb mb-4">
                            <li className="breadcrumb-item"><Link to="/promotion">Danh sách khuyến mãi</Link></li>
                            <li className="breadcrumb-item active">Chi tiết khuyến mãi</li>
                        </ol>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-5">
                            <div className="card shadow-sm">
                                <img
                                    src={promotion.mainImage ? urlImage + promotion.mainImage : "https://via.placeholder.com/400x320?text=No+Image"}
                                    alt={promotion.name}
                                    className="card-img-top"
                                    style={{ objectFit: 'contain', height: 320, borderRadius: '8px 8px 0 0', background: '#fafafa' }}
                                />
                                <div className="card-body">
                                    <h4 className="card-title mb-2">{promotion.name}</h4>
                                    <div className="mb-2">
                                        <span className="badge bg-info text-dark me-2">{promotion.code}</span>
                                        {promotion.is_active
                                            ? <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>Đang áp dụng</span>
                                            : <span className="badge bg-secondary"><i className="fas fa-ban me-1"></i>Ngừng áp dụng</span>
                                        }
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Loại áp dụng:</span> {renderApplicationType(promotion.application_type)}
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Hình thức:</span> {renderType(promotion.type)}
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold text-success">Giá trị:</span> <span className="text-danger">{renderValue(promotion)}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Thời gian áp dụng:</span>
                                        <div>
                                            <div className="small text-muted">Từ:</div>
                                            <span className="text-primary">{promotion.dates?.start_date ? moment(promotion.dates.start_date).format('HH:mm DD/MM/YYYY') : '-'}</span>
                                            <div className="small text-muted mt-1">Đến:</div>
                                            <span className="text-danger">{promotion.dates?.end_date ? moment(promotion.dates.end_date).format('HH:mm DD/MM/YYYY') : '-'}</span>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Tình trạng:</span> <span className="badge bg-info text-dark">{promotion.status_text}</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Kết hợp khuyến mãi khác:</span> {promotion.is_combinable
                                            ? <span className="badge bg-success">Có</span>
                                            : <span className="badge bg-secondary">Không</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-7">
                            <div className="card shadow-sm h-100">
                                <div className="card-header bg-light fw-bold">
                                    <i className="fas fa-globe-asia me-2"></i>Điều kiện và giới hạn
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <span className="fw-semibold">Điều kiện:</span>
                                                <ul className="mb-0">
                                                    <li>Đơn tối thiểu: {promotion.conditions?.min_order_value ? promotion.conditions.min_order_value.toLocaleString() + ' ₫' : '-'}</li>
                                                    <li>Giảm tối đa: {promotion.conditions?.max_discount_amount ? promotion.conditions.max_discount_amount.toLocaleString() + ' ₫' : '-'}</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-2">
                                                <span className="fw-semibold">Giới hạn sử dụng:</span>
                                                <ul className="mb-0">
                                                    <li>Tổng lượt: {promotion.usage_limits?.max_usage || '-'}</li>
                                                    <li>Mỗi người: {promotion.usage_limits?.max_usage_per_user || '-'}</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-header bg-light fw-bold border-top">
                                    <i className="fas fa-bullseye me-2"></i>Đối tượng áp dụng
                                </div>
                                <div className="card-body p-0">
                                    <div className="p-3">
                                        {promotion.products?.length > 0 && (
                                            <div className="mb-2">
                                                <span className="badge bg-primary me-2">Sản phẩm:</span>
                                                {promotion.products.map(p => (
                                                    <span key={p.id} className="badge bg-light text-dark me-1">{p.name}</span>
                                                ))}
                                            </div>
                                        )}
                                        {promotion.categories?.length > 0 && (
                                            <div className="mb-2">
                                                <span className="badge bg-warning text-dark me-2">Danh mục:</span>
                                                {promotion.categories.map(c => (
                                                    <span key={c.id} className="badge bg-light text-dark me-1">{c.name}</span>
                                                ))}
                                            </div>
                                        )}
                                        {promotion.combos?.length > 0 && (
                                            <div className="mb-2">
                                                <span className="badge bg-success me-2">Combo:</span>
                                                {promotion.combos.map(c => (
                                                    <span key={c.id} className="badge bg-light text-dark me-1">{c.name}</span>
                                                ))}
                                            </div>
                                        )}
                                        {promotion.products?.length === 0 && promotion.categories?.length === 0 && promotion.combos?.length === 0 && (
                                            <span className="text-muted">Áp dụng cho tất cả</span>
                                        )}
                                    </div>
                                </div>
                                <div className="card-header bg-light fw-bold border-top">
                                    <i className="fas fa-info-circle me-2"></i>Mô tả khuyến mãi
                                </div>
                                <div className="card-body" style={{ minHeight: 120 }}>
                                    {promotion.description
                                        ? <div dangerouslySetInnerHTML={{ __html: cleanHtml(oembedToIframe(promotion.description)) }} />
                                        : <span className="text-muted fst-italic">Chưa có mô tả</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Button thao tác ra ngoài card, căn giữa, margin-top */}
                    <div className="row mb-4">
                        <div className="col-12 d-flex justify-content-center gap-2" style={{ marginTop: 32 }}>
                            <Link className="btn btn-primary me-2" to={`/promotion/${promotion.id}`}>
                                <i className="fas fa-edit"></i> Sửa khuyến mãi
                            </Link>
                            <button className="btn btn-danger me-2" onClick={handleDelete}>
                                <i className="fas fa-trash-alt"></i> Xóa khuyến mãi
                            </button>
                            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left"></i> Quay lại
                            </button>
                        </div>
                    </div>

            {/* Modal xác nhận xóa */}
<Modal show={showModal} onHide={() => setShowModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Xác nhận xóa</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <p>Bạn có chắc chắn muốn xóa khuyến mãi này?</p>
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
            </main>
        </div>
    );
};

export default PromotionDetail;