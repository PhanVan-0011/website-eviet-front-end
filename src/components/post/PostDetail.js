import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Link, useParams, useNavigate } from 'react-router-dom';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import { cleanHtml,oembedToIframe } from '../../helpers/formatData';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalImg, setModalImg] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        setLoading(true);
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/posts/${id}`, 'GET')
            .then(res => {
                setPost(res.data.data);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            })
            .catch(() => {
                setPost(null);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            });
    }, [id, dispatch]);

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="d-flex justify-content-center align-items-center vh-100">
                {/* <span className="fs-5">Đang tải dữ liệu...</span> */}
            </div>
        </div> 
        );
    }
    if (!post) {
        return (
            <div className="container-fluid px-4">
                <div className="mt-4 mb-3">
                    <h1 className="mt-4">Chi tiết bài viết</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Danh sách bài viết</Link></li>
                        <li className="breadcrumb-item active">Chi tiết bài viết</li>
                    </ol>
                </div>
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                        alt="Không tìm thấy bài viết"
                        style={{ width: 120, marginBottom: 24, opacity: 0.85 }}
                    />
                    <h2 className="text-danger mb-2" style={{ fontWeight: 700 }}>
                        Không tìm thấy bài viết!
                    </h2>
                    <p className="text-secondary mb-4 fs-5 text-center" style={{ maxWidth: 400 }}>
                        Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.<br />
                        Vui lòng kiểm tra lại hoặc quay về trang danh sách bài viết.
                    </p>
                    <Link to="/post" className="btn btn-outline-primary px-4 py-2">
                        <i className="fas fa-arrow-left me-2"></i>Quay về danh sách bài viết
                    </Link>
                </div>
            </div>
        );
    }

    // Hàm xử lý khi click vào bất kỳ ảnh nào
    const handleImgClick = (img) => {
        setModalImg(img);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setModalImg(null);
    };

    // Hàm xóa bài viết
    const handleOpenDeleteModal = () => {
        setShowDeleteModal(true);
    };
    const handleDelete = async () => {
        setShowDeleteModal(false);
        dispatch(actions.controlLoading(true));
        try {
            const res = await requestApi(`api/admin/posts/${id}`, 'DELETE');
            dispatch(actions.controlLoading(false));
            toast.success(res.data?.message || 'Xóa bài viết thành công!', toastSuccessConfig);
            navigate('/post');
        } catch (e) {
            dispatch(actions.controlLoading(false));
            toast.error(
                e?.response?.data?.message || 'Xóa bài viết thất bại!', toastErrorConfig
            );
        }
    };

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <div className="d-flex align-items-center justify-content-between mt-4 mb-2">
                        <h2 className="mb-0">Chi tiết bài viết #{post.id}</h2>
                    </div>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/post">Bài viết</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>

                    <div className="row g-3">
                        {/* Thông tin bài viết & hình ảnh */}
                        <div className="col-lg-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-header background-detail py-2">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="fas fa-newspaper me-2"></i>Thông tin bài viết & hình ảnh
                                    </h6>
                                </div>
                                <div className="card-body p-3">
                                    {/* Hình ảnh bài viết */}
                                    <div className="mb-3" style={{ height: '280px', display: 'flex', flexDirection: 'column' }}>
                                        {post.image_urls && post.image_urls.length > 0 ? (
                                            (() => {
                                                const featuredImg = post.image_urls.find(img => img.is_featured === 1);
                                                const otherImgs = post.image_urls.filter(img => img.is_featured !== 1);
                                                return (
                                                    <>
                                                        {featuredImg ? (
                                                            <>
                                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, overflow: 'hidden' }}>
                                                                    <img
                                                                        key={featuredImg.id}
                                                                        src={urlImage + (featuredImg.main_url || featuredImg.thumb_url)}
                                                                        alt={post.title + '-featured'}
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
                                                                                    src={urlImage + (modalImg.main_url || modalImg.thumb_url)}
                                                                                    alt={post.title + '-modal-full'}
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
                                                                        src={urlImage + (img.main_url || img.thumb_url)}
                                                                        alt={post.title + '-' + idx}
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
                                                                        title="Ảnh bài viết (bấm để xem lớn)"
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
                                            <small className="text-muted d-block">Tiêu đề bài viết</small>
                                            <h6 className="fw-bold mb-1">{post.title}</h6>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Danh mục</small>
                                            <span className="small">{post.categories && post.categories.length > 0 
                                                ? post.categories.map(cat => cat.name).join(', ') 
                                                : 'Chưa phân loại'}</span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Trạng thái</small>
                                            {post.status === 1
                                                ? <span className="badge bg-success small"><i className="fas fa-check-circle me-1"></i>Hiển thị</span>
                                                : <span className="badge bg-secondary small"><i className="fas fa-ban me-1"></i>Ẩn</span>
                                            }
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Ngày tạo</small>
                                            <span className="small">{moment(post.created_at).format('HH:mm DD/MM/YYYY')}</span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Cập nhật</small>
                                            <span className="small">{moment(post.updated_at).format('HH:mm DD/MM/YYYY')}</span>
                                        </div>
                                       
                                    </div>
                                </div>
                                <div className="card shadow-sm border-0 h-100">
                                <div className="card-header py-2">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="fas fa-file-alt me-2"></i>Nội dung bài viết
                                    </h6>
                                </div>
                                <div className="card-body p-3" style={{ overflowY: 'auto' }}>
                                    {post.content
                                        ? <div dangerouslySetInnerHTML={{ __html: cleanHtml(oembedToIframe(post.content)) }} />
                                        : <div className="text-center text-muted py-5">
                                            <i className="fas fa-file-alt fa-3x mb-3 opacity-50"></i>
                                            <p className="mb-0">Chưa có nội dung bài viết</p>
                                        </div>
                                    }
                                </div>
                            </div>
                            </div>
                        </div>
                        {/* Nội dung bài viết
                        <div className="col-lg-12">
                        </div> */}
                    </div>

                    {/* Nút thao tác - Compact */}
                    <div className="row mb-4">
                        <div className="col-12 d-flex justify-content-center gap-2" style={{ marginTop: 20 }}>
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left me-1"></i>Quay lại
                            </button>
                            <Link className="btn btn-primary btn-sm" to={`/post/${post.id}`}>
                                <i className="fas fa-edit me-1"></i>Sửa bài viết
                            </Link>
                            <button className="btn btn-danger btn-sm" onClick={handleOpenDeleteModal}>
                                <i className="fas fa-trash-alt me-1"></i>Xóa bài viết
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
                    <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
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

export default PostDetail;