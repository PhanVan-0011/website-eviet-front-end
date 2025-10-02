import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig'

const SupplierAdd = () => {
    const navigation = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [groupSuppliers, setGroupSuppliers] = useState([]);

    // Load danh sách nhóm nhà cung cấp
    useEffect(() => {
        const fetchGroupSuppliers = async () => {
            try {
                const response = await requestApi('api/admin/supplier-groups?limit=1000', 'GET', []);
                if (response.data && response.data.data) {
                    setGroupSuppliers(response.data.data);
                }
            } catch (error) {
                console.error('Lỗi khi tải danh sách nhóm nhà cung cấp:', error);
                setGroupSuppliers([]);
            }
        };
        fetchGroupSuppliers();
    }, []);

    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);
        
        // Thêm user_id (có thể lấy từ user hiện tại hoặc hardcode)
        const submitData = {
            ...data,
            user_id: 37, // Hoặc lấy từ user hiện tại
            is_active: data.is_active === 'true' // Convert string to boolean
        };
        
        try {
            dispatch(actions.controlLoading(true));
            const response = await requestApi(
                'api/admin/suppliers',
                'POST',
                submitData
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm nhà cung cấp thành công!", toastSuccessConfig);
                
                navigation('/supplier');
                
            } else {
                toast.error(response.data.message || "Thêm nhà cung cấp thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Server error", toastErrorConfig);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/supplier">Nhà cung cấp</Link></li>
                        <li className="breadcrumb-item active">Thêm nhà cung cấp</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Thêm nhà cung cấp
                        </div>
                        <div className='card-body'>
                            <div className='mb-3 row'>
                                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputCode" className="form-label fw-semibold">
                                                    Mã nhà cung cấp <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputCode"
                                                    {...register('code', { required: 'Mã nhà cung cấp là bắt buộc' })}
                                                    placeholder="Nhập mã nhà cung cấp"
                                                />
                                                {errors.code && <div className="text-danger mt-1">{errors.code.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputName" className="form-label fw-semibold">
                                                    Tên nhà cung cấp <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputName"
                                                    {...register('name', { required: 'Tên nhà cung cấp là bắt buộc' })}
                                                    placeholder="Nhập tên nhà cung cấp"
                                                />
                                                {errors.name && <div className="text-danger mt-1">{errors.name.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputGroup" className="form-label fw-semibold">
                                                    Nhóm nhà cung cấp <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <select
                                                    className="form-select"
                                                    id="inputGroup"
                                                    {...register('group_id', { required: 'Nhóm nhà cung cấp là bắt buộc' })}
                                                >
                                                    <option value="">Chọn nhóm nhà cung cấp</option>
                                                    {groupSuppliers.map(group => (
                                                        <option key={group.id} value={group.id}>
                                                            {group.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.group_id && <div className="text-danger mt-1">{errors.group_id.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputPhone" className="form-label fw-semibold">
                                                    Số điện thoại <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputPhone"
                                                    {...register('phone_number', { required: 'Số điện thoại là bắt buộc' })}
                                                    placeholder="Nhập số điện thoại"
                                                />
                                                {errors.phone_number && <div className="text-danger mt-1">{errors.phone_number.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputEmail" className="form-label fw-semibold">
                                                    Email <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    id="inputEmail"
                                                    {...register('email', { 
                                                        required: 'Email là bắt buộc',
                                                        pattern: {
                                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                            message: 'Email không hợp lệ'
                                                        }
                                                    })}
                                                    placeholder="Nhập email"
                                                />
                                                {errors.email && <div className="text-danger mt-1">{errors.email.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputTaxCode" className="form-label fw-semibold">
                                                    Mã số thuế
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputTaxCode"
                                                    {...register('tax_code')}
                                                    placeholder="Nhập mã số thuế"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputAddress" className="form-label fw-semibold">
                                                    Địa chỉ
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    id="inputAddress"
                                                    rows="3"
                                                    {...register('address')}
                                                    placeholder="Nhập địa chỉ"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputStatus" className="form-label fw-semibold">
                                                    Trạng thái <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <select
                                                    className="form-select"
                                                    id="inputStatus"
                                                    {...register('is_active', { required: 'Trạng thái là bắt buộc' })}
                                                    defaultValue="true"
                                                >
                                                    <option value="true">Hoạt động</option>
                                                    <option value="false">Không hoạt động</option>
                                                </select>
                                                {errors.is_active && <div className="text-danger mt-1">{errors.is_active.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label htmlFor="inputNotes" className="form-label fw-semibold">
                                                    Ghi chú
                                                </label>
                                                <textarea
                                                    className="form-control large-textarea"
                                                    id="inputNotes"
                                                    rows="4"
                                                    {...register('notes')}
                                                    placeholder="Nhập ghi chú"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 mb-0">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-secondary w-25"
                                                onClick={() => navigation('/supplier')}
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
                                     </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
};

export default SupplierAdd;