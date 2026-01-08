import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig'
import Select from 'react-select';
import { selectStyles } from '../common/FilterComponents';

const BranchAdd = () => {
    const navigation = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('thong-tin');

    // State cho thời gian bán (giống ProductUpdate)
    const [timeSlots, setTimeSlots] = useState([]);
    const [isFlexibleTime, setIsFlexibleTime] = useState(true);
    const [selectedTimeSlotIds, setSelectedTimeSlotIds] = useState([]);

    // Lấy danh sách time slots
    useEffect(() => {
        const fetchData = async () => {
            try {
                const timeSlotRes = await requestApi('api/admin/time-slots?limit=1000&is_active=1', 'GET', []);
                if (timeSlotRes.data && timeSlotRes.data.data) {
                    const activeTimeSlots = timeSlotRes.data.data.filter(slot => slot.is_active === true || slot.is_active === 1);
                    setTimeSlots(activeTimeSlots);
                }
            } catch (error) {
                console.error("Error fetching time slots: ", error);
            }
        };
        fetchData();
    }, []);

    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);

        try {
            dispatch(actions.controlLoading(true));
            const formData = {
                ...data,
                is_flexible_time: isFlexibleTime,
                time_slot_ids: !isFlexibleTime ? selectedTimeSlotIds : []
            };

            const response = await requestApi(
                'api/admin/branches',
                'POST',
                formData
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm chi nhánh thành công!", toastSuccessConfig);
                navigation('/branch');
            } else {
                toast.error(response.data.message || "Thêm chi nhánh thất bại", toastErrorConfig);
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

    // Format time từ HH:mm:ss sang HH:mm
    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.substring(0, 5); // Lấy HH:mm từ HH:mm:ss
    };

    // Giống ProductUpdate
    const timeSlotOptions = timeSlots.map(slot => ({
        value: slot.id,
        label: `${slot.name} (${formatTime(slot.start_time)} - ${formatTime(slot.end_time)})`
    }));

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/branch">Chi nhánh</Link></li>
                        <li className="breadcrumb-item active">Thêm chi nhánh</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Thêm chi nhánh
                        </div>
                        <div className='card-body'>
                            <div className='mb-3 row'>
                                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                    {/* Tab Navigation */}
                                    <ul className="nav nav-tabs mb-4" id="branchTabs" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'thong-tin' ? 'active' : ''}`}
                                                type="button"
                                                onClick={() => setActiveTab('thong-tin')}
                                                style={{
                                                    color: activeTab === 'thong-tin' ? '#007bff' : '#6c757d',
                                                    borderBottomColor: activeTab === 'thong-tin' ? '#007bff' : 'transparent',
                                                    borderBottomWidth: activeTab === 'thong-tin' ? '2px' : '1px',
                                                    textDecoration: 'none',
                                                    backgroundColor: 'transparent !important',
                                                }}
                                            >
                                                Thông tin
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'thoi-gian' ? 'active' : ''}`}
                                                type="button"
                                                onClick={() => setActiveTab('thoi-gian')}
                                                style={{
                                                    color: activeTab === 'thoi-gian' ? '#007bff' : '#6c757d',
                                                    borderBottomColor: activeTab === 'thoi-gian' ? '#007bff' : 'transparent',
                                                    borderBottomWidth: activeTab === 'thoi-gian' ? '2px' : '1px',
                                                    textDecoration: 'none',
                                                    backgroundColor: 'transparent !important',
                                                }}
                                            >
                                                Thời gian bán
                                            </button>
                                        </li>
                                    </ul>

                                    <div className="tab-content">
                                        {/* Tab Thông tin */}
                                        {activeTab === 'thong-tin' && (
                                            <div className="tab-pane fade show active">
                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputCode" className="form-label fw-semibold">
                                                                Mã chi nhánh <span style={{ color: 'red' }}>*</span>
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
                                                                Tên chi nhánh <span style={{ color: 'red' }}>*</span>
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
                                                                Số điện thoại <span style={{ color: 'red' }}>*</span>
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
                                                                Email <span style={{ color: 'red' }}>*</span>
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
                                                                Trạng thái <span style={{ color: 'red' }}>*</span>
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
                                                                Địa chỉ <span style={{ color: 'red' }}>*</span>
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
                                            </div>
                                        )}

                                        {/* Tab Thời gian bán */}
                                        {activeTab === 'thoi-gian' && (
                                            <div className="tab-pane fade show active">
                                                <div className="row mb-3">
                                                    <div className="col-md-12">
                                                        <div className="mb-3">
                                                            <label className="form-label fw-semibold">Loại thời gian bán</label>
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="timeType"
                                                                    id="flexibleTime"
                                                                    checked={isFlexibleTime}
                                                                    onChange={() => {
                                                                        setIsFlexibleTime(true);
                                                                        setSelectedTimeSlotIds([]);
                                                                    }}
                                                                />
                                                                <label className="form-check-label" htmlFor="flexibleTime">
                                                                    Bán linh hoạt
                                                                </label>
                                                            </div>
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="timeType"
                                                                    id="fixedTime"
                                                                    checked={!isFlexibleTime}
                                                                    onChange={() => setIsFlexibleTime(false)}
                                                                />
                                                                <label className="form-check-label" htmlFor="fixedTime">
                                                                    Thời gian cố định
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {!isFlexibleTime && (
                                                    <div className="row mb-3">
                                                        <div className="col-md-12">
                                                            <div className="mb-3">
                                                                <label className="form-label fw-semibold">Chọn khung giờ bán</label>
                                                                <Select
                                                                    options={timeSlotOptions}
                                                                    isMulti
                                                                    value={timeSlotOptions.filter(opt => selectedTimeSlotIds.includes(opt.value))}
                                                                    onChange={opts => {
                                                                        const values = opts ? opts.map(opt => opt.value) : [];
                                                                        setSelectedTimeSlotIds(values);
                                                                    }}
                                                                    placeholder="Tìm kiếm & chọn khung giờ..."
                                                                    classNamePrefix="react-select"
                                                                    styles={selectStyles}
                                                                    menuPortalTarget={document.body}
                                                                    menuPosition="fixed"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 mb-0">
                                        <div className="d-flex justify-content-center detail-action-buttons">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => navigation('/branch')}
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

export default BranchAdd
