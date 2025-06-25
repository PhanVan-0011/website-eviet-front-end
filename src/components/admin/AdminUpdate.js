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

    useEffect(() => {
        // Lấy thông tin người dùng từ API
        const fetchUserData = async () => {
            try {
                const response = await requestApi(`api/admin/users/${params.id}`, 'GET');
                const data = response.data.data;
                setValue('name', data.name);
                setValue('address', data.address);
                setValue('phone', data.phone);
                setValue('email', data.email);
                setValue('gender', data.gender);
                setValue('is_active', data.is_active ? "1" : "0");
                setValue(
                  'date_of_birth',
                  data.date_of_birth
                    ? moment(data.date_of_birth, ['DD/MM/YYYY', 'YYYY-MM-DD']).format('YYYY-MM-DD')
                    : ''
                );
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        };
        fetchUserData();
    }, [params.id, setValue])
    const handleSubmitForm = async (data) => {
        console.log("Submit data: ", data);
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const response = await requestApi(`api/admin/users/${params.id}`, 'PUT', data);
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
                <h1 className="mt-4">Chỉnh sửa người dùng</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                    <li className="breadcrumb-item active">Chỉnh sửa người dùng</li>
                </ol>
                <div className='card mb-3'>
                    <div className='card-header'>
                        <i className="fas fa-table me-1"></i>
                        Dữ liệu người dùng
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
                                                {...register('name', { required: 'Tên người dùng là bắt buộc' })}
                                                placeholder="Nhập tên người dùng"
                                            />
                                            <label htmlFor="inputName">
                                                Tên người dùng <span style={{color: 'red'}}>*</span>
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
                                        <div className="form-floating">
                                            <input
                                                className="form-control"
                                                id="inputDob"
                                                type="date"
                                                {...register('date_of_birth')}
                                                placeholder="Ngày sinh"
                                            />
                                            <label htmlFor="inputDob">Ngày sinh</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="row mb-3">
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
                                            onClick={() => navigation('-1')}
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
                <p>Bạn chắc chắn muốn xóa người dùng này?</p>
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
                                    toast.success(response.data.message || "Xóa người dùng thành công!", toastSuccessConfig);
                                    setTimeout(() => {
                                        navigation('/admin');
                                    }, 1200);
                                } else {
                                    toast.error(response.data.message || "Xóa người dùng thất bại", toastErrorConfig);
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