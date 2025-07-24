import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';

const OrderAdd = () => {
    const navigation = useNavigate();
    const { register, handleSubmit, setValue, setError, clearErrors, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Danh sách sản phẩm và combo
    const [products, setProducts] = useState([]);
    const [combos, setCombos] = useState([]);
    const [orderItems, setOrderItems] = useState([{ type: 'product', id: '', quantity: 1 }]);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [shippingFee, setShippingFee] = useState('');
    const [paymentMethods, setPaymentMethods] = useState([]);

    // Lấy danh sách sản phẩm, combo và phương thức thanh toán
    useEffect(() => {
        const fetchAll = async () => {
            try {
                dispatch(actions.controlLoading(true));
                const [productRes, comboRes, paymentRes] = await Promise.all([
                    requestApi('api/admin/products?limit=1000', 'GET', []),
                    requestApi('api/admin/combos?limit=1000', 'GET', []),
                    requestApi('api/payment-methods', 'GET', [])
                ]);
                if (productRes.data && productRes.data.data) setProducts(productRes.data.data);
                if (comboRes.data && comboRes.data.data) setCombos(comboRes.data.data);
                if (paymentRes.data && paymentRes.data.data) {
                    const activeMethods = paymentRes.data.data.filter(m => m.is_active);
                    setPaymentMethods(activeMethods);
                    if (activeMethods.length > 0) setPaymentMethod(activeMethods[0].code);
                }
                dispatch(actions.controlLoading(false));
            } catch (err) {
                          dispatch(actions.controlLoading(false));
                toast.error("Không thể tải dữ liệu sản phẩm, combo hoặc phương thức thanh toán!", toastErrorConfig);
            }
        };
        fetchAll();
    }, []);

    // Thêm/xóa item trong đơn hàng
    const handleAddItem = () => {
        const newItems = [...orderItems, { type: 'product', id: '', quantity: 1 }];
        setOrderItems(newItems);
        if (newItems.length > 0) {
            clearErrors('items');
        }
    };
    const handleRemoveItem = (idx) => {
        if (orderItems.length === 1) return;
        const newItems = orderItems.filter((_, i) => i !== idx);
        setOrderItems(newItems);
        if (newItems.length === 0) {
            setError('items', { type: 'manual', message: 'Vui lòng chọn ít nhất 1 sản phẩm hoặc combo!' });
        }
    };
    const handleChangeItem = (idx, field, value) => {
        const newItems = orderItems.map((item, i) =>
            i === idx
                ? field === 'type'
                    ? { ...item, type: value, id: '', quantity: 1 } // reset id và quantity khi đổi loại
                    : { ...item, [field]: value }
            : item
        );
        setOrderItems(newItems);
        if (newItems.length > 0) {
            clearErrors('items');
        }
    };

    // Thêm hàm formatVND giống ComboAdd
    const formatVND = (value) => {
        value = value.replace(/\D/g, '');
        if (!value) return '';
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Xử lý submit
    const handleSubmitForm = async (data) => {
        // Kiểm tra có ít nhất 1 item và tất cả item đều có id
        if (
            orderItems.length === 0 ||
            orderItems.some(item => !item.id)
        ) {
            setError('items', { type: 'manual', message: 'Vui lòng chọn sản phẩm hoặc combo cho đơn hàng!' });
            return;
        } else {
            clearErrors('items');
        }
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const payload = {
                client_name: data.client_name,
                client_phone: data.client_phone,
                shipping_address: data.shipping_address,
                shipping_fee: shippingFee ? Number(shippingFee.replace(/\./g, '')) : 0,
                payment_method_code: paymentMethod,
                items: orderItems.map(item => ({
                    type: item.type,
                    id: Number(item.id),
                    quantity: Number(item.quantity)
                }))
            };
            const response = await requestApi(
                'api/admin/orders',
                'POST',
                payload,
                'json'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Tạo đơn hàng thành công!", toastSuccessConfig);
                setTimeout(() => {
                    navigation('/order');
                }, 1500);
            } else {
                toast.error(response.data.message || "Tạo đơn hàng thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Lỗi khi tạo đơn hàng", toastErrorConfig);
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
                        <li className="breadcrumb-item active">Thêm đơn hàng</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-shopping-cart me-1"></i>
                            Thêm đơn hàng
                        </div>
                        <div className='card-body'>
                            <form onSubmit={handleSubmit(handleSubmitForm)}>
                                <div className="row mb-3">
                                    <div className="col-md-4">
                                        <div className="form-floating mb-3 mb-md-0">
                                            <input
                                                className="form-control"
                                                id="inputClientName"
                                                {...register('client_name', { required: 'Tên khách hàng là bắt buộc' })}
                                                placeholder="Nhập tên khách hàng"
                                            />
                                            <label htmlFor="inputClientName">
                                                Tên khách hàng <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            {errors.client_name && <div className="text-danger">{errors.client_name.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-floating mb-3 mb-md-0">
                                            <input
                                                className="form-control"
                                                id="inputClientPhone"
                                                {...register('client_phone', {
                                                    required: 'Số điện thoại là bắt buộc',
                                                    pattern: {
                                                        value: /^(0|\+84)[1-9][0-9]{8,9}$/,
                                                        message: 'Số điện thoại không hợp lệ'
                                                    }
                                                })}
                                                placeholder="Nhập số điện thoại"
                                            />
                                            <label htmlFor="inputClientPhone">
                                                Số điện thoại <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            {errors.client_phone && <div className="text-danger">{errors.client_phone.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-floating mb-3 mb-md-0">
                                            <input
                                                className="form-control"
                                                id="inputShippingFee"
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="off"
                                                value={formatVND(shippingFee)}
                                                onChange={e => {
                                                    const formatted = formatVND(e.target.value);
                                                    setShippingFee(formatted);
                                                    setValue('shipping_fee', formatted);
                                                }}
                                                placeholder="Phí vận chuyển"
                                            />
                                            <label htmlFor="inputShippingFee">
                                                Phí vận chuyển (VNĐ)
                                            </label>
                                        </div>
                                        
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <div className="form-floating mb-3 mb-md-0">
                                            <input
                                                className="form-control"
                                                id="inputShippingAddress"
                                                {...register('shipping_address', { required: 'Địa chỉ giao hàng là bắt buộc' })}
                                                placeholder="Nhập địa chỉ giao hàng"
                                            />
                                            <label htmlFor="inputShippingAddress">
                                                Địa chỉ giao hàng <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            {errors.shipping_address && <div className="text-danger">{errors.shipping_address.message}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="mb-1 fw-semibold">Phương thức thanh toán <span style={{ color: 'red' }}>*</span></label>
                                        <select
                                            className="form-select"
                                            value={paymentMethod}
                                            onChange={e => setPaymentMethod(e.target.value)}
                                            required
                                        >
                                            {paymentMethods.map(method => (
                                                <option key={method.code} value={method.code}>
                                                    {method.name}
                                                </option>
                                            ))}
                                        </select>
                                        {paymentMethods.length > 0 && (
                                            <div className="form-text mt-1" style={{ minHeight: 22 }}>
                                                {paymentMethods.find(m => m.code === paymentMethod)?.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <label className="fw-bold mb-2">Sản phẩm/Combo trong đơn hàng <span style={{ color: 'red' }}>*</span></label>
                                        {orderItems.map((item, idx) => (
                                            <div className="row align-items-center mb-2" key={idx} style={{ minHeight: 70 }}>
                                                <div className="col-4 d-flex align-items-center">
                                                    <select
                                                        className="form-select"
                                                        value={item.type}
                                                        onChange={e => handleChangeItem(idx, 'type', e.target.value)}
                                                        style={{ maxWidth: 120 }}
                                                    >
                                                        <option value="product">Sản phẩm</option>
                                                        <option value="combo">Combo</option>
                                                    </select>
                                                    <select
                                                        className="form-select ms-2"
                                                        value={item.id}
                                                        onChange={e => handleChangeItem(idx, 'id', e.target.value)}
                                                        
                                                    >
                                                        <option value="" disabled>
                                                            {item.type === 'product' ? 'Chọn sản phẩm' : 'Chọn combo'}
                                                        </option>
                                                        {(item.type === 'product' ? products : combos).map(obj => (
                                                            <option key={obj.id} value={obj.id}>
                                                                {obj.name}
                                                                {obj.size ? ` - ${obj.size}` : ''}
                                                                {obj.category?.name ? ` (${obj.category.name})` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-2 d-flex align-items-center">
                                                    {item.id && (
                                                        (() => {
                                                            const obj = item.type === 'product'
                                                                ? products.find(p => String(p.id) === String(item.id))
                                                                : combos.find(c => String(c.id) === String(item.id));
                                                            const thumbUrl = obj?.featured_image?.thumb_url;
                                                            if (thumbUrl) {
                                                                return (
                                                                    <img
                                                                        src={process.env.REACT_APP_API_URL + 'api/images/' + thumbUrl}
                                                                        alt=""
                                                                        style={{ width: 90, height: 60, objectFit: 'contain', borderRadius: 4, border: '1px solid #eee', background: '#fff' }}
                                                                    />
                                                                );
                                                            } else {
                                                                return (
                                                                    <div style={{ width: 90, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', border: '1px solid #eee', borderRadius: 4 }}>
                                                                        <i className="fas fa-image" style={{ fontSize: 32, color: '#bbb' }}></i>
                                                                    </div>
                                                                );
                                                            }
                                                        })()
                                                    )}
                                                </div>
                                                <div className="col-2">
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
                                                <div className="col-2 d-flex align-items-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => handleRemoveItem(idx)}
                                                        disabled={orderItems.length === 1}
                                                    >
                                                        <i className="fas fa-minus"></i>
                                                    </button>
                                                    {idx === orderItems.length - 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-success ms-2"
                                                            onClick={handleAddItem}
                                                        >
                                                            <i className="fas fa-plus"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {errors.items && (
                                            <div className="text-danger mt-1">{errors.items.message}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 mb-0">
                                    <div className="d-flex justify-content-center gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-secondary w-25"
                                            onClick={() => navigation('/order')}
                                            disabled={isSubmitting}
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button
                                            className="btn btn-primary w-25"
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Đang gửi..." : "Tạo mới"}
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

export default OrderAdd;