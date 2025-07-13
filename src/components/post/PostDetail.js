import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';

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
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <span className="ms-3 fs-5">Đang tải dữ liệu...</span>
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
                    <div className="mt-4 mb-3">
                        <h1 className="mt-4">Chi tiết bài viết</h1>
                        <ol className="breadcrumb mb-4">
                            <li className="breadcrumb-item"><Link to="/post">Danh sách bài viết</Link></li>
                            <li className="breadcrumb-item active">Chi tiết bài viết</li>
                        </ol>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-5">
                            <div className="card shadow-sm">
                                <div className="d-flex flex-column align-items-center p-3">
                                    {/* Ảnh đại diện lớn */}
                                    {post.image_urls && post.image_urls.length > 0 ? (
                                        (() => {
                                            const featuredImg = post.image_urls.find(img => img.is_featured === 1);
                                            const otherImgs = post.image_urls.filter(img => img.is_featured !== 1);
                                            return (
                                                <>
                                                    {featuredImg ? (
                                                        <>
                                                            <img
                                                                key={featuredImg.id}
                                                                src={urlImage + (featuredImg.main_url || featuredImg.thumb_url)}
                                                                alt={post.title + '-featured'}
                                                                className="img-thumbnail mb-3"
                                                                style={{
                                                                    objectFit: 'contain',
                                                                    boxShadow: '0 0 12px #007bff55',
                                                                    cursor: 'pointer',
                                                                    maxWidth: '80%',
                                                                    maxHeight: 400,
                                                                   
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
                                                                                src={urlImage + (modalImg.main_url || modalImg.thumb_url)}
                                                                                alt={post.title + '-modal-full'}
                                                                                style={{
                                                                                    maxWidth: '80vw',
                                                                                    maxHeight: '80vh',
                                                                                    display: 'block',
                                                                                    margin: '0 auto',
                                                                                    borderRadius: 8
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        {/* Đã ẩn nút X đóng */}
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
                                                                src={urlImage + (img.main_url || img.thumb_url)}
                                                                alt={post.title + '-' + idx}
                                                                style={{
                                                                    width: 90,
                                                                    height: 90,
                                                                    objectFit: 'cover',
                                                                    cursor: 'pointer',
                                                                    marginBottom: 4,
                                                                    marginRight: 8
                                                                }}
                                                                title="Ảnh bài viết (bấm để xem lớn)"
                                                                onClick={() => handleImgClick(img)}
                                                            />
                                                        )) : (
                                                            !featuredImg && <div className="text-muted">Chưa có ảnh bài viết</div>
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        })()
                                    ) : (
                                        <div className="text-muted">Chưa có ảnh bài viết</div>
                                    )}
                                </div>
                                <div className="card-body">
                                    <h4 className="card-title mb-2">{post.title}</h4>
                                    <div className="mb-2">
                                        {post.status === 1
                                            ? <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>Hiển thị</span>
                                            : <span className="badge bg-secondary"><i className="fas fa-ban me-1"></i>Ẩn</span>
                                        }
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold text-primary">Danh mục:</span> {post.categories && post.categories.length > 0 ? post.categories.map(cat => cat.name).join(', ') : <span className="text-muted">Chưa phân loại</span>}
                                    </div>
                                    <div className="mb-2">
                                        <span className="fw-semibold">Ngày tạo:</span> {post.created_at}
                                    </div>
                                    <div>
                                        <span className="fw-semibold">Cập nhật:</span> {post.updated_at}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-7 mb-4">
                            <div className="card shadow-sm h-100">
                                <div className="card-header bg-light fw-bold">
                                    <i className="fas fa-info-circle me-2"></i>Nội dung bài viết
                                </div>
                                <div className="card-body" style={{ minHeight: 200 }}>
                                    {post.content
                                        ? <div dangerouslySetInnerHTML={{ __html: post.content }} />
                                        : <span className="text-muted fst-italic">Chưa có nội dung</span>
                                    }
                                </div>
                                <div className="card-footer bg-white border-0">
                                    <Link className="btn btn-primary me-2" to={`/post/${post.id}`}>
                                        <i className="fas fa-edit"></i> Sửa bài viết
                                    </Link>
                                    <button className="btn btn-danger me-2" onClick={handleOpenDeleteModal}>
                                        <i className="fas fa-trash-alt"></i> Xóa bài viết
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