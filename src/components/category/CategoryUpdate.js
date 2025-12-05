import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig'
const urlImage = process.env.REACT_APP_API_URL + 'api/images';

const CategoryUpdate = () => {
    const params = useParams();
    const navigation = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [iconFile, setIconFile] = useState(null);
    const [iconPreview, setIconPreview] = useState(null);
    const [currentIconUrl, setCurrentIconUrl] = useState(null);

    // Hàm xử lý khi chọn icon
    const onChangeIcon = (event) => {
        const file = event.target.files[0];
        if (file) {
            setIconFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setIconPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Lấy danh sách danh mục cha
    useEffect(() => {
        requestApi('api/admin/categories?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setCategories(response.data.data);
            }
        });
    }, []);

    // Lấy thông tin danh mục cần sửa
    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const response = await requestApi(`api/admin/categories/${params.id}`, 'GET');
                const data = response.data.data;
                setValue('name', data.name);
                setValue('description', data.description);
                setValue('status', data.status ? String(data.status) : "1");
                setValue('parent_id', data.parent_id ? String(data.parent_id) : "");
                setValue('type', data.type || "all");
                
                // Lưu URL icon hiện tại
                if (data.icon) {
                    setCurrentIconUrl(data.icon);
                }
            } catch (error) {
                console.error("Error fetching category data: ", error);
            }
        };
        fetchCategoryData();
    }, [params.id, setValue]);

    const handleSubmitForm = async (data) => {
        setIsSubmitting(true);
        // Nếu chọn "Không có", gửi parent_id là null
        if (data.parent_id === "" || data.parent_id === "null") {
            data.parent_id = null;
        }
        
        // Tạo FormData để gửi file
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('status', data.status);
        formData.append('type', data.type);
        if (iconFile) {
            formData.append('icon', iconFile);
        }
        
        try {
            dispatch(actions.controlLoading(true));
            const response = await requestApi(
                `api/admin/categories/${params.id}`,
                'POST',
                formData,
                'json',
                'multipart/form-data'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật danh mục thành công!", toastSuccessConfig);
                
                navigation('/category');
               
            } else {
                toast.error(response.data.message || "Cập nhật danh mục thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Server error", toastErrorConfig);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Cập nhật danh mục</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Cập nhật danh mục
                        </div>
                        <div className='card-body'>
                            <div className='mb-3 row'>
                                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                    <div className="row mb-3">
                                        <div className="col-12 col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputName" className="form-label fw-semibold">
                                                    Tên danh mục <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputName"
                                                    {...register('name', { required: 'Tên danh mục là bắt buộc' })}
                                                    placeholder="Nhập tên danh mục"
                                                />
                                                {errors.name && <div className="text-danger mt-1">{errors.name.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputDescription" className="form-label fw-semibold">
                                                    Mô tả
                                                </label>
                                                <input
                                                    className="form-control"
                                                    id="inputDescription"
                                                    {...register('description')}
                                                    placeholder="Nhập mô tả"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-12 col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputStatus" className="form-label fw-semibold">
                                                    Trạng thái <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <select
                                                    className="form-select"
                                                    id="inputStatus"
                                                    {...register('status', { required: 'Trạng thái là bắt buộc' })}
                                                    defaultValue="1"
                                                >
                                                    <option value="1">Hiển thị</option>
                                                    <option value="0">Ẩn</option>
                                                </select>
                                                {errors.status && <div className="text-danger mt-1">{errors.status.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <div className="mb-3">
                                                <label htmlFor="inputType" className="form-label fw-semibold">
                                                    Loại danh mục <span style={{color: 'red'}}>*</span>
                                                </label>
                                                <select
                                                    className="form-select"
                                                    id="inputType"
                                                    {...register('type', { 
                                                        required: 'Loại danh mục là bắt buộc',
                                                        validate: (value) => {
                                                            if (!['product', 'post', 'all'].includes(value)) {
                                                                return 'Loại danh mục phải là product, post hoặc all';
                                                            }
                                                            return true;
                                                        }
                                                    })}
                                                    defaultValue="all"
                                                >
                                                    <option value="all">Tất cả</option>
                                                    <option value="product">Sản phẩm</option>
                                                    <option value="post">Bài viết</option>
                                                    
                                                </select>
                                                {errors.type && <div className="text-danger mt-1">{errors.type.message}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-12 col-md-6">
                                            <div className="mb-3">
                                                <div className="form-label fw-semibold">
                                                    Icon danh mục
                                                </div>
                                                <div className="row g-3">
                                                    <div className="col-2 d-flex flex-column align-items-center">
                                                        <div
                                                            className={`w-100 border border-2 ${(iconPreview || currentIconUrl) ? 'border-primary' : 'border-secondary'} border-dashed rounded bg-light position-relative d-flex align-items-center justify-content-center`}
                                                            style={{ aspectRatio: '1/1', minHeight: 0, height: 'auto', maxWidth: '100%' }}
                                                        >
                                                            {(iconPreview || currentIconUrl) ? (
                                                                <>
                                                                    <img
                                                                        src={iconPreview || (currentIconUrl ? urlImage + currentIconUrl : '')}
                                                                        alt="Icon preview"
                                                                        className="w-100 h-100 rounded position-absolute top-0 start-0"
                                                                        style={{ objectFit: 'contain', aspectRatio: '1/1' }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-danger btn-sm rounded-circle position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center no-hover"
                                                                        style={{ zIndex: 2, width: 24, height: 24, padding: 0, background: '#fff' }}
                                                                        aria-label="Xóa icon"
                                                                        onClick={() => {
                                                                            setIconFile(null);
                                                                            setIconPreview(null);
                                                                            setCurrentIconUrl(null);
                                                                            document.getElementById('inputIcon').value = '';
                                                                        }}
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
                                                    <label htmlFor="inputIcon" className="form-label btn btn-secondary mb-0">
                                                        <i className="fas fa-upload"></i> Thêm icon danh mục
                                                    </label>
                                                    <div className="d-flex flex-column gap-1">
                                                        <span className="text-muted small">
                                                            Chỉ chọn 1 icon, định dạng: jpg, png, svg...
                                                        </span>
                                                    </div>
                                                </div>
                                                <input
                                                    className="form-control"
                                                    id="inputIcon"
                                                    type="file"
                                                    accept="image/*,.svg"
                                                    style={{ display: 'none' }}
                                                    onChange={onChangeIcon}
                                                />
                                            </div>
                                        </div>
                                        {/* <div className="col-md-6">
                                            <div className="form-floating">
                                                <select
                                                    className="form-select"
                                                    id="inputParentId"
                                                    {...register('parent_id')}
                                                    defaultValue=""
                                                >
                                                    <option value="">Không có</option>
                                                    {categories
                                                        .filter(cat => String(cat.id) !== String(params.id)) // Không cho chọn chính nó làm cha
                                                        .map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                        ))}
                                                </select>
                                                <label htmlFor="inputParentId">Danh mục cha</label>
                                            </div>
                                        </div> */}
                                    </div>
                                    <div className="mt-4 mb-0">
                                        <div className="d-flex flex-column flex-md-row justify-content-center gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-danger w-100 w-md-auto font-weight-bold"
                                                onClick={() => setShowModal(true)}
                                                disabled={isSubmitting}
                                            >
                                                Xóa
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary w-100 w-md-auto font-weight-bold"
                                                onClick={() => navigation('/category')}
                                                disabled={isSubmitting}
                                            >
                                                Hủy bỏ
                                            </button>
                                                <button
                                                    className="btn btn-primary w-100 w-md-auto"
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
                <p>Bạn chắc chắn muốn xóa danh mục này?</p>
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
                                const response = await requestApi(`api/admin/categories/${params.id}`, 'DELETE', []);
                                dispatch(actions.controlLoading(false));
                                if (response.data && response.data.success) {
                                    toast.success(response.data.message || "Xóa danh mục thành công!", toastSuccessConfig);
                                   
                                    navigation('/category');
                                    
                                } else {
                                    toast.error(response.data.message || "Xóa danh mục thất bại", toastErrorConfig);
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
    )
}

export default CategoryUpdate