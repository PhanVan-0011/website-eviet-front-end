import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig'
import Select from 'react-select';

const PickupLocationAdd = () => {
    const navigation = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);

    // Lấy danh sách chi nhánh
    useEffect(() => {
        requestApi('api/admin/branches?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setBranches(response.data.data);
            }
        });
    }, []);

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
                'api/admin/pickup-locations',
                'POST',
                submitData
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm địa điểm nhận hàng thành công!", toastSuccessConfig);
                
                navigation('/pickup-location');
                
            } else {
                toast.error(response.data.message || "Thêm địa điểm nhận hàng thất bại", toastErrorConfig);
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
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/pickup-location">Địa điểm nhận hàng</Link></li>
                        <li className="breadcrumb-item active">Thêm địa điểm nhận hàng</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Thêm địa điểm nhận hàng
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
                                                <span className="d-none d-sm-inline">{isSubmitting ? "Đang gửi..." : "Thêm mới"}</span>
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
        </div>
    )
}

export default PickupLocationAdd

