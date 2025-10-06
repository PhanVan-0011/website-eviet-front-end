import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig'

const BranchUpdate = () => {
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

    // Lấy thông tin chi nhánh cần sửa
    useEffect(() => {
        const fetchBranchData = async () => {
            try {
                const response = await requestApi(`api/admin/branches/${params.id}`, 'GET');
                const data = response.data.data;
                setValue('code', data.code);
                setValue('name', data.name);
                setValue('address', data.address);
                setValue('phone_number', data.phone_number);
                setValue('email', data.email);
                setValue('active', data.active ? String(data.active) : "1");
            } catch (error) {
                console.error("Error fetching branch data: ", error);
            }
        };
        fetchBranchData();
    }, [params.id, setValue]);

    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);
        
        try {
            dispatch(actions.controlLoading(true));
            const response = await requestApi(
                `api/admin/branches/${params.id}`,
                'POST',
                data
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật chi nhánh thành công!", toastSuccessConfig);
                navigation('/branch');
            } else {
                toast.error(response.data.message || "Cập nhật chi nhánh thất bại", toastErrorConfig);
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
                        <li className="breadcrumb-item"><Link to="/branch">Chi nhánh</Link></li>
                        <li className="breadcrumb-item active">Cập nhật chi nhánh</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Cập nhật chi nhánh
                        </div>
                        <div className='card-body'>
                            <div className='mb-3 row'>
                                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputCode" className="form-label fw-semibold">
                                                    Mã chi nhánh <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputCode"
                                                    {...register('code', { required: 'Mã chi nhánh là bắt buộc' })}
                                                    placeholder="Nhập mã chi nhánh"
                                                />
                                                {errors.code && <div className="text-danger mt-1">{errors.code.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputName" className="form-label fw-semibold">
                                                    Tên chi nhánh <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputName"
                                                    {...register('name', { required: 'Tên chi nhánh là bắt buộc' })}
                                                    placeholder="Nhập tên chi nhánh"
                                                />
                                                {errors.name && <div className="text-danger mt-1">{errors.name.message}</div>}
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
                                                    {...register('phone_number', { 
                                                        required: 'Số điện thoại là bắt buộc',
                                                        pattern: {
                                                            value: /^[0-9]{10,11}$/,
                                                            message: "Số điện thoại phải có 10-11 chữ số"
                                                        },
                                                        validate: {
                                                            validPhone: (value) => {
                                                                // Kiểm tra số điện thoại Việt Nam
                                                                const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
                                                                return phoneRegex.test(value) || "Số điện thoại không hợp lệ (VD: 0987654321)";
                                                            }
                                                        }
                                                    })}
                                                    placeholder="Nhập số điện thoại (VD: 0987654321)"
                                                />
                                                {errors.phone_number && <div className="text-danger mt-1">{errors.phone_number.message}</div>}
                                            </div>
                                        </div>
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
                                                            message: "Email không hợp lệ"
                                                        }
                                                    })}
                                                    placeholder="Nhập email"
                                                />
                                                {errors.email && <div className="text-danger mt-1">{errors.email.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputStatus" className="form-label fw-semibold">
                                                    Trạng thái <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <select
                                                    className="form-select"
                                                    id="inputStatus"
                                                    {...register('active', { required: 'Trạng thái là bắt buộc' })}
                                                    defaultValue="1"
                                                >
                                                    <option value="1">Hoạt động</option>
                                                    <option value="0">Không hoạt động</option>
                                                </select>
                                                {errors.active && <div className="text-danger mt-1">{errors.active.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label htmlFor="inputAddress" className="form-label fw-semibold">
                                                    Địa chỉ <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    id="inputAddress"
                                                    rows="3"
                                                    {...register('address', { required: 'Địa chỉ là bắt buộc' })}
                                                    placeholder="Nhập địa chỉ chi nhánh"
                                                />
                                                {errors.address && <div className="text-danger mt-1">{errors.address.message}</div>}
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
                                                onClick={() => navigation('/branch')}
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
                    <p>Bạn chắc chắn muốn xóa chi nhánh này?</p>
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
                                const response = await requestApi(`api/admin/branches/${params.id}`, 'DELETE', []);
                                dispatch(actions.controlLoading(false));
                                if (response.data && response.data.success) {
                                    toast.success(response.data.message || "Xóa chi nhánh thành công!", toastSuccessConfig);
                                    navigation('/branch');
                                } else {
                                    toast.error(response.data.message || "Xóa chi nhánh thất bại", toastErrorConfig);
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

export default BranchUpdate
