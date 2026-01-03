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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';

const TimeSlotUpdate = () => {
    const params = useParams();
    const navigation = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        watch,
    } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [timeSlot, setTimeSlot] = useState(null);
    
    // Time picker states
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [deliveryStartTime, setDeliveryStartTime] = useState(null);
    const [deliveryEndTime, setDeliveryEndTime] = useState(null);

    // Format time từ HH:mm:ss sang Date object cho DatePicker
    const parseTimeString = (timeString) => {
        if (!timeString) return null;
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes || 0, 0, 0);
        return date;
    };

    // Lấy thông tin khung giờ cần sửa
    useEffect(() => {
        const fetchTimeSlotData = async () => {
            try {
                const response = await requestApi(`api/admin/time-slots/${params.id}`, 'GET');
                const data = response.data.data;
                setTimeSlot(data);
                setValue('name', data.name);
                setValue('is_active', data.is_active ? 'true' : 'false');
                
                // Set time picker values
                const startTimeDate = parseTimeString(data.start_time);
                const endTimeDate = parseTimeString(data.end_time);
                const deliveryStartTimeDate = parseTimeString(data.delivery_start_time);
                const deliveryEndTimeDate = parseTimeString(data.delivery_end_time);
                
                setStartTime(startTimeDate);
                setEndTime(endTimeDate);
                setDeliveryStartTime(deliveryStartTimeDate);
                setDeliveryEndTime(deliveryEndTimeDate);
                
                setValue('start_time', startTimeDate);
                setValue('end_time', endTimeDate);
                setValue('delivery_start_time', deliveryStartTimeDate);
                setValue('delivery_end_time', deliveryEndTimeDate);
            } catch (error) {
                console.error("Error fetching time slot data: ", error);
                toast.error('Không thể tải thông tin khung giờ!', toastErrorConfig);
            }
        };
        fetchTimeSlotData();
    }, [params.id, setValue]);

    // Watch form values để hiển thị preview
    const watchedValues = watch();
    
    // Format time từ Date object sang HH:mm:ss
    const formatTimeToSeconds = (date) => {
        if (!date) return null;
        // Nếu là Date object
        if (date instanceof Date) {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}:00`;
        }
        // Nếu là string, giữ nguyên hoặc convert
        return date;
    };
    
    // Format time để hiển thị
    const formatTimeForDisplay = (date) => {
        if (!date) return 'Chưa chọn';
        if (date instanceof Date) {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        return date;
    };
    
    // Tính toán dữ liệu sẽ submit
    const previewData = {
        name: watchedValues.name || '',
        start_time: formatTimeForDisplay(startTime),
        end_time: formatTimeForDisplay(endTime),
        delivery_start_time: formatTimeForDisplay(deliveryStartTime),
        delivery_end_time: formatTimeForDisplay(deliveryEndTime),
        is_active: watchedValues.is_active === 'true' ? 'Hiển thị' : watchedValues.is_active === 'false' ? 'Không hiển thị' : 'Chưa chọn'
    };

    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);
        
        const submitData = {
            name: data.name,
            start_time: formatTimeToSeconds(data.start_time),
            end_time: formatTimeToSeconds(data.end_time),
            delivery_start_time: formatTimeToSeconds(data.delivery_start_time),
            delivery_end_time: formatTimeToSeconds(data.delivery_end_time),
            is_active: data.is_active === 'true' || data.is_active === true
        };
        
        try {
            dispatch(actions.controlLoading(true));
            const response = await requestApi(
                `api/admin/time-slots/${params.id}`,
                'PUT',
                submitData
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật khung giờ thành công!", toastSuccessConfig);
                
                navigation('/time-slot');
               
            } else {
                toast.error(response.data.message || "Cập nhật khung giờ thất bại", toastErrorConfig);
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
            const response = await requestApi(`api/admin/time-slots/${params.id}`, 'DELETE', []);
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Xóa khung giờ thành công!", toastSuccessConfig);
                navigation('/time-slot');
            } else {
                toast.error(response.data.message || "Xóa khung giờ thất bại", toastErrorConfig);
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

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/time-slot">Thời gian đặt hàng</Link></li>
                        <li className="breadcrumb-item active">Cập nhật khung giờ</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Cập nhật khung giờ
                        </div>
                        <div className='card-body'>
                            <div className='mb-3 row'>
                                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                    <div className="row mb-3">
                                        <div className="col-12 col-md-6 d-flex flex-column">
                                            <div className="mb-3 flex-grow-1 d-flex flex-column">
                                                <label htmlFor="inputName" className="form-label fw-semibold">
                                                    Tên ca bán <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputName"
                                                    {...register('name', { required: 'Tên ca bán là bắt buộc' })}
                                                    placeholder="Nhập tên ca bán"
                                                    style={{ minHeight: '38px' }}
                                                />
                                                {errors.name && <div className="text-danger mt-1">{errors.name.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6 d-flex flex-column">
                                            <div className="mb-3 flex-grow-1 d-flex flex-column">
                                                <label htmlFor="inputStatus" className="form-label fw-semibold">
                                                    Trạng thái <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <select
                                                    className="form-select"
                                                    id="inputStatus"
                                                    {...register('is_active', { required: 'Trạng thái là bắt buộc' })}
                                                    defaultValue="true"
                                                    style={{ minHeight: '38px' }}
                                                >
                                                    <option value="true">Hiển thị</option>
                                                    <option value="false">Không hiển thị</option>
                                                </select>
                                                {errors.is_active && <div className="text-danger mt-1">{errors.is_active.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Thời gian bán hàng */}
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <i className="fas fa-shopping-cart me-2 text-primary"></i>
                                            <h6 className="mb-0 fw-semibold">Thời gian bán hàng</h6>
                                        </div>
                                        <div className="row">
                                            <div className="col-12 col-md-6 d-flex flex-column">
                                                <div className="mb-3 flex-grow-1 d-flex flex-column">
                                                    <label htmlFor="inputStartTime" className="form-label fw-semibold">
                                                        Thời gian bắt đầu <span style={{color: 'red'}}>*</span>
                                                    </label>
                                                    <DatePicker
                                                        selected={startTime}
                                                        onChange={(date) => {
                                                            setStartTime(date);
                                                            setValue('start_time', date, { shouldValidate: true });
                                                        }}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={15}
                                                        timeCaption="Giờ"
                                                        dateFormat="HH:mm"
                                                        className="form-control"
                                                        placeholderText="Chọn thời gian bắt đầu"
                                                        locale={vi}
                                                        id="inputStartTime"
                                                        style={{ minHeight: '38px' }}
                                                    />
                                                    <input type="hidden" {...register('start_time', { required: 'Thời gian bắt đầu là bắt buộc' })} />
                                                    {errors.start_time && <div className="text-danger mt-1">{errors.start_time.message}</div>}
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-6 d-flex flex-column">
                                                <div className="mb-3 flex-grow-1 d-flex flex-column">
                                                    <label htmlFor="inputEndTime" className="form-label fw-semibold">
                                                        Thời gian kết thúc <span style={{color: 'red'}}>*</span>
                                                    </label>
                                                    <DatePicker
                                                        selected={endTime}
                                                        onChange={(date) => {
                                                            setEndTime(date);
                                                            setValue('end_time', date, { shouldValidate: true });
                                                        }}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={15}
                                                        timeCaption="Giờ"
                                                        dateFormat="HH:mm"
                                                        className="form-control"
                                                        placeholderText="Chọn thời gian kết thúc"
                                                        locale={vi}
                                                        id="inputEndTime"
                                                        style={{ minHeight: '38px' }}
                                                    />
                                                    <input type="hidden" {...register('end_time', { required: 'Thời gian kết thúc là bắt buộc' })} />
                                                    {errors.end_time && <div className="text-danger mt-1">{errors.end_time.message}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thời gian giao hàng */}
                                    <div className="mb-4">
                                        <div className="d-flex align-items-center mb-3">
                                            <i className="fas fa-truck me-2 text-success"></i>
                                            <h6 className="mb-0 fw-semibold">Thời gian giao hàng</h6>
                                        </div>
                                        <div className="row">
                                            <div className="col-12 col-md-6 d-flex flex-column">
                                                <div className="mb-3 flex-grow-1 d-flex flex-column">
                                                    <label htmlFor="inputDeliveryStartTime" className="form-label fw-semibold">
                                                        Thời gian giao hàng bắt đầu <span style={{color: 'red'}}>*</span>
                                                    </label>
                                                    <DatePicker
                                                        selected={deliveryStartTime}
                                                        onChange={(date) => {
                                                            setDeliveryStartTime(date);
                                                            setValue('delivery_start_time', date, { shouldValidate: true });
                                                        }}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={15}
                                                        timeCaption="Giờ"
                                                        dateFormat="HH:mm"
                                                        className="form-control"
                                                        placeholderText="Chọn thời gian giao hàng bắt đầu"
                                                        locale={vi}
                                                        id="inputDeliveryStartTime"
                                                        style={{ minHeight: '38px' }}
                                                    />
                                                    <input type="hidden" {...register('delivery_start_time', { required: 'Thời gian giao hàng bắt đầu là bắt buộc' })} />
                                                    {errors.delivery_start_time && <div className="text-danger mt-1">{errors.delivery_start_time.message}</div>}
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-6 d-flex flex-column">
                                                <div className="mb-3 flex-grow-1 d-flex flex-column">
                                                    <label htmlFor="inputDeliveryEndTime" className="form-label fw-semibold">
                                                        Thời gian giao hàng kết thúc <span style={{color: 'red'}}>*</span>
                                                    </label>
                                                    <DatePicker
                                                        selected={deliveryEndTime}
                                                        onChange={(date) => {
                                                            setDeliveryEndTime(date);
                                                            setValue('delivery_end_time', date, { shouldValidate: true });
                                                        }}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={15}
                                                        timeCaption="Giờ"
                                                        dateFormat="HH:mm"
                                                        className="form-control"
                                                        placeholderText="Chọn thời gian giao hàng kết thúc"
                                                        locale={vi}
                                                        id="inputDeliveryEndTime"
                                                        style={{ minHeight: '38px' }}
                                                    />
                                                    <input type="hidden" {...register('delivery_end_time', { required: 'Thời gian giao hàng kết thúc là bắt buộc' })} />
                                                    {errors.delivery_end_time && <div className="text-danger mt-1">{errors.delivery_end_time.message}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 mb-0">
                                        <div className="d-flex justify-content-center detail-action-buttons">
                                            <Permission permission={PERMISSIONS.TIME_SLOTS_DELETE}>
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
                                                onClick={() => navigation('/time-slot')}
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
                    <p>Bạn chắc chắn muốn xóa khung giờ này?</p>
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

export default TimeSlotUpdate

