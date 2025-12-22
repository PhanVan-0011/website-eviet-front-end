import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import requestApi from '../../helpers/api';
import { formatDate } from '../../tools/formatData';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import { toastErrorConfig , toastSuccessConfig} from '../../tools/toastConfig';
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';
import { cleanHtml, oembedToIframe } from '../../helpers/formatData';
import { formatVNDWithUnit } from '../../helpers/formatMoney';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

// Component hiển thị từng field thông tin
const InfoItem = ({ label, value, isDanger = false }) => (
    <div className="col-md-3 mb-3">
        <div className="text-muted small mb-1">{label}</div>
        <div className={`fw-semibold border-bottom pb-2 ${isDanger ? 'text-danger' : ''}`}>
            {value ?? 'Chưa có'}
        </div>
    </div>
);

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalImg, setModalImg] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState('thong-tin');

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
                <div className="container-fluid px-3 px-md-4">
                    <div className="d-flex align-items-center justify-content-between mt-3 mt-md-4 mb-2">
                        <h2 className="mb-0 detail-page-header">Chi tiết sản phẩm #{product.id}</h2>
                    </div>
                    <ol className="breadcrumb mb-3 mb-md-4 detail-breadcrumb">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/product">Sản phẩm</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>

                    <div className="card border">
                        {/* Tab Navigation */}
                        <ul className="nav nav-tabs flex-wrap" id="productDetailTabs" role="tablist" style={{borderBottom: '2px solid #dee2e6'}}>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link detail-tab-nav ${activeTab === 'thong-tin' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setActiveTab('thong-tin')}
                                    style={{ 
                                        color: activeTab === 'thong-tin' ? '#007bff' : '#6c757d',
                                        borderBottomColor: activeTab === 'thong-tin' ? '#007bff' : 'transparent',
                                        borderBottomWidth: activeTab === 'thong-tin' ? '2px' : '1px',
                                        textDecoration: 'none',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === 'thong-tin' ? '500' : 'normal'
                                    }}
                                >
                                    Thông tin
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link detail-tab-nav ${activeTab === 'mo-ta' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setActiveTab('mo-ta')}
                                    style={{ 
                                        color: activeTab === 'mo-ta' ? '#007bff' : '#6c757d',
                                        borderBottomColor: activeTab === 'mo-ta' ? '#007bff' : 'transparent',
                                        borderBottomWidth: activeTab === 'mo-ta' ? '2px' : '1px',
                                        textDecoration: 'none',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === 'mo-ta' ? '500' : 'normal'
                                    }}
                                >
                                    <span className="d-none d-md-inline">Mô tả, ghi chú</span>
                                    <span className="d-md-none">Mô tả</span>
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link detail-tab-nav ${activeTab === 'ton-kho' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setActiveTab('ton-kho')}
                                    style={{ 
                                        color: activeTab === 'ton-kho' ? '#007bff' : '#6c757d',
                                        borderBottomColor: activeTab === 'ton-kho' ? '#007bff' : 'transparent',
                                        borderBottomWidth: activeTab === 'ton-kho' ? '2px' : '1px',
                                        textDecoration: 'none',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === 'ton-kho' ? '500' : 'normal'
                                    }}
                                >
                                    Tồn kho
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link detail-tab-nav ${activeTab === 'the-kho' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setActiveTab('the-kho')}
                                    style={{ 
                                        color: activeTab === 'the-kho' ? '#007bff' : '#6c757d',
                                        borderBottomColor: activeTab === 'the-kho' ? '#007bff' : 'transparent',
                                        borderBottomWidth: activeTab === 'the-kho' ? '2px' : '1px',
                                        textDecoration: 'none',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === 'the-kho' ? '500' : 'normal'
                                    }}
                                >
                                    Thẻ kho
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link detail-tab-nav ${activeTab === 'chi-nhanh' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setActiveTab('chi-nhanh')}
                                    style={{ 
                                        color: activeTab === 'chi-nhanh' ? '#007bff' : '#6c757d',
                                        borderBottomColor: activeTab === 'chi-nhanh' ? '#007bff' : 'transparent',
                                        borderBottomWidth: activeTab === 'chi-nhanh' ? '2px' : '1px',
                                        textDecoration: 'none',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === 'chi-nhanh' ? '500' : 'normal'
                                    }}
                                >
                                    <span className="d-none d-md-inline">Chi nhánh áp dụng</span>
                                    <span className="d-md-none">Chi nhánh</span>
                                </button>
                            </li>
                        </ul>

                        <div className="detail-card">
                            {/* Tab Thông tin */}
                            {activeTab === 'thong-tin' && (
                                <div>
                                    {/* Header: Hình ảnh + Thông tin sản phẩm */}
                                    <div className="d-flex flex-column flex-md-row detail-info-grid" style={{marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #dee2e6'}}>
                                        {/* Cột trái: Hình ảnh */}
                                        <div className="w-100 w-md-auto mb-3 mb-md-0" style={{flex: '0 0 30%'}}>
                                            <div style={{display: 'flex', gap: '0.75rem'}}>
                                                {/* Hình ảnh chính */}
                                                <div style={{flex: 1}}>
                                                    {/* Hình ảnh */}
                                                    {product.images && product.images.length > 0 ? (
                                                    (() => {
                                                            const featuredImg = product.images.find(img => img.is_featured === 1);
                                                            const displayImg = featuredImg || product.images[0];
                                                        return (
                                                            <div style={{position: 'relative'}}>
                                                                <img
                                                                    src={process.env.REACT_APP_API_URL + 'api/images/' + (displayImg.main_url || displayImg.thumb_url)}
                                                                    alt={product.name}
                                                                    className="img-thumbnail w-100"
                                                                    style={{
                                                                        objectFit: 'fill',
                                                                        cursor: 'pointer',
                                                                        borderRadius: 8,
                                                                        background: '#f8f9fa',
                                                                        border: '1px solid #dee2e6',
                                                                        height: 'auto',
                                                                        maxHeight: '350px',
                                                                        display: 'block',
                                                                        objectFit: 'contain'
                                                                    }}
                                                                    title="Bấm để xem lớn"
                                                                    onClick={() => handleImgClick(displayImg)}
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
                                                            </div>
                                                        );
                                                    })()
                                                ) : (
                                                    <div
                                                        style={{
                                                            width: '100%',
                                                            height: 350,
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

                                                {/* Ảnh phụ nhỏ bên phải */}
                                                {product.images && product.images.filter(img => img.is_featured !== 1).length > 0 && (
                                                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', width: 'auto'}}>
                                                        {product.images.filter(img => img.is_featured !== 1).map((img, idx) => (
                                                            <img
                                                                key={img.id}
                                                                src={urlImage + (img.main_url || img.thumb_url)}
                                                                alt={product.name + '-' + idx}
                                                                style={{
                                                                    width: 80,
                                                                    height: 80,
                                                                    objectFit: 'cover',
                                                                    cursor: 'pointer',
                                                                    borderRadius: 6,
                                                                    background: '#f8f9fa',
                                                                    border: '1px solid #dee2e6'
                                                                }}
                                                                className="img-thumbnail"
                                                                title="Bấm để xem lớn"
                                                                onClick={() => handleImgClick(img)}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Cột phải: Thông tin sản phẩm */}
                                        <div className="w-100 w-md-auto" style={{flex: '0 0 70%'}}>
                                            {/* Tên sản phẩm */}
                                            <h3 className="h4 h-md-3" style={{marginBottom: '0.75rem', marginTop: 0, fontWeight: 'bold', color: '#000'}}>
                                                {product.name}
                                            </h3>

                                            {/* Badges */}
                                            <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem'}}>
                                                {product.status === 1 ? (
                                                    <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>Hoạt động</span>
                                                ) : (
                                                    <span className="badge bg-danger"><i className="fas fa-ban me-1"></i>Không hoạt động</span>
                                                )}
                                                {product.is_sales_unit && (
                                                    <span className="badge bg-info"><i className="fas fa-shopping-bag me-1"></i>Bán trực tiếp</span>
                                                )}
                                            </div>

                                            {/* Nhóm hàng */}
                                            <div className="mb-3">
                                                <small className="text-muted d-block fw-semibold">Nhóm hàng:</small>
                                                <span className="text-dark">{product.categories && product.categories.length > 0
                                                    ? product.categories.map(cat => cat.name).join(', ')
                                                    : 'Chưa phân loại'}</span>
                                            </div>

                                            {/* Lưới thông tin */}
                                            <div className="row detail-info-grid">
                                                <InfoItem label="Mã hàng" value={product.product_code || product.id} />
                                                <InfoItem label="Tồn kho" value={product.total_stock_quantity || 0} />
                                                <InfoItem label="Đơn vị cơ bản" value={product.base_unit || 'Chưa có'} />
                                                <InfoItem label="Giá vốn" value={formatVNDWithUnit(product.cost_price)} />

                                                <InfoItem label="Giá bán" value={formatVNDWithUnit(product.base_store_price)} isDanger />
                                                <InfoItem label="Giá App" value={formatVNDWithUnit(product.base_app_price)} isDanger />
                                                <InfoItem label="Trạng thái" value={product.status === 1 ? 'Hoạt động' : 'Không hoạt động'} />
                                                <InfoItem label="Bán trực tiếp" value={product.is_sales_unit ? 'Có' : 'Không'} />

                                                <InfoItem label="Ngày tạo" value={formatDate(product.created_at)} />
                                                <InfoItem label="Ngày cập nhật" value={formatDate(product.updated_at)} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Đơn vị tính */}
                                    {product.unit_conversions && product.unit_conversions.length > 0 && (
                                        <div className="mt-3 mt-md-4">
                                            <h6 className="fw-bold mb-2 mb-md-3">Đơn vị tính</h6>
                                            <div className="table-responsive">
                                                <table className="table table-bordered detail-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Tên đơn vị</th>
                                                            <th>Quy đổi</th>
                                                            <th>Giá cửa hàng</th>
                                                            <th>Giá App</th>
                                                            <th>Mã hàng</th>
                                                            <th>Bán trực tiếp</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {product.unit_conversions.map((unit, idx) => (
                                                            <tr key={idx}>
                                                                <td>{unit.unit_name}</td>
                                                                <td className="text-center">{unit.conversion_factor}</td>
                                                                <td className="text-danger">{formatVNDWithUnit(unit.store_price)}</td>
                                                                <td className="text-danger">{formatVNDWithUnit(unit.app_price)}</td>
                                                                <td>{unit.unit_code || 'N/A'}</td>
                                                                <td className="text-center">{unit.is_sales_unit ? 'Có' : 'Không'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Thuộc tính sản phẩm */}
                                    {product.attributes && product.attributes.length > 0 && (
                                        <div className="mt-4">
                                            <h6 className="fw-bold mb-3">Thuộc tính sản phẩm</h6>
                                            {product.attributes.map((attr, attrIdx) => (
                                                <div key={attrIdx} className="mb-4 p-3 border rounded bg-light">
                                                    <div className="mb-3">
                                                        <small className="text-muted d-block mb-1 fw-semibold">Thuộc tính:</small>
                                                        <strong className="d-block mb-2">{attr.name}</strong>
                                                        <small className="text-muted d-block">Loại: {attr.type === 'select' ? 'Một lựa chọn' : attr.type === 'checkbox' ? 'Nhiều lựa chọn' : 'Ghi chú'}</small>
                                                    </div>
                                                    {attr.values && attr.values.length > 0 && (
                                                        <div className="table-responsive">
                                                            <table className="table table-sm table-bordered mb-0">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Giá trị</th>
                                                                        <th>Phụ thu</th>
                                                                        <th className="text-center">Mặc định</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {attr.values.map((value, valIdx) => (
                                                                        <tr key={valIdx}>
                                                                            <td>{value.value}</td>
                                                                            <td className="text-danger">{formatVNDWithUnit(value.price_adjustment)}</td>
                                                                            <td className="text-center">
                                                                                {value.is_default && <i className="fas fa-check text-success fw-bold"></i>}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab Mô tả */}
                            {activeTab === 'mo-ta' && (
                                <div className="tab-pane fade show active">
                                    <div style={{ 
                                        height: '400px', 
                                        overflowY: 'auto',
                                        paddingRight: '10px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '6px',
                                        padding: '15px'
                                    }}>
                                    {product.description
                                        ? <div dangerouslySetInnerHTML={{ __html: cleanHtml(oembedToIframe(product.description)) }} />
                                        : <div className="text-center text-muted py-5">
                                            <i className="fas fa-file-alt fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0">Chưa có mô tả sản phẩm</p>
                                        </div>
                                    }
                                </div>
                            </div>
                            )}

                            {/* Tab Tồn kho */}
                            {activeTab === 'ton-kho' && (
                                <div className="tab-pane fade show active">
                                    {product.branches && product.branches.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Mã chi nhánh</th>
                                                        <th>Tên chi nhánh</th>
                                                        <th>Địa chỉ</th>
                                                        <th>Số điện thoại</th>
                                                        <th>Email</th>
                                                        <th>Trạng thái</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {product.branches.map((branch, idx) => (
                                                        <tr key={idx}>
                                                            <td>{branch.code}</td>
                                                            <td>{branch.name}</td>
                                                            <td>{branch.address}</td>
                                                            <td>{branch.phone_number}</td>
                                                            <td>{branch.email}</td>
                                                            <td>
                                                                {branch.active ? (
                                                                    <span className="badge bg-success">Hoạt động</span>
                                                                ) : (
                                                                    <span className="badge bg-danger">Không hoạt động</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted py-5">
                                            <i className="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0">Sản phẩm chưa liên kết với chi nhánh nào</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab Thẻ kho */}
                            {activeTab === 'the-kho' && (
                                <div className="tab-pane fade show active">
                                    {product.special_prices && product.special_prices.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Tên giá đặc biệt</th>
                                                        <th>Giá</th>
                                                        <th>Trạng thái</th>
                                                        <th>Ngày bắt đầu</th>
                                                        <th>Ngày kết thúc</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {product.special_prices.map((price, idx) => (
                                                        <tr key={idx}>
                                                            <td>{price.name || 'N/A'}</td>
                                                            <td className="text-danger">{formatVNDWithUnit(price.price)}</td>
                                                            <td>
                                                                {price.status ? (
                                                                    <span className="badge bg-success">Hoạt động</span>
                                                                ) : (
                                                                    <span className="badge bg-danger">Không hoạt động</span>
                                                                )}
                                                            </td>
                                                            <td>{price.start_date ? formatDate(price.start_date) : 'N/A'}</td>
                                                            <td>{price.end_date ? formatDate(price.end_date) : 'N/A'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted py-5">
                                            <i className="fas fa-tags fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0">Sản phẩm chưa có giá đặc biệt nào</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab Chi nhánh áp dụng */}
                            {activeTab === 'chi-nhanh' && (
                                <div className="tab-pane fade show active">
                                    <div style={{ 
                                        height: '400px', 
                                        overflowY: 'auto',
                                        paddingRight: '10px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '6px',
                                        padding: '15px'
                                    }}>
                                        {product.branches && product.branches.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th>Mã chi nhánh</th>
                                                            <th>Tên chi nhánh</th>
                                                            <th>Địa chỉ</th>
                                                            <th>Số điện thoại</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {product.branches.map((branch, idx) => (
                                                            <tr key={idx}>
                                                                <td>{branch.code || branch.id}</td>
                                                                <td>{branch.name}</td>
                                                                <td>{branch.address || 'N/A'}</td>
                                                                <td>{branch.phone_number || 'N/A'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted py-5">
                                                <i className="fas fa-store fa-3x mb-3 opacity-50"></i>
                                                <p className="mb-0">Sản phẩm này áp dụng cho toàn bộ hệ thống</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nút thao tác */}
                    <div className="row mt-3 mt-md-4 mb-3 mb-md-4">
                        <div className="col-12 d-flex justify-content-center detail-action-buttons">
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left me-1"></i><span className="d-none d-sm-inline">Quay lại</span>
                            </button>
                            <Permission permission={PERMISSIONS.PRODUCTS_UPDATE}>
                                <Link className="btn btn-primary btn-sm" to={`/product/${product.id}`}>
                                    <i className="fas fa-edit me-1"></i><span className="d-none d-sm-inline">Sửa sản phẩm</span>
                                </Link>
                            </Permission>
                            <Permission permission={PERMISSIONS.PRODUCTS_DELETE}>
                                <button className="btn btn-danger btn-sm" onClick={handleOpenDeleteModal}>
                                    <i className="fas fa-trash-alt me-1"></i><span className="d-none d-sm-inline">Xóa sản phẩm</span>
                                </button>
                            </Permission>
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