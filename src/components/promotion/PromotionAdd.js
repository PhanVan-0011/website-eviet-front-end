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
import { format } from 'date-fns';
import Select from 'react-select';
import { selectStyles } from '../common/FilterComponents';

const PromotionAdd = () => {
    const navigation = useNavigate();
    const { register, handleSubmit, setValue, trigger, formState: { errors }, watch, setError, clearErrors } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Danh sách đối tượng áp dụng
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [combos, setCombos] = useState([]);

    // Chọn loại áp dụng
    const [applicationType, setApplicationType] = useState('products');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedCombos, setSelectedCombos] = useState([]);

    // Ngày
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startDatePicker, setStartDatePicker] = useState(null);
    const [endDatePicker, setEndDatePicker] = useState(null);

    // Giá trị khuyến mãi
    const [promoType, setPromoType] = useState('percentage');
    const [value, setValuePromo] = useState('');

    // Điều kiện và giới hạn
    const [minOrderValue, setMinOrderValue] = useState('');
    const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
    const [maxUsage, setMaxUsage] = useState('');
    const [maxUsagePerUser, setMaxUsagePerUser] = useState('');
    const [isCombinable, setIsCombinable] = useState(false);

    // Hình ảnh
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Tạo options cho react-select
    const productOptions = products.map(p => ({ value: p.id, label: p.name + (p.size ? ` - ${p.size}` : '') + (p.category?.name ? ` (${p.category.name})` : '') }));
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
    const comboOptions = combos.map(c => ({ value: c.id, label: c.name }));
    const applicationTypeOptions = [
        { value: 'products', label: 'Sản phẩm' },
        { value: 'categories', label: 'Danh mục' },
        { value: 'combos', label: 'Combo' },
        { value: 'orders', label: 'Đơn hàng' }
    ];

    // Lấy danh sách sản phẩm, danh mục, combo
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resProducts = await requestApi('api/admin/products?limit=1000', 'GET', []);
                if (resProducts.data && resProducts.data.data) setProducts(resProducts.data.data);

                const resCategories = await requestApi('api/admin/categories?limit=1000', 'GET', []);
                if (resCategories.data && resCategories.data.data) setCategories(resCategories.data.data);

                const resCombos = await requestApi('api/admin/combos?limit=1000', 'GET', []);
                if (resCombos.data && resCombos.data.data) setCombos(resCombos.data.data);
            } catch (e) {
                toast.error("Lỗi khi lấy dữ liệu sản phẩm, danh mục hoặc combo!", toastErrorConfig);
            }
        };
        fetchData();
    }, []);

    // Xử lý chọn đối tượng áp dụng
    const handleSelectChange = (type, values) => {
        if (type === 'products') {
            setSelectedProducts(values);
            clearErrors('selectedProducts');
        }
        if (type === 'categories') {
            setSelectedCategories(values);
            clearErrors('selectedCategories');
        }
        if (type === 'combos') {
            setSelectedCombos(values);
            clearErrors('selectedCombos');
        }
    };

    // Khi đổi loại khuyến mãi thì reset value
    useEffect(() => {
        setValuePromo('');
    }, [promoType]);

    // Thêm hàm formatVND giống ComboAdd
    const formatVND = (value) => {
        value = value.replace(/\D/g, '');
        if (!value) return '';
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

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

    // Hàm validate đối tượng áp dụng
    const validateApplicationTargets = () => {
        if (applicationType === 'products' && selectedProducts.length === 0) {
            setError('selectedProducts', { type: 'manual', message: 'Vui lòng chọn sản phẩm áp dụng!' });
            return false;
        }
        if (applicationType === 'categories' && selectedCategories.length === 0) {
            setError('selectedCategories', { type: 'manual', message: 'Vui lòng chọn danh mục áp dụng!' });
            return false;
        }
        if (applicationType === 'combos' && selectedCombos.length === 0) {
            setError('selectedCombos', { type: 'manual', message: 'Vui lòng chọn combo áp dụng!' });
            return false;
        }
        clearErrors(['selectedProducts', 'selectedCategories', 'selectedCombos']);
        return true;
    };

    // Xử lý submit
    const handleSubmitForm = async (data) => {
        // Validate đối tượng áp dụng
        if (!validateApplicationTargets()) {
            return;
        }
        // Validate thời gian
        if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
            toast.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu", toastErrorConfig);
            setIsSubmitting(false);
            return;
        }
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('code', data.code);
            formData.append('description', data.description || '');
            formData.append('application_type', applicationType);
            formData.append('type', promoType);
            formData.append('value', promoType === 'fixed_amount' ? Number(value.replace(/\./g, '')) : Number(value));
            formData.append('min_order_value', minOrderValue ? Number(minOrderValue.replace(/\./g, '')) : 0);
            formData.append('max_discount_amount', maxDiscountAmount ? Number(maxDiscountAmount.replace(/\./g, '')) : 0);
            formData.append('max_usage', maxUsage ? Number(maxUsage) : '');
            formData.append('max_usage_per_user', maxUsagePerUser ? Number(maxUsagePerUser) : '');
            formData.append('is_combinable', isCombinable ? 1 : 0);
            formData.append('is_active', data.is_active === '1' || data.is_active === true ? 1 : 0);
            formData.append('start_date', startDate ? format(new Date(startDate), 'yyyy-MM-dd HH:mm:ss') : '');
            formData.append('end_date', endDate ? format(new Date(endDate), 'yyyy-MM-dd HH:mm:ss') : '');
            
            // Thêm hình ảnh nếu có
            if (imageFile) {
                formData.append('image_url', imageFile);
            }

            // Thêm id đối tượng áp dụng
            if (applicationType === 'products') {
                selectedProducts.forEach((id, index) => {
                    formData.append(`product_ids[${index}]`, id);
                });
            }
            if (applicationType === 'categories') {
                selectedCategories.forEach((id, index) => {
                    formData.append(`category_ids[${index}]`, id);
                });
            }
            if (applicationType === 'combos') {
                selectedCombos.forEach((id, index) => {
                    formData.append(`combo_ids[${index}]`, id);
                });
            }

            const response = await requestApi(
                'api/admin/promotions',
                'POST',
                formData,
                'json',
                'multipart/form-data'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm khuyến mãi thành công!", toastSuccessConfig);
                
                navigation('/promotion');
                
            } else {
                toast.error(response.data.message || "Thêm khuyến mãi thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Lỗi khi thêm khuyến mãi", toastErrorConfig);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Thêm khuyến mãi</li>
                    </ol>
                    <form onSubmit={handleSubmit(handleSubmitForm)}>
                        <div className="row g-4">
                            {/* Thông tin cơ bản */}
                            <div className="col-12 col-lg-8">
                                <div className="card shadow-sm border-0 h-100">
                                    <div className="card-header bg-white border-bottom-0 pb-0">
                                        <h5 className="mb-0 fw-semibold text-secondary"><i className="fas fa-info-circle me-2"></i>Thông tin cơ bản</h5>
                                    </div>
                                    <div className="card-body pt-2">
                                        <div className="row mb-3">
                                            <div className="col-12 col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="inputName" className="form-label fw-semibold">
                                                        Tên khuyến mãi <span style={{ color: 'red' }}>*</span>
                                                    </label>
                                                    <input
                                                        className="form-control"
                                                        id="inputName"
                                                        {...register('name', { required: 'Tên khuyến mãi là bắt buộc' })}
                                                        placeholder="Nhập tên khuyến mãi"
                                                    />
                                                    {errors.name && <div className="text-danger mt-1">{errors.name.message}</div>}
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="inputCode" className="form-label fw-semibold">
                                                        Mã khuyến mãi <span style={{ color: 'red' }}>*</span>
                                                    </label>
                                                    <input
                                                        className="form-control"
                                                        id="inputCode"
                                                        {...register('code', { required: 'Mã khuyến mãi là bắt buộc' })}
                                                        placeholder="Nhập mã khuyến mãi"
                                                    />
                                                    {errors.code && <div className="text-danger mt-1">{errors.code.message}</div>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col-md-12">
                                                <div className="mb-3">
                                                    <label htmlFor="description" className="form-label fw-semibold">
                                                        Mô tả khuyến mãi <span style={{ color: 'red' }}>*</span>
                                                    </label>
                                                    <CustomEditor
                                                        onReady={() => register('description', { required: "Mô tả khuyến mãi là bắt buộc" })}
                                                        onChange={data => setValue('description', data)}
                                                        trigger={() => trigger('description')}
                                                        folder='promotions'
                                                    />
                                                    {errors.description && <div className="text-danger mt-1">{errors.description.message}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Hình ảnh khuyến mãi */}
                            <div className="col-12 col-lg-4">
                                <div className="card shadow-sm border-0 h-100">
                                    <div className="card-header bg-white border-bottom-0 pb-0">
                                        <h5 className="mb-0 fw-semibold text-secondary"><i className="fas fa-image me-2"></i>Hình ảnh khuyến mãi</h5>
                                    </div>
                                    <div className="card-body pt-2">
                                        <div className="mb-3">
                                            <div className="d-flex flex-column align-items-center">
                                                <div
                                                    className="border border-2 border-secondary border-dashed rounded bg-light position-relative d-flex align-items-center justify-content-center mb-2"
                                                    style={{ aspectRatio: '3/2', width: '100%', maxWidth: 280 }}
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
                                                    <i className="fas fa-upload"></i> Thêm ảnh khuyến mãi
                                                </label>
                                                <div className="text-muted small text-center">
                                                    Chỉ chọn 1 ảnh, định dạng: jpg, png...<br/>
                                                    Kích thước tối đa: 2MB<br/>
                                                    
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
                                                    {...register('imageFile')}
                                                />
                                                {errors.imageFile && <div className="text-danger mt-1 small">{errors.imageFile.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Cài đặt khuyến mãi */}
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="card shadow-sm border-0">
                                    <div className="card-header bg-white border-bottom-0 pb-0">
                                        <h5 className="mb-0 fw-semibold text-secondary"><i className="fas fa-cogs me-2"></i>Cài đặt khuyến mãi</h5>
                                    </div>
                                    <div className="card-body pt-2">
                                        <div className="row mb-3">
                                            <div className="col-12 col-md-4 mb-3 mb-md-0">
                                                <label className="mb-1">Loại áp dụng <span style={{ color: 'red' }}>*</span></label>
                                                <Select
                                                    options={applicationTypeOptions}
                                                    value={applicationTypeOptions.find(opt => opt.value === applicationType)}
                                                    onChange={opt => {
                                                        if (opt) {
                                                            setApplicationType(opt.value);
                                                            setSelectedProducts([]);
                                                            setSelectedCategories([]);
                                                            setSelectedCombos([]);
                                                            clearErrors(['selectedProducts', 'selectedCategories', 'selectedCombos']);
                                                        }
                                                    }}
                                                    placeholder="Chọn loại áp dụng..."
                                                    classNamePrefix="react-select"
                                                    styles={selectStyles}
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    menuPosition="fixed"
                                                    maxMenuHeight={200}
                                                    isSearchable={false}
                                                />
                                            </div>
                                            <div className="col-12 col-md-8">
                                                {/* Đối tượng áp dụng */}
                                                {applicationType === 'products' && (
                                                    <div>
                                                        <label className="mb-1">Chọn sản phẩm <span style={{ color: 'red' }}>*</span></label>
                                                        <Select
                                                            options={productOptions}
                                                            isMulti
                                                            value={productOptions.filter(opt => selectedProducts.includes(String(opt.value)) || selectedProducts.includes(opt.value))}
                                                            onChange={opts => handleSelectChange('products', opts ? opts.map(opt => opt.value) : [])}
                                                            placeholder="Tìm kiếm & chọn sản phẩm..."
                                                            classNamePrefix="react-select"
                                                            styles={selectStyles}
                                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                            menuPosition="fixed"
                                                            maxMenuHeight={200}
                                                        />
                                                        {errors.selectedProducts && <div className="text-danger mt-1 small">{errors.selectedProducts.message}</div>}
                                                    </div>
                                                )}
                                                {applicationType === 'categories' && (
                                                    <div>
                                                        <label className="mb-1">Chọn danh mục <span style={{ color: 'red' }}>*</span></label>
                                                        <Select
                                                            options={categoryOptions}
                                                            isMulti
                                                            value={categoryOptions.filter(opt => selectedCategories.includes(String(opt.value)) || selectedCategories.includes(opt.value))}
                                                            onChange={opts => handleSelectChange('categories', opts ? opts.map(opt => opt.value) : [])}
                                                            placeholder="Tìm kiếm & chọn danh mục..."
                                                            classNamePrefix="react-select"
                                                            styles={selectStyles}
                                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                            menuPosition="fixed"
                                                            maxMenuHeight={200}
                                                        />
                                                        {errors.selectedCategories && <div className="text-danger mt-1 small">{errors.selectedCategories.message}</div>}
                                                    </div>
                                                )}
                                                {applicationType === 'combos' && (
                                                    <div>
                                                        <label className="mb-1">Chọn combo <span style={{ color: 'red' }}>*</span></label>
                                                        <Select
                                                            options={comboOptions}
                                                            isMulti
                                                            value={comboOptions.filter(opt => selectedCombos.includes(String(opt.value)) || selectedCombos.includes(opt.value))}
                                                            onChange={opts => handleSelectChange('combos', opts ? opts.map(opt => opt.value) : [])}
                                                            placeholder="Tìm kiếm & chọn combo..."
                                                            classNamePrefix="react-select"
                                                            styles={selectStyles}
                                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                            menuPosition="fixed"
                                                            maxMenuHeight={200}
                                                        />
                                                        {errors.selectedCombos && <div className="text-danger mt-1 small">{errors.selectedCombos.message}</div>}
                                                    </div>
                                                )}
                                                {applicationType === 'orders' && (
                                                    <div className="d-flex align-items-center" style={{ minHeight: '62px' }}>
                                                        <span className="text-muted fst-italic">Áp dụng cho toàn bộ đơn hàng</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <hr className="my-4" />
                                        <h6 className="text-muted mb-3 fw-semibold">Giá trị khuyến mãi</h6>
                                        {/* Hàng 2: Loại khuyến mãi - Giá trị - Trạng thái */}
                                        <div className="row mb-3">
                                            <div className="col-12 col-md-4 mb-3 mb-md-0">
                                                <label className="mb-1">Loại khuyến mãi <span style={{ color: 'red' }}>*</span></label>
                                                <select
                                                    className="form-select"
                                                    value={promoType}
                                                    onChange={e => setPromoType(e.target.value)}
                                                    required
                                                >
                                                    <option value="percentage">Phần trăm (%)</option>
                                                    <option value="fixed_amount">Tiền cố định (VNĐ)</option>
                                                </select>
                                            </div>
                                            <div className="col-12 col-md-4 mb-3 mb-md-0">
                                                <label className="mb-1">Giá trị <span style={{ color: 'red' }}>*</span></label>
                                                <div className="input-group">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={promoType === 'fixed_amount' ? formatVND(value) : value}
                                                        {...register('promoValue', {
                                                            required: 'Giá trị khuyến mãi là bắt buộc',
                                                            validate: v => {
                                                                const val = promoType === 'fixed_amount' ? Number((v || '').replace(/\./g, '')) : Number(v);
                                                                if (isNaN(val) || val <= 0) return 'Giá trị phải lớn hơn 0';
                                                                if (promoType === 'percentage' && val > 100) return 'Phần trăm tối đa là 100';
                                                                return true;
                                                            }
                                                        })}
                                                        onChange={e => setValuePromo(promoType === 'fixed_amount' ? formatVND(e.target.value) : e.target.value)}
                                                        placeholder={promoType === 'percentage' ? 'VD: 15' : 'VD: 20.000'}
                                                    />
                                                    <span className="input-group-text bg-light">{promoType === 'percentage' ? '%' : 'VNĐ'}</span>
                                                </div>
                                                {errors.promoValue && <div className="text-danger small mt-1">{errors.promoValue.message}</div>}
                                            </div>
                                            <div className="col-12 col-md-4 mb-3 mb-md-0">
                                                <label className="mb-1">Trạng thái <span style={{ color: 'red' }}>*</span></label>
                                                <select
                                                    className="form-select"
                                                    {...register('is_active', { required: 'Trạng thái là bắt buộc', validate: v => v === '1' || v === '0' || 'Trạng thái không hợp lệ' })}
                                                    defaultValue="1"
                                                >
                                                    <option value="1">Hiển thị</option>
                                                    <option value="0">Ẩn</option>
                                                </select>
                                                {errors.is_active && <div className="text-danger small mt-1">{errors.is_active.message}</div>}
                                            </div>
                                        </div>
                                        {/* Hàng 3: Thời gian bắt đầu - Thời gian kết thúc */}
                                        <div className="row mb-3">
                                            <div className="col-12 col-md-6 mb-3 mb-md-0">
                                                <label className="mb-1">Thời gian bắt đầu <span style={{ color: 'red' }}>*</span></label>
                                                <DatePicker
                                                    selected={startDatePicker}
                                                    onChange={date => {
                                                        setStartDatePicker(date);
                                                        setStartDate(date);
                                                        setValue('start_date', date, { shouldValidate: true });
                                                    }}
                                                    locale={vi}
                                                    dateFormat="dd/MM/yyyy HH:mm"
                                                    className="form-control"
                                                    placeholderText="Chọn thời gian bắt đầu"
                                                    showTimeSelect
                                                    timeFormat="HH:mm"
                                                    timeIntervals={15}
                                                    timeCaption="Giờ"
                                                />
                                                <input type="hidden" {...register('start_date', { required: 'Thời gian bắt đầu là bắt buộc' })} />
                                                {errors.start_date && <div className="text-danger small mt-1">{errors.start_date.message}</div>}
                                            </div>
                                            <div className="col-12 col-md-6 mb-3 mb-md-0">
                                                <label className="mb-1">Thời gian kết thúc <span style={{ color: 'red' }}>*</span></label>
                                                <DatePicker
                                                    selected={endDatePicker}
                                                    onChange={date => {
                                                        setEndDatePicker(date);
                                                        setEndDate(date);
                                                        setValue('end_date', date, { shouldValidate: true });
                                                    }}
                                                    locale={vi}
                                                    dateFormat="dd/MM/yyyy HH:mm"
                                                    className="form-control"
                                                    placeholderText="Chọn thời gian kết thúc"
                                                    showTimeSelect
                                                    timeFormat="HH:mm"
                                                    timeIntervals={15}
                                                    timeCaption="Giờ"
                                                />
                                                <input type="hidden" {...register('end_date', { required: 'Thời gian kết thúc là bắt buộc' })} />
                                                {errors.end_date && <div className="text-danger small mt-1">{errors.end_date.message}</div>}
                                            </div>
                                        </div>
                                        <hr className="my-4" />
                                        <h6 className="text-muted mb-3 fw-semibold">Điều kiện & Giới hạn</h6>
                                        {/* Hàng 4: Điều kiện giới hạn */}
                                        <div className="row mb-3">
                                            <div className="col-12 col-md-3 mb-3 mb-md-0">
                                                <label className="mb-1">Đơn tối thiểu (VNĐ)</label>
                                                <div className="input-group">
                                                    <input
                                                        className="form-control"
                                                        id="inputMinOrderValue"
                                                        type="text"
                                                        inputMode="numeric"
                                                        autoComplete="off"
                                                        value={formatVND(minOrderValue)}
                                                        onChange={e => {
                                                            const formatted = formatVND(e.target.value);
                                                            setMinOrderValue(formatted);
                                                        }}
                                                        placeholder=""
                                                    />
                                                    <span className="input-group-text bg-light">VNĐ</span>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-3 mb-3 mb-md-0">
                                                <label className="mb-1">Giảm tối đa (VNĐ)</label>
                                                <div className="input-group">
                                                    <input
                                                        className="form-control"
                                                        id="inputMaxDiscountAmount"
                                                        type="text"
                                                        inputMode="numeric"
                                                        autoComplete="off"
                                                        value={formatVND(maxDiscountAmount)}
                                                        onChange={e => {
                                                            const formatted = formatVND(e.target.value);
                                                            setMaxDiscountAmount(formatted);
                                                        }}
                                                        placeholder=""
                                                    />
                                                    <span className="input-group-text bg-light">VNĐ</span>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-3 mb-3 mb-md-0">
                                                <label className="mb-1">Tổng lượt sử dụng</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    {...register('max_usage', {
                                                        min: { value: 1, message: 'Tổng lượt sử dụng phải lớn hơn 0' },
                                                        validate: v => !v || Number(v) > 0 || 'Tổng lượt sử dụng phải lớn hơn 0'
                                                    })}
                                                    value={maxUsage}
                                                    onChange={e => setMaxUsage(e.target.value)}
                                                    placeholder="VD: 100"
                                                />
                                                {errors.max_usage && <div className="text-danger small mt-1">{errors.max_usage.message}</div>}
                                            </div>
                                            <div className="col-12 col-md-3 mb-3 mb-md-0">
                                                <label className="mb-1">Lượt/người</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    {...register('max_usage_per_user', {
                                                        min: { value: 1, message: 'Lượt/người phải lớn hơn 0' },
                                                        validate: v => !v || Number(v) > 0 || 'Lượt/người phải lớn hơn 0'
                                                    })}
                                                    value={maxUsagePerUser}
                                                    onChange={e => setMaxUsagePerUser(e.target.value)}
                                                    placeholder="VD: 1"
                                                />
                                                {errors.max_usage_per_user && <div className="text-danger small mt-1">{errors.max_usage_per_user.message}</div>}
                                            </div>
                                        </div>
                                        {/* Hàng 5: Kết hợp với mã khác (Toggle Switch) */}
                                        <div className="row mb-3">
                                            <div className="col-12">
                                                <div className="form-check form-switch">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id="switchCombinable"
                                                        checked={isCombinable}
                                                        onChange={e => {
                                                            setIsCombinable(e.target.checked);
                                                            setValue('is_combinable', e.target.checked ? '1' : '0');
                                                        }}
                                                    />
                                                    <label className="form-check-label" htmlFor="switchCombinable">
                                                        Kết hợp với mã khác
                                                    </label>
                                                </div>
                                                <input type="hidden" {...register('is_combinable')} value={isCombinable ? '1' : '0'} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Nút hành động */}
                        <div className="row mt-4 mb-4">
                            <div className="col-12">
                                <div className="d-flex justify-content-center detail-action-buttons">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => navigation('/promotion')}
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
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default PromotionAdd;