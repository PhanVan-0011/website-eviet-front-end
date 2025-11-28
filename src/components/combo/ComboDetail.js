import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import requestApi from '../../helpers/api';
import { formatDate } from '../../tools/formatData';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import { cleanHtml, oembedToIframe } from '../../helpers/formatData';
import { formatVNDWithUnit } from '../../helpers/formatMoney';
import moment from 'moment';

const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

// Component hiển thị từng field thông tin
const InfoItem = ({ label, value, isDanger = false }) => (
    <div className="col-md-4 col-lg-3 mb-3">
        <div className="text-muted small mb-1">{label}</div>
        <div className={`fw-semibold border-bottom pb-2 ${isDanger ? 'text-danger' : ''}`}>
            {value ?? 'Chưa có'}
        </div>
    </div>
);

const ComboDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [combo, setCombo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalImg, setModalImg] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState('thong-tin');

    useEffect(() => {
        setLoading(true);
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/combos/${id}`, 'GET')
            .then(res => {
                setCombo(res.data.data);
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
    const handleOpenDeleteModal = () => {
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        setShowDeleteModal(false);
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
                <div className="d-flex flex-column justify-content-center align-items-center bg-light" style={{ minHeight: '60vh' }}>
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

                    <div className="card border">
                        {/* Tab Navigation */}
                        <ul className="nav nav-tabs" id="comboDetailTabs" role="tablist" style={{borderBottom: '2px solid #dee2e6'}}>
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
                                    className={`nav-link ${activeTab === 'mo-ta' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setActiveTab('mo-ta')}
                                    style={{ 
                                        color: activeTab === 'mo-ta' ? '#007bff' : '#6c757d',
                                        borderBottomColor: activeTab === 'mo-ta' ? '#007bff' : 'transparent',
                                        borderBottomWidth: activeTab === 'mo-ta' ? '2px' : '1px',
                                        textDecoration: 'none',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === 'mo-ta' ? '500' : 'normal'
                                    }}
                                >
                                    Mô tả chi tiết
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === 'chi-nhanh' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setActiveTab('chi-nhanh')}
                                    style={{ 
                                        color: activeTab === 'chi-nhanh' ? '#007bff' : '#6c757d',
                                        borderBottomColor: activeTab === 'chi-nhanh' ? '#007bff' : 'transparent',
                                        borderBottomWidth: activeTab === 'chi-nhanh' ? '2px' : '1px',
                                        textDecoration: 'none',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === 'chi-nhanh' ? '500' : 'normal'
                                    }}
                                >
                                    Chi nhánh áp dụng
                                </button>
                            </li>
                        </ul>

                        <div style={{ padding: '1.5rem' }}>
                            {/* Tab Thông tin */}
                            {activeTab === 'thong-tin' && (
                                <div>
                                    {/* Header: Hình ảnh + Thông tin combo */}
                                    <div style={{display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #dee2e6'}}>
                                        {/* Cột trái: Hình ảnh */}
                                        <div style={{flex: '0 0 35%'}}>
                                            <div style={{display: 'flex', gap: '0.75rem'}}>
                                                {/* Hình ảnh chính */}
                                                <div style={{flex: 1}}>
                                                    {combo.image_urls && combo.image_urls.length > 0 ? (
                                                    (() => {
                                                            const featuredImg = combo.image_urls.find(img => img.is_featured === 1);
                                                            const displayImg = featuredImg || combo.image_urls[0];
                                                        return (
                                                            <div style={{position: 'relative'}}>
                                                                <img
                                                                    src={process.env.REACT_APP_API_URL + 'api/images/' + (displayImg.main_url || displayImg.thumb_url)}
                                                                    alt={combo.name}
                                                                    className="img-thumbnail w-100"
                                                                    style={{
                                                                        objectFit: 'fill',
                                                                        cursor: 'pointer',
                                                                        borderRadius: 8,
                                                                        background: '#f8f9fa',
                                                                        border: '1px solid #dee2e6',
                                                                        height: 300,
                                                                        display: 'block'
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
                                                            </div>
                                                        );
                                                    })()
                                                ) : (
                                                    <div
                                                        style={{
                                                            width: '100%',
                                                            height: 300,
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
                                                {combo.image_urls && combo.image_urls.filter(img => img.is_featured !== 1).length > 0 && (
                                                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', width: 'auto'}}>
                                                        {combo.image_urls.filter(img => img.is_featured !== 1).map((img, idx) => (
                                                            <img
                                                                key={img.id}
                                                                src={urlImage + (img.main_url || img.thumb_url)}
                                                                alt={combo.name + '-' + idx}
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

                                        {/* Cột phải: Thông tin combo */}
                                        <div style={{flex: '0 0 65%'}}>
                                            {/* Tên combo */}
                                            <h3 style={{marginBottom: '0.75rem', marginTop: 0, fontWeight: 'bold', color: '#000'}}>
                                                {combo.name}
                                            </h3>

                                            {/* Badges */}
                                            <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem'}}>
                                                {combo.is_active === true ? (
                                                    <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>Đang áp dụng</span>
                                                ) : (
                                                    <span className="badge bg-danger"><i className="fas fa-ban me-1"></i>Ngừng áp dụng</span>
                                                )}
                                                {combo.applies_to_all_branches ? (
                                                    <span className="badge bg-info"><i className="fas fa-globe me-1"></i>Toàn hệ thống</span>
                                                ) : (
                                                    <span className="badge bg-secondary"><i className="fas fa-store me-1"></i>Chi nhánh cụ thể</span>
                                                )}
                                            </div>

                                            {/* Lưới thông tin */}
                                            <div className="row">
                                                <InfoItem label="Mã combo" value={combo.combo_code || combo.id} />
                                                <InfoItem label="Số sản phẩm" value={combo.items ? combo.items.length : 0} />
                                                <InfoItem label="Giá cửa hàng" value={formatVNDWithUnit(combo.base_store_price)} isDanger />
                                                <InfoItem label="Giá App" value={formatVNDWithUnit(combo.base_app_price)} isDanger />

                                                <InfoItem label="Thời gian bắt đầu" value={combo.start_date ? moment(combo.start_date).format('HH:mm DD/MM/YYYY') : 'N/A'} />
                                                <InfoItem label="Thời gian kết thúc" value={combo.end_date ? moment(combo.end_date).format('HH:mm DD/MM/YYYY') : 'N/A'} />
                                                <InfoItem label="Ngày tạo" value={formatDate(combo.created_at)} />
                                                <InfoItem label="Ngày cập nhật" value={formatDate(combo.updated_at)} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sản phẩm trong combo */}
                                    {combo.items && combo.items.length > 0 && (
                                        <div className="mt-4">
                                            <h6 className="fw-bold mb-3">Sản phẩm trong combo</h6>
                                            <div className="table-responsive">
                                                <table className="table table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '5%' }}>#</th>
                                                            <th style={{ width: '10%' }}>Ảnh</th>
                                                            <th style={{ width: '50%' }}>Sản phẩm</th>
                                                            <th className="text-center" style={{ width: '20%' }}>Giá</th>
                                                            <th className="text-center" style={{ width: '15%' }}>SL</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {combo.items.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td>{idx + 1}</td>
                                                                <td>
                                                                    {item.image_url ? (
                                                                        <img
                                                                            src={item.image_url.startsWith('http') ? item.image_url : urlImage + item.image_url}
                                                                            alt={item.name}
                                                                            className="img-thumbnail"
                                                                            style={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                objectFit: 'cover',
                                                                                borderRadius: 6,
                                                                                border: '1px solid #dee2e6'
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 6 }}>
                                                                            <i className="fas fa-image" style={{ fontSize: 18, color: '#adb5bd' }}></i>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <div className="fw-semibold small">{item.name}</div>
                                                                    <small className="text-muted">{item.product_code}</small>
                                                                </td>
                                                                <td className="text-center">
                                                                    <span className="fw-bold text-danger small">{formatVNDWithUnit(item.base_store_price)}</span>
                                                                </td>
                                                                <td className="text-center">
                                                                    <span className="fw-bold">{item.quantity}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab Sản phẩm trong combo */}
                            {activeTab === 'san-pham' && (
                                <div className="tab-pane fade show active">
                                    {combo.items && combo.items.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '5%' }}>#</th>
                                                            <th style={{ width: '10%' }}>Ảnh</th>
                                                            <th style={{ width: '50%' }}>Sản phẩm</th>
                                                            <th className="text-center" style={{ width: '20%' }}>Giá</th>
                                                            <th className="text-center" style={{ width: '15%' }}>SL</th>
                                                        </tr>
                                                    </thead>
                                                <tbody>
                                                    {combo.items.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>{idx + 1}</td>
                                                            <td>
                                                                {item.image_url ? (
                                                                    <img
                                                                        src={item.image_url.startsWith('http') ? item.image_url : urlImage + item.image_url}
                                                                        alt={item.name}
                                                                        className="img-thumbnail"
                                                                        style={{
                                                                            width: 50,
                                                                            height: 50,
                                                                            objectFit: 'cover',
                                                                            borderRadius: 6,
                                                                            border: '1px solid #dee2e6'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 6 }}>
                                                                        <i className="fas fa-image" style={{ fontSize: 16, color: '#adb5bd' }}></i>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div className="fw-semibold small">{item.name}</div>
                                                                <small className="text-muted">{item.product_code}</small>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className="fw-bold text-danger small">{formatVNDWithUnit(item.base_store_price)}</span>
                                                            </td>
                                                            <td className="text-center">
                                                                <span className="fw-bold">{item.quantity}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted py-5">
                                            <i className="fas fa-box-open fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0">Không có sản phẩm trong combo</p>
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
                                    {combo.description
                                        ? <div dangerouslySetInnerHTML={{ __html: cleanHtml(oembedToIframe(combo.description)) }} />
                                        : <div className="text-center text-muted py-5">
                                            <i className="fas fa-file-alt fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0">Chưa có mô tả combo</p>
                                        </div>
                                    }
                                </div>
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
                                        {combo.branches && combo.branches.length > 0 ? (
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
                                                        {combo.branches.map((branch, idx) => (
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
                                                <p className="mb-0">Combo này áp dụng cho toàn bộ hệ thống</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nút thao tác */}
                    <div className="row mt-4 mb-4">
                        <div className="col-12 d-flex justify-content-center gap-2">
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left me-1"></i>Quay lại
                            </button>
                            <Link className="btn btn-primary btn-sm" to={`/combo/${combo.id}`}>
                                <i className="fas fa-edit me-1"></i>Sửa combo
                            </Link>
                            <button className="btn btn-danger btn-sm" onClick={handleOpenDeleteModal}>
                                <i className="fas fa-trash-alt me-1"></i>Xóa combo
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
                    <p>Bạn có chắc chắn muốn xóa combo này?</p>
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

export default ComboDetail;