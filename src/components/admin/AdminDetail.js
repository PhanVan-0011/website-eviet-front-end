import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import requestApi from '../../helpers/api';
import { formatDate } from '../../tools/formatData';
import { toast } from 'react-toastify';
import * as actions from '../../redux/actions/index';
import { useDispatch } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';
import moment from 'moment';

// Component hiển thị từng field thông tin
const InfoItem = ({ label, value, isDanger = false }) => (
    <div className="col-md-3 mb-3">
        <div className="text-muted small mb-1">{label}</div>
        <div className={`fw-semibold border-bottom pb-2 ${isDanger ? 'text-danger' : ''}`}>
            {value ?? 'Chưa có'}
        </div>
    </div>
);
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
            <div className="container-fluid">
                 <div className="d-flex justify-content-center align-items-center vh-100">
                    {/* <span className="fs-5">Đang tải dữ liệu...</span> */}
                </div>
            </div>     
        );
    }
    if (!user) {
        return (
            <div className="container-fluid px-4">
                <div className="mt-4 mb-3">
                    <h1 className="mt-4">Chi tiết nhân viên</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/admin">Danh sách nhân viên</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>
                </div>
                
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
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
    }

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-3 px-md-4">
                    <div className="d-flex align-items-center justify-content-between mt-3 mt-md-4 mb-2">
                        <h2 className="mb-0 detail-page-header">Chi tiết nhân viên #{user.id}</h2>
                    </div>
                    <ol className="breadcrumb mb-3 mb-md-4 detail-breadcrumb">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/admin">Danh sách nhân viên</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>

                    <div className="card border">
                        <div className="detail-card">
                            {/* Header: Thông tin nhân viên */}
                            <div style={{marginBottom: '1.5rem', paddingBottom: '1.5rem'}}>
                                {/* Tên nhân viên */}
                                <h3 className="h4 h-md-3" style={{marginBottom: '0.75rem', marginTop: 0, fontWeight: 'bold', color: '#000'}}>
                                    {user.name}
                                </h3>

                                {/* Badges */}
                                <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem'}}>
                                    {user.is_active ? (
                                        <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>Hoạt động</span>
                                    ) : (
                                        <span className="badge bg-danger"><i className="fas fa-ban me-1"></i>Không hoạt động</span>
                                    )}
                                    {user.is_verified ? (
                                        <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>Đã xác thực</span>
                                    ) : (
                                        <span className="badge bg-warning text-dark"><i className="fas fa-exclamation-circle me-1"></i>Chưa xác thực</span>
                                    )}
                                    {user.role && (
                                        <span className="badge bg-info text-dark"><i className="fas fa-user-shield me-1"></i>{user.role.display_name || user.role.name}</span>
                                    )}
                                </div>

                                {/* Lưới thông tin */}
                                <div className="row detail-info-grid">
                                    <InfoItem label="Họ tên" value={user.name} />
                                    <InfoItem label="Email" value={user.email} />
                                    <InfoItem label="Số điện thoại" value={user.phone} />
                                    <InfoItem label="Giới tính" value={user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'} />

                                    <InfoItem label="Ngày sinh" value={user.date_of_birth || 'Chưa cập nhật'} />
                                    <InfoItem label="Địa chỉ" value={user.address} />
                                    <InfoItem label="Trạng thái" value={user.is_active ? 'Hoạt động' : 'Không hoạt động'} />
                                    <InfoItem label="Xác thực" value={user.is_verified ? 'Đã xác thực' : 'Chưa xác thực'} />

                                    <InfoItem label="Vai trò" value={user.role ? (user.role.display_name || user.role.name) : 'Chưa có'} />
                                    <InfoItem 
                                        label="Chi nhánh" 
                                        value={
                                            Array.isArray(user.branches) && user.branches.length > 0
                                                ? user.branches.map(b => b.name || (typeof b === 'string' ? b : '')).filter(Boolean).join(", ")
                                                : user.branch
                                                    ? (typeof user.branch === 'string' ? user.branch : (user.branch.name || ''))
                                                    : 'Tất cả chi nhánh'
                                        }
                                    />
                                    <InfoItem label="Ngày tạo" value={user.created_at ? moment(user.created_at).format('DD/MM/YYYY') : 'Chưa có'} />
                                    <InfoItem label="Ngày cập nhật" value={user.updated_at ? moment(user.updated_at).format('DD/MM/YYYY') : 'Chưa có'} />
                                </div>
                            </div>

        
                        </div>
                    </div>

                    {/* Nút thao tác */}
                    <div className="row mt-3 mt-md-4 mb-3 mb-md-4">
                        <div className="col-12 d-flex justify-content-center detail-action-buttons">
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left me-1"></i><span className="d-none d-sm-inline">Quay lại</span>
                            </button>
                            <Permission permission={PERMISSIONS.ADMIN_USERS_UPDATE}>
                                <Link className="btn btn-primary btn-sm" to={`/admin/${user.id}`}>
                                    <i className="fas fa-edit me-1"></i><span className="d-none d-sm-inline">Sửa nhân viên</span>
                                </Link>
                            </Permission>
                            <Permission permission={PERMISSIONS.ADMIN_USERS_DELETE}>
                                <button className="btn btn-danger btn-sm" onClick={() => setShowModal(true)} disabled={deleting}>
                                    <i className="fas fa-trash-alt me-1"></i><span className="d-none d-sm-inline">Xóa nhân viên</span>
                                </button>
                            </Permission>
                        </div>
                    </div>
                </div>
            </main>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Bạn có chắc chắn muốn xóa nhân viên này?</p>
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
    );
};

export default AdminDetail; 