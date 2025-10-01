import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig } from '../../tools/toastConfig';
import { formatDate } from '../../tools/formatData';

const GroupSupplierDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [groupSupplier, setGroupSupplier] = useState(null);

    // Load dữ liệu nhóm nhà cung cấp
    useEffect(() => {
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/supplier-groups/${id}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setGroupSupplier(response.data.data);
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra', toastErrorConfig);
        });
    }, [id, dispatch]);

    if (!groupSupplier) {
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

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4">Chi tiết nhóm nhà cung cấp</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><a href="/">Trang chủ</a></li>
                        <li className="breadcrumb-item"><a href="/group-supplier">Nhóm nhà cung cấp</a></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>

                    <div className="row">
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">Thông tin nhóm nhà cung cấp</h5>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => navigate(`/group-supplier/${id}/edit`)}
                                    >
                                        <i className="fas fa-edit me-1"></i> Chỉnh sửa
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">ID:</label>
                                                <p className="form-control-plaintext">{groupSupplier.id}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">Trạng thái:</label>
                                                <p className="form-control-plaintext">
                                                    <span className={`badge ${groupSupplier.status == 1 ? 'bg-success' : 'bg-danger'}`}>
                                                        {groupSupplier.status == 1 ? 'Hoạt động' : 'Không hoạt động'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Tên nhóm nhà cung cấp:</label>
                                        <p className="form-control-plaintext">{groupSupplier.name}</p>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Mô tả:</label>
                                        <p className="form-control-plaintext">
                                            {groupSupplier.description || 'Không có mô tả'}
                                        </p>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">Ngày tạo:</label>
                                                <p className="form-control-plaintext">{formatDate(groupSupplier.created_at)}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">Ngày cập nhật:</label>
                                                <p className="form-control-plaintext">{formatDate(groupSupplier.updated_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-header">
                                    <h6 className="card-title mb-0">Thông tin bổ sung</h6>
                                </div>
                                <div className="card-body">
                                    <div className="alert alert-info">
                                        <h6 className="alert-heading">Thông tin:</h6>
                                        <ul className="mb-0">
                                            <li>ID: {groupSupplier.id}</li>
                                            <li>Trạng thái: {groupSupplier.status == 1 ? 'Hoạt động' : 'Không hoạt động'}</li>
                                            <li>Tạo lúc: {formatDate(groupSupplier.created_at)}</li>
                                            <li>Cập nhật lúc: {formatDate(groupSupplier.updated_at)}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="card mt-3">
                                <div className="card-header">
                                    <h6 className="card-title mb-0">Hành động</h6>
                                </div>
                                <div className="card-body">
                                    <div className="d-grid gap-2">
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => navigate(`/group-supplier/${id}/edit`)}
                                        >
                                            <i className="fas fa-edit me-1"></i> Chỉnh sửa
                                        </button>
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => navigate('/group-supplier')}
                                        >
                                            <i className="fas fa-arrow-left me-1"></i> Quay lại
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GroupSupplierDetail;
