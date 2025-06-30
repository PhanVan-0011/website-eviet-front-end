import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig'

// Thêm import cho datepicker
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {vi} from 'date-fns/locale';

const AdminAdd = () => {
    const navigation = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State cho ngày sinh
    const [dob, setDob] = useState(null);
    // State cho roles và role_ids
    const [roles, setRoles] = useState([]);

    // Lấy danh sách roles khi load form
    useEffect(() => {
        dispatch(actions.controlLoading(true));
        requestApi('api/admin/roles?limit=1000', 'GET', []).then((res) => {
            if (res.data && res.data.data) setRoles(res.data.data);
            dispatch(actions.controlLoading(false));
        });
    }, []);

    const handleSubmitForm = async (data) => {
        // Đưa ngày sinh vào data nếu có chọn
        if (dob) {
            data.date_of_birth = dob.toISOString().split('T')[0];
        }
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const response = await requestApi('api/admin/admins', 'POST', data);
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm nhân viên thành công!", toastSuccessConfig);
                // Nếu có access_token thì lưu vào localStorage
                if (response.data.data && response.data.data.access_token) {
                    localStorage.setItem('access_token', response.data.data.access_token);
                }
                setTimeout(() => {
                    navigation('/admin');
                }, 1500);
            } else {
                toast.error(response.data.message || "Thêm nhân viên thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            console.log("Error creating user: ", e);
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
                    <h1 className="mt-4">Thêm nhân viên</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Thêm nhân viên</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Dữ liệu nhân viên
                        </div>
                        <div className='card-body'>
                            <div className='mb-3 row'>
                                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3 mb-md-0">
                                                <input
                                                    className="form-control"
                                                    id="inputName"
                                                    {...register('name', { required: 'Tên nhân viên là bắt buộc' })}
                                                    placeholder="Nhập tên nhân viên"
                                                />
                                                <label htmlFor="inputName">
                                                    Tên nhân viên <span style={{color: 'red'}}>*</span>
                                                </label>
                                                {errors.name && <div className="text-danger">{errors.name.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    className="form-control"
                                                    id="inputAddress"
                                                    {...register('address', { required: 'Địa chỉ là bắt buộc' })}
                                                    placeholder="Nhập địa chỉ"
                                                />
                                                <label htmlFor="inputAddress">Địa chỉ <span style={{color: 'red'}}>*</span></label>
                                                {errors.address && <div className="text-danger">{errors.address.message}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3 mb-md-0">
                                                <input
                                                    className="form-control"
                                                    id="inputPhone"
                                                    {...register('phone', { required: 'Số điện thoại là bắt buộc' })}
                                                    placeholder="Nhập số điện thoại"
                                                />
                                                <label htmlFor="inputPhone">
                                                    Số điện thoại <span style={{color: 'red'}}>*</span>
                                                </label>
                                                {errors.phone && <div className="text-danger">{errors.phone.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    className="form-control"
                                                    id="inputEmail"
                                                    type="email"
                                                    {...register('email', { required: 'Email là bắt buộc' })}
                                                    placeholder="Nhập email"
                                                />
                                                <label htmlFor="inputEmail">
                                                    Email <span style={{color: 'red'}}>*</span>
                                                </label>
                                                {errors.email && <div className="text-danger">{errors.email.message}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3 mb-md-0">
                                                <input
                                                    className="form-control"
                                                    id="inputPassword"
                                                    type="password"
                                                    {...register('password', {
                                                        required: 'Mật khẩu là bắt buộc',
                                                        minLength: {
                                                            value: 6,
                                                            message: 'Mật khẩu phải có ít nhất 6 ký tự'
                                                        }
                                                    })}
                                                    placeholder="Nhập mật khẩu"
                                                />
                                                <label htmlFor="inputPassword">
                                                    Mật khẩu <span style={{color: 'red'}}>*</span>
                                                </label>
                                                {errors.password && <div className="text-danger">{errors.password.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3 mb-md-0">
                                                <input
                                                    className="form-control"
                                                    id="inputPasswordConfirm"
                                                    type="password"
                                                    {...register('password_confirmation', { required: 'Vui lòng xác nhận mật khẩu' })}
                                                    placeholder="Xác nhận mật khẩu"
                                                />
                                                <label htmlFor="inputPasswordConfirm">
                                                    Xác nhận mật khẩu <span style={{color: 'red'}}>*</span>
                                                </label>
                                                {errors.password_confirmation && <div className="text-danger">{errors.password_confirmation.message}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3 mb-md-0">
                                                <select
                                                    className="form-select"
                                                    id="inputGender"
                                                    {...register('gender')}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Chọn giới tính</option>
                                                    <option value="male">Nam</option>
                                                    <option value="female">Nữ</option>
                                                    <option value="other">Khác</option>
                                                </select>
                                                <label htmlFor="inputGender">Giới tính</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3 mb-md-0">
                                                <select className="form-select" id="is_active" {...register('is_active', { required: true })}>
                                                    <option value="1">Hoạt động</option>
                                                    <option value="0">Không Hoạt động</option>
                                                </select>
                                                <label htmlFor="is_active">Trạng thái</label>
                                            </div>
                                        </div>
                                    </div>    
                                    <div className="row mb-3">
                                    <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    Vai trò <span style={{ color: 'red' }}>*</span>
                                                </label>
                                                {roles && roles.length > 0 ? (
                                                    <div className="row g-2 overflow-auto border rounded p-2 bg-light" style={{maxHeight: 220}}>
                                                        {roles.map((role, idx) => (
                                                            <div className="col-6 col-md-4" key={role.id}>
                                                                <div className="form-check">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        id={`role_${role.id}`}
                                                                        value={role.id}
                                                                        {...register('role_ids', { required: 'Vai trò là bắt buộc' })}
                                                                    />
                                                                    <label className="form-check-label" htmlFor={`role_${role.id}`}>
                                                                        {role.display_name || role.name}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div>Đang lấy dữ liệu vai trò...</div>
                                                )}
                                               
                                                {errors.role_ids && <div className="text-danger">{errors.role_ids.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold" htmlFor='inputDob'>
                                                        Ngày sinh
                                                    </label>
                                                    <div className="d-flex align-items-center">
                                                        <label htmlFor="inputDob" className="form-label me-2" style={{
                                                                color: '#0d6efd', // Màu cam đẹp, bạn có thể đổi sang #0d6efd (xanh dương) hoặc #20c997 (xanh ngọc)
                                                                fontSize: 20,
                                                                marginRight: 10,
                                                                minWidth: 24,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>            
                                                            <i className="fas fa-calendar-alt"></i>
                                                        </label>
                                                        <DatePicker
                                                            id="inputDob"
                                                            selected={dob}
                                                            onChange={date => {
                                                                setDob(date);
                                                                setValue('date_of_birth', date ? date.toISOString().split('T')[0] : '');
                                                            }}
                                                            dateFormat="dd/MM/yyyy"
                                                            locale={vi}
                                                            className="form-control"
                                                            placeholderText="dd/mm/yyyy"
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                            isClearable
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                 
                                    </div>
             
                                    <div className="mt-4 mb-0">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-secondary w-25"
                                                onClick={() => navigation('/admin')}
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
}

export default AdminAdd