import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';

const RuleUpdate = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm();
    const dispatch = useDispatch();
    const [permissions, setPermissions] = useState([]);
    const [role, setRole] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rolePermissions, setRolePermissions] = useState([]);
    const watchedPermissions = watch('permissions', []);

    useEffect(() => {
        dispatch(actions.controlLoading(true));
        // Lấy danh sách quyền
        requestApi('api/admin/permissions?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setPermissions(response.data.data);
            }
        }).catch(() => {});
        // Lấy thông tin vai trò
        requestApi(`api/admin/roles/${id}`, 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setRole(response.data.data);
                setValue('name', response.data.data.name);
                setValue('display_name', response.data.data.display_name);
                setValue('permissions', response.data.data.permissions.map(p => p.id));
                setRolePermissions(response.data.data.permissions.map(p => p.id));
            }
            dispatch(actions.controlLoading(false));
        }).catch(() => {
            dispatch(actions.controlLoading(false));
        });
    }, [id, setValue, dispatch]);

    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = {
                name: data.name,
                display_name: data.display_name,
                permissions: (data.permissions || []).map(Number)
            };
            const response = await requestApi(
                `api/admin/roles/${id}`,
                'PUT',
                formData,
                'json',
                'application/json'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật vai trò thành công!", toastSuccessConfig);
                
                navigate('/rule');
                
            } else {
                toast.error(response.data.message || "Cập nhật vai trò thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Lỗi khi cập nhật vai trò", toastErrorConfig);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container-fluid px-4 min-vh-100 d-flex flex-column">
            <main className="flex-grow-1 d-flex flex-column">
                <div className="container-fluid px-4 flex-grow-1 d-flex flex-column">
                    <h1 className="mt-4">Cập nhật vai trò</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/rule">Danh sách vai trò</Link></li>
                        <li className="breadcrumb-item active">Cập nhật vai trò</li>
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
                                        <div className="form-floating mb-3 mb-md-0 h-100">
                                            <input
                                                className="form-control"
                                                id="inputName"
                                                {...register('name', { required: 'Tên vai trò là bắt buộc' })}
                                                placeholder="Nhập tên vai trò"
                                            />
                                            <label htmlFor="inputName">
                                                Tên vai trò <span className="text-danger">*</span>
                                            </label>
                                            {errors.name && <div className="text-danger">{errors.name.message}</div>}
                                            <small className="text-muted">Ví dụ: admin, content-editor, sales-manager</small>
                                        </div>
                                    </div>
                                    <div className="col-md-6 h-100 d-flex flex-column">
                                        <div className="form-floating mb-3 mb-md-0 h-100">
                                            <input
                                                className="form-control"
                                                id="inputDisplayName"
                                                {...register('display_name', { required: 'Tên hiển thị là bắt buộc' })}
                                                placeholder="Nhập tên hiển thị"
                                            />
                                            <label htmlFor="inputDisplayName">
                                                Tên hiển thị <span className="text-danger">*</span>
                                            </label>
                                            {errors.display_name && <div className="text-danger">{errors.display_name.message}</div>}
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
                                                                            {...register('permissions', { required: 'Vui lòng chọn ít nhất một quyền' })}
                                                                            checked={watchedPermissions.includes(permission.id.toString()) || watchedPermissions.includes(permission.id)}
                                                                            onChange={e => {
                                                                                const checked = e.target.checked;
                                                                                let newPermissions = [...watchedPermissions];
                                                                                if (checked) {
                                                                                    if (!newPermissions.includes(permission.id.toString())) newPermissions.push(permission.id.toString());
                                                                                } else {
                                                                                    newPermissions = newPermissions.filter(pid => pid !== permission.id.toString() && pid !== permission.id);
                                                                                }
                                                                                setValue('permissions', newPermissions);
                                                                            }}
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
                                                <div className="col-12 text-center text-muted">Đang tải dữ liệu...</div>
                                            )}
                                        </div>
                                        {errors.permissions && <div className="text-danger">{errors.permissions.message}</div>}
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
                                        {isSubmitting ? "Đang gửi..." : "Cập nhật"}
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

export default RuleUpdate; 