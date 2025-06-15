import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';



const SliderAdd = () => {
    const navigation = useNavigate();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [products, setProducts] = useState([]);
    const [combos, setCombos] = useState([]);
    const [posts, setPosts] = useState([]);
    const [linkType, setLinkType] = useState('');
    const [linkId, setLinkId] = useState('');
    const [displayOrder, setDisplayOrder] = useState(1);

    // Lấy danh sách sản phẩm, combo, post để chọn liên kết
    useEffect(() => {
        requestApi('api/products?limit=1000', 'GET', []).then((res) => {
            if (res.data && res.data.data) setProducts(res.data.data);
        });
        requestApi('api/combos?limit=1000', 'GET', []).then((res) => {
            if (res.data && res.data.data) setCombos(res.data.data);
        });
        requestApi('api/posts?limit=1000', 'GET', []).then((res) => {
            if (res.data && res.data.data) setPosts(res.data.data);
        });
    }, []);

    // Xử lý chọn ảnh
    const onChangeImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImageFile(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
        }
    };

    // Khi đổi loại liên kết, reset id liên kết
    const handleChangeLinkType = (e) => {
        const value = e.target.value;
        setLinkType(value);
        setLinkId('');
        setValue('link_type', value);
        setValue('link_id', '');
    };

    // Submit form
    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description || '');
            formData.append('display_order', data.display_order || 1);
            formData.append('is_active', data.is_active);
            if (data.imageFile && data.imageFile[0]) {
                formData.append('image_url', data.imageFile[0]);
            }
            // Xử lý liên kết
            if (data.link_type && data.link_id) {
                formData.append('linkable_type', data.link_type);
                formData.append('linkable_id', data.link_id);
            }
            const response = await requestApi(
                'api/sliders',
                'POST',
                formData,
                'json',
                'multipart/form-data'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm slider thành công!", toastSuccessConfig);
                setTimeout(() => {
                    navigation('/slider');
                }, 1200);
            } else {
                toast.error(response.data.message || "Thêm slider thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            console.error("Error adding slider:", e);
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Lỗi khi thêm slider", toastErrorConfig);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4">Thêm slider</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Thêm slider</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Dữ liệu slider
                        </div>
                        <div className='card-body'>
                            <form onSubmit={handleSubmit(handleSubmitForm)}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3 mb-md-0">
                                            <input
                                                className="form-control"
                                                id="inputTitle"
                                                {...register('title', { required: 'Tiêu đề là bắt buộc' })}
                                                placeholder="Nhập tiêu đề"
                                            />
                                            <label htmlFor="inputTitle">
                                                Tiêu đề <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            {errors.title && <div className="text-danger">{errors.title.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3 mb-md-0">
                                            <input
                                                className="form-control"
                                                id="inputDisplayOrder"
                                                type="number"
                                                min={1}
                                                {...register('display_order')}
                                                value={displayOrder}
                                                onChange={e => {
                                                    setDisplayOrder(e.target.value);
                                                    setValue('display_order', e.target.value);
                                                }}
                                                placeholder="Nhập thứ tự hiển thị"
                                            />
                                            <label htmlFor="inputDisplayOrder">
                                                Thứ tự hiển thị
                                            </label>
                                            {errors.display_order && <div className="text-danger">{errors.display_order.message}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="mb-3 input-file">
                                            <label htmlFor="inputImage" className="form-label btn btn-secondary">
                                                Chọn ảnh slider
                                            </label>
                                            <input
                                                className="form-control"
                                                id="inputImage"
                                                type="file"
                                                accept="image/*"
                                                {...register('imageFile', {
                                                    required: 'Ảnh slider là bắt buộc',
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
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="form-floating mb-3 mb-md-0">
                                            <select
                                                className="form-select"
                                                id="inputLinkType"
                                                {...register('link_type', { required: 'Loại liên kết là bắt buộc' })}
                                                value={linkType}
                                                onChange={handleChangeLinkType}
                                            >
                                                <option value="" disabled>Chọn loại liên kết</option>
                                                <option value="product">Sản phẩm</option>
                                                <option value="combo">Combo</option>
                                                <option value="post">Khuyến mãi</option>
                                            </select>
                                            <label htmlFor="inputLinkType">Loại liên kết <span style={{ color: 'red' }}>*</span></label>
                                            {errors.link_type && <div className="text-danger">{errors.link_type.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        {linkType === "product" && (
                                            <div className="form-floating mb-3 mb-md-0">
                                                <select
                                                    className="form-select"
                                                    id="inputLinkIdProduct"
                                                    {...register('link_id', { required: 'Sản phẩm liên kết là bắt buộc' })}
                                                    value={linkId}
                                                    onChange={e => {
                                                        setLinkId(e.target.value);
                                                        setValue('link_id', e.target.value);
                                                    }}
                                                >
                                                    <option value="" disabled>Chọn sản phẩm</option>
                                                    {products.map(prod => (
                                                        <option key={prod.id} value={prod.id}>{prod.name}</option>
                                                    ))}
                                                </select>
                                                <label htmlFor="inputLinkIdProduct">Sản phẩm liên kết <span style={{ color: 'red' }}>*</span></label>
                                                {errors.link_id && <div className="text-danger">{errors.link_id.message}</div>}
                                            </div>
                                        )}
                                        {linkType === "combo" && (
                                            <div className="form-floating mb-3 mb-md-0">
                                                <select
                                                    className="form-select"
                                                    id="inputLinkIdCombo"
                                                    {...register('link_id', { required: 'Combo liên kết là bắt buộc' })}
                                                    value={linkId}
                                                    onChange={e => {
                                                        setLinkId(e.target.value);
                                                        setValue('link_id', e.target.value);
                                                    }}
                                                >
                                                    <option value="" disabled>Chọn combo</option>
                                                    {combos.map(combo => (
                                                        <option key={combo.id} value={combo.id}>{combo.name}</option>
                                                    ))}
                                                </select>
                                                <label htmlFor="inputLinkIdCombo">Combo liên kết <span style={{ color: 'red' }}>*</span></label>
                                                {errors.link_id && <div className="text-danger">{errors.link_id.message}</div>}
                                            </div>
                                        )}
                                        {linkType === "post" && (
                                            <div className="form-floating mb-3 mb-md-0">
                                                <select
                                                    className="form-select"
                                                    id="inputLinkIdPost"
                                                    {...register('link_id', { required: 'Khuyến mãi liên kết là bắt buộc' })}
                                                    value={linkId}
                                                    onChange={e => {
                                                        setLinkId(e.target.value);
                                                        setValue('link_id', e.target.value);
                                                    }}
                                                >
                                                    <option value="" disabled>Chọn khuyến mãi</option>
                                                    {posts.map(post => (
                                                        <option key={post.id} value={post.id}>{post.name}</option>
                                                    ))}
                                                </select>
                                                <label htmlFor="inputLinkIdPost">Khuyến mãi liên kết <span style={{ color: 'red' }}>*</span></label>
                                                {errors.link_id && <div className="text-danger">{errors.link_id.message}</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-12">
                                        <label htmlFor="description">Mô tả slider</label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            rows={3}
                                            {...register('description')}
                                            placeholder="Nhập mô tả slider"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 mb-0">
                                    <div className="d-flex justify-content-center gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-secondary w-25"
                                            onClick={() => navigation('/slider')}
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

export default SliderAdd;