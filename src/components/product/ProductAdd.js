import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import CustomEditor from '../common/CustomEditor';
import Select from 'react-select';
import { selectStyles } from '../common/FilterComponents';

const ProductAdd = () => {
    const navigation = useNavigate();
    const location = useLocation();
    const { register, handleSubmit, setValue, trigger, formState: { errors, isSubmitted } } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('thong-tin');
    
    // State cho tab Thông tin
    const [categories, setCategories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [productCode, setProductCode] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [baseStorePrice, setBaseStorePrice] = useState('');
    const [baseAppPrice, setBaseAppPrice] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [featuredImageIndex, setFeaturedImageIndex] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isSalesUnit, setIsSalesUnit] = useState(true);
    const [stockQuantity, setStockQuantity] = useState(0);
    
    // State cho tab Chi nhánh
    const [applyToAllBranches, setApplyToAllBranches] = useState(true);
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [branchPrices, setBranchPrices] = useState([]);
    
    // State cho unit conversions
    const [unitConversions, setUnitConversions] = useState([]);
    
    // State cho attributes
    const [attributes, setAttributes] = useState([]);

    // State cho collapse/expand
    const [expandUnitConversions, setExpandUnitConversions] = useState(true);
    const [expandAttributes, setExpandAttributes] = useState(true);

    // Force re-render khi icon thay đổi
    const [, forceUpdate] = useState();

    // Lấy danh sách danh mục và chi nhánh
    useEffect(() => {
        const fetchData = async () => {
            dispatch(actions.controlLoading(true));
            try {
                const [catRes, branchRes] = await Promise.all([
                    requestApi('api/admin/categories/for-type?for=product', 'GET', []),
                    requestApi('api/admin/branches?limit=1000', 'GET', [])
                ]);
                
                if (catRes.data && catRes.data.data) {
                    setCategories(catRes.data.data);
                }
                if (branchRes.data && branchRes.data.data) {
                    setBranches(branchRes.data.data);
                }
            } catch (error) {
                toast.error("Không thể tải dữ liệu", toastErrorConfig);
            } finally {
                dispatch(actions.controlLoading(false));
            }
        };
        fetchData();
    }, []);

    // Tạo options cho react-select
    const categoryOptions = categories.map(cat => ({ value: cat.id, label: cat.name }));
    const branchOptions = branches.map(branch => ({ value: branch.id, label: branch.name }));

    // Hàm format giá tiền
    const formatVND = (value) => {
        value = value.replace(/\D/g, '');
        if (!value) return '';
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Hàm xử lý khi chọn nhiều ảnh
    const onChangeImages = (e) => {
        const newFiles = Array.from(e.target.files);
        const validFiles = [];
        let hasLargeFile = false;
        newFiles.forEach(file => {
            if (file.size > 2 * 1024 * 1024) {
                hasLargeFile = true;
            } else {
                validFiles.push(file);
            }
        });
        if (hasLargeFile) {
            toast.error('Ảnh phải nhỏ hơn 2MB!', toastErrorConfig);
        }
        if (validFiles.length === 0) {
            e.target.value = "";
            return;
        }
        let combinedFiles = [...imageFiles, ...validFiles];
        combinedFiles = combinedFiles.filter(
            (file, idx, arr) => arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
        );
        if (combinedFiles.length > 4) {
            toast.error('Chỉ được chọn tối đa 4 ảnh!', toastErrorConfig);
            combinedFiles = combinedFiles.slice(0, 4);
        }
        setImageFiles(combinedFiles);
        setValue('imageFiles', combinedFiles, { shouldValidate: true });
        const previews = combinedFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
        if (featuredImageIndex >= combinedFiles.length) setFeaturedImageIndex(0);
        e.target.value = "";
    };

    // Hàm xóa ảnh
    const handleRemoveImage = (idx) => {
        const newFiles = imageFiles.filter((_, i) => i !== idx);
        const newPreviews = imagePreviews.filter((_, i) => i !== idx);
        setImageFiles(newFiles);
        setImagePreviews(newPreviews);
        setValue('imageFiles', newFiles, { shouldValidate: true });
        if (featuredImageIndex === idx || featuredImageIndex >= newFiles.length) {
            setFeaturedImageIndex(0);
        } else if (featuredImageIndex > idx) {
            setFeaturedImageIndex(featuredImageIndex - 1);
        }
    };

    // Hàm thêm unit conversion
    const addUnitConversion = () => {
        setUnitConversions([...unitConversions, {
            unit_name: '',
            unit_code: '',
            conversion_factor: 1,
            store_price: '',
            app_price: '',
            is_sales_unit: true
        }]);
    };

    // Hàm xóa unit conversion
    const removeUnitConversion = (index) => {
        setUnitConversions(unitConversions.filter((_, i) => i !== index));
    };

    // Hàm thêm attribute
    const addAttribute = () => {
        setAttributes([...attributes, {
            name: '',
            type: 'select',
            values: []
        }]);
    };

    // Hàm xóa attribute
    const removeAttribute = (index) => {
        setAttributes(attributes.filter((_, i) => i !== index));
    };

    // Hàm thêm giá trị cho attribute
    const addAttributeValue = (attrIndex) => {
        const newAttributes = [...attributes];
        const isFirstValue = newAttributes[attrIndex].values.length === 0;
        newAttributes[attrIndex].values.push({
            value: '',
            price_adjustment: 0,
            is_default: isFirstValue
        });
        setAttributes(newAttributes);
    };

    // Hàm xóa giá trị attribute
    const removeAttributeValue = (attrIndex, valueIndex) => {
        const newAttributes = [...attributes];
        newAttributes[attrIndex].values.splice(valueIndex, 1);
        setAttributes(newAttributes);
    };

    // Hàm xử lý chọn chi nhánh
    const handleBranchSelection = (branchId) => {
        if (selectedBranches.includes(branchId)) {
            setSelectedBranches(selectedBranches.filter(id => id !== branchId));
            setBranchPrices(branchPrices.filter(bp => bp.branch_id !== branchId));
        } else {
            setSelectedBranches([...selectedBranches, branchId]);
            setBranchPrices([...branchPrices, {
                branch_id: branchId,
                price_type: 'store_price',
                price: '',
                unit_of_measure: ''
            }]);
        }
    };

    const handleSubmitForm = async (data) => {
        const valid = await trigger(['imageFiles', 'category_ids']);
        if (!valid) return;
        
        // Validate unit conversions
        for (let unit of unitConversions) {
            if (!unit.unit_name || !unit.conversion_factor || unit.conversion_factor <= 0) {
                return;
            }
        }
        
        // Validate attributes
        for (let attr of attributes) {
            if (!attr.name) {
                return;
            }
            // Validate attribute values if type is select or checkbox
            if ((attr.type === 'select' || attr.type === 'checkbox') && attr.values.length > 0) {
                for (let value of attr.values) {
                    if (!value.value) {
                        return;
                    }
                }
            }
        }
        
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = new FormData();
            
            // Thông tin cơ bản
            formData.append('product_code', productCode);
            formData.append('name', data.name);
            formData.append('description', data.description || '');
            formData.append('status', data.status);
            formData.append('base_unit', data.base_unit || '');
            formData.append('cost_price', Number(costPrice.replace(/\./g, '')) || 0);
            formData.append('base_store_price', Number(baseStorePrice.replace(/\./g, '')) || 0);
            formData.append('base_app_price', Number(baseAppPrice.replace(/\./g, '')) || 0);
            formData.append('is_sales_unit', isSalesUnit ? 1 : 0);
            formData.append('stock_quantity', stockQuantity);
            
            // Danh mục
            if (selectedCategories.length > 0) {
                selectedCategories.forEach(id => formData.append('category_ids[]', id));
            }
            
            // Ảnh
            imageFiles.forEach((file, idx) => {
                formData.append('image_url[]', file);
            });
            formData.append('featured_image_index', featuredImageIndex);
            
            // Unit conversions
            // const unitConversionsFormatted = unitConversions.map(unit => ({
            //     ...unit,
            //     store_price: typeof unit.store_price === 'string' ? Number(unit.store_price.replace(/\./g, '')) : Number(unit.store_price) || 0,
            //     app_price: typeof unit.app_price === 'string' ? Number(unit.app_price.replace(/\./g, '')) : Number(unit.app_price) || 0,
            // }));
            const unitConversionsFormatted = unitConversions.map(unit => {
                const storePrice = typeof unit.store_price === 'string' ? unit.store_price.trim() : unit.store_price;
                const appPrice = typeof unit.app_price === 'string' ? unit.app_price.trim() : unit.app_price;
            
                return {
                    ...unit,
                    store_price: storePrice === '' || storePrice == null
                        ? null
                        : Number(String(storePrice).replace(/\./g, '')),
                    app_price: appPrice === '' || appPrice == null
                        ? null
                        : Number(String(appPrice).replace(/\./g, '')),
                };
            });
            formData.append('unit_conversions_json', JSON.stringify(unitConversionsFormatted));
            
            // Attributes
            const attributesFormatted = attributes.map(attr => ({
                ...attr,
                values: attr.values.map(val => ({
                    ...val,
                    price_adjustment: typeof val.price_adjustment === 'string' ? Number(val.price_adjustment.replace(/\./g, '')) : Number(val.price_adjustment) || 0,
                }))
            }));
            formData.append('attributes_json', JSON.stringify(attributesFormatted));
            
            // Chi nhánh
            formData.append('applies_to_all_branches', applyToAllBranches ? 1 : 0);
            if (!applyToAllBranches && selectedBranches.length > 0) {
                selectedBranches.forEach(id => formData.append('branch_ids[]', id));
                formData.append('branch_prices_json', JSON.stringify(branchPrices));
            }
            
            // Log dữ liệu trước khi gửi
            const reviewData = {
                productCode,
                name: data.name,
                description: data.description || '',
                status: data.status,
                baseUnit: data.base_unit || '',
                costPrice: Number(costPrice.replace(/\./g, '')) || 0,
                baseStorePrice: Number(baseStorePrice.replace(/\./g, '')) || 0,
                baseAppPrice: Number(baseAppPrice.replace(/\./g, '')) || 0,
                isSalesUnit,
                stockQuantity,
                selectedCategories,
                imageFiles: imageFiles.map(f => ({name: f.name, size: f.size})),
                featuredImageIndex,
                unitConversions,
                attributes,
                applyToAllBranches,
                selectedBranches,
                branchPrices
            };
            console.log('=== PRODUCT DATA BEFORE SUBMIT ===', reviewData);
            
            const response = await requestApi(
                'api/admin/products',
                'POST',
                formData,
                'json',
                'multipart/form-data'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Thêm sản phẩm thành công!", toastSuccessConfig);
                // Quay lại trang trước đó nếu có, nếu không thì về danh sách sản phẩm
                const returnTo = location.state?.returnTo || '/product';
                navigation(returnTo);
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
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Thêm sản phẩm</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Thêm sản phẩm
                        </div>
                        <div className='card-body'>
                            <div className='mb-3 row'>
                                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                    {/* Tab Navigation */}
                                    <ul className="nav nav-tabs mb-4" id="productTabs" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'thong-tin' ? 'active' : ''}`}
                                                type="button"
                                                onClick={() => setActiveTab('thong-tin')}
                                                style={{ 
                                                    color: activeTab === 'thong-tin' ? '#007bff' : '#6c757d',
                                                    borderBottomColor: activeTab === 'thong-tin' ? '#007bff' : 'transparent',
                                                    borderBottomWidth: activeTab === 'thong-tin' ? '2px' : '1px',
                                                    textDecoration: 'none',
                                                    backgroundColor: 'transparent !important',
                                                   
                                                }}
                                               
                                            >
                                                Thông tin
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'mo-ta' ? 'active' : ''}`}
                                                type="button"
                                                onClick={() => setActiveTab('mo-ta')}
                                                style={{ 
                                                    color: activeTab === 'mo-ta' ? '#007bff' : '#6c757d',
                                                    borderBottomColor: activeTab === 'mo-ta' ? '#007bff' : 'transparent',
                                                    borderBottomWidth: activeTab === 'mo-ta' ? '2px' : '1px',
                                                    textDecoration: 'none',
                                                    backgroundColor: 'transparent !important',
                                                   
                                                }}
                                              
                                            >
                                                Mô tả chi tiết
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className={`nav-link ${activeTab === 'chi-nhanh' ? 'active' : ''}`}
                                                type="button"
                                                onClick={() => setActiveTab('chi-nhanh')}
                                                style={{ 
                                                    color: activeTab === 'chi-nhanh' ? '#007bff' : '#6c757d',
                                                    borderBottomColor: activeTab === 'chi-nhanh' ? '#007bff' : 'transparent',
                                                    borderBottomWidth: activeTab === 'chi-nhanh' ? '2px' : '1px',
                                                    textDecoration: 'none',
                                                    backgroundColor: 'transparent !important',
                                                  
                                                }}
                                                
                                            >
                                                Chi nhánh kinh doanh
                                            </button>
                                        </li>
                                    </ul>

                                    {/* Tab Content */}
                                    <div className="tab-content">
                                        {/* Tab Thông tin */}
                                        {activeTab === 'thong-tin' && (
                                            <div className="tab-pane fade show active">
                                                <div className="row mb-3">
                                                    <div className="col-12 col-md-6">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputProductCode" className="form-label fw-semibold">
                                                                Mã sản phẩm
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                id="inputProductCode"
                                                                value={productCode}
                                                                onChange={e => setProductCode(e.target.value)}
                                                                placeholder="Mã sản phẩm tự động"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-md-6">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputName" className="form-label fw-semibold">
                                                                Tên sản phẩm <span style={{color: 'red'}}>*</span>
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                id="inputName"
                                                                {...register('name', { required: 'Tên sản phẩm là bắt buộc' })}
                                                                placeholder="Nhập tên sản phẩm"
                                                            />
                                                            {isSubmitted && errors.name && <div className="text-danger mt-1">{errors.name.message}</div>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mb-3">
                                                    <div className="col-12 col-md-4">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputCostPrice" className="form-label fw-semibold">
                                                                Giá vốn (VNĐ)
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                id="inputCostPrice"
                                                                type="text"
                                                                value={costPrice}
                                                                onChange={e => {
                                                                    const formatted = formatVND(e.target.value);
                                                                    setCostPrice(formatted);
                                                                }}
                                                                placeholder="Nhập giá vốn"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-md-4">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputBaseStorePrice" className="form-label fw-semibold">
                                                                Giá bán tại cửa hàng (VNĐ)
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                id="inputBaseStorePrice"
                                                                type="text"
                                                                value={baseStorePrice}
                                                                onChange={e => {
                                                                    const formatted = formatVND(e.target.value);
                                                                    setBaseStorePrice(formatted);
                                                                }}
                                                                placeholder="Nhập giá bán cửa hàng"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-md-4">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputBaseAppPrice" className="form-label fw-semibold">
                                                                Giá bán trên App (VNĐ)
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                id="inputBaseAppPrice"
                                                                type="text"
                                                                value={baseAppPrice}
                                                                onChange={e => {
                                                                    const formatted = formatVND(e.target.value);
                                                                    setBaseAppPrice(formatted);
                                                                }}
                                                                placeholder="Nhập giá bán App"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mb-3">
                                                    <div className="col-12 col-md-4">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputBaseUnit" className="form-label fw-semibold">
                                                                Đơn vị cơ bản <span style={{color: 'red'}}>*</span>
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                id="inputBaseUnit"
                                                                {...register('base_unit', { required: 'Đơn vị cơ bản là bắt buộc' })}
                                                                placeholder="Nhập đơn vị cơ bản"
                                                            />
                                                            {isSubmitted && errors.base_unit && <div className="text-danger mt-1">{errors.base_unit.message}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-md-4">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputStock" className="form-label fw-semibold">
                                                                Tồn kho
                                                            </label>
                                                            <input
                                                                className="form-control"
                                                                id="inputStock"
                                                                type="number"
                                                                value={stockQuantity}
                                                                onChange={e => setStockQuantity(parseInt(e.target.value) || 0)}
                                                                placeholder="Nhập số lượng tồn kho"
                                                                disabled
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-md-4">
                                                        <div className="mb-3">
                                                            <label className="form-label fw-semibold">
                                                                Bán trực tiếp
                                                            </label>
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id="isSalesUnit"
                                                                    checked={isSalesUnit}
                                                                    onChange={e => setIsSalesUnit(e.target.checked)}
                                                                />
                                                                <label className="form-check-label" htmlFor="isSalesUnit">
                                                                    Có
                                                                </label>
                                                            </div>
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
                                                                <option value="1">Đang bán</option>
                                                                <option value="0">Ngừng bán</option>
                                                            </select>
                                                            {isSubmitted && errors.status && <div className="text-danger mt-1">{errors.status.message}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="col-12 col-md-6">
                                                        <div className="mb-3">
                                                            <label className="form-label fw-semibold">
                                                                Danh mục <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Select
                                                                options={categoryOptions}
                                                                isMulti
                                                                value={categoryOptions.filter(opt => selectedCategories.includes(opt.value))}
                                                                onChange={opts => {
                                                                    const values = opts ? opts.map(opt => opt.value) : [];
                                                                    setSelectedCategories(values);
                                                                    setValue('category_ids', values, { shouldValidate: true });
                                                                }}
                                                                placeholder="Tìm kiếm & chọn danh mục..."
                                                                classNamePrefix="react-select"
                                                                styles={selectStyles}
                                                                onBlur={() => trigger('category_ids')}
                                                            />
                                                            <input
                                                                type="hidden"
                                                                {...register('category_ids', {
                                                                    validate: value => (value && value.length > 0) || 'Phải chọn ít nhất 1 danh mục!'
                                                                })}
                                                            />
                                                            {isSubmitted && errors.category_ids && <div className="text-danger">{errors.category_ids.message}</div>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Hình ảnh sản phẩm */}
                                                <div className="row mb-3">
                                                    <div className="col-md-12">
                                                        <div className="mb-3">
                                                            <div className="form-label fw-semibold">
                                                                Hình ảnh sản phẩm 
                                                            </div>
                                                            <div className="row g-3">
                                                                <div className="col-6">
                                                                    <div className="row g-2">
                                                                        {[0, 1, 2, 3].map(idx => (
                                                                            <div key={idx} className="col-3 d-flex flex-column align-items-center">
                                                                        <div
                                                                            className="w-100 border border-2 border-secondary border-dashed rounded bg-light position-relative d-flex align-items-center justify-content-center"
                                                                            style={{ aspectRatio: '1/1', minHeight: 0, height: 'auto', maxWidth: '100%' }}
                                                                        >
                                                                            {imagePreviews[idx] ? (
                                                                                <>
                                                                                    <img
                                                                                        src={imagePreviews[idx]}
                                                                                        alt={`Preview ${idx}`}
                                                                                        className="w-100 h-100 rounded position-absolute top-0 start-0"
                                                                                        style={{ objectFit: 'fill', aspectRatio: '1/1' }}
                                                                                        onClick={e => { e.stopPropagation(); setFeaturedImageIndex(idx); }}
                                                                                    />
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-outline-danger btn-sm rounded-circle position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center no-hover"
                                                                                        style={{ zIndex: 2, width: 24, height: 24, padding: 0, background: '#fff' }}
                                                                                        aria-label="Xóa ảnh"
                                                                                        onClick={e => { e.stopPropagation(); handleRemoveImage(idx); }}
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
                                                                        {imagePreviews[idx] && (
                                                                            <div className="form-check mt-2">
                                                                                <input
                                                                                    type="radio"
                                                                                    name="featuredImage"
                                                                                    checked={featuredImageIndex === idx}
                                                                                    onChange={() => setFeaturedImageIndex(idx)}
                                                                                    className="form-check-input"
                                                                                    id={`featuredImage${idx}`}
                                                                                />
                                                                                <label className="form-check-label" htmlFor={`featuredImage${idx}`}>Ảnh đại diện</label>
                                                                            </div>
                                                                        )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center flex-wrap gap-2 mt-2">
                                                                <label htmlFor="inputImages" className="form-label btn btn-secondary mb-0">
                                                                    <i className="fas fa-upload"></i> Thêm ảnh sản phẩm
                                                                </label>
                                                                <div className="d-flex flex-column gap-1">
                                                                <span className="text-muted small">
                                                                    Chọn tối đa 4 ảnh, định dạng: jpg, png...
                                                                </span>
                                                                <span className="text-muted small">
                                                                    <b>Giữ Ctrl hoặc Shift để chọn nhiều ảnh cùng lúc.</b>
                                                                </span>
                                                                </div>
                                                            </div>
                                                            <input
                                                                className="form-control"
                                                                id="inputImages"
                                                                type="file"
                                                                accept="image/*"
                                                                multiple
                                                                style={{ display: 'none' }}
                                                                onChange={onChangeImages}
                                                                ref={input => (window.imageInput = input)}
                                                            />
                                                            <input
                                                                type="hidden"
                                                                {...register('imageFiles')}
                                                            />
                                                            {isSubmitted && errors.imageFiles && <div className="text-danger">{errors.imageFiles.message}</div>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Unit Conversions */}
                                                <div className="row mb-3">
                                                    <div className="col-md-12">
                                                        <div className="card">
                                                            <div className="card-header d-flex justify-content-between align-items-center">
                                                                <h6 className="mb-0">Đơn vị tính</h6>
                                                                <div className="d-flex gap-2">
                                                                    <button 
                                                                        type="button" 
                                                                        className="btn btn-sm btn-primary" 
                                                                        onClick={addUnitConversion}
                                                                    >
                                                                        + Thêm đơn vị
                                                                    </button>
                                                                    <button 
                                                                        type="button" 
                                                                        className="btn btn-sm btn-light border"
                                                                        onClick={() => setExpandUnitConversions(!expandUnitConversions)}
                                                                        title={expandUnitConversions ? "Thu gọn" : "Mở rộng"}
                                                                    >
                                                                        <span key={`unit-${expandUnitConversions}`}>
                                                                            <i className={expandUnitConversions ? "fas fa-chevron-up text-secondary" : "fas fa-chevron-down text-secondary"}></i>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="card-body" style={{display: expandUnitConversions ? 'block' : 'none'}}>
                                                                {/* Bảng đơn vị chuyển đổi */}
                                                                {unitConversions.length > 0 && (
                                                                    <div className="row mb-3">
                                                                        <div className="col-md-12">
                                                                            <div className="table-responsive">
                                                                                <table className="table table-bordered">
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th>Tên đơn vị</th>
                                                                                            <th>Giá trị quy đổi</th>
                                                                                            <th>Giá cửa hàng</th>
                                                                                            <th>Giá App</th>
                                                                                            <th>Mã hàng</th>
                                                                                            <th>Bán trực tiếp</th>
                                                                                            <th>Thao tác</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {unitConversions.map((unit, index) => (
                                                                                            <tr key={index}>
                                                                                                <td className="align-middle">
                                                                                                    <div className="d-flex flex-column align-items-center" style={{ gap: '4px' }}>
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            className={`form-control ${isSubmitted && !unit.unit_name ? 'is-invalid' : ''}`}
                                                                                                            value={unit.unit_name}
                                                                                                            onChange={e => {
                                                                                                                const newUnits = [...unitConversions];
                                                                                                                newUnits[index].unit_name = e.target.value;
                                                                                                                setUnitConversions(newUnits);
                                                                                                            }}
                                                                                                            placeholder="Nhập tên đơn vị"
                                                                                                        />
                                                                                                        <div className="invalid-feedback d-block small" style={{visibility: isSubmitted && !unit.unit_name ? 'visible' : 'hidden'}}>
                                                                                                            Tên đơn vị là bắt buộc
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="align-middle">
                                                                                                    <div className="d-flex flex-column align-items-center" style={{ gap: '4px' }}>
                                                                                                        <input
                                                                                                            type="number"
                                                                                                            className={`form-control ${isSubmitted && (!unit.conversion_factor || unit.conversion_factor <= 0) ? 'is-invalid' : ''}`}
                                                                                                            value={unit.conversion_factor}
                                                                                                            onChange={e => {
                                                                                                                const newUnits = [...unitConversions];
                                                                                                                const val = parseFloat(e.target.value);
                                                                                                                newUnits[index].conversion_factor = isNaN(val) || val <= 0 ? '' : val;
                                                                                                                setUnitConversions(newUnits);
                                                                                                            }}
                                                                                                            min="0"
                                                                                                            step="1"
                                                                                                            placeholder="Nhập số lớn hơn 0"
                                                                                                        />
                                                                                                        <div className="invalid-feedback d-block small" style={{visibility: isSubmitted && (!unit.conversion_factor || unit.conversion_factor <= 0) ? 'visible' : 'hidden'}}>
                                                                                                            Giá quy đổi phải lớn hơn 0
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="align-middle">
                                                                                                    <div className="d-flex flex-column align-items-center">
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            className="form-control"
                                                                                                            value={unit.store_price}
                                                                                                            onChange={e => {
                                                                                                                const newUnits = [...unitConversions];
                                                                                                                const formatted = formatVND(e.target.value);
                                                                                                                newUnits[index].store_price = formatted;
                                                                                                                setUnitConversions(newUnits);
                                                                                                            }}
                                                                                                            placeholder="Giá cửa hàng (không bắt buộc)"
                                                                                                        />
                                                                                                        <div className="invalid-feedback d-block small" style={{visibility: 'hidden'}}>
                                                                                                            &nbsp;
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="align-middle">
                                                                                                    <div className="d-flex flex-column align-items-center">
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            className="form-control"
                                                                                                            value={unit.app_price}
                                                                                                            onChange={e => {
                                                                                                                const newUnits = [...unitConversions];
                                                                                                                const formatted = formatVND(e.target.value);
                                                                                                                newUnits[index].app_price = formatted;
                                                                                                                setUnitConversions(newUnits);
                                                                                                            }}
                                                                                                            placeholder="Giá App (không bắt buộc)"
                                                                                                        />
                                                                                                        <div className="invalid-feedback d-block small" style={{visibility: 'hidden'}}>
                                                                                                            &nbsp;
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="align-middle">
                                                                                                    <div className="d-flex flex-column align-items-center">
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            className="form-control"
                                                                                                            value={unit.unit_code}
                                                                                                            onChange={e => {
                                                                                                                const newUnits = [...unitConversions];
                                                                                                                newUnits[index].unit_code = e.target.value;
                                                                                                                setUnitConversions(newUnits);
                                                                                                            }}
                                                                                                            placeholder="Mã hàng tự động"
                                                                                                        />
                                                                                                        <div className="invalid-feedback d-block small" style={{visibility: 'hidden'}}>
                                                                                                            &nbsp;
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="align-middle">
                                                                                                    <div className="d-flex flex-column align-items-center" style={{ gap: '4px' }}>
                                                                                                        <div className="form-check">
                                                                                                            <input
                                                                                                                className="form-check-input"
                                                                                                                type="checkbox"
                                                                                                                checked={unit.is_sales_unit}
                                                                                                                onChange={e => {
                                                                                                    const newUnits = [...unitConversions];
                                                                                                    newUnits[index].is_sales_unit = e.target.checked;
                                                                                                    setUnitConversions(newUnits);
                                                                                                }}
                                                                                                            />
                                                                                                            <label className="form-check-label">Bán trực tiếp</label>
                                                                                                        </div>
                                                                                                        <div style={{visibility: 'hidden'}}>
                                                                                                            &nbsp;
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="align-middle">
                                                                                                    <div className="d-flex flex-column align-items-center" style={{ gap: '4px' }}>
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            className="btn btn-sm btn-danger"
                                                                                                            onClick={() => removeUnitConversion(index)}
                                                                                                        >
                                                                                                            <i className="fas fa-trash"></i>
                                                                                                        </button>
                                                                                                        <div style={{visibility: 'hidden'}}>
                                                                                                            &nbsp;
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Attributes */}
                                                <div className="row mb-3">
                                                    <div className="col-md-12">
                                                        <div className="card">
                                                            <div className="card-header d-flex justify-content-between align-items-center">
                                                                <h6 className="mb-0">Thuộc tính sản phẩm</h6>
                                                                <div className="d-flex gap-2">
                                                                    <button type="button" className="btn btn-sm btn-primary" onClick={addAttribute}>
                                                                        + Thêm thuộc tính
                                                                    </button>
                                                                    <button 
                                                                        type="button" 
                                                                        className="btn btn-sm btn-light border"
                                                                        onClick={() => setExpandAttributes(!expandAttributes)}
                                                                        title={expandAttributes ? "Thu gọn" : "Mở rộng"}
                                                                    >
                                                                        <span key={`attr-${expandAttributes}`}>
                                                                            <i className={expandAttributes ? "fas fa-chevron-up text-secondary" : "fas fa-chevron-down text-secondary"}></i>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="card-body" style={{display: expandAttributes ? 'block' : 'none'}}>
                                                                {attributes.map((attr, attrIndex) => (
                                                                    <div key={attrIndex} className="mb-4 border-bottom pb-3">
                                                                        <div className="row mb-3">
                                                                            <div className="col-12 col-md-6 mb-3 mb-md-0">
                                                                                <label className="form-label fw-semibold">Thuộc tính <span style={{color: 'red'}}>*</span></label>
                                                                                <input
                                                                                    type="text"
                                                                                    className={`form-control ${isSubmitted && !attr.name ? 'is-invalid' : ''}`}
                                                                                    value={attr.name}
                                                                                    onChange={e => {
                                                                                        const newAttrs = [...attributes];
                                                                                        newAttrs[attrIndex].name = e.target.value;
                                                                                        setAttributes(newAttrs);
                                                                                    }}
                                                                                    placeholder="Nhập tên thuộc tính"
                                                                                />
                                                                                {isSubmitted && !attr.name && <div className="invalid-feedback d-block">Tên thuộc tính là bắt buộc</div>}
                                                                            </div>
                                                                            <div className="col-12 col-md-4 mb-3 mb-md-0">
                                                                                <label className="form-label">Loại thuộc tính</label>
                                                                                <select
                                                                                    className="form-select"
                                                                                    value={attr.type}
                                                                                    onChange={e => {
                                                                                        const newAttrs = [...attributes];
                                                                                        newAttrs[attrIndex].type = e.target.value;
                                                                                        setAttributes(newAttrs);
                                                                                    }}
                                                                                >
                                                                                    <option value="select">Một lựa chọn (Radio)</option>
                                                                                    <option value="checkbox">Nhiều lựa chọn (Checkbox)</option>
                                                                                    <option value="text">Ghi chú (Text Input)</option>
                                                                                </select>
                                                                            </div>
                                                                            <div className="col-12 col-md-2 d-flex align-items-end justify-content-center">
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-danger"
                                                                                    onClick={() => removeAttribute(attrIndex)}
                                                                                >
                                                                                    <i className="fas fa-trash"></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Hiển thị giá trị cho select và checkbox */}
                                                                        {(attr.type === 'select' || attr.type === 'checkbox') && (
                                                                            <div className="row mb-3">
                                                                                <div className="col-12">
                                                                                    <div className="mb-2">
                                                                                        <label className="form-label">Giá trị</label>
                                                                                    </div>
                                                                                    {attr.values.map((value, valueIndex) => (
                                                                                        <div key={valueIndex} className="row mb-2">
                                                                                            <div className="col-12 col-md-4 mb-2 mb-md-0">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    className={`form-control ${isSubmitted && !value.value ? 'is-invalid' : ''}`}
                                                                                                    value={value.value}
                                                                                                    onChange={e => {
                                                                                                        const newAttrs = [...attributes];
                                                                                                        newAttrs[attrIndex].values[valueIndex].value = e.target.value;
                                                                                                        setAttributes(newAttrs);
                                                                                                    }}
                                                                                                    placeholder="Nhập giá trị"
                                                                                                    
                                                                                                />
                                                                                                {isSubmitted && !value.value && <div className="invalid-feedback d-block">Giá trị là bắt buộc</div>}
                                                                                            </div>
                                                                                            <div className="col-6 col-md-2 mb-2 mb-md-0">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    className="form-control"
                                                                                                    value={value.price_adjustment}
                                                                                                    onChange={e => {
                                                                                                        const newAttrs = [...attributes];
                                                                                                        const formatted = formatVND(e.target.value);
                                                                                                        newAttrs[attrIndex].values[valueIndex].price_adjustment = formatted;
                                                                                                        setAttributes(newAttrs);
                                                                                                    }}
                                                                                                    placeholder="Phụ thu"
                                                                                                />
                                                                                            </div>
                                                                                            <div className="col-6 col-md-2 mb-2 mb-md-0">
                                                                                                <div className="form-check">
                                                                                                    <input
                                                                                                        className="form-check-input"
                                                                                                        type="radio"
                                                                                                        name={`default_${attrIndex}`}
                                                                                                        checked={value.is_default}
                                                                                                        onChange={e => {
                                                                                                            const newAttrs = [...attributes];
                                                                                                            // Reset all other values to false
                                                                                                            newAttrs[attrIndex].values.forEach((v, i) => {
                                                                                                                v.is_default = (i === valueIndex);
                                                                                                            });
                                                                                                            setAttributes(newAttrs);
                                                                                                        }}
                                                                                                    />
                                                                                                    <label className="form-check-label">Mặc định</label>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-12 col-md-2 d-flex align-items-center justify-content-center">
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="btn btn-sm btn-danger"
                                                                                                    onClick={() => removeAttributeValue(attrIndex, valueIndex)}
                                                                                                >
                                                                                                    <i className="fas fa-trash"></i>
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                    <div className="mt-2">
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-sm btn-secondary"
                                                                                            onClick={() => addAttributeValue(attrIndex)}
                                                                                        >
                                                                                            + Thêm giá trị
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {/* Hiển thị thông báo cho text type */}
                                                                        {attr.type === 'text' && (
                                                                            <div className="alert alert-info">
                                                                                <i className="fas fa-info-circle me-2"></i>
                                                                                Thuộc tính dạng text cho phép khách hàng nhập ghi chú tự do
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tab Mô tả */}
                                        {activeTab === 'mo-ta' && (
                                            <div className="tab-pane fade show active">
                                                <div className="row mb-3">
                                                    <div className="col-md-12">
                                                        <div className="mb-3">
                                                            <label htmlFor="description" className="form-label fw-semibold">
                                                                Mô tả sản phẩm
                                                            </label>
                                                            <CustomEditor
                                                                folder='products'                                      
                                                                onReady={() => register('description')}
                                                                onChange={data => setValue('description', data)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tab Chi nhánh */}
                                        {activeTab === 'chi-nhanh' && (
                                            <div className="tab-pane fade show active">
                                                <div className="row mb-3">
                                                    <div className="col-md-12">
                                                        <div className="mb-3">
                                                            <label className="form-label fw-semibold">Áp dụng cho</label>
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="applyToAll"
                                                                    id="applyToAll"
                                                                    checked={applyToAllBranches}
                                                                    onChange={() => {
                                                                        setApplyToAllBranches(true);
                                                                        setSelectedBranches([]);
                                                                        setBranchPrices([]);
                                                                    }}
                                                                />
                                                                <label className="form-check-label" htmlFor="applyToAll">
                                                                    Toàn hệ thống
                                                                </label>
                                                            </div>
                                                            <div className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="radio"
                                                                    name="applyToAll"
                                                                    id="applyToSpecific"
                                                                    checked={!applyToAllBranches}
                                                                    onChange={() => setApplyToAllBranches(false)}
                                                                />
                                                                <label className="form-check-label" htmlFor="applyToSpecific">
                                                                    Chi nhánh
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {!applyToAllBranches && (
                                                    <div className="row mb-3">
                                                        <div className="col-md-12">
                                                            <div className="mb-3">
                                                                <label className="form-label fw-semibold">Chọn chi nhánh</label>
                                                                <Select
                                                                    options={branchOptions}
                                                                    isMulti
                                                                    value={branchOptions.filter(opt => selectedBranches.includes(opt.value))}
                                                                    onChange={opts => {
                                                                        const values = opts ? opts.map(opt => opt.value) : [];
                                                                        setSelectedBranches(values);
                                                                        // Cập nhật branchPrices
                                                                        const newBranchPrices = [];
                                                                        values.forEach(branchId => {
                                                                            const existingPrice = branchPrices.find(bp => bp.branch_id === branchId);
                                                                            if (existingPrice) {
                                                                                newBranchPrices.push(existingPrice);
                                                                            } else {
                                                                                newBranchPrices.push({
                                                                                    branch_id: branchId,
                                                                                    price_type: 'store_price',
                                                                                    price: '',
                                                                                    unit_of_measure: ''
                                                                                });
                                                                            }
                                                                        });
                                                                        setBranchPrices(newBranchPrices);
                                                                    }}
                                                                    placeholder="Tìm kiếm & chọn chi nhánh..."
                                                                    classNamePrefix="react-select"
                                                                    styles={selectStyles}
                                                                    menuPortalTarget={document.body}
                                                                    menuPosition="fixed"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 mb-0">
                                        <div className="d-flex justify-content-center detail-action-buttons">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => {
                                                    const returnTo = location.state?.returnTo || '/product';
                                                    navigation(returnTo);
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                <i className="fas fa-times me-1"></i><span className="d-none d-sm-inline">Hủy bỏ</span>
                                            </button>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                type="submit"
                                                disabled={isSubmitting}
                                            >
                                                <i className="fas fa-check me-1"></i>
                                                <span className="d-none d-sm-inline">{isSubmitting ? "Đang gửi..." : "Thêm mới"}</span>
                                                {isSubmitting && <span className="d-sm-none">...</span>}
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