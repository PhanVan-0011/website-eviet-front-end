import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import CustomEditor from '../common/CustomEditor';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';

const ComboAdd = () => {
    const navigation = useNavigate();
    const { register, handleSubmit, setValue, trigger, formState: { errors }, watch } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [products, setProducts] = useState([]);
    const [price, setPrice] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [comboItems, setComboItems] = useState([{ product_id: '', quantity: 1 }]);
    const [startDatePicker, setStartDatePicker] = useState(null);
    const [endDatePicker, setEndDatePicker] = useState(null);

    // Lấy danh sách sản phẩm
    useEffect(() => {
        requestApi('api/admin/products?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setProducts(response.data.data);
            }
        });
    }, []);

    // Hàm xử lý khi chọn ảnh
    const onChangeImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
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
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setValue('imageFile', file, { shouldValidate: true });
        e.target.value = "";
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setValue('imageFile', null, { shouldValidate: true });
    };

    // Thêm hàm format chỉ dấu chấm ngăn cách hàng nghìn
    const formatVND = (value) => {
        value = value.replace(/\D/g, ''); // chỉ lấy số
        if (!value) return '';
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Thêm/xóa sản phẩm trong combo
    const handleAddItem = () => {
        setComboItems([...comboItems, { product_id: '', quantity: 1 }]);
    };
    const handleRemoveItem = (idx) => {
        if (comboItems.length === 1) return;
        setComboItems(comboItems.filter((_, i) => i !== idx));
    };
    const handleChangeItem = (idx, field, value) => {
        setComboItems(comboItems.map((item, i) =>
            i === idx ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmitForm = async (data) => {
        // Validate thời gian kết thúc phải lớn hơn hoặc bằng ngày bắt đầu
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            toast.error("Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu", toastErrorConfig);
            setIsSubmitting(false);
            return;
        }
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description || '');
            formData.append('price', Number(data.price.replace(/\./g, '')));
            formData.append('start_date', startDate ? new Date(startDate).toISOString() : '');
            formData.append('end_date', endDate ? new Date(endDate).toISOString() : '');
            formData.append('is_active', data.is_active);
            formData.append('image_url', imageFile);

            // Thêm sản phẩm vào combo
            comboItems.forEach((item, idx) => {
                formData.append(`items[${idx}][product_id]`, item.product_id);
                formData.append(`items[${idx}][quantity]`, item.quantity);
            });

            const response = await requestApi(
                'api/admin/combos',
                'POST',
                formData,
                'json',
                'multipart/form-data'
            );
            dispatch(actions.controlLoading(false));
            console.log("Response from adding combo:", response);
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm combo thành công!", toastSuccessConfig);
                setTimeout(() => {
                    navigation('/combo');
                }, 1500);
            } else {
                toast.error(response.data.message || "Thêm combo thất bại", toastErrorConfig);
            }
        } catch (e) {
            console.error("Error adding combo:", e);
            dispatch(actions.controlLoading(false));
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Lỗi khi thêm combo", toastErrorConfig);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4">Thêm combo mới</h1>
                    <ol className="breadcrumb mb-4 p-2">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Thêm combo</li>
                    </ol>
                    <form onSubmit={handleSubmit(handleSubmitForm)}>
                        <div className="row g-4">
                            {/* Thông tin cơ bản */}
                            <div className="col-lg-6">
                                <div className="card shadow-sm border-0 h-100">
                                    <div className="card-header bg-white border-bottom-0 pb-0">
                                        <h5 className="mb-0 fw-semibold text-secondary"><i className="fas fa-info-circle me-2"></i>Thông tin cơ bản</h5>
                                    </div>
                                    <div className="card-body pt-2">
                                        <div className="mb-3">
                                            <div className="form-floating">
                                                <input
                                                    className="form-control"
                                                    id="inputName"
                                                    {...register('name', { required: 'Tên combo là bắt buộc' })}
                                                    placeholder="Nhập tên combo"
                                                />
                                                <label htmlFor="inputName">
                                                    Tên combo <span className="text-danger">*</span>
                                                </label>
                                                {errors.name && <div className="text-danger mt-1 small">{errors.name.message}</div>}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <div className="form-floating">
                                                <input
                                                    className="form-control"
                                                    id="inputPrice"
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    value={price}
                                                    {...register('price')}
                                                    onChange={e => {
                                                        const formatted = formatVND(e.target.value);
                                                        setPrice(formatted);
                                                        setValue('price', formatted, { shouldValidate: true });
                                                    }}
                                                    placeholder="Nhập giá Combo (VND)"
                                                />
                                                <label htmlFor="inputPrice">
                                                    Giá Combo (VNĐ)
                                                </label>
                                                {errors.price && <div className="text-danger mt-1 small">{errors.price.message}</div>}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <div className="form-floating">
                                                <select
                                                    className="form-select"
                                                    id="inputStatus"
                                                    {...register('is_active', { required: 'Trạng thái là bắt buộc' })}
                                                    defaultValue="1"
                                                >
                                                    <option value="1">Hiển thị</option>
                                                    <option value="0">Ẩn</option>
                                                </select>
                                                <label htmlFor="inputStatus">Trạng thái <span className="text-danger">*</span></label>
                                                {errors.is_active && <div className="text-danger mt-1 small">{errors.is_active.message}</div>}
                                            </div>
                                        </div>
                                        {/* Ngày bắt đầu và kết thúc cùng 1 hàng */}
                                        <div className="row mb-3">
                                            <div className="col-6">
                                                <label htmlFor="inputStartDate" className="form-label fw-semibold">
                                                    Ngày bắt đầu <span className="text-danger">*</span>
                                                </label>
                                                <div className="d-flex align-items-center" style={{gap: '4px'}}>
                                                    <DatePicker
                                                        selected={startDatePicker}
                                                        onChange={date => {
                                                            setStartDatePicker(date);
                                                            setStartDate(date);
                                                            setValue('start_date', date, { shouldValidate: true });
                                                        }}
                                                        locale={vi}
                                                        dateFormat="dd/MM/yyyy"
                                                        className="form-control"
                                                        placeholderText="Chọn ngày bắt đầu"
                                                        id="inputStartDate"
                                                        autoComplete="off"
                                                    />
                                                    <button type="button" tabIndex={-1} className="btn p-0 border-0 bg-transparent" style={{height: '38px'}} onClick={() => document.getElementById('inputStartDate')?.focus()}>
                                                        <i className="fas fa-calendar-alt text-secondary"></i>
                                                    </button>
                                                    <input type="hidden" {...register('start_date', { required: 'Ngày bắt đầu là bắt buộc' })} />
                                                </div>
                                                {errors.start_date && <div className="text-danger mt-1 small">{errors.start_date.message}</div>}
                                            </div>
                                            <div className="col-6">
                                                <label htmlFor="inputEndDate" className="form-label fw-semibold">
                                                    Ngày kết thúc <span className="text-danger">*</span>
                                                </label>
                                                <div className="d-flex align-items-center" style={{gap: '4px'}}>
                                                    <DatePicker
                                                        selected={endDatePicker}
                                                        onChange={date => {
                                                            setEndDatePicker(date);
                                                            setEndDate(date);
                                                            setValue('end_date', date, { shouldValidate: true });
                                                        }}
                                                        locale={vi}
                                                        dateFormat="dd/MM/yyyy"
                                                        className="form-control"
                                                        placeholderText="Chọn ngày kết thúc"
                                                        id="inputEndDate"
                                                        autoComplete="off"
                                                    />
                                                    <button type="button" tabIndex={-1} className="btn p-0 border-0 bg-transparent" style={{height: '38px'}} onClick={() => document.getElementById('inputEndDate')?.focus()}>
                                                        <i className="fas fa-calendar-alt text-secondary"></i>
                                                    </button>
                                                    <input type="hidden" {...register('end_date', { required: 'Ngày kết thúc là bắt buộc' })} />
                                                </div>
                                                {errors.end_date && <div className="text-danger mt-1 small">{errors.end_date.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Hình ảnh combo */}
                            <div className="col-lg-6">
                                <div className="card shadow-sm border-0 h-100">
                                    <div className="card-header bg-white border-bottom-0 pb-0">
                                        <h5 className="mb-0 fw-semibold text-secondary"><i className="fas fa-image me-2"></i>Hình ảnh combo</h5>
                                    </div>
                                    <div className="card-body pt-2">
                                        <div className="mb-3">
                                            <div className="d-flex flex-column align-items-center">
                                                <div
                                                    className="border border-2 border-secondary border-dashed rounded bg-light position-relative d-flex align-items-center justify-content-center mb-2"
                                                    style={{ aspectRatio: '3/2', width: '100%', maxWidth: 320 }}
                                                >
                                                    {imagePreview ? (
                                                        <>
                                                            <img
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                className="w-100 h-100 rounded position-absolute top-0 start-0"
                                                                style={{ objectFit: 'fill', aspectRatio: '1/1' }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm rounded-circle position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center no-hover"
                                                                style={{ zIndex: 2, width: 28, height: 28, padding: 0, background: '#fff' }}
                                                                aria-label="Xóa ảnh"
                                                                onClick={handleRemoveImage}
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100">
                                                            <i className="fas fa-image fs-1 text-secondary"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <label htmlFor="inputImage" className="form-label btn btn-secondary mb-0 mt-2">
                                                    <i className="fas fa-upload"></i> Thêm ảnh combo
                                                </label>
                                                <div className="text-muted small">
                                                            Chỉ chọn 1 ảnh, định dạng: jpg, png...<br/>
                                                            Kích thước tối đa: 2MB
                                                </div>
                                                <input
                                                    className="form-control"
                                                    id="inputImage"
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={onChangeImage}
                                                />
                                                <input
                                                    type="hidden"
                                                    {...register('imageFile', {
                                                        required: 'Ảnh combo là bắt buộc',
                                                    })}
                                                />
                                                {errors.imageFile && <div className="text-danger mt-1 small">{errors.imageFile.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Mô tả combo */}
                        <div className="row mt-4">
                            <div className="col-lg-12">
                                <div className="card shadow-sm border-0">
                                    <div className="card-header bg-white border-bottom-0 pb-0">
                                        <h5 className="mb-0 fw-semibold text-secondary"><i className="fas fa-align-left me-2"></i>Mô tả combo</h5>
                                    </div>
                                    <div className="card-body pt-2">
                                        <CustomEditor
                                            onReady={() => register('description', { required: "Mô tả combo là bắt buộc" })}
                                            onChange={data => setValue('description', data)}
                                            trigger={() => trigger('description')}
                                        />
                                        {errors.description && <div className="text-danger mt-1 small">{errors.description.message}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Sản phẩm trong combo */}
                        <div className="row mt-4">
                            <div className="col-lg-12">
                                <div className="card shadow-sm border-0">
                                    <div className="card-header bg-white border-bottom-0 pb-0">
                                        <h5 className="mb-0 fw-semibold text-secondary"><i className="fas fa-boxes me-2"></i>Sản phẩm trong combo <span className="text-danger">*</span></h5>
                                    </div>
                                    <div className="card-body pt-2">
                                        {comboItems.map((item, idx) => (
                                            <div className="row align-items-center mb-3" key={idx}>
                                                <div className="col-md-5">
                                                    <select
                                                        className="form-select"
                                                        value={item.product_id}
                                                        onChange={e => handleChangeItem(idx, 'product_id', e.target.value)}
                                                        required
                                                    >
                                                        <option value="" disabled>
                                                            Chọn sản phẩm
                                                        </option>
                                                        {products.map(prod => {
                                                            const isSelected = comboItems.some((it, i) => it.product_id === prod.id && i !== idx);
                                                            return (
                                                                <option
                                                                    key={prod.id}
                                                                    value={prod.id}
                                                                    disabled={isSelected}
                                                                    style={isSelected ? { color: '#ccc', backgroundColor: '#f5f5f5' } : {}}
                                                                >
                                                                    {prod.name}
                                                                    {prod.size ? ` - ${prod.size}` : ''}
                                                                    {prod.category?.name ? ` (${prod.category.name})` : ''}
                                                                    {isSelected ? ' (Đã chọn)' : ''}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>
                                                <div className="col-md-3 d-flex align-items-center">
                                                    <img
                                                        src={
                                                            products.find(p => String(p.id) === String(item.product_id))?.featured_image?.main_url
                                                                ? process.env.REACT_APP_API_URL + 'api/images/' + products.find(p => String(p.id) === String(item.product_id)).featured_image.main_url
                                                                : '/no-image.png'
                                                        }
                                                        alt=""
                                                        style={{ width: 90, height: 60, objectFit: 'contain', borderRadius: 4, border: '1px solid #eee', background: '#fff' }}
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        min={1}
                                                        value={item.quantity}
                                                        onChange={e => handleChangeItem(idx, 'quantity', e.target.value)}
                                                        placeholder="Số lượng"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-2 d-flex align-items-center gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => handleRemoveItem(idx)}
                                                        disabled={comboItems.length === 1}
                                                    >
                                                        <i className="fas fa-minus"></i>
                                                    </button>
                                                    {idx === comboItems.length - 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-success"
                                                            onClick={handleAddItem}
                                                        >
                                                            <i className="fas fa-plus"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Nút hành động */}
                        <div className="row mt-4 mb-4">
                            <div className="col-lg-12">
                                <div className="d-flex justify-content-center gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary w-25"
                                        onClick={() => navigation('/combo')}
                                        disabled={isSubmitting}
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        className="btn btn-primary w-25"
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Đang gửi..." : "Thêm mới"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ComboAdd;