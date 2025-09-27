import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';

const RuleAdd = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const [permissions, setPermissions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(actions.controlLoading(true));
        // Lấy danh sách tất cả quyền có sẵn
        requestApi('api/admin/permissions?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setPermissions(response.data.data);
                dispatch(actions.controlLoading(false));
            }

        }).catch((error) => {
            dispatch(actions.controlLoading(false));
            console.log("Error fetching permissions: ", error);
        });
    }, []);

    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = {
                name: data.name,
                display_name: data.display_name,
                permissions: (data.permission_ids || []).map(Number)
            };
            const response = await requestApi(
                'api/admin/roles',
                'POST',
                formData,
                'json',
                'application/json'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm vai trò thành công!", toastSuccessConfig);
                
                navigate('/rule');
                
            } else {
                toast.error(response.data.message || "Thêm vai trò thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Lỗi khi thêm vai trò", toastErrorConfig);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="layoutSidenav_content">
            <main className="flex-grow-1 d-flex flex-column">
                <div className="container-fluid px-4 flex-grow-1 d-flex flex-column">
                    <h1 className="mt-4">Thêm vai trò</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/rule">Danh sách vai trò</Link></li>
                        <li className="breadcrumb-item active">Thêm vai trò</li>
                    </ol>
                    <div className="card mb-3 flex-grow-1 d-flex flex-column">
                        <div className="card-header">
                            <i className="fas fa-user-shield me-1"></i>
                            Thông tin vai trò
                        </div>
                        <div className="card-body flex-grow-1 d-flex flex-column">
                            <form className="flex-grow-1 d-flex flex-column mb-0" onSubmit={handleSubmit(handleSubmitForm)}>
                                <div className="row mb-3 align-items-stretch flex-grow-1">
                                    <div className="col-md-6 h-100 d-flex flex-column">
                                        <div className="mb-3 h-100">
                                            <label htmlFor="inputName" className="form-label fw-semibold">
                                                Tên vai trò <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                className="form-control"
                                                id="inputName"
                                                {...register('name', { 
                                                    required: 'Tên vai trò là bắt buộc',
                                                })}
                                                placeholder="Nhập tên vai trò"
                                            />
                                            {errors.name && <div className="text-danger mt-1">{errors.name.message}</div>}
                                            <small className="text-muted">Ví dụ: admin, content-editor, sales-manager</small>
                                        </div>
                                    </div>
                                    <div className="col-md-6 h-100 d-flex flex-column">
                                        <div className="mb-3 h-100">
                                            <label htmlFor="inputDisplayName" className="form-label fw-semibold">
                                                Tên hiển thị <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                className="form-control"
                                                id="inputDisplayName"
                                                {...register('display_name', { required: 'Tên hiển thị là bắt buộc' })}
                                                placeholder="Nhập tên hiển thị"
                                            />
                                            {errors.display_name && <div className="text-danger mt-1">{errors.display_name.message}</div>}
                                            <small className="text-muted">Ví dụ: Kế toán, Quản trị viên...</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-12 h-100 d-flex flex-column">
                                        <label className="form-label fw-semibold mb-2">
                                            Chọn quyền <span className="text-danger">*</span>
                                        </label>
                                        <div className="border rounded p-2 bg-light overflow-auto h-100" style={{maxHeight: '400px', minHeight: '120px'}}>
                                            {permissions && Object.keys(permissions).length > 0 ? (
                                                Object.keys(permissions).map(group => (
                                                    <div key={group} className="mb-2">
                                                        <div className="fw-bold text-primary mb-1 text-capitalize">
                                                            <i className="fas fa-folder me-2"></i>{group}
                                                        </div>
                                                        <div className="row g-2">
                                                            {permissions[group].map(permission => (
                                                                <div className="col-md-6" key={permission.id}>
                                                                    <div className="form-check d-flex align-items-center flex-row-reverse justify-content-end">
                                                                        <input
                                                                            className="form-check-input ms-2"
                                                                            type="checkbox"
                                                                            id={`perm_${permission.id}`}
                                                                            value={permission.id}
                                                                            {...register('permission_ids', { 
                                                                                required: 'Vui lòng chọn ít nhất một quyền' 
                                                                            })}
                                                                        />
                                                                        <label className="form-check-label mb-0 me-2" htmlFor={`perm_${permission.id}`}> 
                                                                            <span className="fw-semibold">{permission.display_name || permission.name}</span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-12 text-center text-muted">Hệ thống chưa tồn tại quyền nào...</div>
                                            )}
                                        </div>
                                        {errors.permission_ids && <div className="text-danger">{errors.permission_ids.message}</div>}
                                    </div>
                                </div>
                                <div className="mt-auto py-3 bg-white d-flex justify-content-center gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary w-25"
                                        onClick={() => navigate('/rule')}
                                        disabled={isSubmitting}
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        className="btn btn-primary w-25"
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Đang gửi..." : "Thêm mới"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RuleAdd;
