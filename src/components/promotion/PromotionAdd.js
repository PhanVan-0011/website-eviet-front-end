import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import CustomEditor from '../common/CustomEditor';

const PromotionAdd = () => {
    const navigation = useNavigate();
    const { register, handleSubmit, setValue, trigger, formState: { errors }, watch } = useForm();
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
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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

    // Xử lý chọn đối tượng áp dụng
    const handleSelectChange = (type, values) => {
        if (type === 'products') setSelectedProducts(values);
        if (type === 'categories') setSelectedCategories(values);
        if (type === 'combos') setSelectedCombos(values);
    };

    // Thêm hàm formatVND giống ComboAdd
    const formatVND = (value) => {
        value = value.replace(/\D/g, '');
        if (!value) return '';
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Xử lý submit
    const handleSubmitForm = async (data) => {
        // Validate ngày
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            toast.error("Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu", toastErrorConfig);
            setIsSubmitting(false);
            return;
        }
        // Validate đối tượng áp dụng
        if (
            (applicationType === 'products' && selectedProducts.length === 0) ||
            (applicationType === 'categories' && selectedCategories.length === 0) ||
            (applicationType === 'combos' && selectedCombos.length === 0)
        ) {
            toast.error("Vui lòng chọn đối tượng áp dụng!", toastErrorConfig);
            setIsSubmitting(false);
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
                value: Number(value),
                min_order_value: minOrderValue ? Number(minOrderValue.replace(/\./g, '')) : 0,
                max_discount_amount: maxDiscountAmount ? Number(maxDiscountAmount.replace(/\./g, '')) : 0,
                max_usage: maxUsage ? Number(maxUsage) : null,
                max_usage_per_user: maxUsagePerUser ? Number(maxUsagePerUser) : null,
                is_combinable: data.is_combinable === '1' || data.is_combinable === true,
                is_active: data.is_active === '1' || data.is_active === true,
                start_date: startDate ? new Date(startDate).toISOString() : '',
                end_date: endDate ? new Date(endDate).toISOString() : '',
            };
            // Thêm id đối tượng áp dụng
            if (applicationType === 'products') payload.product_ids = selectedProducts.map(Number);
            if (applicationType === 'categories') payload.category_ids = selectedCategories.map(Number);
            if (applicationType === 'combos') payload.combo_ids = selectedCombos.map(Number);

            const response = await requestApi(
                'api/admin/promotions',
                'POST',
                payload,
                'json'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm khuyến mãi thành công!", toastSuccessConfig);
                setTimeout(() => {
                    navigation('/promotion');
                }, 1500);
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
                    <h1 className="mt-4">Thêm khuyến mãi</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Thêm khuyến mãi</li>
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
                                                <select
                                                    className="form-select"
                                                    multiple
                                                    value={selectedProducts}
                                                    onChange={e => handleSelectChange('products', Array.from(e.target.selectedOptions, option => option.value))}
                                                    required
                                                    style={{ minHeight: 80 }}
                                                >
                                                    {products.map(prod => (
                                                        <option key={prod.id} value={prod.id}>
                                                            {prod.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        {applicationType === 'categories' && (
                                            <div>
                                                <label className="mb-1">Chọn danh mục <span style={{ color: 'red' }}>*</span></label>
                                                <select
                                                    className="form-select"
                                                    multiple
                                                    value={selectedCategories}
                                                    onChange={e => handleSelectChange('categories', Array.from(e.target.selectedOptions, option => option.value))}
                                                    required
                                                    style={{ minHeight: 80 }}
                                                >
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        {applicationType === 'combos' && (
                                            <div>
                                                <label className="mb-1">Chọn combo <span style={{ color: 'red' }}>*</span></label>
                                                <select
                                                    className="form-select"
                                                    multiple
                                                    value={selectedCombos}
                                                    onChange={e => handleSelectChange('combos', Array.from(e.target.selectedOptions, option => option.value))}
                                                    required
                                                    style={{ minHeight: 80 }}
                                                >
                                                    {combos.map(combo => (
                                                        <option key={combo.id} value={combo.id}>
                                                            {combo.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        {applicationType === 'orders' && (
                                            <div className="text-muted fst-italic mt-2">Áp dụng cho toàn bộ đơn hàng</div>
                                        )}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-4">
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
                                    <div className="col-md-4">
                                        <label className="mb-1">Giá trị <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            className="form-control"
                                            type="number"
                                            min={0}
                                            value={value}
                                            onChange={e => setValuePromo(e.target.value)}
                                            required
                                            placeholder={promoType === 'percentage' ? 'VD: 15 (%)' : 'VD: 20000 (VNĐ)'}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="mb-1">Trạng thái <span style={{ color: 'red' }}>*</span></label>
                                        <select
                                            className="form-select"
                                            {...register('is_active', { required: 'Trạng thái là bắt buộc' })}
                                            defaultValue="1"
                                        >
                                            <option value="1">Hiển thị</option>
                                            <option value="0">Ẩn</option>
                                        </select>
                                        {errors.is_active && <div className="text-danger">{errors.is_active.message}</div>}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-3">
                                        <label className="mb-1">Ngày bắt đầu <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="mb-1">Ngày kết thúc <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            required
                                        />
                                    </div>
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
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-3">
                                        <label className="mb-1">Tổng lượt sử dụng</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min={1}
                                            value={maxUsage}
                                            onChange={e => setMaxUsage(e.target.value)}
                                            placeholder="VD: 100"
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="mb-1">Lượt/người</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min={1}
                                            value={maxUsagePerUser}
                                            onChange={e => setMaxUsagePerUser(e.target.value)}
                                            placeholder="VD: 1"
                                        />
                                    </div>
                                    <div className="col-md-3">
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
                                            {isSubmitting ? "Đang gửi..." : "Thêm mới"}
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

export default PromotionAdd;