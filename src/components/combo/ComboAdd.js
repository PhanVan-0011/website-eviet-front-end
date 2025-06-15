import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import CustomEditor from '../common/CustomEditor';

const ComboAdd = () => {
    const navigation = useNavigate();
    const { register, handleSubmit, setValue, trigger, formState: { errors }, watch } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [products, setProducts] = useState([]);
    const [price, setPrice] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [comboItems, setComboItems] = useState([{ product_id: '', quantity: 1 }]);

    // Lấy danh sách sản phẩm
    useEffect(() => {
        requestApi('api/products?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setProducts(response.data.data);
            }
        });
    }, []);

    // Hàm xử lý khi chọn ảnh
    const onChangeImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageFile(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
        }
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
            formData.append('image_url', data.imageFile ? data.imageFile[0] : null);

            // Thêm sản phẩm vào combo
            comboItems.forEach((item, idx) => {
                formData.append(`items[${idx}][product_id]`, item.product_id);
                formData.append(`items[${idx}][quantity]`, item.quantity);
            });

            const response = await requestApi(
                'api/combos',
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
                    <h1 className="mt-4">Thêm combo</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Thêm combo</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Dữ liệu combo
                        </div>
                        <div className='card-body'>
                            <form onSubmit={handleSubmit(handleSubmitForm)}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3 mb-md-0">
                                            <input
                                                className="form-control"
                                                id="inputName"
                                                {...register('name', { required: 'Tên combo là bắt buộc' })}
                                                placeholder="Nhập tên combo"
                                            />
                                            <label htmlFor="inputName">
                                                Tên combo <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            {errors.name && <div className="text-danger">{errors.name.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                         <div className="form-floating mb-3 mb-md-0">
                                                <input
                                                    className="form-control"
                                                    id="inputPrice"
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    value={price}
                                                    onChange={e => {
                                                        const formatted = formatVND(e.target.value);
                                                        setPrice(formatted);
                                                        setValue('price', formatted);
                                                    }}
                                                    placeholder="Nhập giá Combo (VND)"
                                                />
                                                <label htmlFor="inputPrice">
                                                    Giá Combo (VNĐ) <span style={{color: 'red'}}>*</span>
                                                </label>
                                                {errors.price && <div className="text-danger">{errors.price.message}</div>}
                                            </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="mb-1">Ngày bắt đầu <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="mb-1">Ngày kết thúc <span style={{ color: 'red' }}>*</span></label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3 mb-md-0">
                                            <select
                                                className="form-select"
                                                id="inputStatus"
                                                {...register('is_active', { required: 'Trạng thái là bắt buộc' })}
                                                defaultValue="1"
                                            >
                                                <option value="1">Hiển thị</option>
                                                <option value="0">Ẩn</option>
                                            </select>
                                            <label htmlFor="inputStatus">Trạng thái <span style={{ color: 'red' }}>*</span></label>
                                            {errors.is_active && <div className="text-danger">{errors.is_active.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6 input-file">
                                        <div className="mb-3">
                                            <label htmlFor="inputImage" className="form-label btn btn-secondary">
                                                Chọn ảnh combo
                                            </label>
                                            <input
                                                className="form-control"
                                                id="inputImage"
                                                type="file"
                                                accept="image/*"
                                                {...register('imageFile', {
                                                    required: 'Ảnh combo là bắt buộc',
                                                    onChange: onChangeImage,
                                                    validate: {
                                                        checkType: (files) =>
                                                            files && files[0]
                                                                ? (['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(files[0].type)
                                                                    ? true
                                                                    : 'Chỉ chấp nhận ảnh jpg, jpeg, png, gif')
                                                                : true,
                                                        checkSize: (files) =>
                                                            files && files[0]
                                                                ? (files[0].size <= 2 * 1024 * 1024
                                                                    ? true
                                                                    : 'Kích thước ảnh tối đa 2MB')
                                                                : true
                                                    }
                                                })}
                                            />
                                            <small className="text-muted"> Chỉ chọn 1 ảnh, định dạng: jpg, png...</small>
                                            {errors.imageFile && <div className="text-danger">{errors.imageFile.message}</div>}
                                            {imageFile && (
                                                <div className="mt-2">
                                                    <img
                                                        src={imageFile}
                                                        alt="Preview"
                                                        className="img-thumbnail"
                                                        style={{ maxWidth: '200px' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <label htmlFor="description">Mô tả combo</label>
                                        <CustomEditor
                                            onReady={() => register('description', { required: "Mô tả combo là bắt buộc" })}
                                            onChange={data => setValue('description', data)}
                                            trigger={() => trigger('description')}
                                        />
                                        {errors.description && <div className="text-danger">{errors.description.message}</div>}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <label className="fw-bold mb-2">Sản phẩm trong combo <span style={{ color: 'red' }}>*</span></label>
                                        {comboItems.map((item, idx) => (
                                            <div className="row align-items-center mb-2" key={idx}>
                                                <div className="col-md-7">
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
                                                    {/* Hiển thị hình ảnh và mô tả sản phẩm đã chọn */}
                                                    {item.product_id && (
                                                        <div className="mt-1 d-flex align-items-center gap-2">
                                                            <img
                                                                src={
                                                                    products.find(p => p.id === item.product_id)?.image_url
                                                                        ? products.find(p => p.id === item.product_id).image_url.startsWith('http')
                                                                            ? products.find(p => p.id === item.product_id).image_url
                                                                            : process.env.REACT_APP_API_URL + 'api/images/' + products.find(p => p.id === item.product_id).image_url
                                                                        : '/no-image.png'
                                                                }
                                                                alt=""
                                                                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }}
                                                            />
                                                            {!products.find(p => p.id === item.product_id)?.image_url && (
                                                                <span className="ms-2 small text-muted">Sản phẩm được chọn chưa có hình ảnh</span>
                                                            )}
                    
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-md-3">
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
                                                <div className="col-md-2">
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
                                                            className="btn btn-success ms-2"
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
                                <div className="mt-4 mb-0">
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
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ComboAdd;