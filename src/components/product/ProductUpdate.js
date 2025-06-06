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
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';
const ProductUpdate = () => {
    const params = useParams();
    const navigation = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit, setValue, trigger, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [originalPrice, setOriginalPrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [oldImage, setOldImage] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [description, setDescription] = useState('');
    // Lấy danh sách danh mục
    useEffect(() => {
        requestApi('api/categories?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setCategories(response.data.data);
            }
        });
    }, []);

    // Lấy thông tin sản phẩm cần sửa
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await requestApi(`api/products/${params.id}`, 'GET');
                const data = response.data.data;
                setValue('name', data.name);
                setValue('description', data.description);
                setValue('original_price', data.original_price);
                setValue('sale_price', data.sale_price);
                setValue('stock_quantity', data.stock_quantity);
                setValue('size', data.size || '');
                setValue('category_id', data.category_id);
                setValue('status', String(data.status));
                setOriginalPrice(formatVND(parseInt(data.original_price, 10)));
                setSalePrice(formatVND(parseInt(data.sale_price, 10)));
                setValue('original_price', formatVND(parseInt(data.original_price, 10)));
                setValue('sale_price', formatVND(parseInt(data.sale_price, 10)));
                setOldImage(data.image_url);
                setDescription(data.description || '');
            } catch (error) {
                toast.error("Không lấy được dữ liệu sản phẩm", toastErrorConfig);
            }
        };
        fetchProduct();
    }, [params.id, setValue]);

    // Hàm xử lý khi chọn ảnh mới
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

        // Hàm format giá tiền
    const formatVND = (value) => {
        if (value === null || value === undefined) return '';
        // Nếu là số thì chuyển sang chuỗi
        value = value.toString();
        // Loại bỏ mọi ký tự không phải số
        value = value.replace(/\D/g, '');
        // Nếu rỗng thì trả về rỗng
        if (!value) return '';
        // Format theo từng nhóm 3 số, không thêm số 0 nào
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
    

    // Submit form
    const handleSubmitForm = async (data) => {
        console.log(data);
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
            formData.append('category_id', data.category_id);
            formData.append('status', data.status);
            // Nếu chọn ảnh mới thì gửi lên, không thì bỏ qua
            if (data.imageFile && data.imageFile[0]) {
                formData.append('image_url', data.imageFile[0]);
            }
            // Nếu không chọn ảnh mới, backend sẽ giữ ảnh cũ
            console.log('Submitting form data:', formData);
            const response = await requestApi(
                `api/products/${params.id}`,
                'POST', // hoặc 'PUT' nếu backend hỗ trợ
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
                    <h1 className="mt-4">Cập nhật sản phẩm</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Cập nhật sản phẩm</li>
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
                                                {/* Hiển thị ảnh cũ hoặc ảnh mới preview */}
                                                {(imageFile || oldImage) && (
                                                    <div className="mt-2">
                                                        <img
                                                            src={imageFile ? imageFile : (urlImage + oldImage)}
                                                            alt="ảnh sản phẩm"
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
                                const response = await requestApi(`api/products/${params.id}`, 'DELETE', []);
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