import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DataTables from '../common/DataTables'
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import { formatDate } from '../../tools/formatData';
import ImageList from '../common/ImageList';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';


const formatVND = (value) => {
    if (typeof value !== 'number' && typeof value !== 'string') return '';
    value = value.toString().replace(/\D/g, '');
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [numOfPages, setNumOfPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemOfPage, setItemOfPage] = useState(25);
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemDelete, setItemDelete] = useState(null);
    const [typeDelete, setTypeDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(Date.now());

    // Filter states
    const [categories, setCategories] = useState([]);
   
    const [filterOriginalPrice, setFilterOriginalPrice] = useState('');
    const [filterSalePrice, setFilterSalePrice] = useState('');
    const [filterStock, setFilterStock] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Sort states
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const categoryIdParam = params.get('category_id') || '';
    const [filterCategory, setFilterCategory] = useState(categoryIdParam);


    // Lấy danh mục cho filter
    useEffect(() => {
        requestApi('api/admin/categories?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setCategories(response.data.data);
        });
    }, []);

    // 3. Gọi lại API khi filter thay đổi
    useEffect(() => {
        // Tạo query string cho filter
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        if (filterCategory) query += `&category_id=${filterCategory}`;
        if (filterOriginalPrice) {
            const [min, max] = filterOriginalPrice.split('-');
            if (min) query += `&original_price_from=${min}`;
            if (max) query += `&original_price_to=${max}`;
        }
        if (filterSalePrice) {
            const [min, max] = filterSalePrice.split('-');
            if (min) query += `&sale_price_from=${min}`;
            if (max) query += `&sale_price_to=${max}`;
        }
        if (filterStock) query += `&stock_quantity=${filterStock}`;
        if (filterStatus !== '') query += `&status=${filterStatus}`;

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/products${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setProducts(response.data.data);
            setNumOfPages(response.data.pagination.last_page);
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
        });
    }, [
        currentPage,
        itemOfPage,
        searchText,
        filterCategory,
        filterOriginalPrice,
        filterSalePrice,
        filterStock,
        filterStatus,
        refresh
    ]);

    // 4. Không cần filteredProducts, dùng trực tiếp products cho sortedProducts
    const sortedProducts = [...products].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Đặc biệt cho category và status
        if (sortField === 'category') {
            aValue = a.category ? a.category.name : '';
            bValue = b.category ? b.category.name : '';
        }
        if (sortField === 'status') {
            aValue = a.status;
            bValue = b.status;
        }

        // Sửa tại đây: Nếu là trường giá thì ép kiểu số để sort đúng
        if (sortField === 'original_price' || sortField === 'sale_price' || sortField === 'stock_quantity') {
            aValue = Number(aValue);
            bValue = Number(bValue);
        } else {
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    // 4. Hàm xử lý sort
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // 5. Icon sort
    const renderSortIcon = (field) => {
        if (sortField !== field) return <i className="fas fa-sort text-secondary ms-1"></i>;
        return sortOrder === 'asc'
            ? <i className="fas fa-sort-up text-primary ms-1"></i>
            : <i className="fas fa-sort-down text-primary ms-1"></i>;
    };

    // 6. Columns với header có sort và width %
    const columns = [
        { 
            title: () => (
                <span>
                    Mã sản phẩm
                </span>
            ),
            element: row => row.product_code,
            width: "8%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('name')}>
                    Tên sản phẩm {renderSortIcon('name')}
                </span>
            ),
            element: row => row.name,
            width: "18%"
        },
        { 
            title: "Hình ảnh", 
            element: row => (
                row.featured_image && row.featured_image.thumb_url ? (
                    <ImageList
                        src={urlImage + row.featured_image.thumb_url}
                        alt={row.name}
                    />
                ) : (
                    <span className="text-muted">Không có ảnh</span>
                )
            ),
            width: "12%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('category')}>
                    Danh mục {renderSortIcon('category')}
                </span>
            ),
            element: row => Array.isArray(row.categories)
                ? row.categories.map(cat => cat.name).join(', ')
                : (row.categories && row.categories.name ? row.categories.name : ""),
            width: "12%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('stock_quantity')}>
                    Số lượng {renderSortIcon('stock_quantity')}
                </span>
            ),
            element: row => row.stock_quantity,
            width: "9%"
        },
        {
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('original_price')}>
                    Giá gốc {renderSortIcon('original_price')}
                </span>
            ),
            element: row => (
                <div>
                    {formatVND(parseInt(row.original_price))} ₫
                </div>
            ),
            width: "11%"
        },
        {
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('sale_price')}>
                    Giá bán {renderSortIcon('sale_price')}
                </span>
            ),
            element: row => (
                <div>
                    {formatVND(parseInt(row.sale_price))} ₫
                </div>
            ),
            width: "11%"
        },
        { 
            
            title: "Trạng thái",
            element: row => row.status === 1
                ? <span className="badge bg-success">Đang bán</span>
                : <span className="badge bg-secondary">Ngừng bán</span>
            ,
            width: "10%"
        },
        {
            title: "Hành động", 
            element: row => (
                <div className="d-flex align-items-center">
                    <Permission permission={PERMISSIONS.PRODUCTS_VIEW}>
                        <Link className="btn btn-info btn-sm me-1" to={`/product/detail/${row.id}`}>
                            <i className="fas fa-eye"></i>
                        </Link>
                    </Permission>
                    <Permission permission={PERMISSIONS.PRODUCTS_UPDATE}>
                        <Link className="btn btn-primary btn-sm me-1" to={`/product/${row.id}`}>
                            <i className="fas fa-edit"></i>
                        </Link>
                    </Permission>
                    <Permission permission={PERMISSIONS.PRODUCTS_DELETE}>
                        <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(row.id)}>
                            <i className="fas fa-trash"></i>
                        </button>
                    </Permission>
                </div>
            ),
            width: "10%"
        }
    ];

    // // 7. Filter header
    // const filterHeader = [
    //     null, // ID
    //     null, // Tên sản phẩm
    //     null, // Hình ảnh
    //     <select
    //         className="form-select form-select-sm"
    //         value={filterCategory}
    //         onChange={e => setFilterCategory(e.target.value)}
    //     >
    //         <option value="">Tất cả danh mục</option>
    //         {categories.map(cat => (
    //             <option key={cat.id} value={cat.id}>{cat.name}</option>
    //         ))}
    //     </select>,
    //     <input
    //         type="text"
    //         className="form-control form-control-sm"
    //         placeholder="Lọc số lượng"
    //         value={filterStock}
    //         onChange={e => setFilterStock(e.target.value)}
    //     />,
    //     <input
    //         type="text"
    //         className="form-control form-control-sm"
    //         placeholder="Lọc giá gốc"
    //         value={filterOriginalPrice}
    //         onChange={e => setFilterOriginalPrice(e.target.value)}
    //     />,
    //     <input
    //         type="text"
    //         className="form-control form-control-sm"
    //         placeholder="Lọc giá bán"
    //         value={filterSalePrice}
    //         onChange={e => setFilterSalePrice(e.target.value)}
    //     />,
        
    //     <select
    //         className="form-select form-select-sm"
    //         value={filterStatus}
    //         onChange={e => setFilterStatus(e.target.value)}
    //     >
    //         <option value="">Tất cả</option>
    //         <option value="1">Hiển thị</option>
    //         <option value="0">Ẩn</option>
    //     </select>,
    //     null // Action
    // ];

    // Handle single Delete
    const handleDelete = (id) => {
        setItemDelete(id);
        setTypeDelete('single');
        setShowModal(true);
    }
    // Handle Multi Delete
    const multiDelete = () => {
        setTypeDelete('multi');
        setShowModal(true);
    }
    // Delete
    const requestApiDelete = () => {
        dispatch(actions.controlLoading(true));
        if(typeDelete === 'single'){
            requestApi(`api/admin/products/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa sản phẩm thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa sản phẩm thất bại", toastErrorConfig);
                }
            }).catch((e) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (e.response && e.response.data && e.response.data.message) {
                    toast.error(e.response.data.message, toastErrorConfig);
                } else {
                    toast.error("Server error", toastErrorConfig);
                }
            });
        } else {
            requestApi(`api/admin/products/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa sản phẩm thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa sản phẩm thất bại", toastErrorConfig);
                }
            }).catch((e) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (e.response && e.response.data && e.response.data.message) {
                    toast.error(e.response.data.message, toastErrorConfig);
                } else {
                    toast.error("Server error", toastErrorConfig);
                }
            });
        }
    }

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4">Danh sách sản phẩm</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Danh sách sản phẩm</li>
                    </ol>
                    <div className='mb-3'>
                        <Permission permission={PERMISSIONS.PRODUCTS_CREATE}>
                            <Link className="btn btn-primary me-2" to="/product/add">
                                <i className="fas fa-plus"></i> Thêm sản phẩm
                            </Link>
                        </Permission>
                        <Permission permission={PERMISSIONS.PRODUCTS_DELETE}>
                            {selectedRows.length > 0 && (
                                <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}>
                                    <i className="fas fa-trash"></i> Xóa
                                </button>
                            )}
                        </Permission>
                    </div>

                    {/* Bộ lọc */}
                    <div className="row mb-3 g-2 align-items-end">
                        {/* Danh mục */}
                        <div className="col-md-3">
                            <label className="form-label fw-semibold text-primary mb-1" htmlFor="filterCategory">
                                <i className="fas fa-list me-1"></i>Danh mục
                            </label>
                            <select
                                id="filterCategory"
                                className="form-select form-select-sm border-primary shadow-sm"
                                style={{ backgroundColor: '#f8f9fa', fontWeight: 500,height:40, cursor: 'pointer' }}
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        {/* Giá gốc */}
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-success mb-1" htmlFor="filterOriginalPrice">
                                <i className="fas fa-money-bill-wave me-1"></i>Giá gốc
                            </label>
                            <select
                                id="filterOriginalPrice"
                                className="form-select form-select-sm border-success shadow-sm"
                                style={{ backgroundColor: '#f8f9fa', fontWeight: 500,height:40, cursor: 'pointer' }}
                                value={filterOriginalPrice}
                                onChange={e => setFilterOriginalPrice(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="0-10000">Dưới 10.000 ₫</option>
                                <option value="10000-20000">10.000 ₫ - 20.000 ₫</option>
                                <option value="20000-40000">20.000 ₫ - 40.000 ₫</option>
                                <option value="40000-70000">40.000 ₫ - 70.000 ₫</option>
                                <option value="70000-100000">70.000 ₫ - 100.000 ₫</option>
                                <option value="100000-200000">100.000 ₫ - 200.000 ₫</option>
                                <option value="200000-">Trên 200.000 ₫</option>
                            </select>
                        </div>
                        {/* Giá bán */}
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-warning mb-1" htmlFor="filterSalePrice">
                                <i className="fas fa-coins me-1"></i>Giá bán
                            </label>
                            <select
                                id="filterSalePrice"
                                className="form-select form-select-sm border-warning shadow-sm"
                                style={{ backgroundColor: '#f8f9fa', fontWeight: 500,height:40, cursor: 'pointer' }}
                                value={filterSalePrice}
                                onChange={e => setFilterSalePrice(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="0-10000">Dưới 10.000 ₫</option>
                                <option value="10000-20000">10.000 ₫ - 20.000 ₫</option>
                                <option value="20000-40000">20.000 ₫ - 40.000 ₫</option>
                                <option value="40000-70000">40.000 ₫ - 70.000 ₫</option>
                                <option value="70000-100000">70.000 ₫ - 100.000 ₫</option>
                                <option value="100000-200000">100.000 ₫ - 200.000 ₫</option>
                                <option value="200000-">Trên 200.000 ₫</option>
                            </select>
                        </div>
                        {/* Trạng thái */}
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-info mb-1" htmlFor="filterStatus">
                                <i className="fas fa-toggle-on me-1"></i>Trạng thái
                            </label>
                            <select
                                id="filterStatus"
                                className="form-select form-select-sm border-info shadow-sm"
                                style={{ backgroundColor: '#f8f9fa', fontWeight: 500,height:40, cursor: 'pointer' }}
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="1">Đang bán</option>
                                <option value="0">Ngừng bán</option>
                            </select>
                        </div>
                    </div>

                    <DataTables
                        name="Dữ liệu sản phẩm"
                        columns={columns}
                        data={sortedProducts}
                        numOfPages={numOfPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        setItemOfPage={setItemOfPage}
                        changeKeyword={(keyword) => setSearchText(keyword)}
                        onSelectedRows={selectedRows => setSelectedRows(selectedRows)}
                      
                    />
                </div>
            </main>
            <Modal show={showModal} onHide={() => {setShowModal(false); setItemDelete(null); setTypeDelete(null)}}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {typeDelete === 'single' ? (
                        <p>Bạn có chắc chắn muốn xóa sản phẩm này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các sản phẩm này?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {setShowModal(false)}}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={() => {requestApiDelete()}}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default ProductList