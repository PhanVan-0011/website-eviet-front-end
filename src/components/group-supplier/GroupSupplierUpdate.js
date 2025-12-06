import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig'

const GroupSupplierUpdate = () => {
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

    // Lấy thông tin nhóm nhà cung cấp cần sửa
    useEffect(() => {
        const fetchGroupSupplierData = async () => {
            try {
                dispatch(actions.controlLoading(true));
                const response = await requestApi(`api/admin/supplier-groups/${params.id}`, 'GET');
                const data = response.data.data;
                setValue('name', data.name);
                setValue('description', data.description);
                setValue('status', data.status ? String(data.status) : "1");
            } catch (error) {
                console.error("Error fetching group supplier data: ", error);
            } finally {
                dispatch(actions.controlLoading(false));
                setIsLoading(false);
            }
        };
        fetchGroupSupplierData();
    }, [params.id, setValue, dispatch]);

    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);
        
        try {
            dispatch(actions.controlLoading(true));
            const response = await requestApi(
                `api/admin/supplier-groups/${params.id}`,
                'POST',
                data
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật nhóm nhà cung cấp thành công!", toastSuccessConfig);
                
                navigation('/group-supplier');
               
            } else {
                toast.error(response.data.message || "Cập nhật nhóm nhà cung cấp thất bại", toastErrorConfig);
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
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Cập nhật nhóm nhà cung cấp</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Cập nhật nhóm nhà cung cấp
                        </div>
                        <div className='card-body'>
                            <div className='mb-3 row'>
                                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputName" className="form-label fw-semibold">
                                                    Tên nhóm nhà cung cấp <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputName"
                                                    {...register('name', { required: 'Tên nhóm nhà cung cấp là bắt buộc' })}
                                                    placeholder="Nhập tên nhóm nhà cung cấp"
                                                />
                                                {errors.name && <div className="text-danger mt-1">{errors.name.message}</div>}
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
                                                    {...register('status', { required: 'Trạng thái là bắt buộc' })}
                                                    defaultValue="1"
                                                >
                                                    <option value="1">Hiển thị</option>
                                                    <option value="0">Ẩn</option>
                                                </select>
                                                {errors.status && <div className="text-danger mt-1">{errors.status.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputDescription" className="form-label fw-semibold">
                                                    Mô tả
                                                </label>
                                                <textarea
                                                    className="form-control large-textarea"
                                                    id="inputDescription"
                                                    rows="12"
                                                    {...register('description')}
                                                    placeholder="Nhập mô tả nhóm nhà cung cấp"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 mb-0">
                                        <div className="d-flex justify-content-center detail-action-buttons">
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => setShowModal(true)}
                                                disabled={isSubmitting}
                                            >
                                                <i className="fas fa-trash me-1"></i><span className="d-none d-sm-inline">Xóa</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => navigation('/group-supplier')}
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
                <p>Bạn chắc chắn muốn xóa nhóm nhà cung cấp này?</p>
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
                                const response = await requestApi(`api/admin/supplier-groups/${params.id}`, 'DELETE', []);
                                dispatch(actions.controlLoading(false));
                                if (response.data && response.data.success) {
                                    toast.success(response.data.message || "Xóa nhóm nhà cung cấp thành công!", toastSuccessConfig);
                                   
                                    navigation('/group-supplier');
                                    
                                } else {
                                    toast.error(response.data.message || "Xóa nhóm nhà cung cấp thất bại", toastErrorConfig);
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

export default GroupSupplierUpdate;
