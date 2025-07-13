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
import { vi } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminUpdate = () => {
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
     const [roles, setRoles] = useState([]);
     const [dob, setDob] = useState(null);
     // Thêm các state cho avatar
     const [imagePreview, setImagePreview] = useState(null);
     const [imageFile, setImageFile] = useState(null);
     const [oldAvatar, setOldAvatar] = useState(null);

    useEffect(() => {
        // Lấy dữ liệu user và roles song song
        const fetchAll = async () => {
            try {
                dispatch(actions.controlLoading(true));
                const [userRes, rolesRes] = await Promise.all([
                    requestApi(`api/admin/admins/${params.id}`, 'GET'),
                    requestApi('api/admin/roles?limit=1000', 'GET', [])
                ]);
                // Xử lý user
                const data = userRes.data.data;
                setValue('name', data.name);
                setValue('address', data.address);
                setValue('phone', data.phone);
                setValue('email', data.email);
                setValue('gender', data.gender);
                setValue('is_active', data.is_active ? "1" : "0");
                if (data.date_of_birth) {
                    const date = moment(data.date_of_birth, ['DD/MM/YYYY', 'YYYY-MM-DD']).toDate();
                    setDob(date);
                    setValue('date_of_birth', moment(date).format('YYYY-MM-DD'));
                } else {
                    setDob(null);
                    setValue('date_of_birth', '');
                }
                if (data.image_url && data.image_url.main_url) {
                    setOldAvatar(data.image_url.main_url);
                }
                if (data.roles && Array.isArray(data.roles)) {
                    setTimeout(() => {
                        setValue('role_ids', data.roles.map(r => String(r.id)));
                    }, 0);
                }
                // Xử lý roles
                if (rolesRes.data && rolesRes.data.data) setRoles(rolesRes.data.data);
                dispatch(actions.controlLoading(false));
            } catch (error) {
                dispatch(actions.controlLoading(false));
                console.error("Error fetching data: ", error);
            }
        };
        fetchAll();
    }, [params.id, setValue]);
    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            let response;
            if (imageFile) {
                // Nếu có ảnh mới, dùng FormData
                const formData = new FormData();
                Object.keys(data).forEach(key => {
                    if (Array.isArray(data[key])) {
                        data[key].forEach(val => formData.append(key + '[]', val));
                    } else {
                        formData.append(key, data[key]);
                    }
                });
                // Gửi role_ids dạng array
                if (Array.isArray(data.role_ids)) {
                    data.role_ids.forEach(id => formData.append('role_ids[]', id));
                }
                formData.append('image_url', imageFile); // key là image_url

                // // Log FormData entries
                // console.log('FormData entries:');
                // for (let pair of formData.entries()) {
                //     console.log(pair[0], pair[1]);
                // }
                // Log image file details
                // if (imageFile) {
                //     console.log('Image file:', {
                //         name: imageFile.name,
                //         type: imageFile.type,
                //         size: imageFile.size
                //     });
                // }

                response = await requestApi(`api/admin/admins/${params.id}`, 'POST', formData,'json', 'multipart/form-data');
            } else {
                response = await requestApi(`api/admin/admins/${params.id}`, 'POST', data);
            }
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật thông tin thành công", toastSuccessConfig);
                setTimeout(() => {
                    navigation('/admin');
                }, 1500);
            } else {
                toast.error(response.data.message || "Cập nhật thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            console.log("Error Update user: ", e);
            let errorMsg = "Server error";
            if (e.response && e.response.data) {
                let data = e.response.data;
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data);
                        console.log("Parsed error data: ", data);
                    } catch {}
                }
                if (data.message) {
                    errorMsg = data.message;
                }
            }
            toast.error(errorMsg, toastErrorConfig);
        } finally {
            setIsSubmitting(false);
        }
    }

    // Hàm chọn ảnh mới
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

    // Hàm xóa ảnh
    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setOldAvatar(null);
    };


  return (
    <div id="layoutSidenav_content">
        <main>
            <div className="container-fluid px-4">
                <h1 className="mt-4">Chỉnh sửa nhân viên</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                    <li className="breadcrumb-item active">Chỉnh sửa nhân viên</li>
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

                                {/* Avatar + Ngày sinh + Vai trò giống hệt AdminAdd */}
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
                                                            ) : oldAvatar ? (
                                                                <img
                                                                    src={process.env.REACT_APP_API_URL + 'api/images/' + oldAvatar}
                                                                    alt=""
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
                                            onClick={() => navigation('/admin')}
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
                <p>Bạn chắc chắn muốn xóa nhân viên này?</p>
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
                                    toast.success(response.data.message || "Xóa nhân viên thành công!", toastSuccessConfig);
                                    setTimeout(() => {
                                        navigation('/admin');
                                    }, 1200);
                                } else {
                                    toast.error(response.data.message || "Xóa nhân viên thất bại", toastErrorConfig);
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

export default AdminUpdate