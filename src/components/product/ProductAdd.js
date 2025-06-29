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
    const { register, handleSubmit, setValue,trigger, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [originalPrice, setOriginalPrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [imageFile, setImageFile] = useState(null);


    // Lấy danh sách danh mục
    useEffect(() => {
        requestApi('api/admin/categories?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setCategories(response.data.data);
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
    

    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);
        console.log('Submitted data:', data);
        try {
            dispatch(actions.controlLoading(true));
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description || '');
            formData.append('original_price', Number(data.original_price.replace(/\./g, '')));
            formData.append('sale_price', Number(data.sale_price.replace(/\./g, '')));
            formData.append('stock_quantity', data.stock_quantity);
            formData.append('size', data.size || '');
            formData.append('category_id', data.category_id);
            formData.append('status', data.status);
            formData.append('image_url', data.imageFile ? data.imageFile[0] : null);
            
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
                    <h1 className="mt-4">Thêm sản phẩm</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Thêm sản phẩm</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Dữ liệu sản phẩm
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
                                                    id="inputCategory"
                                                    {...register('category_id', { required: 'Danh mục là bắt buộc' })}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Chọn danh mục</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                                <label htmlFor="inputCategory">Danh mục <span style={{color: 'red'}}>*</span></label>
                                                {errors.category_id && <div className="text-danger">{errors.category_id.message}</div>}
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
                                                    <option value="1">Đang bán</option>
                                                    <option value="0">Ngừng bán</option>
                                                </select>
                                                <label htmlFor="inputStatus">Trạng thái <span style={{color: 'red'}}>*</span></label>
                                                {errors.status && <div className="text-danger">{errors.status.message}</div>}
                                            </div>
                                        
                                        </div>
                                    </div>
                                    
                                    <div className="row mb-3">
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
                                        <div className="col-md-6 input-file">
                                            <div className="mb-3">
                                                <label htmlFor="inputImage" className="form-label btn btn-secondary">
                                                    Chọn ảnh sản phẩm
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputImage"
                                                    type="file"
                                                    accept="image/*"
                                                    {...register('imageFile', {
                                                        required: 'Ảnh sản phẩm là bắt buộc',
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
                                                {/* Ảnh luôn hiển thị bên dưới input nếu đã chọn */}
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
                                            <label htmlFor="description">Mô tả sản phẩm</label>
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