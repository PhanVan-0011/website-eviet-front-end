import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { formatDate } from '../../tools/formatData';
import ImageList from '../common/ImageList';

const CategoryDetail = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

    // Lấy thông tin chi tiết danh mục
    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                dispatch(actions.controlLoading(true));
                const response = await requestApi(`api/admin/categories/${params.id}`, 'GET');
                setCategory(response.data.data);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            } catch (error) {
                console.error("Error fetching category data: ", error);
                setLoading(false);
                dispatch(actions.controlLoading(false));
            }
        };
        fetchCategoryData();
    }, [params.id, dispatch]);

    if (loading) {
        return (
            <div id="layoutSidenav_content">
                <main>
                    <div className="container-fluid px-4">
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!category) {
        return (
            <div id="layoutSidenav_content">
                <main>
                    <div className="container-fluid px-4">
                        <div className="alert alert-danger" role="alert">
                            Không tìm thấy danh mục!
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item"><Link to="/category">Danh mục</Link></li>
                        <li className="breadcrumb-item active">Chi tiết danh mục</li>
                    </ol>
                    
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Chi tiết danh mục
                        </div>
                        <div className='card-body'>
                            <div className="row">
                                <div className="col-md-8">
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <strong>Tên danh mục:</strong>
                                        </div>
                                        <div className="col-sm-9">
                                            {category.name}
                                        </div>
                                    </div>
                                    
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <strong>Mô tả:</strong>
                                        </div>
                                        <div className="col-sm-9">
                                            {category.description || 'Không có mô tả'}
                                        </div>
                                    </div>
                                    
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <strong>Trạng thái:</strong>
                                        </div>
                                        <div className="col-sm-9">
                                            {category.status === 1 
                                                ? <span className="badge bg-success">Hiển thị</span>
                                                : <span className="badge bg-secondary">Ẩn</span>
                                            }
                                        </div>
                                    </div>
                                    
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <strong>Số sản phẩm:</strong>
                                        </div>
                                        <div className="col-sm-9">
                                            {category.products_count || 0} sản phẩm
                                        </div>
                                    </div>
                                    
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <strong>Ngày tạo:</strong>
                                        </div>
                                        <div className="col-sm-9">
                                            {formatDate(category.created_at)}
                                        </div>
                                    </div>
                                    
                                    <div className="row mb-3">
                                        <div className="col-sm-3">
                                            <strong>Ngày cập nhật:</strong>
                                        </div>
                                        <div className="col-sm-9">
                                            {formatDate(category.updated_at)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-md-4">
                                    <div className="text-center">
                                        <strong className="d-block mb-2">Icon danh mục</strong>
                                        {category.icon ? (
                                            <div className="border rounded p-3 bg-light">
                                                <ImageList 
                                                    src={urlImage + category.icon} 
                                                    alt={category.name}
                                                    style={{ maxWidth: '150px', maxHeight: '150px' }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="border rounded p-3 bg-light text-muted">
                                                <i className="fas fa-image fa-3x mb-2"></i>
                                                <div>Không có icon</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <div className="d-flex justify-content-center gap-2">
                                    <Link 
                                        to="/category" 
                                        className="btn btn-secondary"
                                    >
                                        <i className="fas fa-arrow-left me-1"></i> Quay lại
                                    </Link>
                                    <Link 
                                        to={`/category/${category.id}/edit`} 
                                        className="btn btn-primary"
                                    >
                                        <i className="fas fa-edit me-1"></i> Chỉnh sửa
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CategoryDetail
