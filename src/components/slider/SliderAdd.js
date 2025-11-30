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
    const [imagePreview, setImagePreview] = useState(null);
    const [products, setProducts] = useState([]);
    const [combos, setCombos] = useState([]);
    const [posts, setPosts] = useState([]);
    const [linkType, setLinkType] = useState('');
    const [linkId, setLinkId] = useState('');
    const [displayOrder, setDisplayOrder] = useState(1);

    // Lấy danh sách sản phẩm, combo, post để chọn liên kết
    useEffect(() => {
        requestApi('api/admin/products?limit=1000', 'GET', []).then((res) => {
            if (res.data && res.data.data) setProducts(res.data.data);
        });
        requestApi('api/admin/combos?limit=1000', 'GET', []).then((res) => {
            if (res.data && res.data.data) setCombos(res.data.data);
        });
        requestApi('api/admin/posts?limit=1000', 'GET', []).then((res) => {
            if (res.data && res.data.data) setPosts(res.data.data);
        });
    }, []);

    // Xử lý chọn ảnh
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
            if (imageFile) {
                formData.append('image_url', imageFile);
            }
            // Xử lý liên kết (không bắt buộc)
            if (data.link_type && data.link_id) {
                formData.append('linkable_type', data.link_type);
                formData.append('linkable_id', data.link_id);
            }
            const response = await requestApi(
                'api/admin/sliders',
                'POST',
                formData,
                'json',
                'multipart/form-data'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm slider thành công!", toastSuccessConfig);
                
                navigation('/slider');
                
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
                    <h1 className="mt-4">Thêm slider mới</h1>
                    <ol className="breadcrumb mb-4 p-2">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Thêm slider</li>
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
                                            <label htmlFor="inputTitle" className="form-label fw-semibold">
                                                Tiêu đề slider <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                className="form-control"
                                                id="inputTitle"
                                                {...register('title', { required: 'Tiêu đề là bắt buộc' })}
                                                placeholder="Nhập tiêu đề slider"
                                            />
                                            {errors.title && <div className="text-danger mt-1 small">{errors.title.message}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="inputDisplayOrder" className="form-label fw-semibold">
                                                Thứ tự hiển thị
                                            </label>
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
                                            {errors.display_order && <div className="text-danger mt-1 small">{errors.display_order.message}</div>}
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="inputStatus" className="form-label fw-semibold">
                                                Trạng thái <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select"
                                                id="inputStatus"
                                                {...register('is_active', { required: 'Trạng thái là bắt buộc' })}
                                                defaultValue="1"
                                            >
                                                <option value="1">Hiển thị</option>
                                                <option value="0">Ẩn</option>
                                            </select>
                                            {errors.is_active && <div className="text-danger mt-1 small">{errors.is_active.message}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Hình ảnh slider */}
                            <div className="col-lg-6">
                                <div className="card shadow-sm border-0 h-100">
                                    <div className="card-header bg-white border-bottom-0 pb-0">
                                        <h5 className="mb-0 fw-semibold text-secondary"><i className="fas fa-image me-2"></i>Hình ảnh slider</h5>
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
                                                    <i className="fas fa-upload"></i> Thêm ảnh slider
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
                                                        required: 'Ảnh slider là bắt buộc',
                                                    })}
                                                />
                                                {errors.imageFile && <div className="text-danger mt-1 small">{errors.imageFile.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Liên kết slider */}
                        <div className="row mt-4">
                            <div className="col-lg-12">
                                <div className="card shadow-sm border-0">
                                    <div className="card-header bg-white border-bottom-0 pb-0">
                                        <h5 className="mb-0 fw-semibold text-secondary"><i className="fas fa-link me-2"></i>Liên kết slider</h5>
                                    </div>
                                    <div className="card-body pt-2">
                                        <div className="row mb-3">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="inputLinkType" className="form-label fw-semibold">
                                                        Loại liên kết
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        id="inputLinkType"
                                                        {...register('link_type')}
                                                        value={linkType}
                                                        onChange={handleChangeLinkType}
                                                    >
                                                        <option value="" disabled>Chọn loại liên kết</option>
                                                        <option value="product">Sản phẩm</option>
                                                        <option value="combo">Combo</option>
                                                        <option value="post">Khuyến mãi</option>
                                                    </select>
                                                    {errors.link_type && <div className="text-danger mt-1 small">{errors.link_type.message}</div>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                {linkType === "product" && (
                                                    <div className="mb-3">
                                                        <label htmlFor="inputLinkIdProduct" className="form-label fw-semibold">
                                                            Sản phẩm liên kết
                                                        </label>
                                                        <select
                                                            className="form-select"
                                                            id="inputLinkIdProduct"
                                                            {...register('link_id')}
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
                                                        {errors.link_id && <div className="text-danger mt-1 small">{errors.link_id.message}</div>}
                                                    </div>
                                                )}
                                                {linkType === "combo" && (
                                                    <div className="mb-3">
                                                        <label htmlFor="inputLinkIdCombo" className="form-label fw-semibold">
                                                            Combo liên kết
                                                        </label>
                                                        <select
                                                            className="form-select"
                                                            id="inputLinkIdCombo"
                                                            {...register('link_id')}
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
                                                        {errors.link_id && <div className="text-danger mt-1 small">{errors.link_id.message}</div>}
                                                    </div>
                                                )}
                                                {linkType === "post" && (
                                                    <div className="mb-3">
                                                        <label htmlFor="inputLinkIdPost" className="form-label fw-semibold">
                                                            Khuyến mãi liên kết
                                                        </label>
                                                        <select
                                                            className="form-select"
                                                            id="inputLinkIdPost"
                                                            {...register('link_id')}
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
                                                        {errors.link_id && <div className="text-danger mt-1 small">{errors.link_id.message}</div>}
                                                    </div>
                                                )}
                                                {!linkType && (
                                                    <div className="d-flex align-items-center justify-content-center h-100">
                                                        <span className="text-muted fst-italic">Hiển thị khi không có liên kết</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Mô tả slider */}
                        <div className="row mt-4">
                            <div className="col-lg-12">
                                <div className="card shadow-sm border-0">
                                    <div className="card-header bg-white border-bottom-0 pb-0">
                                        <h5 className="mb-0 fw-semibold text-secondary"><i className="fas fa-align-left me-2"></i>Mô tả slider</h5>
                                    </div>
                                    <div className="card-body pt-2">
                                        <div className="mb-3">
                                            <label htmlFor="description" className="form-label fw-semibold">
                                                Mô tả slider
                                            </label>
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                rows={4}
                                                {...register('description')}
                                                placeholder="Nhập mô tả chi tiết cho slider..."
                                            />
                                        </div>
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
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default SliderAdd;