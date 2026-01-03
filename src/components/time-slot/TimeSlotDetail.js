import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { formatDate } from '../../tools/formatData';
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

const TimeSlotDetail = () => {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [timeSlot, setTimeSlot] = useState(null);
    const [loading, setLoading] = useState(true);

    // Format time từ HH:mm:ss sang HH:mm
    const formatTime = (timeString) => {
        if (!timeString) return '-';
        return timeString.substring(0, 5); // Lấy HH:mm từ HH:mm:ss
    };

    // Lấy thông tin chi tiết khung giờ
    useEffect(() => {
        const fetchTimeSlotData = async () => {
            try {
                dispatch(actions.controlLoading(true));
                const response = await requestApi(`api/admin/time-slots/${params.id}`, 'GET');
                setTimeSlot(response.data.data);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            } catch (error) {
                console.error("Error fetching time slot data: ", error);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            }
        };
        fetchTimeSlotData();
    }, [params.id, dispatch]);

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="d-flex justify-content-center align-items-center vh-100">
                    {/* <span className="fs-5">Đang tải dữ liệu...</span> */}
                </div>
            </div>     
        );
    }
    if (!timeSlot) {
        return (
            <div className="container-fluid px-4">
                <div className="mt-4 mb-3">
                    <h1 className="mt-4">Chi tiết khung giờ</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/time-slot">Danh sách thời gian đặt hàng</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>
                </div>
                
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                        alt="Không tìm thấy khung giờ"
                        style={{ width: 120, marginBottom: 24, opacity: 0.85 }}
                    />
                    <h2 className="text-danger mb-2" style={{ fontWeight: 700 }}>
                        Không tìm thấy khung giờ!
                    </h2>
                    <p className="text-secondary mb-4 fs-5 text-center" style={{ maxWidth: 400 }}>
                        Khung giờ bạn tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.<br />
                        Vui lòng kiểm tra lại hoặc quay về trang danh sách thời gian đặt hàng.
                    </p>
                    <Link to="/time-slot" className="btn btn-outline-primary px-4 py-2">
                        <i className="fas fa-arrow-left me-2"></i>Quay về danh sách thời gian đặt hàng
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
                        <h2 className="mb-0 detail-page-header">Chi tiết khung giờ #{timeSlot.id}</h2>
                    </div>
                    <ol className="breadcrumb mb-3 mb-md-4 detail-breadcrumb">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/time-slot">Danh sách thời gian đặt hàng</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>

                    <div className="card border">
                        <div className="detail-card">
                            {/* Header: Thông tin khung giờ */}
                            <div style={{marginBottom: '1.5rem', paddingBottom: '1.5rem'}}>
                                {/* Tên khung giờ */}
                                <h3 className="h4 h-md-3" style={{marginBottom: '0.75rem', marginTop: 0, fontWeight: 'bold', color: '#000'}}>
                                    {timeSlot.name}
                                </h3>

                                {/* Badges */}
                                <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem'}}>
                                    {timeSlot.is_active ? (
                                        <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>Hiển thị</span>
                                    ) : (
                                        <span className="badge bg-secondary"><i className="fas fa-ban me-1"></i>Không hiển thị</span>
                                    )}
                                </div>

                                {/* Lưới thông tin */}
                                <div className="row detail-info-grid">
                                    <InfoItem label="Tên ca bán" value={timeSlot.name} />
                                    <InfoItem label="Thời gian bán hàng" value={`${formatTime(timeSlot.start_time)} - ${formatTime(timeSlot.end_time)}`} />
                                    <InfoItem label="Thời gian giao hàng" value={`${formatTime(timeSlot.delivery_start_time)} - ${formatTime(timeSlot.delivery_end_time)}`} />
                                    <InfoItem label="Trạng thái" value={timeSlot.is_active ? 'Hiển thị' : 'Không hiển thị'} />
                                    <InfoItem label="Ngày tạo" value={timeSlot.created_at ? moment(timeSlot.created_at).format('DD/MM/YYYY') : 'Chưa có'} />
                                    <InfoItem label="Ngày cập nhật" value={timeSlot.updated_at ? moment(timeSlot.updated_at).format('DD/MM/YYYY') : 'Chưa có'} />
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
                            <Permission permission={PERMISSIONS.TIME_SLOTS_UPDATE}>
                                <Link className="btn btn-primary btn-sm" to={`/time-slot/${timeSlot.id}/edit`}>
                                    <i className="fas fa-edit me-1"></i><span className="d-none d-sm-inline">Sửa khung giờ</span>
                                </Link>
                            </Permission>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default TimeSlotDetail

