import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import requestApi from '../../helpers/api';
import { formatDate } from '../../tools/formatData';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { toast } from 'react-toastify';

const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

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
        requestApi(`api/products/${id}`, 'GET')
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
    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            dispatch(actions.controlLoading(true));
            try {
                const res = await requestApi(`api/products/${id}`, 'DELETE');
                dispatch(actions.controlLoading(false));
                toast.success(res.data?.message || 'Xóa sản phẩm thành công!');
                navigate('/product');
            } catch (e) {
                dispatch(actions.controlLoading(false));
                toast.error(
                    e?.response?.data?.message || 'Xóa sản phẩm thất bại!'
                );
            }
        }
    };

    // Chỉ hiển thị nội dung chính khi đã load xong
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <span className="ms-3 fs-5">Đang tải dữ liệu...</span>
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
                        <div className="col-md-5">
                            <div className="card shadow-sm">
                                <img
                                    src={urlImage + product.image_url}
                                    alt={product.name}
                                    className="card-img-top"
                                    style={{ objectFit: 'container', height: 320, borderRadius: '8px 8px 0 0', background: '#fafafa' }}
                                />
                                <div className="card-body">
                                    <h4 className="card-title mb-2">{product.name}</h4>
                                    <div className="mb-2">
                                        {product.status === 1
                                            ? <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>Đang bán</span>
                                            : <span className="badge bg-secondary"><i className="fas fa-ban me-1"></i>Ngừng bán</span>
                                        }
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold text-primary">Danh mục:</span> {product.category?.name || <span className="text-muted">Chưa phân loại</span>}
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold text-success">Giá gốc:</span> <span className="text-danger">{formatVND(product.original_price)} ₫</span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold text-warning">Giá bán:</span> <span className="text-danger">{formatVND(product.sale_price)} ₫</span>
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
                        <div className="col-md-7">
                            <div className="card shadow-sm h-100">
                                <div className="card-header bg-light fw-bold">
                                    <i className="fas fa-info-circle me-2"></i>Mô tả sản phẩm
                                </div>
                                <div className="card-body" style={{ minHeight: 200 }}>
                                    {product.description
                                        ? <div dangerouslySetInnerHTML={{ __html: product.description }} />
                                        : <span className="text-muted fst-italic">Chưa có mô tả</span>
                                    }
                                </div>
                                <div className="card-footer bg-white border-0">
                                    <Link className="btn btn-primary me-2" to={`/product/${product.id}`}>
                                        <i className="fas fa-edit"></i> Sửa sản phẩm
                                    </Link>
                                    <button className="btn btn-danger me-2" onClick={handleDelete}>
                                        <i className="fas fa-trash-alt"></i> Xóa sản phẩm
                                    </button>
                                    <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                                        <i className="fas fa-arrow-left"></i> Quay lại
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductDetail;