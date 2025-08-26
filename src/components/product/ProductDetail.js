import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import requestApi from '../../helpers/api';
import { formatDate } from '../../tools/formatData';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import { toastErrorConfig , toastSuccessConfig} from '../../tools/toastConfig';
import { cleanHtml, oembedToIframe } from '../../helpers/formatData';
import { formatVNDWithUnit } from '../../helpers/formatMoney';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalImg, setModalImg] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        setLoading(true);
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/products/${id}`, 'GET')
            .then(res => {
                setProduct(res.data.data);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            })
            .catch(() => {
                setProduct(null);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            });
    }, [id, dispatch]);

    // Hàm xóa sản phẩm
    const handleOpenDeleteModal = () => {
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        setShowDeleteModal(false);
        dispatch(actions.controlLoading(true));
        try {
            const res = await requestApi(`api/admin/products/${id}`, 'DELETE');
            dispatch(actions.controlLoading(false));
            toast.success(res.data?.message || 'Xóa sản phẩm thành công!', toastSuccessConfig);
            navigate('/product');
        } catch (e) {
            dispatch(actions.controlLoading(false));
            toast.error(
                e?.response?.data?.message || 'Xóa sản phẩm thất bại!', toastErrorConfig
            );
        }
    };

    // Hàm xử lý khi click vào bất kỳ ảnh nào
    const handleImgClick = (img) => {
        setModalImg(img);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setModalImg(null);
    };

    // Chỉ hiển thị nội dung chính khi đã load xong
    if (loading) {
        return (
            <div className="container-fluid">
            <div className="d-flex justify-content-center align-items-center vh-100">
               {/* <span className="fs-5">Đang tải dữ liệu...</span> */}
           </div>
       </div> 
        );
    }
    if (!product) {
        
        return (
            <div className="container-fluid px-4">
                <div className="mt-4 mb-3">
                    <h1 className="mt-4">Chi tiết sản phẩm</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Danh sách sản phẩm</Link></li>
                        <li className="breadcrumb-item active">Chi tiết sản phẩm</li>
                    </ol>
                </div>
                
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <img
            src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
            alt="Không tìm thấy sản phẩm"
            style={{ width: 120, marginBottom: 24, opacity: 0.85 }}
        />
        <h2 className="text-danger mb-2" style={{ fontWeight: 700 }}>
            Không tìm thấy sản phẩm!
        </h2>
        <p className="text-secondary mb-4 fs-5 text-center" style={{ maxWidth: 400 }}>
            Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.<br />
            Vui lòng kiểm tra lại hoặc quay về trang danh sách sản phẩm.
        </p>
        <Link to="/product" className="btn btn-outline-primary px-4 py-2">
            <i className="fas fa-arrow-left me-2"></i>Quay về danh sách sản phẩm
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
                        <h2 className="mb-0">Chi tiết sản phẩm #{product.id}</h2>
                    </div>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/product">Sản phẩm</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>

                    <div className="row g-3">
                        {/* Thông tin sản phẩm & hình ảnh */}
                        <div className="col-lg-5">
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-primary text-white py-2">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="fas fa-box me-2"></i>Thông tin sản phẩm & hình ảnh
                                    </h6>
                                </div>
                                <div className="card-body p-3">
                                    {/* Hình ảnh sản phẩm */}
                                    <div className="mb-3" style={{ height: '280px', display: 'flex', flexDirection: 'column' }}>
                                        {product.image_urls && product.image_urls.length > 0 ? (
                                            (() => {
                                                const featuredImg = product.image_urls.find(img => img.is_featured === 1);
                                                const otherImgs = product.image_urls.filter(img => img.is_featured !== 1);
                                                return (
                                                    <>
                                                        {featuredImg ? (
                                                            <>
                                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, overflow: 'hidden' }}>
                                                                    <img
                                                                        key={featuredImg.id}
                                                                        src={process.env.REACT_APP_API_URL + 'api/images/' + (featuredImg.main_url || featuredImg.thumb_url)}
                                                                        alt={product.name + '-featured'}
                                                                        className="img-thumbnail"
                                                                        style={{
                                                                            objectFit: 'contain',
                                                                            boxShadow: '0 0 8px #007bff33',
                                                                            cursor: 'pointer',
                                                                            maxWidth: '100%',
                                                                            maxHeight: '100%',
                                                                            borderRadius: 8,
                                                                            background: '#f8f9fa',
                                                                            border: '1px solid #dee2e6'
                                                                        }}
                                                                        title="Ảnh đại diện (bấm để xem lớn)"
                                                                        onClick={() => handleImgClick(featuredImg)}
                                                                    />
                                                                </div>
                                                                {/* Modal xem ảnh full */}
                                                                {showModal && modalImg && (
                                                                    <Modal show={showModal} onHide={handleCloseModal} centered>
                                                                        <Modal.Body style={{ position: 'relative', padding: 0, background: 'transparent', border: 0 }}>
                                                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                                                                                <img
                                                                                    src={process.env.REACT_APP_API_URL + 'api/images/' + (modalImg.main_url || modalImg.thumb_url)}
                                                                                    alt={product.name + '-modal-full'}
                                                                                    style={{
                                                                                        maxWidth: '80vw',
                                                                                        maxHeight: '80vh',
                                                                                        objectFit: 'contain',
                                                                                        display: 'block',
                                                                                        margin: '0 auto',
                                                                                        borderRadius: 8
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </Modal.Body>
                                                                    </Modal>
                                                                )}
                                                            </>
                                                        ) : null}
                                                        {/* Các ảnh phụ */}
                                                        {otherImgs.length > 0 && (
                                                            <div className="d-flex flex-wrap gap-1 justify-content-center" style={{ maxHeight: 70, overflowY: 'auto', flexShrink: 0 }}>
                                                                {otherImgs.map((img, idx) => (
                                                                    <img
                                                                        key={img.id}
                                                                        src={process.env.REACT_APP_API_URL + 'api/images/' + (img.main_url || img.thumb_url)}
                                                                        alt={product.name + '-' + idx}
                                                                        style={{
                                                                            width: 45,
                                                                            height: 45,
                                                                            objectFit: 'cover',
                                                                            cursor: 'pointer',
                                                                            borderRadius: 6,
                                                                            background: '#f8f9fa',
                                                                            border: '1px solid #dee2e6',
                                                                            flexShrink: 0
                                                                        }}
                                                                        className="img-thumbnail"
                                                                        title="Ảnh sản phẩm (bấm để xem lớn)"
                                                                        onClick={() => handleImgClick(img)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()
                                        ) : (
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: 8,
                                                    background: '#f8f9fa',
                                                    border: '1px solid #dee2e6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <i className="fas fa-image" style={{ fontSize: 60, color: '#adb5bd' }}></i>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Thông tin cơ bản - Compact */}
                                    <div className="row g-2">
                                        <div className="col-12">
                                            <small className="text-muted d-block">Tên sản phẩm</small>
                                            <h6 className="fw-bold mb-1">{product.name}</h6>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Trạng thái</small>
                                            {product.status === 1
                                                ? <span className="badge bg-success small"><i className="fas fa-check-circle me-1"></i>Đang bán</span>
                                                : <span className="badge bg-secondary small"><i className="fas fa-ban me-1"></i>Ngừng bán</span>
                                            }
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Số lượng</small>
                                            <span className="fw-semibold">{product.stock_quantity}</span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Giá gốc</small>
                                            <span className="fw-bold text-info">{formatVNDWithUnit(product.original_price)}</span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Giá bán</small>
                                            <span className="fw-bold text-danger">{formatVNDWithUnit(product.sale_price)}</span>
                                        </div>
                                        {product.size && (
                                            <div className="col-6">
                                                <small className="text-muted d-block">Kích thước</small>
                                                <span className="badge bg-secondary">{product.size}</span>
                                            </div>
                                        )}
                                        <div className="col-6">
                                            <small className="text-muted d-block">Ngày tạo</small>
                                            <span className="small">{formatDate(product.created_at)}</span>
                                        </div>
                                        <div className="col-12">
                                            <small className="text-muted d-block">Danh mục</small>
                                            <span className="small">{product.categories && product.categories.length > 0
                                                ? product.categories.map(cat => cat.name).join(', ')
                                                : 'Chưa phân loại'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Mô tả sản phẩm */}
                        <div className="col-lg-7">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-header bg-success text-white py-2">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="fas fa-info-circle me-2"></i>Mô tả sản phẩm
                                    </h6>
                                </div>
                                <div className="card-body p-3" style={{ overflowY: 'auto' }}>
                                    {product.description
                                        ? <div dangerouslySetInnerHTML={{ __html: cleanHtml(oembedToIframe(product.description)) }} />
                                        : <div className="text-center text-muted py-5">
                                            <i className="fas fa-file-alt fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0">Chưa có mô tả sản phẩm</p>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nút thao tác - Compact */}
                    <div className="row mb-4">
                        <div className="col-12 d-flex justify-content-center gap-2" style={{ marginTop: 20 }}>
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left me-1"></i>Quay lại
                            </button>
                            <Link className="btn btn-primary btn-sm" to={`/product/${product.id}`}>
                                <i className="fas fa-edit me-1"></i>Sửa sản phẩm
                            </Link>
                            <button className="btn btn-danger btn-sm" onClick={handleOpenDeleteModal}>
                                <i className="fas fa-trash-alt me-1"></i>Xóa sản phẩm
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Bạn có chắc chắn muốn xóa sản phẩm này?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ProductDetail;