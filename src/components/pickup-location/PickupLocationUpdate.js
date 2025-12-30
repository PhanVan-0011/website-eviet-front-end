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
import Select from 'react-select';

const PickupLocationUpdate = () => {
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
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [pickupLocation, setPickupLocation] = useState(null);

    // Lấy danh sách chi nhánh
    useEffect(() => {
        requestApi('api/admin/branches?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setBranches(response.data.data);
            }
        });
    }, []);

    // Lấy thông tin địa điểm nhận hàng cần sửa
    useEffect(() => {
        if (branches.length === 0) return; // Chờ branches load xong
        
        const fetchPickupLocationData = async () => {
            try {
                const response = await requestApi(`api/admin/pickup-locations/${params.id}`, 'GET');
                const data = response.data.data;
                setPickupLocation(data);
                setValue('name', data.name);
                setValue('description', data.description || '');
                setValue('is_active', data.is_active ? 'true' : 'false');
                
                // Set selected branch
                if (data.branch_id) {
                    const branch = branches.find(b => b.id === data.branch_id);
                    if (branch) {
                        const branchOption = {
                            value: branch.id,
                            label: branch.name,
                            data: branch
                        };
                        setSelectedBranch(branchOption);
                        setValue('branch_id', branch.id);
                    }
                }
            } catch (error) {
                console.error("Error fetching pickup location data: ", error);
                toast.error('Không thể tải thông tin địa điểm nhận hàng!', toastErrorConfig);
            }
        };
        fetchPickupLocationData();
    }, [params.id, setValue, branches]);

    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);
        
        if (!selectedBranch) {
            toast.error('Vui lòng chọn chi nhánh!', toastErrorConfig);
            setIsSubmitting(false);
            return;
        }
        
        const submitData = {
            branch_id: selectedBranch.value,
            name: data.name,
            description: data.description || '',
            is_active: data.is_active === 'true' || data.is_active === true
        };
        
        try {
            dispatch(actions.controlLoading(true));
            const response = await requestApi(
                `api/admin/pickup-locations/${params.id}`,
                'PUT',
                submitData
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật địa điểm nhận hàng thành công!", toastSuccessConfig);
                
                navigation('/pickup-location');
               
            } else {
                toast.error(response.data.message || "Cập nhật địa điểm nhận hàng thất bại", toastErrorConfig);
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

    const handleDelete = async () => {
        setShowModal(false);
        try {
            dispatch(actions.controlLoading(true));
            const response = await requestApi(`api/admin/pickup-locations/${params.id}`, 'DELETE', []);
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Xóa địa điểm nhận hàng thành công!", toastSuccessConfig);
                navigation('/pickup-location');
            } else {
                toast.error(response.data.message || "Xóa địa điểm nhận hàng thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Server error", toastErrorConfig);
            }
        }
    }

    const branchOptions = branches.map(branch => ({
        value: branch.id,
        label: branch.name,
        data: branch
    }));

    const selectStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '38px',
            borderColor: '#ced4da',
            '&:hover': {
                borderColor: '#86b7fe'
            }
        })
    };

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/pickup-location">Địa điểm nhận hàng</Link></li>
                        <li className="breadcrumb-item active">Cập nhật địa điểm nhận hàng</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Cập nhật địa điểm nhận hàng
                        </div>
                        <div className='card-body'>
                            <div className='mb-3 row'>
                                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                    <div className="row mb-3">
                                        <div className="col-12 col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputBranch" className="form-label fw-semibold">
                                                    Chi nhánh <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <Select
                                                    value={selectedBranch}
                                                    onChange={(option) => {
                                                        setSelectedBranch(option);
                                                        if (option) {
                                                            setValue('branch_id', option.value);
                                                        }
                                                    }}
                                                    options={branchOptions}
                                                    styles={selectStyles}
                                                    placeholder="Chọn chi nhánh"
                                                    isClearable
                                                    isSearchable
                                                />
                                                {!selectedBranch && errors.branch_id && (
                                                    <div className="text-danger mt-1">Chi nhánh là bắt buộc</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputName" className="form-label fw-semibold">
                                                    Tên địa điểm <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputName"
                                                    {...register('name', { required: 'Tên địa điểm là bắt buộc' })}
                                                    placeholder="Nhập tên địa điểm"
                                                />
                                                {errors.name && <div className="text-danger mt-1">{errors.name.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-12 col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputDescription" className="form-label fw-semibold">
                                                    Mô tả
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    id="inputDescription"
                                                    rows="3"
                                                    {...register('description')}
                                                    placeholder="Nhập mô tả"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
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
                                                    <option value="true">Hiển thị</option>
                                                    <option value="false">Không hiển thị</option>
                                                </select>
                                                {errors.is_active && <div className="text-danger mt-1">{errors.is_active.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 mb-0">
                                        <div className="d-flex justify-content-center detail-action-buttons">
                                            <Permission permission={PERMISSIONS.PICKUP_LOCATIONS_DELETE}>
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
                                                onClick={() => navigation('/pickup-location')}
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
                    <p>Bạn chắc chắn muốn xóa địa điểm nhận hàng này?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                    >
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default PickupLocationUpdate

