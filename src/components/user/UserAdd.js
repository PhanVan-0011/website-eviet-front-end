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

const UserAdd = () => {
    const navigation = useNavigate();
    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dob, setDob] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // Hàm xử lý chọn ảnh đại diện giống ProductAdd
    const onChangeImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra kích thước
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Ảnh phải nhỏ hơn 2MB!', toastErrorConfig);
                e.target.value = ""; // reset input
                return;
            }
            // Kiểm tra định dạng
            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
                toast.error('Chỉ chấp nhận ảnh jpg, jpeg, png, gif', toastErrorConfig);
                e.target.value = ""; // reset input
                return;
            }

            // Đọc file và tạo preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Set giá trị cho form
            setImageFile(file);
        } else {
            setImagePreview(null);
            setImageFile(null);
        }
        e.target.value = ""; // reset input
    };

    // Khi submit, gửi imageFile.file lên API với field image_url
    const handleSubmitForm = async (data) => {
        // Đưa ngày sinh vào data nếu có chọn
        if (dob) {
            data.date_of_birth = dob.toISOString().split('T')[0];
        }
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            // Sử dụng FormData để gửi kèm ảnh
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key !== 'imageFile') formData.append(key, data[key]);
            });
            if (imageFile) {
                formData.append('image_url', imageFile);
            }
            const response = await requestApi('api/admin/users', 'POST', formData, 'json', 'multipart/form-data');
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm khách hàng thành công!", toastSuccessConfig);
                
                navigation('/user');
                
            } else {
                toast.error(response.data.message || "Thêm khách hàng thất bại", toastErrorConfig);
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
                    <h1 className="mt-4">Thêm khách hàng</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Thêm khách hàng</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Dữ liệu khách hàng
                        </div>
                        <div className='card-body'>
                            <div className='mb-3 row'>
                                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputName" className="form-label fw-semibold">
                                                    Tên khách hàng <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputName"
                                                    {...register('name', { required: 'Tên khách hàng là bắt buộc' })}
                                                    placeholder="Nhập tên khách hàng"
                                                />
                                                {errors.name && <div className="text-danger mt-1">{errors.name.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputAddress" className="form-label fw-semibold">
                                                    Địa chỉ <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputAddress"
                                                    {...register('address', { required: 'Địa chỉ là bắt buộc' })}
                                                    placeholder="Nhập địa chỉ"
                                                />
                                                {errors.address && <div className="text-danger mt-1">{errors.address.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                {/* Avatar upload react-hook-form chuẩn */}
                             

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputPhone" className="form-label fw-semibold">
                                                    Số điện thoại <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputPhone"
                                                    {...register('phone', { required: 'Số điện thoại là bắt buộc' })}
                                                    placeholder="Nhập số điện thoại"
                                                />
                                                {errors.phone && <div className="text-danger mt-1">{errors.phone.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputEmail" className="form-label fw-semibold">
                                                    Email <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputEmail"
                                                    type="email"
                                                    {...register('email', { required: 'Email là bắt buộc' })}
                                                    placeholder="Nhập email"
                                                />
                                                {errors.email && <div className="text-danger mt-1">{errors.email.message}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputPassword" className="form-label fw-semibold">
                                                    Mật khẩu <span style={{color: 'red'}}>*</span>
                                                </label>
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
                                                {errors.password && <div className="text-danger mt-1">{errors.password.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputPasswordConfirm" className="form-label fw-semibold">
                                                    Xác nhận mật khẩu <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputPasswordConfirm"
                                                    type="password"
                                                    {...register('password_confirmation', { required: 'Vui lòng xác nhận mật khẩu' })}
                                                    placeholder="Xác nhận mật khẩu"
                                                />
                                                {errors.password_confirmation && <div className="text-danger mt-1">{errors.password_confirmation.message}</div>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputGender" className="form-label fw-semibold">
                                                    Giới tính <span style={{ color: 'red' }}>*</span>
                                                </label>
                                                <select
                                                    className="form-select"
                                                    id="inputGender"
                                                    {...register('gender', { required: 'Giới tính là bắt buộc' })}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Chọn giới tính</option>
                                                    <option value="male">Nam</option>
                                                    <option value="female">Nữ</option>
                                                    <option value="other">Khác</option>
                                                </select>
                                                {errors.gender && <div className="text-danger mt-1">{errors.gender.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="is_active" className="form-label fw-semibold">
                                                    Trạng thái
                                                </label>
                                                <select className="form-select" id="is_active" {...register('is_active', { required: true })}>
                                                    <option value="1">Hoạt động</option>
                                                    <option value="0">Không Hoạt động</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    Ảnh đại diện
                                                </label>
                                                <div className="d-flex gap-3 align-items-start">
                                                    <div 
                                                        className="position-relative rounded-circle bg-light d-flex align-items-center justify-content-center border border-2 border-secondary border-dashed"
                                                        style={{ width: 100, height: 100, overflow: 'hidden' }}
                                                    >
                                                        {imagePreview ? (
                                                            <>
                                                                <img
                                                                    src={imagePreview}
                                                                    alt="Avatar preview"
                                                                    className="w-100 h-100"
                                                                    style={{ objectFit: 'fill' }}
                                                                />
                                                             
                                                            </>
                                                        ) : (
                                                            <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100">
                                                                <i className="fas fa-user fs-1 text-secondary"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="d-flex flex-column gap-2">
                                                        <div className="text-muted small">
                                                            Chỉ chọn 1 ảnh, định dạng: jpg, png...<br/>
                                                            Kích thước tối đa: 2MB
                                                        </div>
                                                        <label htmlFor="inputAvatar" className="btn btn-secondary mb-0">
                                                            <i className="fas fa-upload me-2"></i>Chọn ảnh
                                                        </label>
                                                        <input
                                                            id="inputAvatar"
                                                            type="file"
                                                            accept="image/*"
                                                            style={{ display: 'none' }}
                                                            onChange={onChangeImage}
                                                        />
                                                        {errors.imageFile && (
                                                            <div className="text-danger">{errors.imageFile.message}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    Ngày sinh
                                                </label>
                                                <div className="d-flex align-items-center">
                                                    <label htmlFor="inputDob" className="form-label me-2" style={{
                                                            color: '#0d6efd',
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
                                                        placeholderText="Chọn ngày sinh"
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
                                                onClick={() => navigation('/user')}
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

export default UserAdd