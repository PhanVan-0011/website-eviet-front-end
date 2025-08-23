import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import requestApi from '../../helpers/api';
import { formatDate } from '../../tools/formatData';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { toast } from 'react-toastify';
import moment from 'moment';
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
                    <div className="mt-4 mb-3">
                        <h1 className="mt-4"></h1>
                        <ol className="breadcrumb mb-4">
                            <li className="breadcrumb-item"><Link to="/combo">Danh sách combo</Link></li>
                            <li className="breadcrumb-item active">Chi tiết combo</li>
                        </ol>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-5">
                            <div className="card shadow-sm">
                                <img
                                    src={combo.mainImage ? urlImage + combo.mainImage : "https://via.placeholder.com/400x320?text=No+Image"}
                                    alt={combo.name}
                                    className="card-img-top"
                                    style={{ objectFit: 'contain', height: 320, borderRadius: '8px 8px 0 0', background: '#fafafa' }}
                                />
                                <div className="card-body">
                                    <h4 className="card-title mb-2">{combo.name}</h4>
                                    <div className="mb-2">
                                        {combo.is_active === true
                                            ? <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>Đang áp dụng</span>
                                            : <span className="badge bg-secondary"><i className="fas fa-ban me-1"></i>Ngừng áp dụng</span>
                                        }
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold text-success">Giá combo:</span> <span className="text-danger">
                                            {formatVNDWithUnit(combo.price)}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Số sản phẩm:</span> {combo.items ? combo.items.length : 0}
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Thời gian áp dụng:</span>
                                        <div>
                                            <div className="small text-muted">Từ:</div>
                                            <span className="text-primary">{moment(combo.start_date).format('HH:mm DD/MM/YYYY')}</span>
                                            <div className="small text-muted mt-1">Đến:</div>
                                            <span className="text-danger">{moment(combo.end_date).format('HH:mm DD/MM/YYYY')}</span>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Ngày tạo:</span> {formatDate(combo.created_at)}
                                    </div>
                                    <div>
                                        <span className="fw-semibold">Cập nhật:</span> {formatDate(combo.updated_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-7">
                            <div className="card shadow-sm h-100">
                                <div className="card-header bg-light fw-bold">
                                    <i className="fas fa-info-circle me-2"></i>Mô tả combo
                                </div>
                                <div className="card-body" style={{ minHeight: 120 }}>
                                    {  
                                    combo.description
                                        ? <div dangerouslySetInnerHTML={{ __html: cleanHtml(oembedToIframe(combo.description)) }} />
                                        : <span className="text-muted fst-italic"></span>
                                    }
                                </div>
                                <div className="card-header bg-light fw-bold border-top">
                                    <i className="fas fa-box-open me-2"></i>Sản phẩm trong combo
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
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {combo.items && combo.items.length > 0 ? (
                                                    combo.items.map((item, idx) => (
                                                        <tr key={item.id}>
                                                            <td>{idx + 1}</td>
                                                            <td>
                                                                {item.product && item.product.image_url ? (
                                                                    <img
                                                                        src={item.product.image_url.startsWith('http')
                                                                            ? item.product.image_url
                                                                            : urlImage + item.product.image_url}
                                                                        alt={item.product ? item.product.name : ''}
                                                                        className="img-thumbnail"
                                                                        style={{ width: 56, height: 56, objectFit: 'cover' }}
                                                                    />
                                                                ) : (
                                                                    <div style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', border: '1px solid #eee', borderRadius: 8 }}>
                                                                        <i className="fas fa-image" style={{ fontSize: 24, color: '#bbb' }}></i>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div className="fw-semibold">{item.product ? item.product.name : ''}</div>
                                                                <div className="text-muted small">{item.product ? item.product.size : ''}</div>
                                                            </td>
                                                            <td className="text-center">
                                                                {formatVNDWithUnit(item.product?.sale_price)}
                                                            </td>
                                                            <td className="text-center">{item.quantity}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="text-center text-muted">Không có sản phẩm</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Button thao tác ra ngoài card, căn giữa, margin-top */}
                    <div className="row">
                        <div className="col-12 d-flex justify-content-center gap-2" style={{ marginTop: 32 }}>
                            <Link className="btn btn-primary me-2" to={`/combo/${combo.id}`}>
                                <i className="fas fa-edit"></i> Sửa combo
                            </Link>
                            <button className="btn btn-danger me-2" onClick={handleDelete}>
                                <i className="fas fa-trash-alt"></i> Xóa combo
                            </button>
                            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left"></i> Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ComboDetail;