import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig'
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';

const SupplierUpdate = () => {
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
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
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

    // Lấy thông tin nhà cung cấp cần sửa
    useEffect(() => {
        const fetchSupplierData = async () => {
            try {
                dispatch(actions.controlLoading(true));
                const response = await requestApi(`api/admin/suppliers/${params.id}`, 'GET');
                const data = response.data.data;
                setValue('code', data.code);
                setValue('name', data.name);
                setValue('group_id', data.group_id);
                setValue('phone_number', data.phone_number);
                setValue('email', data.email);
                setValue('tax_code', data.tax_code);
                setValue('address', data.address);
                setValue('notes', data.notes);
            } catch (error) {
                console.error("Error fetching supplier data: ", error);
            } finally {
                dispatch(actions.controlLoading(false));
                setIsLoading(false);
            }
        };
        fetchSupplierData();
    }, [params.id, setValue, dispatch]);

    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);
        
        // Lấy user_id từ localStorage
        const userData = localStorage.getItem('user');
        const currentUser = userData ? JSON.parse(userData) : null;
        const userId = currentUser?.id || null;
        
        if (!userId) {
            toast.error('Không tìm thấy thông tin người dùng', toastErrorConfig);
            setIsSubmitting(false);
            return;
        }
        
        // Thêm user_id thực tế
        const submitData = {
            ...data,
            user_id: userId
        };
        
        try {
            dispatch(actions.controlLoading(true));
            const response = await requestApi(
                `api/admin/suppliers/${params.id}`,
                'PUT',
                submitData
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật nhà cung cấp thành công!", toastSuccessConfig);
                
                navigation('/supplier');
               
            } else {
                toast.error(response.data.message || "Cập nhật nhà cung cấp thất bại", toastErrorConfig);
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
                        <li className="breadcrumb-item active">Cập nhật nhà cung cấp</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Cập nhật nhà cung cấp
                        </div>
                        <div className='card-body'>
                            <div className='mb-3 row'>
                                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputCode" className="form-label fw-semibold">
                                                    Mã nhà cung cấp
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputCode"
                                                    {...register('code')}
                                                    placeholder="Mã nhà cung cấp tự động"
                                                    readOnly
                                                    style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                                                />
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
                                        <div className="col-md-12">
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
                                        <div className="d-flex justify-content-center detail-action-buttons">
                                            <Permission permission={PERMISSIONS.SUPPLIERS_DELETE}>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => setShowModal(true)}
                                                    disabled={isSubmitting}
                                                >
                                                    <i className="fas fa-trash me-1"></i><span className="d-none d-sm-inline">Xóa</span>
                                                </button>
                                            </Permission>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => navigation('/supplier')}
                                                disabled={isSubmitting}
                                            >
                                                <i className="fas fa-times me-1"></i><span className="d-none d-sm-inline">Hủy bỏ</span>
                                            </button>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                type="submit"
                                                disabled={isSubmitting}
                                            >
                                                <i className="fas fa-check me-1"></i>
                                                <span className="d-none d-sm-inline">{isSubmitting ? "Đang gửi..." : "Cập nhật"}</span>
                                                {isSubmitting && <span className="d-sm-none">...</span>}
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
                <p>Bạn chắc chắn muốn xóa nhà cung cấp này?</p>
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
                                const response = await requestApi(`api/admin/suppliers/${params.id}`, 'DELETE', []);
                                dispatch(actions.controlLoading(false));
                                if (response.data && response.data.success) {
                                    toast.success(response.data.message || "Xóa nhà cung cấp thành công!", toastSuccessConfig);
                                   
                                    navigation('/supplier');
                                    
                                } else {
                                    toast.error(response.data.message || "Xóa nhà cung cấp thất bại", toastErrorConfig);
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
};

export default SupplierUpdate;