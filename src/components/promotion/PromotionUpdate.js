import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import CustomEditor from '../common/CustomEditor';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';
import Select from 'react-select';

const PromotionUpdate = () => {
    const params = useParams();
    const navigation = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit, setValue, trigger, watch, formState: { errors }, setError, clearErrors } = useForm();
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

    // Lấy danh sách sản phẩm, danh mục, combo
    useEffect(() => {
        requestApi('api/admin/products?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setProducts(response.data.data);
        });
        requestApi('api/admin/categories?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setCategories(response.data.data);
        });
        requestApi('api/admin/combos?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setCombos(response.data.data);
        });
    }, []);

    // Lấy dữ liệu khuyến mãi cần sửa
    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch(actions.controlLoading(true));
                const res = await requestApi(`api/admin/promotions/${params.id}`, 'GET');
                if (res.data && res.data.data) {
                    const data = res.data.data;
                    setValue('name', data.name);
                    setValue('code', data.code);
                    setValue('description', data.description || '');
                    setApplicationType(data.application_type);
                    setPromoType(data.type);
                    const promoVal = data.type === 'fixed_amount' ? formatVND(data.value) : data.value;
                    setValuePromo(promoVal);
                    setValue('promoValue', promoVal);
                    setMinOrderValue(data.conditions?.min_order_value ? data.conditions.min_order_value.toString() : '');
                    setMaxDiscountAmount(data.conditions?.max_discount_amount ? data.conditions.max_discount_amount.toString() : '');
                    setMaxUsage(data.usage_limits?.max_usage ? data.usage_limits.max_usage.toString() : '');
                    setMaxUsagePerUser(data.usage_limits?.max_usage_per_user ? data.usage_limits.max_usage_per_user.toString() : '');
                    setValue('is_active', data.is_active === true ? "1" : "0");
                    setValue('is_combinable', data.is_combinable === true ? "1" : "0");
                    const start = data.dates?.start_date ? moment(data.dates.start_date).toDate() : null;
                    const end = data.dates?.end_date ? moment(data.dates.end_date).toDate() : null;
                    setStartDate(start);
                    setEndDate(end);
                    setStartDatePicker(start);
                    setEndDatePicker(end);
                    setValue('start_date', start);
                    setValue('end_date', end);
                    if (data.products && data.products.length > 0) setSelectedProducts(data.products.map(p => p.id.toString()));
                    if (data.categories && data.categories.length > 0) setSelectedCategories(data.categories.map(c => c.id.toString()));
                    if (data.combos && data.combos.length > 0) setSelectedCombos(data.combos.map(c => c.id.toString()));
                    // Trigger validate các trường liên quan sau khi set dữ liệu
                    setTimeout(() => {
                        trigger(['start_date', 'end_date', 'promoValue', 'selectedProducts', 'selectedCategories', 'selectedCombos']);
                    }, 0);
                }
                dispatch(actions.controlLoading(false));
            } catch (error) {
                dispatch(actions.controlLoading(false));
                toast.error("Không lấy được dữ liệu khuyến mãi", toastErrorConfig);
            }
        };
        fetchData();
    }, [params.id, setValue, dispatch, trigger]);

    // Hàm format tiền
    const formatVND = (value) => {
        value = value ? value.toString().replace(/\D/g, '') : '';
        if (!value) return '';
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Xử lý chọn đối tượng áp dụng
    const handleSelectChange = (type, values) => {
        if (type === 'products') setSelectedProducts(values);
        if (type === 'categories') setSelectedCategories(values);
        if (type === 'combos') setSelectedCombos(values);
    };

    // Tạo options cho react-select
    const productOptions = products.map(p => ({ value: p.id, label: p.name + (p.size ? ` - ${p.size}` : '') + (p.category?.name ? ` (${p.category.name})` : '') }));
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
    const comboOptions = combos.map(c => ({ value: c.id, label: c.name }));

    // Khi đổi loại khuyến mãi thì reset value
    useEffect(() => {
        setValuePromo('');
    }, [promoType]);

    // Validate đối tượng áp dụng react-hook-form
    useEffect(() => {
        if (applicationType === 'products') {
            if (selectedProducts.length === 0) {
                setError('selectedProducts', { type: 'manual', message: 'Vui lòng chọn sản phẩm áp dụng!' });
            } else {
                clearErrors('selectedProducts');
            }
            clearErrors(['selectedCategories', 'selectedCombos']);
        } else if (applicationType === 'categories') {
            if (selectedCategories.length === 0) {
                setError('selectedCategories', { type: 'manual', message: 'Vui lòng chọn danh mục áp dụng!' });
            } else {
                clearErrors('selectedCategories');
            }
            clearErrors(['selectedProducts', 'selectedCombos']);
        } else if (applicationType === 'combos') {
            if (selectedCombos.length === 0) {
                setError('selectedCombos', { type: 'manual', message: 'Vui lòng chọn combo áp dụng!' });
            } else {
                clearErrors('selectedCombos');
            }
            clearErrors(['selectedProducts', 'selectedCategories']);
        } else if (applicationType === 'orders') {
            clearErrors(['selectedProducts', 'selectedCategories', 'selectedCombos']);
        }
    }, [applicationType, selectedProducts, selectedCategories, selectedCombos, setError, clearErrors]);

    // Xử lý submit
    const handleSubmitForm = async (data) => {
        // Validate ngày
        if (startDatePicker && endDatePicker) {
            if (new Date(endDatePicker) < new Date(startDatePicker)) {
                setError('end_date', { type: 'manual', message: 'Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu' });
                setIsSubmitting(false);
                return;
            } else {
                clearErrors('end_date');
            }
        } else {
            // Nếu 1 trong 2 chưa chọn thì không báo lỗi
            clearErrors('end_date');
        }
        // Validate đối tượng áp dụng react-hook-form
        if (applicationType === 'products' && selectedProducts.length === 0) {
            setError('selectedProducts', { type: 'manual', message: 'Vui lòng chọn sản phẩm áp dụng!' });
            return;
        }
        if (applicationType === 'categories' && selectedCategories.length === 0) {
            setError('selectedCategories', { type: 'manual', message: 'Vui lòng chọn danh mục áp dụng!' });
            return;
        }
        if (applicationType === 'combos' && selectedCombos.length === 0) {
            setError('selectedCombos', { type: 'manual', message: 'Vui lòng chọn combo áp dụng!' });
            return;
        }
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const payload = {
                name: data.name,
                code: data.code,
                description: data.description || '',
                application_type: applicationType,
                type: promoType,
                value: promoType === 'fixed_amount' ? Number(value.replace(/\./g, '')) : Number(value),
                min_order_value: minOrderValue ? Number(minOrderValue.replace(/\./g, '')) : 0,
                max_discount_amount: maxDiscountAmount ? Number(maxDiscountAmount.replace(/\./g, '')) : 0,
                max_usage: maxUsage ? Number(maxUsage) : null,
                max_usage_per_user: maxUsagePerUser ? Number(maxUsagePerUser) : null,
                is_combinable: data.is_combinable === '1' || data.is_combinable === true,
                is_active: data.is_active === '1' || data.is_active === true,
                start_date: startDatePicker ? startDatePicker.toISOString() : '',
                end_date: endDatePicker ? endDatePicker.toISOString() : '',
            };
            // Thêm id đối tượng áp dụng
            if (applicationType === 'products') payload.product_ids = selectedProducts.map(Number);
            if (applicationType === 'categories') payload.category_ids = selectedCategories.map(Number);
            if (applicationType === 'combos') payload.combo_ids = selectedCombos.map(Number);

            const response = await requestApi(
                `api/admin/promotions/${params.id}`,
                'PUT', // hoặc 'PUT' nếu backend hỗ trợ
                payload,
                'json'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật khuyến mãi thành công!", toastSuccessConfig);
                
                navigation('/promotion');
                
            } else {
                toast.error(response.data.message || "Cập nhật khuyến mãi thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Lỗi khi cập nhật khuyến mãi", toastErrorConfig);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4">Cập nhật khuyến mãi</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Cập nhật khuyến mãi</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-gift me-1"></i>
                            Dữ liệu khuyến mãi
                        </div>
                        <div className='card-body'>
                            <form onSubmit={handleSubmit(handleSubmitForm)}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3 mb-md-0">
                                            <input
                                                className="form-control"
                                                id="inputName"
                                                {...register('name', { required: 'Tên khuyến mãi là bắt buộc' })}
                                                placeholder="Nhập tên khuyến mãi"
                                            />
                                            <label htmlFor="inputName">
                                                Tên khuyến mãi <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            {errors.name && <div className="text-danger">{errors.name.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3 mb-md-0">
                                            <input
                                                className="form-control"
                                                id="inputCode"
                                                {...register('code', { required: 'Mã khuyến mãi là bắt buộc' })}
                                                placeholder="Nhập mã khuyến mãi"
                                            />
                                            <label htmlFor="inputCode">
                                                Mã khuyến mãi <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            {errors.code && <div className="text-danger">{errors.code.message}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <label htmlFor="description">Mô tả khuyến mãi <span style={{ color: 'red' }}>*</span></label>
                                        <CustomEditor
                                            data={watch('description')}
                                            onReady={() => register('description', { required: "Mô tả khuyến mãi là bắt buộc" })}
                                            onChange={data => setValue('description', data)}
                                            trigger={() => trigger('description')}
                                        />
                                        {errors.description && <div className="text-danger">{errors.description.message}</div>}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-4">
                                        <label className="mb-1">Loại áp dụng <span style={{ color: 'red' }}>*</span></label>
                                        <select
                                            className="form-select"
                                            value={applicationType}
                                            onChange={e => {
                                                setApplicationType(e.target.value);
                                                setSelectedProducts([]);
                                                setSelectedCategories([]);
                                                setSelectedCombos([]);
                                            }}
                                            required
                                        >
                                            <option value="products">Sản phẩm</option>
                                            <option value="categories">Danh mục</option>
                                            <option value="combos">Combo</option>
                                            <option value="orders">Đơn hàng</option>
                                        </select>
                                    </div>
                                    <div className="col-md-8">
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
                                                />
                                                {errors.selectedCombos && <div className="text-danger mt-1 small">{errors.selectedCombos.message}</div>}
                                            </div>
                                        )}
                                        {applicationType === 'orders' && (
                                            <div className="text-muted fst-italic mt-2">Áp dụng cho toàn bộ đơn hàng</div>
                                        )}
                                    </div>
                                </div>
                                {/* Dòng gồm: Loại khuyến mãi, Giá trị, Trạng thái, Thời gian bắt đầu, Thời gian kết thúc */}
                                <div className="row mb-3">
                                    <div className="col-md-2">
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
                                    <div className="col-md-2">
                                        <label className="mb-1">Giá trị <span style={{ color: 'red' }}>*</span></label>
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
                                            placeholder={promoType === 'percentage' ? 'VD: 15 (%)' : 'VD: 20.000 (VNĐ)'}
                                        />
                                        {errors.promoValue && <div className="text-danger">{errors.promoValue.message}</div>}
                                    </div>
                                    <div className="col-md-2">
                                        <label className="mb-1">Trạng thái <span style={{ color: 'red' }}>*</span></label>
                                        <select
                                            className="form-select"
                                            {...register('is_active', { required: 'Trạng thái là bắt buộc', validate: v => v === '1' || v === '0' || 'Trạng thái không hợp lệ' })}
                                            defaultValue="1"
                                        >
                                            <option value="1">Hiển thị</option>
                                            <option value="0">Ẩn</option>
                                        </select>
                                        {errors.is_active && <div className="text-danger">{errors.is_active.message}</div>}
                                    </div>
                                    <div className="col-md-3">
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
                                        {errors.start_date && <div className="text-danger">{errors.start_date.message}</div>}
                                    </div>
                                    <div className="col-md-3">
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
                                        {errors.end_date && <div className="text-danger">{errors.end_date.message}</div>}
                                    </div>
                                </div>
                                {/* Dòng gồm: Đơn tối thiểu, Giảm tối đa, Tổng lượt sử dụng, Lượt/người, Kết hợp với mã khác */}
                                <div className="row mb-3">
                                    <div className="col-md-3">
                                        <label className="mb-1">Đơn tối thiểu (VNĐ)</label>
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
                                            placeholder="VD: 50.000"
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="mb-1">Giảm tối đa (VNĐ)</label>
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
                                            placeholder="VD: 20.000"
                                        />
                                    </div>
                                    <div className="col-md-2">
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
                                        {errors.max_usage && <div className="text-danger">{errors.max_usage.message}</div>}
                                    </div>
                                    <div className="col-md-2">
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
                                        {errors.max_usage_per_user && <div className="text-danger">{errors.max_usage_per_user.message}</div>}
                                    </div>
                                    <div className="col-md-2">
                                        <label className="mb-1">Kết hợp với mã khác</label>
                                        <select
                                            className="form-select"
                                            {...register('is_combinable')}
                                            defaultValue="0"
                                        >
                                            <option value="1">Có</option>
                                            <option value="0">Không</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-4 mb-0">
                                    <div className="d-flex justify-content-center gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-secondary w-25"
                                            onClick={() => navigation('/promotion')}
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
            </main>
        </div>
    );
};

export default PromotionUpdate;