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
import ProductFilterPanel from './ProductFilterPanel';
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
    const [debouncedSearchText, setDebouncedSearchText] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemDelete, setItemDelete] = useState(null);
    const [typeDelete, setTypeDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(Date.now());

    // Filter states
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [brands, setBrands] = useState([]);
    const [isFilterVisible, setIsFilterVisible] = useState(true);
   
    // New filter states for ProductFilterPanel
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [creationTimeFilter, setCreationTimeFilter] = useState('all');
    const [customDateFrom, setCustomDateFrom] = useState(null);
    const [customDateTo, setCustomDateTo] = useState(null);
    const [productStatus, setProductStatus] = useState('all');
    const [directSale, setDirectSale] = useState('all');

    // Legacy filter states (keep for backward compatibility)
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

    // Debounce search text (giống logic trong LiveSearch)
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchText]);


    // Lấy dữ liệu cho filter
    useEffect(() => {
        // Lấy danh mục
        requestApi('api/admin/categories?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setCategories(response.data.data);
        });

        // Lấy nhà cung cấp (giả sử API endpoint này)
        requestApi('api/admin/suppliers?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setSuppliers(response.data.data);
        }).catch(() => {
            // Nếu API không tồn tại, tạo dữ liệu mẫu
            setSuppliers([
                { id: 1, name: 'Nhà cung cấp A' },
                { id: 2, name: 'Nhà cung cấp B' },
                { id: 3, name: 'Nhà cung cấp C' }
            ]);
        });

        // Lấy thương hiệu (giả sử API endpoint này)
        requestApi('api/admin/brands?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setBrands(response.data.data);
        }).catch(() => {
            // Nếu API không tồn tại, tạo dữ liệu mẫu
            setBrands([
                { id: 1, name: 'ACECOOK' },
                { id: 2, name: 'ASIA FOOD' },
                { id: 3, name: 'BIBICA' },
                { id: 4, name: 'BINGGRAE' },
                { id: 5, name: 'CAMEL' }
            ]);
        });
    }, []);

    // 3. Gọi lại API khi filter thay đổi
    useEffect(() => {
        // Tạo query string cho filter
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${debouncedSearchText}`;
        
        // Legacy filters
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

        // New filter panel filters
        if (selectedCategories.length > 0) {
            const categoryIds = selectedCategories.map(cat => cat.value).join(',');
            query += `&category_ids=${categoryIds}`;
        }
        if (selectedSuppliers.length > 0) {
            const supplierIds = selectedSuppliers.map(supplier => supplier.value).join(',');
            query += `&supplier_ids=${supplierIds}`;
        }
        if (selectedBrands.length > 0) {
            const brandIds = selectedBrands.map(brand => brand.value).join(',');
            query += `&brand_ids=${brandIds}`;
        }
        if (creationTimeFilter === 'custom' && customDateFrom && customDateTo) {
            query += `&created_from=${customDateFrom.toISOString().split('T')[0]}`;
            query += `&created_to=${customDateTo.toISOString().split('T')[0]}`;
        }
        if (productStatus !== 'all') {
            query += `&product_status=${productStatus}`;
        }
        if (directSale !== 'all') {
            query += `&direct_sale=${directSale}`;
        }

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
        debouncedSearchText,
        filterCategory,
        filterOriginalPrice,
        filterSalePrice,
        filterStock,
        filterStatus,
        selectedCategories,
        selectedSuppliers,
        selectedBrands,
        creationTimeFilter,
        customDateFrom,
        customDateTo,
        productStatus,
        directSale,
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
                    Mã 
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
            width: "13%"
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
                    <ImageList icon alt="Không có ảnh" />
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
                    Tồn kho{renderSortIcon('stock_quantity')}
                </span>
            ),
            element: row => row.stock_quantity,
            width: "7%"
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
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Danh sách sản phẩm</li>
                    </ol>
                    
                    {/* Layout chính với FilterPanel và nội dung */}
                    <div className="row g-0">
                        {/* Filter Panel */}
                        <ProductFilterPanel
                            categories={categories}
                            suppliers={suppliers}
                            brands={brands}
                            selectedCategories={selectedCategories}
                            setSelectedCategories={setSelectedCategories}
                            selectedSuppliers={selectedSuppliers}
                            setSelectedSuppliers={setSelectedSuppliers}
                            selectedBrands={selectedBrands}
                            setSelectedBrands={setSelectedBrands}
                            creationTimeFilter={creationTimeFilter}
                            setCreationTimeFilter={setCreationTimeFilter}
                            customDateFrom={customDateFrom}
                            setCustomDateFrom={setCustomDateFrom}
                            customDateTo={customDateTo}
                            setCustomDateTo={setCustomDateTo}
                            productStatus={productStatus}
                            setProductStatus={setProductStatus}
                            directSale={directSale}
                            setDirectSale={setDirectSale}
                            isVisible={isFilterVisible}
                            onToggleVisibility={() => setIsFilterVisible(!isFilterVisible)}
                        />

                        {/* Nội dung chính */}
                        <div className={`main-content-area ${isFilterVisible ? 'col-md-10' : 'col-md-12'} transition-all d-flex flex-column ${!isFilterVisible ? 'expanded' : ''}`}>
                            {/* Header với nút thêm sản phẩm */}
                            <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white flex-shrink-0">
                                <div>
                                    <h4 className="mb-0 fw-bold text-primary">Danh sách sản phẩm</h4>
                                </div>
                                <div className="d-flex gap-2">
                                    {/* Nút xóa khi có sản phẩm được chọn */}
                                    <Permission permission={PERMISSIONS.PRODUCTS_DELETE}>
                                        {selectedRows.length > 0 && (
                                            <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}>
                                                <i className="fas fa-trash me-1"></i> Xóa ({selectedRows.length})
                                            </button>
                                        )}
                                    </Permission>
                                    
                                    {/* Nút tạo mới */}
                                    <Permission permission={PERMISSIONS.PRODUCTS_CREATE}>
                                        <Link className="btn btn-primary" to="/product/add">
                                            <i className="fas fa-plus me-1"></i> Tạo mới
                                        </Link>
                                    </Permission>
                                    
                                    {/* Các nút khác */}
                                    <button className="btn btn-outline-secondary">
                                        <i className="fas fa-upload me-1"></i> Import file
                                    </button>
                                    <button className="btn btn-outline-secondary">
                                        <i className="fas fa-download me-1"></i> Xuất file
                                    </button>
                                    <button className="btn btn-outline-secondary">
                                        <i className="fas fa-cog"></i>
                                    </button>
                                    <button className="btn btn-outline-secondary">
                                        <i className="fas fa-question-circle"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Search bar */}
                            <div className="p-3 border-bottom bg-light search-bar">
                                <div className="row align-items-center">
                                    <div className="col-md-4">
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="fas fa-search"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Tìm kiếm theo mã sản phẩm, tên sản phẩm..."
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                            />
                                            {searchText && (
                                                <button 
                                                    className="btn btn-outline-secondary btn-sm"
                                                    type="button"
                                                    onClick={() => setSearchText('')}
                                                    title="Xóa tìm kiếm"
                                                    style={{
                                                        borderLeft: 'none',
                                                        borderRadius: '0 0.375rem 0.375rem 0',
                                                        backgroundColor: '#f8f9fa',
                                                        color: '#6c757d'
                                                    }}
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-end">
                                        {/* Có thể thêm các nút khác ở đây nếu cần */}
                                    </div>
                    </div>

                                {/* Search results info */}
                                {searchText && (
                                    <div className="search-results-info">
                                        <small>
                                            <i className="fas fa-info-circle me-1"></i>
                                            Đang tìm kiếm: "<strong>{searchText}</strong>" - Tìm thấy {products.length} kết quả
                                        </small>
                        </div>
                                )}
                    </div>

                            {/* Data Table */}
                            <div className="flex-grow-1 overflow-auto">
                                <div className="p-3">
                                    <DataTables
                                        name="Danh sách sản phẩm"
                                        columns={columns}
                                        data={sortedProducts}
                                        numOfPages={numOfPages}
                                        currentPage={currentPage}
                                        setCurrentPage={setCurrentPage}
                                        setItemOfPage={setItemOfPage}
                                        onSelectedRows={selectedRows => setSelectedRows(selectedRows)}
                                        hideSearch={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
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