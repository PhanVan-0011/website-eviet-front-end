import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import requestApi from '../../helpers/api';
import { formatDate } from '../../tools/formatData';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { toast } from 'react-toastify';
import moment from 'moment';
import { Modal, Button } from 'react-bootstrap';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import { cleanHtml, oembedToIframe } from '../../helpers/formatData';
import { formatVNDWithUnit } from '../../helpers/formatMoney';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const ComboDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [combo, setCombo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalImg, setModalImg] = useState(null);

    useEffect(() => {
        setLoading(true);
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/combos/${id}`, 'GET')
            .then(res => {
                // Xử lý dữ liệu trả về cho phù hợp
                const data = res.data.data;
                // Lấy ảnh chính
                let mainImage = '';
                if (data.image_urls && data.image_urls.length > 0) {
                    mainImage = data.image_urls[0].main_url;
                }
                setCombo({
                    ...data,
                    mainImage,
                });
                setLoading(false);
                dispatch(actions.controlLoading(false));
            })
            .catch(() => {
                setCombo(null);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            });
    }, [id, dispatch]);

    // Hàm xóa combo
    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa combo này?')) {
            dispatch(actions.controlLoading(true));
            try {
                const res = await requestApi(`api/admin/combos/${id}`, 'DELETE');
                dispatch(actions.controlLoading(false));
                toast.success(res.data?.message || 'Xóa combo thành công!', toastSuccessConfig);
                navigate('/combo');
            } catch (e) {
                dispatch(actions.controlLoading(false));
                toast.error(
                    e?.response?.data?.message || 'Xóa combo thất bại!', toastErrorConfig
                );
            }
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

    if (loading) {
        return (
            <div className="container-fluid">
                 <div className="d-flex justify-content-center align-items-center vh-100">
                    {/* <span className="fs-5">Đang tải dữ liệu...</span> */}
                </div>
            </div> 
        );
    }
    if (!combo) {
        return (
            <div className="container-fluid px-4">
                <div className="mt-4 mb-3">
                    <h1 className="mt-4">Chi tiết combo</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/combo">Danh sách combo</Link></li>
                        <li className="breadcrumb-item active">Chi tiết combo</li>
                    </ol>
                </div>
                <div className="d-flex flex-column justify-content-center align-items-center  bg-light" style={{ minHeight: '60vh' }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                        alt="Không tìm thấy combo"
                        style={{ width: 120, marginBottom: 24, opacity: 0.85 }}
                    />
                    <h2 className="text-danger mb-2" style={{ fontWeight: 700 }}>
                        Không tìm thấy combo!
                    </h2>
                    <p className="text-secondary mb-4 fs-5 text-center" style={{ maxWidth: 400 }}>
                        Combo bạn tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.<br />
                        Vui lòng kiểm tra lại hoặc quay về trang danh sách combo.
                    </p>
                    <Link to="/combo" className="btn btn-outline-primary px-4 py-2">
                        <i className="fas fa-arrow-left me-2"></i>Quay về danh sách combo
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
                        <h2 className="mb-0">Chi tiết combo #{combo.id}</h2>
                    </div>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/combo">Combo</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>

                    <div className="row g-3">
                        {/* Thông tin combo & hình ảnh */}
                        <div className="col-lg-5">
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-primary text-white py-2">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="fas fa-cubes me-2"></i>Thông tin combo & hình ảnh
                                    </h6>
                                </div>
                                <div className="card-body p-3">
                                    {/* Hình ảnh combo */}
                                    <div className="mb-3" style={{ height: '280px', display: 'flex', flexDirection: 'column' }}>
                                        {combo.image_urls && combo.image_urls.length > 0 ? (
                                            (() => {
                                                const featuredImg = combo.image_urls.find(img => img.is_featured === 1);
                                                const otherImgs = combo.image_urls.filter(img => img.is_featured !== 1);
                                                return (
                                                    <>
                                                        {featuredImg ? (
                                                            <>
                                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, overflow: 'hidden' }}>
                                                                    <img
                                                                        key={featuredImg.id}
                                                                        src={process.env.REACT_APP_API_URL + 'api/images/' + (featuredImg.main_url || featuredImg.thumb_url)}
                                                                        alt={combo.name + '-featured'}
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
                                                                                    alt={combo.name + '-modal-full'}
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
                                                                        alt={combo.name + '-' + idx}
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
                                                                        title="Ảnh combo (bấm để xem lớn)"
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
                                            <small className="text-muted d-block">Tên combo</small>
                                            <h6 className="fw-bold mb-1">{combo.name}</h6>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Trạng thái</small>
                                            {combo.is_active === true
                                                ? <span className="badge bg-success small"><i className="fas fa-check-circle me-1"></i>Đang áp dụng</span>
                                                : <span className="badge bg-secondary small"><i className="fas fa-ban me-1"></i>Ngừng áp dụng</span>
                                            }
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Số sản phẩm</small>
                                            <span className="fw-semibold">{combo.items ? combo.items.length : 0}</span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Giá combo</small>
                                            <span className="fw-bold text-danger">{formatVNDWithUnit(combo.price)}</span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Ngày tạo</small>
                                            <span className="small">{formatDate(combo.created_at)}</span>
                                        </div>
                                        <div className="col-12">
                                            <small className="text-muted d-block">Thời gian áp dụng</small>
                                            <div className="small">
                                                <span className="text-primary">{moment(combo.start_date).format('HH:mm DD/MM/YYYY')}</span>
                                                <span className="text-muted"> đến </span>
                                                <span className="text-danger">{moment(combo.end_date).format('HH:mm DD/MM/YYYY')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Mô tả & Sản phẩm trong combo */}
                        <div className="col-lg-7">
                            <div className="card shadow-sm border-0 h-100 d-flex flex-column">
                                <div className="card-header bg-success text-white py-2">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="fas fa-info-circle me-2"></i>Mô tả combo
                                    </h6>
                                </div>
                                <div className="card-body p-3" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {combo.description
                                        ? <div dangerouslySetInnerHTML={{ __html: cleanHtml(oembedToIframe(combo.description)) }} />
                                        : <div className="text-center text-muted py-3">
                                            <i className="fas fa-file-alt fa-2x mb-2 opacity-50"></i>
                                            <p className="mb-0 small">Chưa có mô tả combo</p>
                                        </div>
                                    }
                                </div>
                                <div className="card-header bg-warning text-dark py-2 border-top">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="fas fa-box-open me-2"></i>Sản phẩm trong combo ({combo.items ? combo.items.length : 0})
                                    </h6>
                                </div>
                                <div className="card-body p-0 flex-grow-1" style={{ overflowY: 'auto' }}>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0 table-sm">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: 40 }}>#</th>
                                                    <th style={{ width: 60 }}>Ảnh</th>
                                                    <th>Sản phẩm</th>
                                                    <th className="text-center" style={{ width: 80 }}>Giá</th>
                                                    <th className="text-center" style={{ width: 50 }}>SL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {combo.items && combo.items.length > 0 ? (
                                                    combo.items.map((item, idx) => (
                                                        <tr key={item.id}>
                                                            <td>{idx + 1}</td>
                                                            <td>
                                                                {(() => {
                                                                    const getProductImage = (product) => {
                                                                        if (!product) return null;
                                                                        if (product.image_urls && Array.isArray(product.image_urls)) {
                                                                            const featuredImage = product.image_urls.find(img => img.is_featured === 1);
                                                                            if (featuredImage && featuredImage.thumb_url) {
                                                                                return featuredImage.thumb_url;
                                                                            }
                                                                        }
                                                                        if (product.image_url) {
                                                                            return product.image_url;
                                                                        }
                                                                        return null;
                                                                    };

                                                                    const productImageUrl = getProductImage(item.product);
                                                                    return productImageUrl ? (
                                                                        <img
                                                                            src={productImageUrl.startsWith('http')
                                                                                ? productImageUrl
                                                                                : urlImage + productImageUrl}
                                                                            alt={item.product ? item.product.name : ''}
                                                                            className="img-thumbnail"
                                                                            style={{
                                                                                width: 40,
                                                                                height: 40,
                                                                                objectFit: 'cover',
                                                                                borderRadius: 6,
                                                                                border: '1px solid #dee2e6'
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 6 }}>
                                                                            <i className="fas fa-image" style={{ fontSize: 16, color: '#adb5bd' }}></i>
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
                                                                <span className="fw-bold text-primary small">{formatVNDWithUnit(item.product?.sale_price)}</span>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className="fw-bold">{item.quantity}</span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="text-center text-muted py-3">
                                                            <i className="fas fa-box-open fa-2x mb-2 opacity-50"></i>
                                                            <p className="mb-0">Không có sản phẩm trong combo</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
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
                            <Link className="btn btn-primary btn-sm" to={`/combo/${combo.id}`}>
                                <i className="fas fa-edit me-1"></i>Sửa combo
                            </Link>
                            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                                <i className="fas fa-trash-alt me-1"></i>Xóa combo
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ComboDetail;