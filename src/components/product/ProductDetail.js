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

    // Hàm format giá tiền
    const formatVND = (value) => {
        if (value === null || value === undefined) return '';
        value = value.toString();
        value = value.replace(/\D/g, '');
        if (!value) return '';
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

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
               <span className="fs-5">Đang tải dữ liệu...</span>
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
                    <div className="mt-4 mb-3">
                        <h1 className="mt-4">Chi tiết sản phẩm</h1>
                        <ol className="breadcrumb mb-4">
                            <li className="breadcrumb-item"><Link to="/">Danh sách sản phẩm</Link></li>
                            <li className="breadcrumb-item active">Chi tiết sản phẩm</li>
                        </ol>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-5 d-flex" style={{ height: '75vh' }}>
                            <div className="card shadow-sm mb-4 flex-fill" style={{ height: '100%' }}>
                                <div style={{ height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                                    {product.image_urls && product.image_urls.length > 0 ? (
                                        (() => {
                                            const featuredImg = product.image_urls.find(img => img.is_featured === 1);
                                            const otherImgs = product.image_urls.filter(img => img.is_featured !== 1);
                                            return (
                                                <>
                                                    {featuredImg ? (
                                                        <>
                                                            <img
                                                                key={featuredImg.id}
                                                                src={process.env.REACT_APP_API_URL + 'api/images/' + (featuredImg.main_url || featuredImg.thumb_url)}
                                                                alt={product.name + '-featured'}
                                                                className="img-thumbnail mb-3"
                                                                style={{
                                                                    objectFit: 'contain',
                                                                    boxShadow: '0 0 12px #007bff55',
                                                                    cursor: 'pointer',
                                                                    maxWidth: '80%',
                                                                    maxHeight: 400,
                                                                    borderRadius: 10,
                                                                    background: '#f8f9fa',
                                                                    border: '1px solid #eee',
                                                                    display: 'block',
                                                                    margin: '0 auto'
                                                                }}
                                                                title="Ảnh đại diện (bấm để xem lớn)"
                                                                onClick={() => handleImgClick(featuredImg)}
                                                            />
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
                                                                                    display: 'block',
                                                                                    margin: '0 auto',
                                                                                    borderRadius: 8
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        {/* Không có nút X đóng */}
                                                                    </Modal.Body>
                                                                </Modal>
                                                            )}
                                                        </>
                                                    ) : null}
                                                    {/* Các ảnh còn lại nhỏ hơn */}
                                                    <div className="d-flex flex-wrap gap-2 justify-content-center align-items-center">
                                                        {otherImgs.length > 0 ? otherImgs.map((img, idx) => (
                                                            <img
                                                                key={img.id}
                                                                src={process.env.REACT_APP_API_URL + 'api/images/' + (img.main_url || img.thumb_url)}
                                                                alt={product.name + '-' + idx}
                                                                style={{
                                                                    width: 90,
                                                                    height: 90,
                                                                    objectFit: 'cover',
                                                                    cursor: 'pointer',
                                                                    marginBottom: 4,
                                                                    marginRight: 8,
                                                                    borderRadius: 10,
                                                                    background: '#f8f9fa',
                                                                    border: '1px solid #eee',
                                                                    display: 'block',
                                                                }}
                                                                title="Ảnh sản phẩm (bấm để xem lớn)"
                                                                onClick={() => handleImgClick(img)}
                                                            />
                                                        )) : (
                                                            !featuredImg && (
                                                                <div
                                                                    style={{
                                                                        width: '80%',
                                                                        height: 240,
                                                                        borderRadius: 10,
                                                                        background: '#f8f9fa',
                                                                        border: '1px solid #eee',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        margin: '0 auto',
                                                                    }}
                                                                >
                                                                    <i className="fas fa-image" style={{ fontSize: 80, color: '#bbb' }}></i>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        })()
                                    ) : (
                                        <div
                                            style={{
                                                width: '80%',
                                                height: 240,
                                                borderRadius: 10,
                                                background: '#f8f9fa',
                                                border: '1px solid #eee',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto',
                                            }}
                                        >
                                            <i className="fas fa-image" style={{ fontSize: 80, color: '#bbb' }}></i>
                                        </div>
                                    )}
                                </div>
                                <div className="card-body" style={{ height: '50%', overflowY: 'auto' }}>
                                    <h4 className="card-title mb-2">{product.name}</h4>
                                    <div className="mb-2">
                                        {product.status === 1
                                            ? <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>Đang bán</span>
                                            : <span className="badge bg-secondary"><i className="fas fa-ban me-1"></i>Ngừng bán</span>
                                        }
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold text-primary">Danh mục:</span> {product.categories && product.categories.length > 0
                                            ? product.categories.map(cat => cat.name).join(', ')
                                            : <span className="text-muted">Chưa phân loại</span>}
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold text-success">Giá gốc:</span> <span className="text-danger">{formatVND(parseInt(product.original_price))} ₫</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold text-warning">Giá bán:</span> <span className="text-danger">{formatVND(parseInt(product.sale_price))} ₫</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Số lượng:</span> {product.stock_quantity}
                                    </div>
                                    {product.size && (
                                        <div className="mb-2">
                                            <span className="fw-semibold">Kích thước:</span> {product.size}
                                        </div>
                                    )}
                                    <div className="mb-2">
                                        <span className="fw-semibold">Ngày tạo:</span> {formatDate(product.created_at)}
                                    </div>
                                    <div>
                                        <span className="fw-semibold">Cập nhật:</span> {formatDate(product.updated_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-7 mb-4 d-flex" style={{ height: '75vh' }}>
                            <div className="card shadow-sm h-100 flex-fill d-flex flex-column" style={{ height: '100%' }}>
                                <div className="card-header bg-light fw-bold">
                                    <i className="fas fa-info-circle me-2"></i>Mô tả sản phẩm
                                </div>
                                <div className="card-body flex-grow-1" style={{ minHeight: 200, overflowY: 'auto' }}>
                                    {product.description
                                        ? <div dangerouslySetInnerHTML={{ __html: cleanHtml(oembedToIframe(product.description)) }} />
                                        : <span className="text-muted fst-italic">Chưa có mô tả</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Di chuyển các button ra ngoài card, đặt bên dưới hai cột */}
                <div className="row mb-4">
                    <div className="col-12 d-flex justify-content-center gap-2">
                        <Link className="btn btn-primary" to={`/product/${product.id}`}>
                            <i className="fas fa-edit"></i> Sửa sản phẩm
                        </Link>
                        <button className="btn btn-danger" onClick={handleOpenDeleteModal}>
                            <i className="fas fa-trash-alt"></i> Xóa sản phẩm
                        </button>
                        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                            <i className="fas fa-arrow-left"></i> Quay lại
                        </button>
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