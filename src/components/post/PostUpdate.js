import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import CustomEditor from '../common/CustomEditor';

const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const PostUpdate = () => {
    const { id } = useParams();
    const { register, handleSubmit, setValue, trigger, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [oldImage, setOldImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [description, setDescription] = useState('');

    useEffect(() => {
        requestApi('api/categories?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setCategories(response.data.data);
        });
        // Lấy dữ liệu bài viết
        requestApi(`api/posts/${id}`, 'GET', []).then((response) => {
            const data = response.data.data;
            setValue('title', data.title);
            setValue('content', data.content);
            setValue('status', data.status);
            setValue('category_ids', data.categories ? data.categories.map(c => String(c.id)) : []);
            setOldImage(data.image_url);
            setDescription(data.content || ''); // Thêm dòng này để truyền data cho CustomEditor
        });
    }, [id, setValue]);

    // Xử lý chọn ảnh mới
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

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('content', data.content || '');
            formData.append('status', data.status);
            // Gửi nhiều danh mục (array)
            if (data.category_ids && data.category_ids.length > 0) {
                data.category_ids.forEach(id => formData.append('category_ids[]', id));
            }
            // Chỉ truyền ảnh mới nếu người dùng chọn ảnh mới
            console.log('Uploading new image:', data.imageFile);
             console.log('Uploading new image:', data.imageFile[0]);
            if (data.imageFile && data.imageFile[0]) {
               
                formData.append('image_url', data.imageFile[0]);
            }
            const response = await requestApi(
                `api/posts/${id}`,
                'POST',
                formData,
                'json',
                'multipart/form-data'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật bài viết thành công!", toastSuccessConfig);
                setTimeout(() => navigate('/post'), 1200);
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
                    <h1 className="mt-4">Cập nhật bài viết</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Cập nhật bài viết</li>
                    </ol>
                    <div className="card mb-3">
                        <div className="card-header">
                            <i className="fas fa-table me-1"></i>
                            Dữ liệu bài viết
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="row mb-3">
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
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Danh mục <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <div
                                                className="row"
                                                style={{
                                                    maxHeight: 220,
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
                                                                {...register('category_ids', { required: 'Danh mục là bắt buộc' })}
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
                                <div className="row mb-3">
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
                                    <div className="col-md-6 input-file">
                                        <div className="mb-3">
                                            <label htmlFor="inputImage" className="form-label btn btn-secondary">
                                                Chọn ảnh bài viết
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
                                            {(imageFile || oldImage) && (
                                                <div className="mt-2">
                                                    <img
                                                        src={imageFile ? imageFile : (oldImage ? urlImage + oldImage : '')}
                                                        alt="Preview"
                                                        className="img-thumbnail"
                                                        style={{ maxWidth: '200px' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Đang gửi..." : "Cập nhật"}
                                    </button>
                                    <Link to="/post" className="btn btn-outline-secondary">Quay lại</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PostUpdate;