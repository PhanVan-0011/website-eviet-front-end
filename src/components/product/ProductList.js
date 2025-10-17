import React, { useEffect, useState, useRef } from 'react'
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
import {
    FilterSelectSingle,
    FilterSelectMulti,
    FilterButtonGroup,
    FilterDateRange,
    FilterToggleButton
} from '../common/FilterComponents';
import LiveSearch from '../common/LiveSearch';
import CategoryModal from '../common/CategoryModal';
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
    const [suppliers, setSuppliers] = useState([]);
    const [brands, setBrands] = useState([]);
   
    // Filter states
    const [filterValues, setFilterValues] = useState({
        categories: [],
        suppliers: [],
        brands: [],
        creationTime: { from: null, to: null },
        productStatus: 'all',
        directSale: 'all'
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);


    const updateFilter = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(prev => !prev);
    };

    // Handle category creation
    const handleCreateCategory = () => {
        setShowCategoryModal(true);
    };

    const handleCategorySuccess = () => {
        // Reload categories after successful creation
        requestApi('api/admin/categories?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                setCategories(response.data.data);
            }
        });
    };


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
        let query = `?page=${currentPage}&limit=${itemOfPage}`;
        
        // Tìm kiếm keyword
        if (searchText) query += `&keyword=${searchText}`;
        
        // Lọc danh mục
        if (filterValues.categories && filterValues.categories.length > 0) {
            query += `&category_id=${filterValues.categories[0].value}`;
        }
        
        // Lọc nhà cung cấp
        if (filterValues.suppliers && filterValues.suppliers.length > 0) {
            query += `&supplier_id=${filterValues.suppliers[0].value}`;
        }
        
        // Lọc trạng thái sản phẩm
        if (filterValues.productStatus && filterValues.productStatus !== 'all') {
            query += `&status=${filterValues.productStatus === 'active' ? 1 : 0}`;
        }
        
        // Lọc bán trực tiếp
        if (filterValues.directSale && filterValues.directSale !== 'all') {
            query += `&is_sales_unit=${filterValues.directSale === 'yes' ? 1 : 0}`;
        }
        
        // Lọc khoảng ngày tạo
        if (filterValues.creationTime?.from && filterValues.creationTime?.to) {
            query += `&start_date=${filterValues.creationTime.from.toISOString().split('T')[0]}`;
            query += `&end_date=${filterValues.creationTime.to.toISOString().split('T')[0]}`;
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
        searchText,
        filterValues,
        refresh
    ]);

    // 4. Sort products (API đã filter rồi, chỉ cần sort)
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
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('categories')}>
                    Danh mục {renderSortIcon('categories')}
                </span>
            ),
            element: row => Array.isArray(row.categories)
                ? row.categories.map(cat => cat.name).join(', ')
                : "Không có",
            width: "12%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('total_stock_quantity')}>
                    Tồn kho{renderSortIcon('total_stock_quantity')}
                </span>
            ),
            element: row => row.total_stock_quantity,
            width: "7%",
            summarizable: true
        },
        {
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('cost_price')}>
                    Giá vốn {renderSortIcon('cost_price')}
                </span>
            ),
            element: row => (
                <div>
                    {formatVND(parseInt(row.cost_price))} ₫
                </div>
            ),
            width: "11%",
            summarizable: true
        },
        {
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('base_store_price')}>
                    Giá cửa hàng {renderSortIcon('base_store_price')}
                </span>
            ),
            element: row => (
                <div>
                    {formatVND(parseInt(row.base_store_price))} ₫
                </div>
            ),
            width: "11%",
            summarizable: true
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('base_app_price')}>
                    Giá App {renderSortIcon('base_app_price')}
                </span>
            ),
            element: row => (
                <div>
                    {formatVND(parseInt(row.base_app_price))} ₫
                </div>
            ),
            width: "11%",
            summarizable: true
        },
        { 
            title: "Đơn vị",
            element: row => row.base_unit || "---",
            width: "8%"
        },
        { 
            title: "Bán trực tiếp",
            element: row => row.is_sales_unit 
                ? <span className="badge bg-info">Có</span>
                : <span className="badge bg-light text-dark">Không</span>,
            width: "8%"
        },
        { 
            title: "Chi nhánh",
            element: row => Array.isArray(row.branches)
                ? row.branches.map(b => b.name).join(', ')
                : "---",
            width: "12%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('created_at')}>
                    Ngày tạo {renderSortIcon('created_at')}
                </span>
            ),
            element: row => formatDate(row.created_at),
            width: "12%"
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
                        <div className={`position-relative filter-panel ${isFilterVisible ? 'col-md-2' : 'col-md-0'} transition-all d-flex flex-column`}>
                            {isFilterVisible && (
                                <div className="p-3 filter-content">
                                    {/* <h6 className="fw-bold mb-3 text-primary text-center" style={{ fontSize: '0.9rem' }}>
                                        <i className="fas fa-filter me-1"></i>
                                        Sản phẩm
                                    </h6> */}

                                    {/* Nhóm hàng */}
                                    <FilterSelectMulti
                                        label="Nhóm hàng"
                                        value={filterValues.categories || []}
                                        onChange={(selected) => updateFilter('categories', selected || [])}
                                        options={categories.map(cat => ({
                                            value: cat.id,
                                            label: cat.name
                                        }))}
                                        placeholder="Chọn nhóm hàng"
                                        onCreateNew={handleCreateCategory}
                                        createNewLabel="Tạo mới"
                                    />

                                    {/* Thời gian tạo */}
                                    <FilterDateRange
                                        label="Thời gian tạo"
                                        value={filterValues.creationTime || { from: null, to: null }}
                                        onChange={(dateRange) => updateFilter('creationTime', dateRange)}
                                    />

                                    {/* Nhà cung cấp */}
                                    <FilterSelectMulti
                                        label="Nhà cung cấp"
                                        value={filterValues.suppliers || []}
                                        onChange={(selected) => updateFilter('suppliers', selected || [])}
                                        options={suppliers.map(supplier => ({
                                            value: supplier.id,
                                            label: supplier.name
                                        }))}
                                        placeholder="Chọn nhà cung cấp"
                                    />

                                    {/* Trạng thái sản phẩm */}
                                    <FilterSelectSingle
                                        label="Trạng thái sản phẩm"
                                        value={filterValues.productStatus ? {
                                            value: filterValues.productStatus,
                                            label: filterValues.productStatus === 'all' ? 'Tất cả' : 
                                                   filterValues.productStatus === 'active' ? 'Đang bán' : 'Ngừng bán'
                                        } : null}
                                        onChange={(selected) => updateFilter('productStatus', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: 'active', label: 'Đang bán' },
                                            { value: 'inactive', label: 'Ngừng bán' }
                                        ]}
                                        placeholder="Chọn trạng thái"
                                    />

                                    {/* Bán trực tiếp */}
                                    <FilterButtonGroup
                                        label="Bán trực tiếp"
                                        value={filterValues.directSale || 'all'}
                                        onChange={(value) => updateFilter('directSale', value)}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: 'yes', label: 'Có' },
                                            { value: 'no', label: 'Không' }
                                        ]}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Nội dung chính */}
                        <div className={`main-content-area ${isFilterVisible ? 'col-md-10' : 'col-md-12'} transition-all d-flex flex-column ${!isFilterVisible ? 'expanded' : ''}`}>
                            {/* Search bar với các nút action */}
                            <div className="p-3 border-bottom bg-light search-bar">
                                <div className="row align-items-center">
                                    <div className="col-md-4">
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="fas fa-search"></i>
                                            </span>
                                            <LiveSearch 
                                                changeKeyword={setSearchText}
                                                placeholder="Tìm kiếm theo mã sản phẩm, tên sản phẩm..."
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="d-flex justify-content-end gap-2">
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
                                            <button className="btn btn-secondary">
                                                <i className="fas fa-upload me-1"></i> Import file
                                            </button>
                                            <button className="btn btn-secondary">
                                                <i className="fas fa-download me-1"></i> Xuất file
                                            </button>
                                            <button className="btn btn-secondary">
                                                <i className="fas fa-cog"></i>
                                            </button>
                                            <button className="btn btn-secondary">
                                                <i className="fas fa-question-circle"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Search results info */}
                                {searchText && (
                                    <div className="search-results-info">
                                        <small>
                                            <i className="fas fa-info-circle me-1"></i>
                                            Đang tìm kiếm: "<strong>{searchText}</strong>" - Tìm thấy {sortedProducts.length} kết quả
                                        </small>
                                    </div>
                                )}
                            </div>

                            {/* Header với tiêu đề */}
                            <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white flex-shrink-0">
                                <div className="d-flex align-items-center gap-2">
                                    <h4 className="mb-0 fw-bold text-primary">Danh sách sản phẩm</h4>
                                    {/* Filter Toggle Button */}
                                    <FilterToggleButton
                                        key={`toggle-${isFilterVisible}`}
                                        isVisible={isFilterVisible}
                                        onToggle={() => {
                                            setIsPulsing(true);
                                            setTimeout(() => setIsPulsing(false), 600);
                                            toggleFilterVisibility();
                                        }}
                                        isPulsing={isPulsing}
                                    />
                                </div>
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
                        selectedRows={selectedRows}
                        onSelectedRows={selectedRows => setSelectedRows(selectedRows)}
                        hideSearch={true}
                        showSummary={true}
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

            {/* Category Modal */}
            <CategoryModal
                show={showCategoryModal}
                onHide={() => setShowCategoryModal(false)}
                onSuccess={handleCategorySuccess}
            />
        </div>
    )
}

export default ProductList