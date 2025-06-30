import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import requestApi from '../../helpers/api';
import { formatDate } from '../../tools/formatData';
import { toast } from 'react-toastify';
import * as actions from '../../redux/actions/index';
import { useDispatch } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
const AdminDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const [deleting, setDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        setLoading(true);
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/admins/${id}`, 'GET', []).then(res => {
            setUser(res.data.data);
            setLoading(false);
            dispatch(actions.controlLoading(false));
        }).catch(() => {
            dispatch(actions.controlLoading(false));
            setLoading(false)
        }
            );
    }, [id]);

    const handleDelete = async () => {
        setDeleting(true);
        dispatch(actions.controlLoading(true));
        try {
            const res = await requestApi(`api/admin/admins/${id}`, 'DELETE');
            dispatch(actions.controlLoading(false));
            toast.success(res.data?.message || 'Xóa nhân viên thành công!', toastSuccessConfig);
            navigate('/admin');
        } catch (e) {
            dispatch(actions.controlLoading(false));
            toast.error(e?.response?.data?.message || 'Xóa nhân viên thất bại!', toastErrorConfig);
        }
        setDeleting(false);
    };

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
    if (!user) return (
        <div className="container-fluid px-4">
            <div className="mt-4 mb-3">
                <h1 className="mt-4">Chi tiết nhân viên</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/admin">Danh sách nhân viên</Link></li>
                    <li className="breadcrumb-item active">Chi tiết nhân viên</li>
                </ol>
            </div>
            <div className="d-flex flex-column justify-content-center align-items-center bg-light rounded-3 shadow-sm" style={{ minHeight: '60vh' }}>
                <img
                    src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                    alt="Không tìm thấy nhân viên"
                    style={{ width: 120, marginBottom: 24, opacity: 0.85 }}
                />
                <h2 className="text-danger mb-2" style={{ fontWeight: 700 }}>
                    Không tìm thấy nhân viên!
                </h2>
                <p className="text-secondary mb-4 fs-5 text-center" style={{ maxWidth: 400 }}>
                    Nhân viên bạn tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.<br />
                    Vui lòng kiểm tra lại hoặc quay về trang danh sách nhân viên.
                </p>
                <Link to="/admin" className="btn btn-outline-primary px-4 py-2">
                    <i className="fas fa-arrow-left me-2"></i>Quay về danh sách nhân viên
                </Link>
            </div>
        </div>
    );

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4">Chi tiết nhân viên</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/admin">Danh sách nhân viên</Link></li>
                        <li className="breadcrumb-item active">Chi tiết nhân viên</li>
                    </ol>
                    <div className="card mb-3 bg-light rounded-3 shadow-sm">
                        <div className="card-header">
                            <i className="fas fa-user me-1"></i> Thông tin nhân viên
                        </div>
                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-md-6 mb-2">
                                    <strong>Họ tên:</strong> {user.name}
                                </div>
                                <div className="col-md-6 mb-2">
                                    <strong>Email:</strong> {user.email}
                                </div>
                                <div className="col-md-6 mb-2">
                                    <strong>Số điện thoại:</strong> {user.phone}
                                </div>
                                <div className="col-md-6 mb-2">
                                    <strong>Trạng thái:</strong> {user.is_active ? <span className="badge bg-success">Hoạt động</span> : <span className="badge bg-secondary">Không hoạt động</span>}
                                </div>
                                <div className="col-md-6 mb-2">
                                    <strong>Giới tính:</strong> {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}
                                </div>
                                <div className="col-md-6 mb-2">
                                    <strong>Ngày sinh:</strong> {user.date_of_birth || <span className="text-muted">Chưa cập nhật</span>}
                                </div>
                                <div className="col-md-6 mb-2">
                                    <strong>Địa chỉ:</strong> {user.address}
                                </div>
                                <div className="col-md-6 mb-2">
                                    <strong>Xác thực:</strong> {user.is_verified ? <span className="badge bg-success">Đã xác thực</span> : <span className="badge bg-warning text-dark">Chưa xác thực</span>}
                                </div>
                                <div className="col-md-6 mb-2">
                                    <strong>Ngày tạo:</strong> {formatDate(user.created_at)}
                                </div>
                                <div className="col-md-6 mb-2">
                                    <strong>Ngày cập nhật:</strong> {formatDate(user.updated_at)}
                                </div>
                                <div className="col-md-6 mb-2">
                                    <strong>Vai trò:</strong> {user.roles && user.roles.length > 0 ? user.roles.map(r => (
                                        <span key={r.id} className="badge bg-info text-dark me-1">{r.display_name || r.name}</span>
                                    )) : <span className="text-muted">Chưa có</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 3 button nằm ngoài card, căn giữa */}
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <button className="btn btn-danger px-4" onClick={() => setShowModal(true)} disabled={deleting}>
                            <i className="fas fa-trash-alt me-1"></i> Xóa
                        </button>
                        <button className="btn btn-primary px-4" onClick={() => navigate(`/admin/${user.id}`)}>
                            <i className="fas fa-edit me-1"></i> Cập nhật
                        </button>
                        <button className="btn btn-outline-secondary px-4" onClick={() => navigate(-1)}>
                            <i className="fas fa-arrow-left me-1"></i> Quay lại
                        </button>
                        <Modal show={showModal} onHide={() => setShowModal(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>Xác nhận xóa</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>Bạn chắc chắn muốn xóa nhân viên này?</p>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowModal(false)} disabled={deleting}>
                                    Hủy
                                </Button>
                                <Button variant="danger" onClick={async () => { setShowModal(false); await handleDelete(); }} disabled={deleting}>
                                    Xóa
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDetail; 