import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import DataTables from '../common/DataTables'
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button, Dropdown } from 'react-bootstrap';
import { formatDate } from '../../tools/formatData';
import ImageList from '../common/ImageList';
import ImageWithZoom from '../common/ImageWithZoom';
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

// Component Dropdown custom cho chọn đơn vị
const UnitDropdown = ({ product, selectedUnitIndex, onUnitChange }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const hasUnitConversions = product.unit_conversions && product.unit_conversions.length > 0;

    // Tính toán vị trí dropdown khi mở
    useEffect(() => {
        if (showDropdown && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: buttonRect.bottom + window.scrollY + 4,
                left: buttonRect.left + window.scrollX
            });
        }
    }, [showDropdown]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                buttonRef.current && 
                !buttonRef.current.contains(event.target) &&
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    const getDisplayUnit = (unitIndex) => {
        if (unitIndex === 0) {
            return product.base_unit || 'Cơ bản';
        }
        return product.unit_conversions[unitIndex - 1]?.unit_name || '';
    };

    if (!hasUnitConversions) {
        return <span style={{ color: '#0066cc' }}>{product.base_unit}</span>;
    }

    return (
        <>
            <div className="d-inline-block">
                <button
                    ref={buttonRef}
                    type="button"
                    className="btn-sm p-0"
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                        fontSize: 'inherit',
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        lineHeight: '1'
                    }}
                    title="Click để đổi đơn vị"
                >
                    <span>{getDisplayUnit(selectedUnitIndex)}</span>
                    <i className="fas fa-chevron-down" style={{ fontSize: '0.6rem', opacity: 0.7 }}></i>
                </button>
            </div>

            {showDropdown && typeof document !== 'undefined' && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'absolute',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        minWidth: '150px',
                        zIndex: 10000,
                        border: '1px solid #ddd',
                        borderRadius: '0.25rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        backgroundColor: 'white'
                    }}
                >
                    <button
                        className="w-100 text-start"
                        onClick={() => {
                            onUnitChange(product.id, 0);
                            setShowDropdown(false);
                        }}
                        style={{
                            padding: '0.5rem 0.75rem',
                            backgroundColor: selectedUnitIndex === 0 ? '#f0f0f0' : 'transparent',
                            border: 'none',
                            fontWeight: selectedUnitIndex === 0 ? 'bold' : 'normal',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            width: '100%'
                        }}
                    >
                        {product.base_unit} <span className="">(Cơ bản)</span>
                    </button>
                    {product.unit_conversions.map((unit, idx) => (
                        <button
                            key={idx}
                            className="w-100 text-start"
                            onClick={() => {
                                onUnitChange(product.id, idx + 1);
                                setShowDropdown(false);
                            }}
                            style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: selectedUnitIndex === idx + 1 ? '#f0f0f0' : 'transparent',
                                border: 'none',
                                fontWeight: selectedUnitIndex === idx + 1 ? 'bold' : 'normal',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                borderTop: '1px solid #f0f0f0',
                                width: '100%'
                            }}
                        >
                            {unit.unit_name}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
};

