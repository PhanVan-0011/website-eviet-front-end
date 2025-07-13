import React, { use, useEffect, useState} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { set, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import moment from 'moment';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig'
import { Modal, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';

const UserUpdate = () => {
    const params = useParams();
    const navigation = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();
     const dispatch = useDispatch();
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [showModal, setShowModal] = useState(false);
     const [imagePreview, setImagePreview] = useState(null);
     const [imageFile, setImageFile] = useState(null);
     const [oldAvatar, setOldAvatar] = useState(null);
     const [dob, setDob] = useState(null);

    useEffect(() => {
        // Lấy thông tin khách hàng từ API
        const fetchUserData = async () => {
            dispatch(actions.controlLoading(true));
            try {
                const response = await requestApi(`api/admin/users/${params.id}`, 'GET');
                const data = response.data.data;
                setValue('name', data.name);
                setValue('address', data.address);
                setValue('phone', data.phone);
                setValue('email', data.email);
                setValue('gender', data.gender);
                setValue('is_active', data.is_active ? "1" : "0");
                setDob(data.date_of_birth ? new Date(data.date_of_birth) : null);
                setOldAvatar(data.image_url?.main_url || null);
                dispatch(actions.controlLoading(false));
            } catch (error) {
                dispatch(actions.controlLoading(false));
                console.error("Error fetching user data: ", error);
            }
        };
        fetchUserData();
    }, [params.id, setValue]);

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

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageFile(null);
    };

    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });
            if (imageFile) {
                formData.append('image_url', imageFile);
            }
            if (dob) {
                data.date_of_birth = dob.toISOString().split('T')[0];
            }
            const response = await requestApi(`api/admin/users/${params.id}`, 'POST', formData, 'json', 'multipart/form-data');
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật thông tin thành công", toastSuccessConfig);
                setTimeout(() => {
                    navigation('/user');
                }, 1500);
            } else {
                toast.error(response.data.message || "Cập nhật thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            console.log("Error Update user: ", e);
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
                <h1 className="mt-4">Chỉnh sửa khách hàng</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                    <li className="breadcrumb-item active">Chỉnh sửa khách hàng</li>
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
                                        <div className="form-floating mb-3 mb-md-0">
                                            <input
                                                className="form-control"
                                                id="inputName"
                                                {...register('name', { required: 'Tên khách hàng là bắt buộc' })}
                                                placeholder="Nhập tên khách hàng"
                                            />
                                            <label htmlFor="inputName">
                                                Tên khách hàng <span style={{color: 'red'}}>*</span>
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
                                                    Ảnh đại diện
                                                </label>
                                                <div className="d-flex gap-3 align-items-start">
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
                                                        ) : oldAvatar ? (
                                                            <img
                                                                src={process.env.REACT_APP_API_URL + 'api/images/' + oldAvatar}
                                                                alt="Avatar"
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
                                            className="btn btn-danger w-25 font-weight-bold"
                                            onClick={() => setShowModal(true)}
                                            disabled={isSubmitting}
                                        >
                                            Xóa
                                        </button>
                                          <button
                                            type="button"
                                            className="btn btn-secondary w-25 font-weight-bold"
                                            onClick={() => navigation('/user')}
                                            disabled={isSubmitting}
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button
                                            className="btn btn-primary w-25 font-weight-bold"
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Đang gửi..." : "Cập nhật"}
                                        </button>
                                      
                                       
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>                        
                </div>
            </div>
        </main>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Xác nhận xóa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Bạn chắc chắn muốn xóa khách hàng này?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Hủy
                </Button>
                <Button
                    variant="danger"
                    onClick={async () => {
                        setShowModal(false);
                       
                            try {
                                dispatch(actions.controlLoading(true));
                                const response = await requestApi(`api/admin/users/${params.id}`, 'DELETE', []);
                                dispatch(actions.controlLoading(false));
                                if (response.data && response.data.success) {
                                    toast.success(response.data.message || "Xóa khách hàng thành công!", toastSuccessConfig);
                                    setTimeout(() => {
                                        navigation('/user');
                                    }, 1200);
                                } else {
                                    toast.error(response.data.message || "Xóa khách hàng thất bại", toastErrorConfig);
                                }
                            } catch (e) {
                                dispatch(actions.controlLoading(false));
                                if (e.response && e.response.data && e.response.data.message) {
                                    toast.error(e.response.data.message, toastErrorConfig);
                                } else {
                                    toast.error("Server error", toastErrorConfig);
                                }
                            }
                       
                    }}
                    disabled={isSubmitting}
                >
                    Xóa
                </Button>
            </Modal.Footer>
        </Modal>
    </div>
  )
}

export default UserUpdate