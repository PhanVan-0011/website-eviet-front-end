import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import CustomEditor from '../common/CustomEditor';



const ProductAdd = () => {
    const navigation = useNavigate();
    const { register, handleSubmit, setValue, trigger, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [originalPrice, setOriginalPrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [featuredImageIndex, setFeaturedImageIndex] = useState(0);


    // Lấy danh sách danh mục
    useEffect(() => {
        dispatch(actions.controlLoading(true));
        requestApi('api/admin/categories?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setCategories(response.data.data);
            }
            dispatch(actions.controlLoading(false));
        });
    }, []);

    // Hàm xử lý khi chọn nhiều ảnh
    const onChangeImages = (e) => {
        const newFiles = Array.from(e.target.files);
        // Kiểm tra file vượt quá 2MB
        const validFiles = [];
        let hasLargeFile = false;
        newFiles.forEach(file => {
            if (file.size > 2 * 1024 * 1024) {
                hasLargeFile = true;
            } else {
                validFiles.push(file);
            }
        });
        // Chỉ hiện toast 1 lần nếu có ít nhất 1 file lớn hơn 2MB
        if (hasLargeFile) {
            toast.error('Ảnh phải nhỏ hơn 2MB!', toastErrorConfig);
        }
        // Nếu không có file hợp lệ nào thì return, không cập nhật state
        if (validFiles.length === 0) {
            e.target.value = ""; // reset input file
            return;
        }
        let combinedFiles = [...imageFiles, ...validFiles];
        // Loại bỏ các file trùng tên (nếu cần)
        combinedFiles = combinedFiles.filter(
            (file, idx, arr) => arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
        );
        if (combinedFiles.length > 4) {
            toast.error('Chỉ được chọn tối đa 4 ảnh!', toastErrorConfig);
            combinedFiles = combinedFiles.slice(0, 4);
        }
        setImageFiles(combinedFiles);
        setValue('imageFiles', combinedFiles, { shouldValidate: true });
        // Tạo preview mới
        const previews = combinedFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
        // Reset featured nếu ảnh đại diện vượt quá số lượng mới
        if (featuredImageIndex >= combinedFiles.length) setFeaturedImageIndex(0);
        e.target.value = ""; // reset input file
    };

    // Thêm hàm format chỉ dấu chấm ngăn cách hàng nghìn
    const formatVND = (value) => {
        value = value.replace(/\D/g, ''); // chỉ lấy số
        if (!value) return '';
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
    
    // Thêm hàm xóa ảnh
    const handleRemoveImage = (idx) => {
        const newFiles = imageFiles.filter((_, i) => i !== idx);
        const newPreviews = imagePreviews.filter((_, i) => i !== idx);
        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
        setValue('imageFiles', newFiles, { shouldValidate: true });
        // Nếu xóa ảnh đại diện thì reset về 0, hoặc nếu ảnh đại diện bị xóa thì về 0
        if (featuredImageIndex === idx || featuredImageIndex >= newFiles.length) {
            setFeaturedImageIndex(0);
        } else if (featuredImageIndex > idx) {
            setFeaturedImageIndex(featuredImageIndex - 1);
        }
    };

    const handleSubmitForm = async (data) => {
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
            // Gửi nhiều category_ids
            if (data.category_ids && data.category_ids.length > 0) {
                (Array.isArray(data.category_ids) ? data.category_ids : [data.category_ids]).forEach(id => formData.append('category_ids[]', id));
            }
            formData.append('status', data.status);
            imageFiles.forEach((file, idx) => {
                formData.append('image_url[]', file);
            });
            formData.append('featured_image_index', featuredImageIndex);
            
            const response = await requestApi(
                'api/admin/products',
                'POST',
                formData,
                'json', // responseType
                'multipart/form-data' // headers
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm sản phẩm thành công!", toastSuccessConfig);
                setTimeout(() => {
                    navigation('/product');
                }, 1500);
            } else {
                toast.error(response.data.message || "Thêm sản phẩm thất bại", toastErrorConfig);
            }
        } catch (e) {
                console.error("Error adding product:", e);
            dispatch(actions.controlLoading(false));
             if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Lỗi khi thêm sản phẩm", toastErrorConfig);
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
                        <li className="breadcrumb-item active">Thêm sản phẩm</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Thêm sản phẩm
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
                                        <div className="col-md-6 px-3">
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
                                                            {imagePreviews[idx] && (
                                                                <div className="form-check mt-2">
                                                                    <input
                                                                        type="radio"
                                                                        name="featuredImage"
                                                                        checked={featuredImageIndex === idx}
                                                                        onChange={() => setFeaturedImageIndex(idx)}
                                                                        className="form-check-input"
                                                                        id={`featuredImage${idx}`}
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
                                                    {...register('imageFiles')}
                                                />
                                                {errors.imageFiles && <div className="text-danger">{errors.imageFiles.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6 px-3">
                                            <div className="mb-3">
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
                                                                    {...register('category_ids', { required: 'Phải chọn ít nhất 1 danh mục' })}
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
                                            <label htmlFor="description"  style={{
                                                        paddingBottom: 8,
                                                        
                                                    }}>
                                                Mô tả sản phẩm</label>
                                            <CustomEditor
                                                onReady={() => register('description', {'required': "Mô tả sản phẩm là bắt buộc"})} // hoặc truyền state nếu muốn hiển thị lại khi sửa
                                                onChange={data => setValue('description', data)}
                                                trigger={() => trigger('description')} // Gọi trigger để kiểm tra validation
                                            />
                                            {errors.description && <div className="text-danger">{errors.description.message}</div>}
                                        </div>
                                    </div>
                                
                                    <div className="mt-4 mb-0">
                                        <div className="d-flex justify-content-center gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-secondary w-25"
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

export default ProductAdd;