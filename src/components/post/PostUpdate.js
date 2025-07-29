import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import CustomEditor from '../common/CustomEditor';
import { Modal, Button } from 'react-bootstrap';
import Select from 'react-select';

const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const PostUpdate = () => {
    const { id } = useParams();
    const { register, handleSubmit, setValue, trigger, formState: { errors, isSubmitted } } = useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [oldImages, setOldImages] = useState([]); // ảnh cũ từ API
    const [imageFiles, setImageFiles] = useState([]); // file ảnh mới
    const [imagePreviews, setImagePreviews] = useState([]); // preview ảnh (cũ + mới)
    const [removedOldImageIds, setRemovedOldImageIds] = useState([]); // id ảnh cũ bị xóa
    const [featuredImageIndex, setFeaturedImageIndex] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));
    const [description, setDescription] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch(actions.controlLoading(true));
                const [catRes, postRes] = await Promise.all([
                    requestApi('api/admin/categories?limit=1000', 'GET', []),
                    requestApi(`api/admin/posts/${id}`, 'GET')
                ]);
                if (catRes.data && catRes.data.data) setCategories(catRes.data.data);
                const data = postRes.data.data;
                setValue('title', data.title);
                setValue('content', data.content);
                setValue('status', String(data.status));
                setDescription(data.content || '');
                // Ảnh cũ
                const imgs = data.image_urls || [];
                setOldImages(imgs);
                setImageFiles([]);
                setImagePreviews(imgs.map(img => urlImage + (img.thumb_url || img.main_url)));
                // Xác định featuredImageIndex
                let featuredIdx = 0;
                if (data.featured_image && data.featured_image.id) {
                    featuredIdx = imgs.findIndex(img => img.id === data.featured_image.id);
                } else {
                    featuredIdx = imgs.findIndex(img => img.is_featured === 1);
                }
                setFeaturedImageIndex(featuredIdx >= 0 ? featuredIdx : 0);
                // Danh mục
                const catIds = (data.categories || []).map(cat => cat.id);
                setSelectedCategories(catIds);
                setValue('category_ids', catIds);
                dispatch(actions.controlLoading(false));
            } catch (error) {
                dispatch(actions.controlLoading(false));
                toast.error("Không lấy được dữ liệu bài viết hoặc danh mục", toastErrorConfig);
            }
        };
        fetchData();
    }, [id, setValue]);

    // Thêm validate cho imageFiles
    useEffect(() => {
        // Validate ảnh: nếu không có ảnh cũ và không có ảnh mới thì báo lỗi
        if (oldImages.length + imageFiles.length === 0) {
            setValue('imageFiles', undefined, { shouldValidate: true });
        } else {
            setValue('imageFiles', imageFiles, { shouldValidate: true });
        }
        // eslint-disable-next-line
    }, [oldImages, imageFiles]);

    // Xử lý chọn ảnh (chỉ 1 ảnh mới)
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
        const previews = [
            ...oldImages.map(img => urlImage + (img.thumb_url || img.main_url)),
            URL.createObjectURL(file)
        ];
        setImagePreviews(previews);
        setFeaturedImageIndex(0);
        e.target.value = "";
        trigger('imageFiles');
    };

    // Hàm xóa ảnh (chỉ 1 ảnh)
    const handleRemoveImage = (idx) => {
        if (idx < oldImages.length) {
            // Xóa ảnh cũ
            const removed = oldImages[idx];
            setRemovedOldImageIds([...removedOldImageIds, removed.id]);
            setOldImages([]);
            setImageFiles([]);
            setImagePreviews([]);
            setValue('imageFiles', [], { shouldValidate: true });
            setFeaturedImageIndex(0);
            trigger('imageFiles');
        } else {
            // Xóa ảnh mới
            setImageFiles([]);
            setImagePreviews([]);
            setValue('imageFiles', [], { shouldValidate: true });
            setFeaturedImageIndex(0);
            trigger('imageFiles');
        }
    };

    // Chọn danh mục
    const handleCategoryChange = (e) => {
        const value = parseInt(e.target.value);
        let newSelected = [...selectedCategories];
        if (e.target.checked) {
            if (!newSelected.includes(value)) newSelected.push(value);
        } else {
            newSelected = newSelected.filter(id => id !== value);
        }
        setSelectedCategories(newSelected);
        setValue('category_ids', newSelected, { shouldValidate: true });
    };

    // Submit
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
            (selectedCategories.length > 0 ? selectedCategories : []).forEach(id => formData.append('category_ids[]', id));
            imageFiles.forEach((file) => {
                formData.append('image_url[]', file);
            });
            removedOldImageIds.forEach(id => formData.append('deleted_image_ids[]', id));
            if (imageFiles.length > 0 || oldImages.length > 0) {
                formData.append('featured_image_index', 0);
            }
            const response = await requestApi(
                `api/admin/posts/${id}`,
                'POST',
                formData,
                'json',
                'multipart/form-data'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật bài viết thành công!", toastSuccessConfig);
                navigate('/post');
            } else {
                toast.error(response.data.message || "Cập nhật bài viết thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            toast.error("Lỗi khi cập nhật bài viết", toastErrorConfig);
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
                        <li className="breadcrumb-item active">Cập nhật bài viết</li>
                    </ol>
                    <div className="card mb-3">
                        <div className="card-header">
                            <i className="fas fa-table me-1"></i>
                            Cập nhật bài viết
                        </div>
                        <div className="card-body">
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
                                        <div className="col-md-6 px-3">
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
                                                {isSubmitted && errors.imageFiles && <div className="text-danger">{errors.imageFiles.message}</div>}
                                            </div>
                                        </div>
                                        
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-12">
                                            <label className="form-label">Nội dung</label>
                                            <CustomEditor
                                                data={description}
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
                                                className="btn btn-danger w-25 font-weight-bold"
                                                onClick={() => setShowModal(true)}
                                                disabled={isSubmitting}
                                            >
                                                Xóa
                                            </button>
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
                                                {isSubmitting ? "Đang gửi..." : "Cập nhật"}
                                            </button>
                                        </div>
                                        <Modal show={showModal} onHide={() => setShowModal(false)}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Xác nhận xóa</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <p>Bạn chắc chắn muốn xóa bài viết này?</p>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button variant="secondary" onClick={() => setShowModal(false)}>
                                                    Hủy
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={async () => {
                                                        setShowModal(false);
                                                        setIsSubmitting(true);
                                                        try {
                                                            dispatch(actions.controlLoading(true));
                                                            const res = await requestApi(`api/admin/posts/${id}`, 'DELETE');
                                                            dispatch(actions.controlLoading(false));
                                                            if (res.data && res.data.success) {
                                                                toast.success(res.data.message || 'Đã xóa bài viết!', toastSuccessConfig);
                                                                navigate('/post')
                                                            } else {
                                                                toast.error(res.data.message || 'Xóa bài viết thất bại', toastErrorConfig);
                                                            }
                                                        } catch (e) {
                                                            dispatch(actions.controlLoading(false));
                                                            toast.error('Lỗi khi xóa bài viết', toastErrorConfig);
                                                        } finally {
                                                            setIsSubmitting(false);
                                                        }
                                                    }}
                                                    disabled={isSubmitting}
                                                >
                                                    Xóa
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>
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

export default PostUpdate;