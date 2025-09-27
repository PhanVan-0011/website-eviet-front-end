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
import Select from 'react-select';
import { selectStyles } from '../common/FilterComponents';

const AdminAdd = () => {
    const navigation = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        trigger,
    } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State cho ngày sinh
    const [dob, setDob] = useState(null);
    // State cho roles và role_ids
    const [roles, setRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const roleOptions = roles.map(role => ({ value: role.id, label: role.display_name || role.name }));

    // State cho ảnh đại diện
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    // Lấy danh sách roles khi load form
    useEffect(() => {
        dispatch(actions.controlLoading(true));
        requestApi('api/admin/roles?limit=1000', 'GET', []).then((res) => {
            if (res.data && res.data.data) setRoles(res.data.data);
            dispatch(actions.controlLoading(false));
        });
    }, []);

    const onChangeImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Ảnh phải nhỏ hơn 2MB!', toastErrorConfig);
                e.target.value = "";
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
                toast.error('Chỉ chấp nhận ảnh jpg, jpeg, png, gif', toastErrorConfig);
                e.target.value = "";
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setImageFile(file);
        } else {
            setImagePreview(null);
            setImageFile(null);
        }
        e.target.value = "";
    };

    const handleSubmitForm = async (data) => {
        // Đảm bảo role_ids là mảng
        if (data.role_ids && !Array.isArray(data.role_ids)) {
            data.role_ids = [data.role_ids];
        }
        // Validate role_ids
        const valid = await trigger('role_ids');
        if (!valid) return;
        // Đưa ngày sinh vào data nếu có chọn
        if (dob) {
            data.date_of_birth = dob.toISOString().split('T')[0];
        }
        // Log dữ liệu trước khi submit
        console.log('Dữ liệu submit:', data);
        console.log('Ảnh đại diện:', imageFile);
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key !== 'imageFile' && key !== 'role_ids') formData.append(key, data[key]);
            });
            // Gửi role_ids dạng array
            if (Array.isArray(data.role_ids)) {
                data.role_ids.forEach(id => formData.append('role_ids[]', id));
            }
            if (imageFile) {
                formData.append('image_url', imageFile);
            }
            console.log(formData);
            const response = await requestApi('api/admin/admins', 'POST', formData, 'json', 'multipart/form-data');
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm nhân viên thành công!", toastSuccessConfig);
                // // Nếu có access_token thì lưu vào localStorage
                // if (response.data.data && response.data.data.access_token) {
                //     localStorage.setItem('access_token', response.data.data.access_token);
                // }
               
                navigation('/admin');
                
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
                                            <div className="mb-3">
                                                <label htmlFor="inputName" className="form-label fw-semibold">
                                                    Tên nhân viên <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputName"
                                                    {...register('name', { required: 'Tên nhân viên là bắt buộc' })}
                                                    placeholder="Nhập tên nhân viên"
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
                                                            message: 'Mật khẩu phải có ít nhất 8 ký tự'
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
                                            <div className="row">
                                                <div className="col-md-7">
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold">
                                                            Ảnh đại diện
                                                        </label>
                                                        <div className="d-flex gap-2 align-items-start">
                                                            <div 
                                                                className="position-relative rounded-circle bg-light d-flex align-items-center justify-content-center border border-2 border-secondary border-dashed"
                                                                style={{ width: 100, height: 100, overflow: 'hidden' }}
                                                            >
                                                                {imagePreview ? (
                                                                    <img
                                                                        src={imagePreview}
                                                                        alt="Avatar preview"
                                                                        className="w-100 h-100"
                                                                        style={{ objectFit: 'fill' }}
                                                                    />
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
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-5">
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold" htmlFor='inputDob'>
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
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    Vai trò <span style={{ color: 'red' }}>*</span>
                                                </label>
                                                <Select
                                                    options={roleOptions}
                                                    isMulti
                                                    value={roleOptions.filter(opt => selectedRoles.includes(String(opt.value)) || selectedRoles.includes(opt.value))}
                                                    onChange={opts => {
                                                        const values = opts ? opts.map(opt => opt.value) : [];
                                                        setSelectedRoles(values);
                                                        setValue('role_ids', values, { shouldValidate: true });
                                                    }}
                                                    placeholder="Tìm kiếm & chọn vai trò..."
                                                    classNamePrefix="react-select"
                                                    styles={selectStyles}
                                                    onBlur={() => trigger('role_ids')}
                                                />
                                                <input
                                                    type="hidden"
                                                    {...register('role_ids', {
                                                        validate: value => (value && value.length > 0) || 'Phải chọn ít nhất 1 vai trò!'
                                                    })}
                                                />
                                                {errors.role_ids && <div className="text-danger">{errors.role_ids.message}</div>}
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