import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { formatDate } from '../../tools/formatData';
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';

const PickupLocationDetail = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const [pickupLocation, setPickupLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    // Lấy thông tin chi tiết địa điểm nhận hàng
    useEffect(() => {
        const fetchPickupLocationData = async () => {
            try {
                dispatch(actions.controlLoading(true));
                const response = await requestApi(`api/admin/pickup-locations/${params.id}`, 'GET');
                setPickupLocation(response.data.data);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            } catch (error) {
                console.error("Error fetching pickup location data: ", error);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            }
        };
        fetchPickupLocationData();
    }, [params.id, dispatch]);

    if (loading) {
        return (
            <div id="layoutSidenav_content">
                <main>
                    <div className="container-fluid px-4">
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!pickupLocation) {
        return (
            <div id="layoutSidenav_content">
                <main>
                    <div className="container-fluid px-4">
                        <div className="alert alert-danger" role="alert">
                            Không tìm thấy địa điểm nhận hàng!
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/pickup-location">Địa điểm nhận hàng</Link></li>
                        <li className="breadcrumb-item active">Chi tiết địa điểm nhận hàng</li>
                    </ol>
                    
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Chi tiết địa điểm nhận hàng
                        </div>
                        <div className='card-body'>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <strong>Tên địa điểm:</strong>
                                        </div>
                                        <div className="col-sm-9">
                                            {pickupLocation.name}
                                        </div>
                                    </div>
                                    
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <strong>Mô tả:</strong>
                                        </div>
                                        <div className="col-sm-9">
                                            {pickupLocation.description || 'Không có mô tả'}
                                        </div>
                                    </div>
                                    
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <strong>Chi nhánh:</strong>
                                        </div>
                                        <div className="col-sm-9">
                                            {pickupLocation.branch ? (
                                                <div>
                                                    <span className="badge bg-primary me-2">{pickupLocation.branch.code}</span>
                                                    {pickupLocation.branch.name}
                                                </div>
                                            ) : '-'}
                                        </div>
                                    </div>
                                    
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <strong>Trạng thái:</strong>
                                        </div>
                                        <div className="col-sm-9">
                                            {pickupLocation.is_active 
                                                ? <span className="badge bg-success">Hiển thị</span>
                                                : <span className="badge bg-secondary">Không hiển thị</span>
                                            }
                                        </div>
                                    </div>
                                    
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <strong>Ngày tạo:</strong>
                                        </div>
                                        <div className="col-sm-9">
                                            {formatDate(pickupLocation.created_at)}
                                        </div>
                                    </div>
                                    
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <strong>Ngày cập nhật:</strong>
                                        </div>
                                        <div className="col-sm-9">
                                            {formatDate(pickupLocation.updated_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <div className="d-flex justify-content-center gap-2">
                                    <Link 
                                        to="/pickup-location" 
                                        className="btn btn-secondary"
                                    >
                                        <i className="fas fa-arrow-left me-1"></i> Quay lại
                                    </Link>
                                    <Permission permission={PERMISSIONS.PICKUP_LOCATIONS_UPDATE}>
                                        <Link 
                                            to={`/pickup-location/${pickupLocation.id}/edit`} 
                                            className="btn btn-primary"
                                        >
                                            <i className="fas fa-edit me-1"></i> Chỉnh sửa
                                        </Link>
                                    </Permission>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default PickupLocationDetail