const formatVND = (value) => {
    if (typeof value !== 'number' && typeof value !== 'string') return '';
    value = value.toString().replace(/\D/g, '');
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Hàm format số với phần thập phân
const formatNumberWithDecimal = (value) => {
    if (typeof value !== 'number' && typeof value !== 'string') return '';
    
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    
    // Làm tròn 3 chữ số thập phân
    const rounded = Math.round(num * 1000) / 1000;
    
    // Tách phần nguyên và phần thập phân
    const parts = rounded.toString().split('.');
    const intPart = parts[0];
    const decPart = parts[1] || '';
    
    // Format phần nguyên với dấu chấm phân cách hàng nghìn
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Nếu có phần thập phân, thêm dấu phẩy (không pad zeros, hiển thị tối đa 3 chữ số)
    if (decPart) {
        return formattedInt + ',' + decPart;
    }
    
    return formattedInt;
};

// Helper function để tính giá vốn và tồn kho theo đơn vị
const calculateUnitMetrics = (product, selectedUnitIndex) => {
    // Nếu là đơn vị cơ bản
    if (selectedUnitIndex === 0) {
        return {
            costPrice: product.cost_price,
            stockQuantity: product.total_stock_quantity
        };
    }

    // Nếu là đơn vị chuyển đổi
    const unitConversion = product.unit_conversions?.[selectedUnitIndex - 1];
    if (unitConversion && unitConversion.conversion_factor) {
        const factor = parseFloat(unitConversion.conversion_factor) || 1;
        
        return {
            // Giá vốn = giá vốn cơ bản × hệ số quy đổi, làm tròn 3 số thập phân
            costPrice: parseFloat((parseFloat(product.cost_price) * factor).toFixed(3)),
            // Tồn kho = tồn kho cơ bản ÷ hệ số quy đổi, làm tròn 3 số thập phân
            stockQuantity: parseFloat((parseFloat(product.total_stock_quantity) / factor).toFixed(3))
        };
    }

    // Fallback
    return {
        costPrice: product.cost_price,
        stockQuantity: product.total_stock_quantity
    };
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
        productStatus: 'active',
        directSale: 'yes'
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [totalStockQuantity, setTotalStockQuantity] = useState(0);
    
    // State để lưu đơn vị được chọn cho mỗi sản phẩm (key: product_id, value: unit_index)
    const [selectedUnits, setSelectedUnits] = useState({});

    // Hàm thay đổi đơn vị cho sản phẩm
    const handleUnitChange = (productId, unitIndex) => {
        setSelectedUnits(prev => ({
            ...prev,
            [productId]: unitIndex
        }));
    };

    // Hàm lấy thông tin theo đơn vị được chọn
    const getUnitData = (product) => {
        const selectedUnitIndex = selectedUnits[product.id] || 0;
        const metrics = calculateUnitMetrics(product, selectedUnitIndex);
        
        // Nếu chọn đơn vị cơ bản (index 0)
        if (selectedUnitIndex === 0) {
            return {
                code: product.product_code,
                storePrice: product.base_store_price,
                appPrice: product.base_app_price,
                unit: product.base_unit,
                costPrice: metrics.costPrice,
                stockQuantity: metrics.stockQuantity
            };
        }
        
        // Nếu chọn đơn vị chuyển đổi
        const unitConversion = product.unit_conversions?.[selectedUnitIndex - 1];
        if (unitConversion) {
            return {
                code: unitConversion.unit_code || product.product_code,
                storePrice: unitConversion.store_price,
                appPrice: unitConversion.app_price,
                unit: unitConversion.unit_name,
                costPrice: metrics.costPrice,
                stockQuantity: metrics.stockQuantity
            };
        }
        
        // Fallback về đơn vị cơ bản
        return {
            code: product.product_code,
            storePrice: product.base_store_price,
            appPrice: product.base_app_price,
            unit: product.base_unit,
            costPrice: metrics.costPrice,
            stockQuantity: metrics.stockQuantity
        };
    };


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
        if (filterValues.productStatus) {
            query += `&status=${filterValues.productStatus === 'active' ? 1 : 0}`;
        }
        
        // Lọc bán trực tiếp
        if (filterValues.directSale) {
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

        // Lấy tổng tồn kho toàn bộ (không phân trang)
        let summaryQuery = '';
        if (searchText) summaryQuery += `?keyword=${searchText}`;
        if (filterValues.categories && filterValues.categories.length > 0) {
            summaryQuery += (summaryQuery ? '&' : '?') + `category_id=${filterValues.categories[0].value}`;
        }
        if (filterValues.suppliers && filterValues.suppliers.length > 0) {
            summaryQuery += (summaryQuery ? '&' : '?') + `supplier_id=${filterValues.suppliers[0].value}`;
        }
        if (filterValues.productStatus) {
            summaryQuery += (summaryQuery ? '&' : '?') + `status=${filterValues.productStatus === 'active' ? 1 : 0}`;
        }
        if (filterValues.directSale) {
            summaryQuery += (summaryQuery ? '&' : '?') + `is_sales_unit=${filterValues.directSale === 'yes' ? 1 : 0}`;
        }
        if (filterValues.creationTime?.from && filterValues.creationTime?.to) {
            summaryQuery += (summaryQuery ? '&' : '?') + `start_date=${filterValues.creationTime.from.toISOString().split('T')[0]}`;
            summaryQuery += `&end_date=${filterValues.creationTime.to.toISOString().split('T')[0]}`;
        }

        requestApi(`api/admin/products${summaryQuery}&limit=10000`, 'GET', []).then((response) => {
            if (response.data && response.data.data) {
                const total = response.data.data.reduce((sum, product) => {
                    return sum + (parseInt(product.total_stock_quantity) || 0);
                }, 0);
                setTotalStockQuantity(total);
            }
        }).catch(() => {
            setTotalStockQuantity(0);
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
                    Mã hàng
                </span>
            ),
            element: row => {
                const unitData = getUnitData(row);
                return (
                    <div className="text-nowrap">
                        {unitData.code}
                    </div>
                );
            },
            width: "8%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('name')}>
                    Tên hàng {renderSortIcon('name')}
                </span>
            ),
            element: row => {
                const hasUnitConversions = row.unit_conversions && row.unit_conversions.length > 0;
                const selectedUnitIndex = selectedUnits[row.id] || 0;
                
                // Lấy tên đơn vị hiện tại
                const getCurrentUnitName = () => {
                    if (selectedUnitIndex === 0) {
                        return row.base_unit || '';
                    }
                    return row.unit_conversions?.[selectedUnitIndex - 1]?.unit_name || '';
                };
                
                const currentUnitName = getCurrentUnitName();
                
                return (
                    <div 
                        className="product-name-cell" 
                        style={{ 
                            minWidth: '180px',
                            wordWrap: 'break-word',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            lineHeight: '1.5'
                        }} 
                        title={row.name}
                    >
                        <span className="name fw-bold" style={{ display: 'inline' }}>
                            {row.name}
                            {hasUnitConversions && currentUnitName && (
                                <>
                                    {' '}
                                    <span className="text-primary" style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                                        (
                                        <UnitDropdown
                                            product={row}
                                            selectedUnitIndex={selectedUnitIndex}
                                            onUnitChange={handleUnitChange}
                                        />
                                        )
                                    </span>
                                </>
                            )}
                            {!hasUnitConversions && row.base_unit && (
                                <span className="text-primary" style={{ whiteSpace: 'nowrap' }}> ({row.base_unit})</span>
                            )}
                        </span>
                    </div>
                );
            },
            width: "15%"
        },
        { 
            title: "Hình ảnh", 
            element: row => (
                row.featured_image && row.featured_image.thumb_url ? (
                    <ImageWithZoom
                        src={urlImage + row.featured_image.thumb_url}
                        zoomSrc={row.featured_image.main_url ? urlImage + row.featured_image.main_url : urlImage + row.featured_image.thumb_url}
                        alt={row.name}
                    />
                ) : (
                    <ImageWithZoom icon alt="Không có ảnh" />
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
            element: row => {
                const unitData = getUnitData(row);
                return (
                    <div>
                        {formatNumberWithDecimal(unitData.stockQuantity)}
                    </div>
                );
            },
            width: "7%",
            summarizable: true
        },
        {
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('cost_price')}>
                    Giá vốn {renderSortIcon('cost_price')}
                </span>
            ),
            element: row => {
                const unitData = getUnitData(row);
                return (
                    <div>
                        {formatVND(unitData.costPrice)} ₫
                    </div>
                );
            },
            width: "11%"
        },
        {
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('base_store_price')}>
                    Giá cửa hàng {renderSortIcon('base_store_price')}
                </span>
            ),
            element: row => {
                const unitData = getUnitData(row);
                return (
                    <div>
                        {formatVND(parseInt(unitData.storePrice))} ₫
                    </div>
                );
            },
            width: "11%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('base_app_price')}>
                    Giá App {renderSortIcon('base_app_price')}
                </span>
            ),
            element: row => {
                const unitData = getUnitData(row);
                return (
                    <div>
                        {formatVND(parseInt(unitData.appPrice))} ₫
                    </div>
                );
            },
            width: "11%"
        },
        { 
            title: "Đơn vị",
            element: row => {
                const unitData = getUnitData(row);
                return unitData.unit || "---";
            },
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
                    setSelectedRows([]);
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
                    setSelectedRows([]);
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
                    {/* Header row: Breadcrumb + Search + Actions */}
                    <div className="d-flex align-items-center py-2 mt-2 mb-2 border-bottom product-header-row">
                        {/* Left section: Breadcrumb + Search - chiếm 50% */}
                        <div className="product-left-section d-flex align-items-center gap-3">
                            <ol className="breadcrumb mb-0 d-none d-md-flex flex-shrink-0" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                                <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                                <li className="breadcrumb-item active">Danh sách sản phẩm</li>
                            </ol>
                            
                            {/* Search - rộng hơn và canh trái */}
                            <div className="product-search-bar flex-grow-1">
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text" style={{ backgroundColor: '#fff' }}>
                                        <i className="fas fa-search text-muted"></i>
                                    </span>
                                    <LiveSearch 
                                        changeKeyword={setSearchText}
                                        placeholder="Tìm theo mã, tên"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Actions - bên phải - chiếm 50% */}
                        <div className="product-right-section d-flex align-items-center gap-2 justify-content-end">
                            {/* Nút xóa khi có sản phẩm được chọn */}
                            <Permission permission={PERMISSIONS.PRODUCTS_DELETE}>
                                {selectedRows.length > 0 && (
                                    <button className="btn btn-danger btn-sm" onClick={() => multiDelete(selectedRows)}>
                                        <i className="fas fa-trash me-1"></i> Xóa ({selectedRows.length})
                                    </button>
                                )}
                            </Permission>
                            
                            {/* Nút tạo mới */}
                            <Permission permission={PERMISSIONS.PRODUCTS_CREATE}>
                                <Link className="btn btn-primary btn-sm" to="/product/add">
                                    <i className="fas fa-plus me-1"></i>
                                    <span className="d-none d-sm-inline">Tạo mới</span>
                                </Link>
                            </Permission>
                            
                            {/* Các button riêng lẻ - hiện trên >= 1280px */}
                            <div className="order-action-buttons">
                                <button className="btn btn-outline-secondary btn-sm">
                                    <i className="fas fa-upload me-1"></i> Import
                                </button>
                                <button className="btn btn-outline-secondary btn-sm">
                                    <i className="fas fa-download me-1"></i> Xuất file
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" title="Cài đặt">
                                    <i className="fas fa-cog"></i>
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" title="Trợ giúp">
                                    <i className="fas fa-question-circle"></i>
                                </button>
                            </div>
                            
                            {/* Dropdown menu cho các nút phụ - chỉ hiện khi < 1280px */}
                            <div className="order-action-dropdown">
                                <Dropdown>
                                    <Dropdown.Toggle 
                                        variant="outline-secondary" 
                                        size="sm" 
                                        className="d-flex align-items-center"
                                        id="actions-dropdown"
                                    >
                                        <i className="fas fa-ellipsis-v"></i>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu align="end">
                                        <Dropdown.Item>
                                            <i className="fas fa-upload me-2"></i> Import
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            <i className="fas fa-download me-2"></i> Xuất file
                                        </Dropdown.Item>
                                        <Dropdown.Divider />
                                        <Dropdown.Item>
                                            <i className="fas fa-cog me-2"></i> Cài đặt
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            <i className="fas fa-question-circle me-2"></i> Trợ giúp
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                    
                    {/* Layout chính với FilterPanel và nội dung */}
                    <div className="d-flex gap-4" style={{ gap: '16px' }}>
                        {/* Filter Panel Card */}
                        {isFilterVisible && (
                            <div className="filter-card-wrapper" style={{ width: '240px', flexShrink: 0 }}>
                                <div className="filter-card">
                                    <div className="filter-card-content">
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
                                                label: filterValues.productStatus === 'active' ? 'Đang bán' : 'Ngừng bán'
                                            } : null}
                                            onChange={(selected) => updateFilter('productStatus', selected ? selected.value : 'active')}
                                            options={[
                                                { value: 'active', label: 'Đang bán' },
                                                { value: 'inactive', label: 'Ngừng bán' }
                                            ]}
                                            placeholder="Chọn trạng thái"
                                        />

                                        {/* Bán trực tiếp */}
                                        <FilterButtonGroup
                                            label="Bán trực tiếp"
                                            value={filterValues.directSale || 'yes'}
                                            onChange={(value) => updateFilter('directSale', value)}
                                            options={[
                                                { value: 'yes', label: 'Có' },
                                                { value: 'no', label: 'Không' }
                                            ]}
                                        />
                                    </div>
                                    
                                    {/* Toggle Button - Pill button ở mép phải */}
                                    <button
                                        className="filter-toggle-btn"
                                        onClick={() => setIsFilterVisible(false)}
                                        title="Thu gọn bộ lọc"
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Table Card */}
                        <div className="table-card-wrapper flex-grow-1">
                            {/* Nút mở lại filter khi đã thu gọn - hiện trên tablet và desktop */}
                            {!isFilterVisible && (
                                <button
                                    className="filter-toggle-btn-open d-none d-md-flex"
                                    onClick={() => setIsFilterVisible(true)}
                                    title="Mở bộ lọc"
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            )}
                            <div className="table-card">
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
                                    customSummaryData={{ 4: totalStockQuantity }}
                                    tableHeight="calc(100vh - 180px)"
                                />
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