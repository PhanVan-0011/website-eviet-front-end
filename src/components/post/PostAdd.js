import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import CustomEditor from '../common/CustomEditor';
import Select from 'react-select';

const PostAdd = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, trigger, control, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [featuredImageIndex, setFeaturedImageIndex] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));

    useEffect(() => {
        dispatch(actions.controlLoading(true));
        requestApi('api/admin/categories?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setCategories(response.data.data);
            dispatch(actions.controlLoading(false));
        });
    }, []);

    // Xử lý chọn ảnh (chỉ 1 ảnh)
    const onChangeImages = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ảnh phải nhỏ hơn 2MB!', toastErrorConfig);
            e.target.value = "";
            return;
        }
        setImageFiles([file]);
        setValue('imageFiles', [file], { shouldValidate: true });
        setImagePreviews([URL.createObjectURL(file)]);
        setFeaturedImageIndex(0);
        e.target.value = "";
    };

    const handleRemoveImage = (idx) => {
        setImageFiles([]);
        setImagePreviews([]);
        setValue('imageFiles', [], { shouldValidate: true });
        setFeaturedImageIndex(0);
    };

    const handleSubmitForm = async (data) => {
        const valid = await trigger(['imageFiles', 'category_ids']);
        if (!valid) return;
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('content', data.content || '');
            formData.append('status', data.status);
            if (data.category_ids && data.category_ids.length > 0) {
                (Array.isArray(data.category_ids) ? data.category_ids : [data.category_ids]).forEach(id => formData.append('category_ids[]', id));
            }
            imageFiles.forEach((file, idx) => {
                formData.append('image_url[]', file);
            });
            if (imageFiles.length > 0) {
                formData.append('featured_image_index', 0);
            }
            const response = await requestApi(
                'api/admin/posts',
                'POST',
                formData,
                'json',
                'multipart/form-data'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm bài viết thành công!", toastSuccessConfig);

                navigate('/post');
         
            } else {
                toast.error(response.data.message || "Thêm bài viết thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Lỗi khi thêm bài viết", toastErrorConfig);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4">Thêm bài viết</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Thêm bài viết</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Dữ liệu bài viết
                        </div>
                        <div className='card-body'>
                            <div className='mb-3 row'>
                                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3 mb-md-0">
                                                <input
                                                    className="form-control"
                                                    id="inputTitle"
                                                    {...register('title', { required: 'Tiêu đề là bắt buộc' })}
                                                    placeholder="Nhập tiêu đề bài viết"
                                                />
                                                <label htmlFor="inputTitle">
                                                    Tiêu đề <span style={{ color: 'red' }}>*</span>
                                                </label>
                                                {errors.title && <div className="text-danger">{errors.title.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3 mb-md-0">
                                                <select
                                                    className="form-select"
                                                    id="inputStatus"
                                                    {...register('status', { required: 'Trạng thái là bắt buộc' })}
                                                    defaultValue="1"
                                                >
                                                    <option value="1">Hiển thị</option>
                                                    <option value="0">Ẩn</option>
                                                </select>
                                                <label htmlFor="inputStatus">Trạng thái <span style={{ color: 'red' }}>*</span></label>
                                                {errors.status && <div className="text-danger">{errors.status.message}</div>}
                                            </div>
                                        </div>
                                 
                                    </div>
                                    <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Danh mục <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <Select
                                                options={categoryOptions}
                                                isMulti
                                                value={categoryOptions.filter(opt => selectedCategories.includes(String(opt.value)) || selectedCategories.includes(opt.value))}
                                                onChange={opts => {
                                                    const values = opts ? opts.map(opt => opt.value) : [];
                                                    setSelectedCategories(values);
                                                    setValue('category_ids', values, { shouldValidate: true });
                                                }}
                                                placeholder="Tìm kiếm & chọn danh mục..."
                                                classNamePrefix="react-select"
                                                onBlur={() => trigger('category_ids')}
                                            />
                                            <input
                                                type="hidden"
                                                {...register('category_ids', {
                                                    validate: value => (value && value.length > 0) || 'Phải chọn ít nhất 1 danh mục!'
                                                })}
                                            />
                                            {errors.category_ids && <div className="text-danger">{errors.category_ids.message}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                    <div className="mb-3">
                                        <div className="form-label fw-semibold">
                                            Hình ảnh bài viết
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-3 p-2 d-flex flex-column align-items-center">
                                                <div
                                                    className={`w-100 border border-2 ${imagePreviews[0] ? 'border-primary' : 'border-secondary'} border-dashed rounded bg-light position-relative d-flex align-items-center justify-content-center`}
                                                    style={{ aspectRatio: '1/1', minHeight: 0, height: 'auto', maxWidth: '100%' }}
                                                >
                                                    {imagePreviews[0] ? (
                                                        <>
                                                            <img
                                                                src={imagePreviews[0]}
                                                                alt={`Preview`}
                                                                className="w-100 h-100 rounded position-absolute top-0 start-0"
                                                                style={{ objectFit: 'fill', aspectRatio: '1/1' }}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm rounded-circle position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center no-hover"
                                                                style={{ zIndex: 2, width: 24, height: 24, padding: 0, background: '#fff' }}
                                                                aria-label="Xóa ảnh"
                                                                onClick={e => { e.stopPropagation(); handleRemoveImage(0); }}
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
                                            </div>
                                        </div>
                                                <div className="d-flex align-items-center flex-wrap gap-2 mt-2">
                                                    <label htmlFor="inputImages" className="form-label btn btn-secondary mb-0">
                                                        <i className="fas fa-upload"></i> Thêm ảnh bài viết
                                                    </label>
                                                    <div className="d-flex flex-column gap-1">
                                                    <span className="text-muted small">
                                                        Chỉ chọn 1 ảnh, định dạng: jpg, png...
                                                    </span>
                                                    </div>
                                                </div>
                                                <input
                                                    className="form-control"
                                                    id="inputImages"
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={onChangeImages}
                                                    ref={input => (window.imageInput = input)}
                                                />
                                                <input
                                                    type="hidden"
                                                    {...register('imageFiles')}
                                                />
                                                {errors.imageFiles && <div className="text-danger">{errors.imageFiles.message}</div>}
                                            </div>
                                        </div>
                                 
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-12">
                                            <label className="form-label">Nội dung</label>
                                            <CustomEditor
                                                folder="posts"
                                                onReady={() => register('content', { required: "Nội dung là bắt buộc" })}
                                                onChange={data => setValue('content', data)}
                                                trigger={() => trigger('content')}
                                            />
                                            {errors.content && <div className="text-danger">{errors.content.message}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-4 mb-0">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-secondary w-25"
                                                onClick={() => navigate('/post')}
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
                </div>
            </main>
        </div>
    );
};

export default PostAdd;