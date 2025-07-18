import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import CustomEditor from '../common/CustomEditor';
import { Modal, Button } from 'react-bootstrap';

const ProductUpdate = () => {
    const params = useParams();
    const navigation = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit, setValue, trigger, formState: { errors, isSubmitted } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [originalPrice, setOriginalPrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [oldImages, setOldImages] = useState([]); // ảnh cũ từ API
    const [imagePreviews, setImagePreviews] = useState([]); // preview ảnh mới
    const [removedOldImageIds, setRemovedOldImageIds] = useState([]); // id ảnh cũ bị xóa
    const [featuredImageIndex, setFeaturedImageIndex] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [description, setDescription] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);

    // Gộp lấy danh mục và lấy thông tin sản phẩm cần sửa
    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch(actions.controlLoading(true));
                const [catRes, prodRes] = await Promise.all([
                    requestApi('api/admin/categories?limit=1000', 'GET', []),
                    requestApi(`api/admin/products/${params.id}`, 'GET')
                ]);
                // Xử lý danh mục
                if (catRes.data && catRes.data.data) {
                    setCategories(catRes.data.data);
                }
                // Xử lý sản phẩm
                const data = prodRes.data.data;
                setValue('name', data.name);
                setValue('description', data.description);
                setValue('original_price', data.original_price);
                setValue('sale_price', data.sale_price);
                setValue('stock_quantity', data.stock_quantity);
                setValue('size', data.size || '');
                setValue('status', String(data.status));
                setOriginalPrice(formatVND(parseInt(data.original_price, 10)));
                setSalePrice(formatVND(parseInt(data.sale_price, 10)));
                setValue('original_price', formatVND(parseInt(data.original_price, 10)));
                setValue('sale_price', formatVND(parseInt(data.sale_price, 10)));
                // Xử lý ảnh cũ
                const imgs = data.image_urls || [];
                setOldImages(imgs);
                setImageFiles([]);
                setImagePreviews(imgs.map(img => process.env.REACT_APP_API_URL + 'api/images/' + (img.thumb_url || img.main_url)));
                // Xác định featuredImageIndex
                let featuredIdx = 0;
                if (data.featured_image && data.featured_image.id) {
                    featuredIdx = imgs.findIndex(img => img.id === data.featured_image.id);
                } else {
                    featuredIdx = imgs.findIndex(img => img.is_featured === 1);
                }
                setFeaturedImageIndex(featuredIdx >= 0 ? featuredIdx : 0);
                setDescription(data.description || '');
                // Danh mục
                const catIds = (data.categories || []).map(cat => cat.id);
                setSelectedCategories(catIds);
                setValue('category_ids', catIds);
                dispatch(actions.controlLoading(false));
            } catch (error) {
                dispatch(actions.controlLoading(false));
                toast.error("Không lấy được dữ liệu sản phẩm hoặc danh mục", toastErrorConfig);
            }
        };
        fetchData();
        // eslint-disable-next-line
    }, [params.id, setValue]);

    // Validate ảnh: nếu không có ảnh cũ và không có ảnh mới thì báo lỗi
    useEffect(() => {
        if (oldImages.length + imageFiles.length === 0) {
            setValue('imageFiles', undefined, { shouldValidate: true });
        } else {
            setValue('imageFiles', imageFiles, { shouldValidate: true });
        }
        // eslint-disable-next-line
    }, [oldImages, imageFiles]);

    // Hàm format giá tiền
    const formatVND = (value) => {
        if (value === null || value === undefined) return '';
        value = value.toString();
        value = value.replace(/\D/g, '');
        if (!value) return '';
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
    


    // Hàm xử lý khi chọn nhiều ảnh mới
    const onChangeImages = (e) => {
        const newFiles = Array.from(e.target.files);
        const validFiles = [];
        let hasLargeFile = false;
        newFiles.forEach(file => {
            // if (!file.type.startsWith('image/')) {
            //     hasInvalidType = true;
            //     return;
            // }
            if (file.size > 2 * 1024 * 1024) {
                hasLargeFile = true;
            } else {
                validFiles.push(file);
            }
        });
        // if (hasInvalidType) {
        //     toast.error('Mỗi file tải lên phải là hình ảnh.', toastErrorConfig);
        // }
        if (hasLargeFile) {
            toast.error('Ảnh phải nhỏ hơn 2MB!', toastErrorConfig);
        }
        if (validFiles.length === 0) {
            e.target.value = "";
            return;
        }
        // Nối file mới vào sau ảnh cũ và ảnh mới đã có
        let combinedFiles = [...imageFiles, ...validFiles];
        // Loại bỏ file trùng tên và size
        combinedFiles = combinedFiles.filter(
            (file, idx, arr) => arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
        );
        // Chỉ cho phép tối đa 4 ảnh (bao gồm cả ảnh cũ và mới)
        const maxFiles = 4 - oldImages.length;
        if (combinedFiles.length > maxFiles) {
            toast.error('Chỉ được chọn tối đa 4 ảnh!', toastErrorConfig);
            combinedFiles = combinedFiles.slice(0, maxFiles);
        }
        setImageFiles(combinedFiles);
        setValue('imageFiles', combinedFiles, { shouldValidate: true });
        // Tạo preview mới: ảnh cũ (link) + ảnh mới (file)
        const previews = [
            ...oldImages.map(img => process.env.REACT_APP_API_URL + 'api/images/' + (img.thumb_url || img.main_url)),
            ...combinedFiles.map(file => URL.createObjectURL(file))
        ];
        setImagePreviews(previews);
        // Đảm bảo featuredImageIndex hợp lệ
        if (previews.length === 0) {
            setFeaturedImageIndex(-1);
        } else if (featuredImageIndex >= previews.length) {
            setFeaturedImageIndex(0);
        }
        e.target.value = "";
        trigger('imageFiles');
    };

    // Hàm xóa ảnh
    const handleRemoveImage = (idx) => {
        if (idx < oldImages.length) {
            // Xóa ảnh cũ
            const removed = oldImages[idx];
            setRemovedOldImageIds([...removedOldImageIds, removed.id]);
            const newOld = oldImages.filter((_, i) => i !== idx);
            setOldImages(newOld);
            // Cập nhật preview và files
            const previews = [
                ...newOld.map(img => process.env.REACT_APP_API_URL + 'api/images/' + (img.thumb_url || img.main_url)),
                ...imageFiles.map(file => URL.createObjectURL(file))
            ];
            setImagePreviews(previews);
            setValue('imageFiles', imageFiles, { shouldValidate: true });
            // Đảm bảo featuredImageIndex hợp lệ
            if (previews.length === 0) {
                setFeaturedImageIndex(-1);
            } else if (featuredImageIndex === idx || featuredImageIndex >= previews.length) {
                setFeaturedImageIndex(0);
            } else if (featuredImageIndex > idx) {
                setFeaturedImageIndex(featuredImageIndex - 1);
            }
            trigger('imageFiles');
        } else {
            // Xóa ảnh mới
            const newIdx = idx - oldImages.length;
            const newFiles = imageFiles.filter((_, i) => i !== newIdx);
            setImageFiles(newFiles);
            // Cập nhật preview
            const previews = [
                ...oldImages.map(img => process.env.REACT_APP_API_URL + 'api/images/' + (img.thumb_url || img.main_url)),
                ...newFiles.map(file => URL.createObjectURL(file))
            ];
            setImagePreviews(previews);
            setValue('imageFiles', newFiles, { shouldValidate: true });
            // Đảm bảo featuredImageIndex hợp lệ
            if (previews.length === 0) {
                setFeaturedImageIndex(-1);
            } else if (featuredImageIndex === idx || featuredImageIndex >= previews.length) {
                setFeaturedImageIndex(0);
            } else if (featuredImageIndex > idx) {
                setFeaturedImageIndex(featuredImageIndex - 1);
            }
            trigger('imageFiles');
        }
    };

    // // Sửa lại chọn ảnh đại diện: lưu id ảnh cũ hoặc null nếu là ảnh mới
    // const handleSetFeaturedImage = (idx) => {
    //     if (idx < oldImages.length) {
    //         setFeaturedImageId(oldImages[idx].id);
    //     } else {
    //         setFeaturedImageId(null); // Ảnh mới không có id
    //     }
    //     setFeaturedImageIndex(idx);
    // };

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
        const valid = await trigger('imageFiles');
        if (!valid) return;
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description || '');
            formData.append('original_price', Number(data.original_price.replace(/\./g, '')));
            formData.append('sale_price', Number(data.sale_price.replace(/\./g, '')));
            formData.append('stock_quantity', data.stock_quantity);
            formData.append('size', data.size || '');
            formData.append('status', data.status);
            (selectedCategories.length > 0 ? selectedCategories : []).forEach(id => formData.append('category_ids[]', id));

            // Gửi file ảnh thật sự
            imageFiles.forEach(file => formData.append('image_url[]', file));
            // Gửi deleted_image_ids[]
            removedOldImageIds.forEach(id => formData.append('deleted_image_ids[]', id));
            // Chỉ gửi featured_image_index nếu còn ảnh
            if (featuredImageIndex >= 0) {
                formData.append('featured_image_index', featuredImageIndex);
            }
            

            const response = await requestApi(
                `api/admin/products/${params.id}`,
                'POST',
                formData,
                'json',
                'multipart/form-data'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật sản phẩm thành công!", toastSuccessConfig);
                setTimeout(() => {
                    navigation('/product');
                }, 1500);
            } else {
                toast.error(response.data.message || "Cập nhật sản phẩm thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Lỗi khi cập nhật sản phẩm", toastErrorConfig);
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
                        <li className="breadcrumb-item active">Cập nhật sản phẩm</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                           Cập nhật sản phẩm
                        </div>
                        <div className='card-body'>
                            <div className='mb-3 row'>
                                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3 mb-md-0">
                                                <input
                                                    className="form-control"
                                                    id="inputName"
                                                    {...register('name', { required: 'Tên sản phẩm là bắt buộc' })}
                                                    placeholder="Nhập tên sản phẩm"
                                                />
                                                <label htmlFor="inputName">
                                                    Tên sản phẩm <span style={{color: 'red'}}>*</span>
                                                </label>
                                                {errors.name && <div className="text-danger">{errors.name.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3 mb-md-0">
                                                <input
                                                    className="form-control"
                                                    id="inputStock"
                                                    type="number"
                                                    {...register('stock_quantity', { required: 'Số lượng là bắt buộc' })}
                                                    placeholder="Nhập số lượng"
                                                />
                                                <label htmlFor="inputStock">
                                                    Số lượng <span style={{color: 'red'}}>*</span>
                                                </label>
                                                {errors.stock_quantity && <div className="text-danger">{errors.stock_quantity.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3 mb-md-0">
                                                <input
                                                    className="form-control"
                                                    id="inputOriginalPrice"
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    value={originalPrice}
                                                    onChange={e => {
                                                        const formatted = formatVND(e.target.value);
                                                        setOriginalPrice(formatted);
                                                        setValue('original_price', formatted);
                                                    }}
                                                    placeholder="Nhập giá gốc (VND)"
                                                />
                                                <label htmlFor="inputOriginalPrice">
                                                    Giá gốc (VNĐ) <span style={{color: 'red'}}>*</span>
                                                </label>
                                                {errors.original_price && <div className="text-danger">{errors.original_price.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    className="form-control"
                                                    id="inputSalePrice"
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="off"
                                                    value={salePrice}
                                                    onChange={e => {
                                                        const formatted = formatVND(e.target.value);
                                                        setSalePrice(formatted);
                                                        setValue('sale_price', formatted);
                                                    }}
                                                    placeholder="Nhập giá bán (VND)"
                                                />
                                                <label htmlFor="inputSalePrice">
                                                    Giá bán (VNĐ)<span style={{color: 'red'}}>*</span>
                                                </label>
                                                {errors.sale_price && <div className="text-danger">{errors.sale_price.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3 mb-md-0">
                                                <select
                                                    className="form-select"
                                                    id="inputStatus"
                                                    {...register('status', { required: 'Trạng thái là bắt buộc' })}
                                                    defaultValue="1"
                                                >
                                                    <option value="1">Đang bán</option>
                                                    <option value="0">Ngừng bán</option>
                                                </select>
                                                <label htmlFor="inputStatus">Trạng thái <span style={{color: 'red'}}>*</span></label>
                                                {errors.status && <div className="text-danger">{errors.status.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3 mb-md-0">
                                                <input
                                                    className="form-control"
                                                    id="inputSize"
                                                    {...register('size')}
                                                    placeholder="Nhập kích thước (nếu có)"
                                                />
                                                <label htmlFor="inputSize">Kích thước</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-6 input-file">
                                            <div className="mb-3">
                                                <div className="form-label fw-semibold">
                                                    Hình ảnh sản phẩm
                                                </div>
                                                <div className="row g-3">
                                                    {[0, 1, 2, 3].map(idx => (
                                                        <div key={idx} className="col-3 p-2 d-flex flex-column align-items-center">
                                                            <div
                                                                className="w-100 border border-2 border-secondary border-dashed rounded bg-light position-relative d-flex align-items-center justify-content-center"
                                                                style={{ aspectRatio: '1/1', minHeight: 0, height: 'auto', maxWidth: '100%' }}
                                                            >
                                                                {imagePreviews[idx] ? (
                                                                    <>
                                                                        <img
                                                                            src={imagePreviews[idx]}
                                                                            alt={`Preview ${idx}`}
                                                                            className="w-100 h-100 rounded position-absolute top-0 start-0"
                                                                            style={{ objectFit: 'fill', aspectRatio: '1/1' }}
                                                                            onClick={e => { e.stopPropagation(); setFeaturedImageIndex(idx); }}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-danger btn-sm rounded-circle position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center no-hover"
                                                                            style={{ zIndex: 2, width: 24, height: 24, padding: 0, background: '#fff' }}
                                                                            aria-label="Xóa ảnh"
                                                                            onClick={e => { e.stopPropagation(); handleRemoveImage(idx); }}
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
                                                            {/* Nút chọn ảnh đại diện nằm ngoài khung */}
                                                            {imagePreviews[idx] && (
                                                                <div className="form-check mt-2">
                                                                    <input
                                                                        type="radio"
                                                                        name="featuredImage"
                                                                        checked={featuredImageIndex === idx}
                                                                        onChange={() => setFeaturedImageIndex(idx)}
                                                                        className="form-check-input"
                                                                        id={`featuredImage${idx}`}
                                                                        disabled={imagePreviews.length === 0}
                                                                    />
                                                                    <label className="form-check-label" htmlFor={`featuredImage${idx}`}>Ảnh đại diện</label>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="d-flex align-items-center flex-wrap gap-2 mt-2">
                                                    <label htmlFor="inputImages" className="form-label btn btn-secondary mb-0">
                                                        <i className="fas fa-upload"></i> Thêm ảnh sản phẩm
                                                    </label>
                                                    <div className="d-flex flex-column gap-1">
                                                    <span className="text-muted small">
                                                        Chọn tối đa 4 ảnh, định dạng: jpg, png...
                                                    </span>
                                                    <span className="text-muted small">
                                                        <b>Giữ Ctrl hoặc Shift để chọn nhiều ảnh cùng lúc.</b>
                                                    </span>
                                                    </div>
                                        
                                                </div>
                                                <input
                                                    className="form-control"
                                                    id="inputImages"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    style={{ display: 'none' }}
                                                    onChange={onChangeImages}
                                                    ref={input => (window.imageInput = input)}
                                                />
                                                <input
                                                    type="hidden"
                                                    {...register('imageFiles', {
                                                    })}
                                                />
                                                {isSubmitted && errors.imageFiles && <div className="text-danger">{errors.imageFiles.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3 px-3">
                                                <label className="form-label fw-semibold">
                                                    Danh mục <span style={{ color: 'red' }}>*</span>
                                                </label>
                                                <div
                                                    className="row"
                                                    style={{
                                                        maxHeight: 245,
                                                        overflowY: 'auto',
                                                        border: '1px solid #e0e0e0',
                                                        borderRadius: 4,
                                                        padding: 8,
                                                        background: '#fafbfc'
                                                    }}
                                                >
                                                    {categories.map(cat => (
                                                        <div className="col-12" key={cat.id}>
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id={`cat_${cat.id}`}
                                                                    value={cat.id}
                                                                    checked={selectedCategories.includes(cat.id)}
                                                                    onChange={handleCategoryChange}
                                                                />
                                                                <label className="form-check-label" htmlFor={`cat_${cat.id}`}>
                                                                    {cat.name}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    </div>
                                                {errors.category_ids && <div className="text-danger">{errors.category_ids.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-md-12">
                                            <label htmlFor="description">Mô tả sản phẩm</label>
                                            <CustomEditor
                                                data={description}
                                                onReady={() => register('description', {'required': "Mô tả sản phẩm là bắt buộc"})}
                                                onChange={data => setValue('description', data)}
                                                trigger={() => trigger('description')}
                                            />
                                            {errors.description && <div className="text-danger">{errors.description.message}</div>}
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
                                                className="btn btn-secondary w-25 font-weight-bold"
                                                onClick={() => navigation('/product')}
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
                </div>
            </main>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Xác nhận xóa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Bạn chắc chắn muốn xóa sản phẩm này?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Hủy
                </Button>
                <Button
                    variant="danger"
                    onClick={async () => {
                        setShowModal(false);
                            try {
                                dispatch(actions.controlLoading(true));
                                const response = await requestApi(`api/admin/products/${params.id}`, 'DELETE', []);
                                dispatch(actions.controlLoading(false));
                                if (response.data && response.data.success) {
                                    toast.success(response.data.message || "Xóa sản phẩm thành công!", toastSuccessConfig);
                                    setTimeout(() => {
                                        navigation('/product');
                                    }, 1200);
                                } else {
                                    toast.error(response.data.message || "Xóa sản phẩm thất bại", toastErrorConfig);
                                }
                            } catch (e) {
                                dispatch(actions.controlLoading(false));
                                if (e.response && e.response.data && e.response.data.message) {
                                    toast.error(e.response.data.message, toastErrorConfig);
                                } else {
                                    toast.error("Server error", toastErrorConfig);
                                }
                            }
                    }}
                    disabled={isSubmitting}
                >
                    Xóa
                </Button>
            </Modal.Footer>
        </Modal>
        </div>
    );
};

export default ProductUpdate;