import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig } from '../../tools/toastConfig'

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
    const [categories, setCategories] = useState([]);

    // Lấy danh sách danh mục cha
    useEffect(() => {
        requestApi('api/categories?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setCategories(response.data.data);
            }
        });
    }, []);

    // Lấy thông tin danh mục cần sửa
    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const response = await requestApi(`api/categories/${params.id}`, 'GET');
                const data = response.data.data;
                setValue('name', data.name);
                setValue('description', data.description);
                setValue('status', data.status ? String(data.status) : "1");
                setValue('parent_id', data.parent_id ? String(data.parent_id) : "");
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
        try {
            dispatch(actions.controlLoading(true));
            const response = await requestApi(`api/categories/${params.id}`, 'PUT', data);
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật danh mục thành công!", { position: "top-right", autoClose: 1000 });
                setTimeout(() => {
                    navigation('/category');
                }, 1500);
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
                    <h1 className="mt-4">Cập nhật danh mục</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Cập nhật danh mục</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Dữ liệu danh mục
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
                                                    {...register('name', { required: 'Tên danh mục là bắt buộc' })}
                                                    placeholder="Nhập tên danh mục"
                                                />
                                                <label htmlFor="inputName">
                                                    Tên danh mục <span style={{color: 'red'}}>*</span>
                                                </label>
                                                {errors.name && <div className="text-danger">{errors.name.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    className="form-control"
                                                    id="inputDescription"
                                                    {...register('description')}
                                                    placeholder="Nhập mô tả"
                                                />
                                                <label htmlFor="inputDescription">Mô tả</label>
                                            </div>
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
                                                <label htmlFor="inputStatus">Trạng thái <span style={{color: 'red'}}>*</span></label>
                                                {errors.status && <div className="text-danger">{errors.status.message}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
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
                                        </div>
                                    </div>
                                    <div className="mt-4 mb-0">
                                        <div className="d-flex justify-content-center">
                                            <button
                                                className="btn btn-primary w-50"
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
        </div>
    )
}

export default CategoryUpdate