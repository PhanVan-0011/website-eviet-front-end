import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';
import CustomEditor from '../common/CustomEditor';
import DatePicker from 'react-datepicker';
import vi from 'date-fns/locale/vi';
import { format } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { selectStyles } from '../common/FilterComponents';
import { Modal, Button } from 'react-bootstrap';

const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const ComboUpdate = () => {
    const params = useParams();
    const navigation = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit, setValue, trigger, formState: { errors, isSubmitted }, setError, clearErrors } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('thong-tin');

    // Thông tin cơ bản
    const [products, setProducts] = useState([]);
    const [branches, setBranches] = useState([]);
    const [comboCode, setComboCode] = useState('');
    const [price, setPrice] = useState('');
    const [baseStorePrice, setBaseStorePrice] = useState('');
    const [baseAppPrice, setBaseAppPrice] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [oldImage, setOldImage] = useState(null);
    const [shouldRemoveImage, setShouldRemoveImage] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startDatePicker, setStartDatePicker] = useState(null);
    const [endDatePicker, setEndDatePicker] = useState(null);
    const [comboItems, setComboItems] = useState([{ product_id: '', quantity: 1 }]);
    const [description, setDescription] = useState('');
    const [itemErrors, setItemErrors] = useState({});

    // Chi nhánh
    const [applyToAllBranches, setApplyToAllBranches] = useState(true);
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // State cho tab Thời gian bán
    const [timeSlots, setTimeSlots] = useState([]);
    const [isFlexibleTime, setIsFlexibleTime] = useState(true);
    const [selectedTimeSlotIds, setSelectedTimeSlotIds] = useState([]);

    // Lấy thông tin combo cần sửa
    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch(actions.controlLoading(true));
                const [productsRes, branchRes, timeSlotRes, comboRes] = await Promise.all([
                    requestApi('api/admin/products?limit=1000', 'GET', []),
                    requestApi('api/admin/branches?limit=1000', 'GET', []),
                    requestApi('api/admin/time-slots?limit=1000&is_active=1', 'GET', []),
                    requestApi(`api/admin/combos/${params.id}`, 'GET')
                ]);

                if (productsRes.data && productsRes.data.data) {
                    setProducts(productsRes.data.data);
                }
                if (branchRes.data && branchRes.data.data) {
                    setBranches(branchRes.data.data);
                }
                
                // Xử lý time slots - chỉ lấy các time slots active
                if (timeSlotRes.data && timeSlotRes.data.data) {
                    const activeTimeSlots = timeSlotRes.data.data.filter(slot => slot.is_active === true || slot.is_active === 1);
                    setTimeSlots(activeTimeSlots);
                }

                // Xử lý dữ liệu combo
                if (comboRes.data && comboRes.data.data) {
                    const data = comboRes.data.data;
                    setComboCode(data.combo_code || '');
                    setValue('name', data.name);
                    setValue('description', data.description);
                    setValue('price', formatVND(parseInt(data.price, 10)));
                    setPrice(formatVND(parseInt(data.price, 10)));
                    setBaseStorePrice(formatVND(parseInt(data.base_store_price || 0, 10)));
                    setBaseAppPrice(formatVND(parseInt(data.base_app_price || 0, 10)));

                    if (data.start_date) {
                        const start = new Date(data.start_date);
                        setStartDatePicker(start);
                        setStartDate(start);
                        setValue('start_date', start, { shouldValidate: true });
                    }
                    if (data.end_date) {
                        const end = new Date(data.end_date);
                        setEndDatePicker(end);
                        setEndDate(end);
                        setValue('end_date', end, { shouldValidate: true });
                    }
                    setValue('is_active', data.is_active === true ? "1" : "0");

                    if (data.image_urls && data.image_urls.length > 0) {
                        setOldImage(data.image_urls[0].main_url);
                    }

                    setDescription(data.description || '');

                    if (data.items && data.items.length > 0) {
                        setComboItems(data.items.map(item => ({
                            product_id: item.product_id,
                            quantity: item.quantity
                        })));
                    }

                    // Xử lý chi nhánh
                    if (data.applies_to_all_branches === true || data.applies_to_all_branches === 1) {
                        setApplyToAllBranches(true);
                        setSelectedBranches([]);
                    } else if (data.branches && data.branches.length > 0) {
                        setApplyToAllBranches(false);
                        const branchIds = data.branches.map(branch => branch.id);
                        setSelectedBranches(branchIds);
                    }
                    
                    // Thời gian bán
                    if (data.is_flexible_time === true || data.is_flexible_time === 1) {
                        setIsFlexibleTime(true);
                        setSelectedTimeSlotIds([]);
                    } else {
                        setIsFlexibleTime(false);
                        // Xử lý cả trường hợp time_slots (array objects) hoặc time_slot_ids (array numbers)
                        if (data.time_slots && data.time_slots.length > 0) {
                            const timeSlotIds = data.time_slots.map(slot => typeof slot === 'object' ? slot.id : slot);
                            setSelectedTimeSlotIds(timeSlotIds);
                        } else if (data.time_slot_ids && data.time_slot_ids.length > 0) {
                            setSelectedTimeSlotIds(data.time_slot_ids);
                        } else {
                            setSelectedTimeSlotIds([]);
                        }
                    }
                }
                dispatch(actions.controlLoading(false));
            } catch (error) {
                dispatch(actions.controlLoading(false));
                toast.error("Không lấy được dữ liệu", toastErrorConfig);
            }
        };
        fetchData();
    }, [params.id, setValue]);

    // Tạo options cho react-select
    const productOptions = products.map(p => ({ value: p.id, label: p.name + (p.size ? ` - ${p.size}` : '') + (p.category?.name ? ` (${p.category.name})` : ''), data: p }));
    const branchOptions = branches.map(branch => ({ value: branch.id, label: branch.name }));
    
    // Format time từ HH:mm:ss sang HH:mm
    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.substring(0, 5); // Lấy HH:mm từ HH:mm:ss
    };
    
    const timeSlotOptions = timeSlots.map(slot => ({ 
        value: slot.id, 
        label: `${slot.name} (${formatTime(slot.start_time)} - ${formatTime(slot.end_time)})` 
    }));

    const getProductStock = (productId) => {
        if (!productId) return null;
        const product = products.find(p => String(p.id) === String(productId));
        return product ? Number(product.total_stock_quantity || 0) : null;
    };

    const enforceQuantityValidity = (target, productStock) => {
        if (!target.value || Number(target.value) < 1) {
            target.setCustomValidity('Số lượng phải lớn hơn hoặc bằng 1');
        } else if (productStock !== null && Number(target.value) > productStock) {
            target.setCustomValidity(`Số lượng không được vượt quá tồn kho (${productStock})`);
        } else {
            target.setCustomValidity('');
        }
    };

    // Hàm format giá tiền
    const formatVND = (value) => {
        if (value === null || value === undefined) return '';
        value = value.toString();
        value = value.replace(/\D/g, '');
        if (!value) return '';
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Hàm format hiển thị VND với ký hiệu
    const formatVNDDisplay = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Custom Option component với hình ảnh
    const CustomOption = ({ innerRef, innerProps, data, isSelected, isFocused }) => {
        const imageUrl = data.data?.featured_image?.thumb_url 
            ? `${process.env.REACT_APP_API_URL}api/images/${data.data.featured_image.thumb_url}`
            : null;

        return (
            <div
                ref={innerRef}
                {...innerProps}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: isSelected ? '#0d6efd' : isFocused ? '#e7f1ff' : 'white',
                    color: isSelected ? 'white' : '#212529',
                    cursor: 'pointer'
                }}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={data.data?.name || 'Product'}
                        style={{
                            width: '32px',
                            height: '32px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            marginRight: '8px',
                            border: '1px solid #ddd'
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            marginRight: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: '#6c757d'
                        }}
                    >
                        <i className="fas fa-image"></i>
                    </div>
                )}
                <div>
                    <div style={{ fontWeight: '500' }}>
                        <span className="badge bg-primary me-2">{data.data?.product_code || 'N/A'}</span>
                        {data.data?.name || 'N/A'}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                        Tồn: {data.data?.total_stock_quantity || 0} | Giá: {formatVNDDisplay(data.data?.base_store_price || 0)}
                    </div>
                </div>
            </div>
        );
    };

    // Custom SingleValue component với hình ảnh
    const CustomSingleValue = ({ data }) => {
        const imageUrl = data.data?.featured_image?.thumb_url 
            ? `${process.env.REACT_APP_API_URL}api/images/${data.data.featured_image.thumb_url}`
            : null;

        return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px', minHeight: '60px' }}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={data.data?.name || 'Product'}
                        style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            flexShrink: 0
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            color: '#6c757d',
                            flexShrink: 0
                        }}
                    >
                        <i className="fas fa-image"></i>
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, justifyContent: 'center', height: '100%' }}>
                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <span className="badge bg-primary" style={{ fontSize: '11px', flexShrink: 0, padding: '4px 8px' }}>{data.data?.product_code || 'N/A'}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '16px' }}>{data.data?.name || 'N/A'}</span>
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.75, color: '#6c757d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '3px' }}>
                        Tồn: {data.data?.total_stock_quantity || 0} | Giá: {formatVNDDisplay(data.data?.base_store_price || 0)}
                    </div>
                </div>
            </div>
        );
    };

    // Hàm xử lý khi chọn ảnh mới
    const onChangeImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ảnh phải nhỏ hơn 2MB!', toastErrorConfig);
            e.target.value = "";
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
            toast.error('Chỉ chấp nhận ảnh jpg, jpeg, png, gif', toastErrorConfig);
            e.target.value = "";
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setValue('imageFile', file, { shouldValidate: true });
        setShouldRemoveImage(false);
        e.target.value = "";
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (oldImage) {
            setShouldRemoveImage(true);
        }
        setOldImage(null);
        setValue('imageFile', null, { shouldValidate: true });
    };

    // Thêm/xóa sản phẩm trong combo
    const handleAddItem = () => {
        setComboItems([...comboItems, { product_id: '', quantity: 1 }]);
        clearErrors('comboItems');
    };
    const handleRemoveItem = (idx) => {
        if (comboItems.length === 1) return;
        setComboItems(comboItems.filter((_, i) => i !== idx));
        clearErrors('comboItems');
        // Xóa lỗi của item bị xóa và cập nhật lại index cho các item còn lại
        const newErrors = {};
        Object.keys(itemErrors).forEach(key => {
            const keyIdx = parseInt(key);
            if (keyIdx < idx) {
                newErrors[keyIdx] = itemErrors[keyIdx];
            } else if (keyIdx > idx) {
                newErrors[keyIdx - 1] = itemErrors[keyIdx];
            }
        });
        setItemErrors(newErrors);
    };
    const handleChangeItem = (idx, field, value) => {
        setComboItems(comboItems.map((item, i) =>
            i === idx ? { ...item, [field]: value } : item
        ));
        clearErrors('comboItems');
        // Xóa lỗi của item khi người dùng thay đổi
        if (itemErrors[idx]) {
            const newErrors = { ...itemErrors };
            delete newErrors[idx];
            setItemErrors(newErrors);
        }
    };
    
    // Hàm validate sản phẩm trong combo
    const validateComboItems = () => {
        if (!comboItems || comboItems.length === 0) {
            setError('comboItems', { type: 'manual', message: 'Cần chọn ít nhất 1 sản phẩm cho combo!' });
            return false;
        }
        const ids = comboItems.map(i => i.product_id).filter(Boolean);
        const hasDuplicate = ids.length !== new Set(ids).size;
        if (hasDuplicate) {
            setError('comboItems', { type: 'manual', message: 'Không được chọn trùng sản phẩm trong combo!' });
            return false;
        }
        
        // Validate từng item và lưu lỗi theo index
        const errors = {};
        let hasError = false;
        comboItems.forEach((item, idx) => {
            if (!item.product_id) {
                errors[idx] = 'Vui lòng chọn sản phẩm';
                hasError = true;
            } else if (!item.quantity || Number(item.quantity) < 1) {
                errors[idx] = 'Số lượng phải lớn hơn 0';
                hasError = true;
            } else {
                const productStock = getProductStock(item.product_id);
                if (productStock !== null && Number(item.quantity) > productStock) {
                    errors[idx] = `Số lượng không được vượt quá tồn kho (${productStock})`;
                    hasError = true;
                }
            }
        });

        if (hasError) {
            setItemErrors(errors);
            return false;
        }

        setItemErrors({});
        clearErrors('comboItems');
        return true;
    };

    const handleSubmitForm = async (data) => {
        if (!validateComboItems()) {
            return;
        }
        if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
            toast.error("Thời gian kết thúc phải lớn hơn thời gian bắt đầu", toastErrorConfig);
            return;
        }
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = new FormData();

            // Thông tin cơ bản
            formData.append('combo_code', comboCode);
            formData.append('name', data.name);
            formData.append('description', data.description || '');
            formData.append('price', Number(price.replace(/\./g, '')) || 0);
            formData.append('base_store_price', Number(baseStorePrice.replace(/\./g, '')) || 0);
            formData.append('base_app_price', Number(baseAppPrice.replace(/\./g, '')) || 0);
            formData.append('start_date', startDate ? format(new Date(startDate), 'yyyy-MM-dd HH:mm:ss') : '');
            formData.append('end_date', endDate ? format(new Date(endDate), 'yyyy-MM-dd HH:mm:ss') : '');
            formData.append('is_active', data.is_active);

            // Xử lý ảnh
            if (imageFile) {
                formData.append('image_url', imageFile);
            } else if (shouldRemoveImage) {
                formData.append('image_url', '');
            }

            // Sản phẩm trong combo
            comboItems.forEach((item, idx) => {
                formData.append(`items[${idx}][product_id]`, item.product_id);
                formData.append(`items[${idx}][quantity]`, item.quantity);
            });

            // Chi nhánh
            formData.append('applies_to_all_branches', applyToAllBranches ? 1 : 0);
            if (!applyToAllBranches && selectedBranches.length > 0) {
                selectedBranches.forEach(id => formData.append('branch_ids[]', id));
            }
            
            // Thời gian bán
            formData.append('is_flexible_time', isFlexibleTime ? 1 : 0);
            if (!isFlexibleTime && selectedTimeSlotIds.length > 0) {
                selectedTimeSlotIds.forEach(id => formData.append('time_slot_ids[]', id));
            }

            const response = await requestApi(
                `api/admin/combos/${params.id}`,
                'POST',
                formData,
                'json',
                'multipart/form-data'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật combo thành công!", toastSuccessConfig);
                setTimeout(() => {
                    navigation('/combo');
                }, 1500);
            } else {
                toast.error(response.data.message || "Cập nhật combo thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Lỗi khi cập nhật combo", toastErrorConfig);
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
                        <li className="breadcrumb-item active">Cập nhật combo</li>
                    </ol>
                    <div className='card mb-3'>
                        <div className='card-header'>
                            <i className="fas fa-table me-1"></i>
                            Cập nhật combo
                        </div>
                        <div className='card-body'>
                            <form onSubmit={handleSubmit(handleSubmitForm)}>
                                {/* Tab Navigation */}
                                <ul className="nav nav-tabs mb-4" id="comboTabs" role="tablist">
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
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link ${activeTab === 'thoi-gian' ? 'active' : ''}`}
                                            type="button"
                                            onClick={() => setActiveTab('thoi-gian')}
                                            style={{
                                                color: activeTab === 'thoi-gian' ? '#007bff' : '#6c757d',
                                                borderBottomColor: activeTab === 'thoi-gian' ? '#007bff' : 'transparent',
                                                borderBottomWidth: activeTab === 'thoi-gian' ? '2px' : '1px',
                                                textDecoration: 'none',
                                                backgroundColor: 'transparent !important',
                                            }}
                                        >
                                            Thời gian bán
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
                                                    <div className="mb-4">
                                                        <label htmlFor="inputComboCode" className="form-label fw-semibold">
                                                            Mã combo
                                                        </label>
                                                        <input
                                                            className="form-control"
                                                            id="inputComboCode"
                                                            value={comboCode}
                                                            onChange={e => setComboCode(e.target.value)}
                                                            placeholder="Mã combo"
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="inputName" className="form-label fw-semibold">
                                                            Tên combo <span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <input
                                                            className="form-control"
                                                            id="inputName"
                                                            {...register('name', { required: 'Tên combo là bắt buộc' })}
                                                            placeholder="Nhập tên combo"
                                                        />
                                                        {isSubmitted && errors.name && <div className="text-danger mt-1">{errors.name.message}</div>}
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="inputBaseStorePrice" className="form-label fw-semibold">
                                                            Giá cửa hàng (VNĐ)
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
                                                            placeholder="Nhập giá cửa hàng"
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="inputBaseAppPrice" className="form-label fw-semibold">
                                                            Giá App (VNĐ)
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
                                                            placeholder="Nhập giá App"
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="inputStatus" className="form-label fw-semibold">
                                                            Trạng thái <span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <select
                                                            className="form-select"
                                                            id="inputStatus"
                                                            {...register('is_active', { required: 'Trạng thái là bắt buộc' })}
                                                            defaultValue="1"
                                                        >
                                                            <option value="1">Hiển thị</option>
                                                            <option value="0">Ẩn</option>
                                                        </select>
                                                        {isSubmitted && errors.is_active && <div className="text-danger mt-1 small">{errors.is_active.message}</div>}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-6">
                                                      {/* Hình ảnh */}
                                                    <div className="row mb-3">
                                                        <div className="col-md-12">
                                                            <div className="mb-3">
                                                                <div className="d-flex flex-column align-items-center">
                                                                    <div
                                                                        className="border border-2 border-secondary border-dashed rounded bg-light position-relative d-flex align-items-center justify-content-center mb-2"
                                                                        style={{ aspectRatio: '3/2', width: '100%', maxWidth: 320 }}
                                                                    >
                                                                        {(imagePreview || oldImage) ? (
                                                                            <>
                                                                                <img
                                                                                    src={imagePreview || (oldImage?.startsWith('http') ? oldImage : urlImage + oldImage)}
                                                                                    alt="Preview"
                                                                                    className="w-100 h-100 rounded position-absolute top-0 start-0"
                                                                                    style={{ objectFit: 'fill', aspectRatio: '1/1' }}
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-outline-danger btn-sm rounded-circle position-absolute top-0 end-0 m-1 d-flex align-items-center justify-content-center no-hover"
                                                                                    style={{ zIndex: 2, width: 28, height: 28, padding: 0, background: '#fff' }}
                                                                                    aria-label="Xóa ảnh"
                                                                                    onClick={handleRemoveImage}
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
                                                                    <label htmlFor="inputImage" className="form-label btn btn-secondary mb-0 mt-2">
                                                                        <i className="fas fa-upload"></i> {imagePreview || oldImage ? 'Thay đổi ảnh' : 'Thêm ảnh combo'}
                                                                    </label>
                                                                    <div className="text-muted small">
                                                                        Chỉ chọn 1 ảnh, định dạng: jpg, png...<br />
                                                                        Kích thước tối đa: 2MB
                                                                    </div>
                                                                    <input
                                                                        className="form-control"
                                                                        id="inputImage"
                                                                        type="file"
                                                                        accept="image/*"
                                                                        style={{ display: 'none' }}
                                                                        onChange={onChangeImage}
                                                                    />
                                                                    <input
                                                                        type="hidden"
                                                                        {...register('imageFile')}
                                                                    />
                                                                    {isSubmitted && errors.imageFile && <div className="text-danger mt-1 small">{errors.imageFile.message}</div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Ngày bắt đầu và kết thúc - chỉ hiển thị trên màn hình 768px-1024px */}
                                                    <div className="d-none d-md-block d-lg-none">
                                                        <div className="mb-3">
                                                            <label htmlFor="inputStartDate" className="form-label fw-semibold">
                                                                Thời gian bắt đầu <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <div className="d-flex align-items-center" style={{ gap: '4px' }}>
                                                                <DatePicker
                                                                    selected={startDatePicker}
                                                                    onChange={date => {
                                                                        setStartDatePicker(date);
                                                                        setStartDate(date);
                                                                        setValue('start_date', date, { shouldValidate: true });
                                                                    }}
                                                                    locale={vi}
                                                                    dateFormat="dd/MM/yyyy HH:mm"
                                                                    className="form-control"
                                                                    placeholderText="Chọn thời gian bắt đầu"
                                                                    id="inputStartDate"
                                                                    autoComplete="off"
                                                                    showTimeSelect
                                                                    timeFormat="HH:mm"
                                                                    timeIntervals={15}
                                                                    timeCaption="Giờ"
                                                                    popperPlacement="bottom-start"
                                                                />
                                                                <button type="button" tabIndex={-1} className="btn p-0 border-0 bg-transparent" style={{ height: '38px' }} onClick={() => document.getElementById('inputStartDate')?.focus()}>
                                                                    <i className="fas fa-calendar-alt text-secondary"></i>
                                                                </button>
                                                                <input type="hidden" {...register('start_date', { required: 'Thời gian bắt đầu là bắt buộc' })} />
                                                            </div>
                                                            {isSubmitted && errors.start_date && <div className="text-danger mt-1 small">{errors.start_date.message}</div>}
                                                        </div>
                                                        <div className="mb-3">
                                                            <label htmlFor="inputEndDate" className="form-label fw-semibold">
                                                                Thời gian kết thúc <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <div className="d-flex align-items-center" style={{ gap: '4px' }}>
                                                                <DatePicker
                                                                    selected={endDatePicker}
                                                                    onChange={date => {
                                                                        setEndDatePicker(date);
                                                                        setEndDate(date);
                                                                        setValue('end_date', date, { shouldValidate: true });
                                                                    }}
                                                                    locale={vi}
                                                                    dateFormat="dd/MM/yyyy HH:mm"
                                                                    className="form-control"
                                                                    placeholderText="Chọn thời gian kết thúc"
                                                                    id="inputEndDate"
                                                                    autoComplete="off"
                                                                    showTimeSelect
                                                                    timeFormat="HH:mm"
                                                                    timeIntervals={15}
                                                                    timeCaption="Giờ"
                                                                    popperPlacement="bottom-start"
                                                                />
                                                                <button type="button" tabIndex={-1} className="btn p-0 border-0 bg-transparent" style={{ height: '38px' }} onClick={() => document.getElementById('inputEndDate')?.focus()}>
                                                                    <i className="fas fa-calendar-alt text-secondary"></i>
                                                                </button>
                                                                <input type="hidden" {...register('end_date', { required: 'Thời gian kết thúc là bắt buộc' })} />
                                                            </div>
                                                            {isSubmitted && errors.end_date && <div className="text-danger mt-1 small">{errors.end_date.message}</div>}
                                                        </div>
                                                    </div>
                                                    {/* Ngày bắt đầu và kết thúc - chỉ hiển thị trên màn hình >= 1024px */}
                                                    <div className="d-none d-lg-block">
                                                        <div className="row">
                                                            <div className="col-12 col-xl-6 mb-3 mb-xl-0">
                                                                <label htmlFor="inputStartDateLarge" className="form-label fw-semibold">
                                                                    Thời gian bắt đầu <span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <div className="d-flex align-items-center" style={{ gap: '4px' }}>
                                                                    <DatePicker
                                                                        selected={startDatePicker}
                                                                        onChange={date => {
                                                                            setStartDatePicker(date);
                                                                            setStartDate(date);
                                                                            setValue('start_date', date, { shouldValidate: true });
                                                                        }}
                                                                        locale={vi}
                                                                        dateFormat="dd/MM/yyyy HH:mm"
                                                                        className="form-control"
                                                                        placeholderText="Chọn thời gian bắt đầu"
                                                                        id="inputStartDateLarge"
                                                                        autoComplete="off"
                                                                        showTimeSelect
                                                                        timeFormat="HH:mm"
                                                                        timeIntervals={15}
                                                                        timeCaption="Giờ"
                                                                        popperPlacement="bottom-start"
                                                                    />
                                                                    <button type="button" tabIndex={-1} className="btn p-0 border-0 bg-transparent" style={{ height: '38px' }} onClick={() => document.getElementById('inputStartDateLarge')?.focus()}>
                                                                        <i className="fas fa-calendar-alt text-secondary"></i>
                                                                    </button>
                                                                    <input type="hidden" {...register('start_date', { required: 'Thời gian bắt đầu là bắt buộc' })} />
                                                                </div>
                                                                {isSubmitted && errors.start_date && <div className="text-danger mt-1 small">{errors.start_date.message}</div>}
                                                            </div>
                                                            <div className="col-12 col-xl-6">
                                                                <label htmlFor="inputEndDateLarge" className="form-label fw-semibold">
                                                                    Thời gian kết thúc <span style={{ color: 'red' }}>*</span>
                                                                </label>
                                                                <div className="d-flex align-items-center" style={{ gap: '4px' }}>
                                                                    <DatePicker
                                                                        selected={endDatePicker}
                                                                        onChange={date => {
                                                                            setEndDatePicker(date);
                                                                            setEndDate(date);
                                                                            setValue('end_date', date, { shouldValidate: true });
                                                                        }}
                                                                        locale={vi}
                                                                        dateFormat="dd/MM/yyyy HH:mm"
                                                                        className="form-control"
                                                                        placeholderText="Chọn thời gian kết thúc"
                                                                        id="inputEndDateLarge"
                                                                        autoComplete="off"
                                                                        showTimeSelect
                                                                        timeFormat="HH:mm"
                                                                        timeIntervals={15}
                                                                        timeCaption="Giờ"
                                                                        popperPlacement="bottom-start"
                                                                    />
                                                                    <button type="button" tabIndex={-1} className="btn p-0 border-0 bg-transparent" style={{ height: '38px' }} onClick={() => document.getElementById('inputEndDateLarge')?.focus()}>
                                                                        <i className="fas fa-calendar-alt text-secondary"></i>
                                                                    </button>
                                                                    <input type="hidden" {...register('end_date', { required: 'Thời gian kết thúc là bắt buộc' })} />
                                                                </div>
                                                                {isSubmitted && errors.end_date && <div className="text-danger mt-1 small">{errors.end_date.message}</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                            {/* Ngày bắt đầu và kết thúc - chỉ hiển thị trên mobile (< 768px) */}
                                            <div className="row mb-3 d-md-none">
                                                <div className="col-12 mb-3">
                                                    <label htmlFor="inputStartDateMobile" className="form-label fw-semibold">
                                                        Thời gian bắt đầu <span style={{ color: 'red' }}>*</span>
                                                    </label>
                                                    <div className="d-flex align-items-center" style={{ gap: '4px' }}>
                                                        <DatePicker
                                                            selected={startDatePicker}
                                                            onChange={date => {
                                                                setStartDatePicker(date);
                                                                setStartDate(date);
                                                                setValue('start_date', date, { shouldValidate: true });
                                                            }}
                                                            locale={vi}
                                                            dateFormat="dd/MM/yyyy HH:mm"
                                                            className="form-control"
                                                            placeholderText="Chọn thời gian bắt đầu"
                                                            id="inputStartDateMobile"
                                                            autoComplete="off"
                                                            showTimeSelect
                                                            timeFormat="HH:mm"
                                                            timeIntervals={15}
                                                            timeCaption="Giờ"
                                                            popperPlacement="bottom-start"
                                                        />
                                                        <button type="button" tabIndex={-1} className="btn p-0 border-0 bg-transparent" style={{ height: '38px' }} onClick={() => document.getElementById('inputStartDateMobile')?.focus()}>
                                                            <i className="fas fa-calendar-alt text-secondary"></i>
                                                        </button>
                                                        <input type="hidden" {...register('start_date', { required: 'Thời gian bắt đầu là bắt buộc' })} />
                                                    </div>
                                                    {isSubmitted && errors.start_date && <div className="text-danger mt-1 small">{errors.start_date.message}</div>}
                                                </div>
                                                <div className="col-12">
                                                    <label htmlFor="inputEndDateMobile" className="form-label fw-semibold">
                                                        Thời gian kết thúc <span style={{ color: 'red' }}>*</span>
                                                    </label>
                                                    <div className="d-flex align-items-center" style={{ gap: '4px' }}>
                                                        <DatePicker
                                                            selected={endDatePicker}
                                                            onChange={date => {
                                                                setEndDatePicker(date);
                                                                setEndDate(date);
                                                                setValue('end_date', date, { shouldValidate: true });
                                                            }}
                                                            locale={vi}
                                                            dateFormat="dd/MM/yyyy HH:mm"
                                                            className="form-control"
                                                            placeholderText="Chọn thời gian kết thúc"
                                                            id="inputEndDateMobile"
                                                            autoComplete="off"
                                                            showTimeSelect
                                                            timeFormat="HH:mm"
                                                            timeIntervals={15}
                                                            timeCaption="Giờ"
                                                            popperPlacement="bottom-start"
                                                        />
                                                        <button type="button" tabIndex={-1} className="btn p-0 border-0 bg-transparent" style={{ height: '38px' }} onClick={() => document.getElementById('inputEndDateMobile')?.focus()}>
                                                            <i className="fas fa-calendar-alt text-secondary"></i>
                                                        </button>
                                                        <input type="hidden" {...register('end_date', { required: 'Thời gian kết thúc là bắt buộc' })} />
                                                    </div>
                                                    {isSubmitted && errors.end_date && <div className="text-danger mt-1 small">{errors.end_date.message}</div>}
                                                </div>
                                            </div>

                                            {/* Sản phẩm trong combo */}
                                            <div className="row mt-4">
                                                <div className="col-12">
                                                    <div className="card shadow-sm border-0">
                                                        <div className="card-header d-flex justify-content-between align-items-center">
                                                            <h6 className="mb-0">Sản phẩm trong combo</h6>
                                                            <div className="d-flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-primary"
                                                                    onClick={handleAddItem}
                                                                >
                                                                    + Thêm sản phẩm
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="card-body pt-2">
                                                            <div className="table-responsive">
                                                                <table className="table table-bordered table-hover mb-0">
                                                                    <thead className="table-light">
                                                                        <tr>
                                                                            <th width="5%" className="text-center">STT</th>
                                                                            <th width="55%">Sản phẩm</th>
                                                                            <th width="20%" className="text-center">Số lượng</th>
                                                                            <th width="20%" className="text-center">Thao tác</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {comboItems.map((item, idx) => {
                                                                            const productStock = getProductStock(item.product_id);
                                                                            return (
                                                                            <tr key={idx}>
                                                                                <td className="text-center align-middle">
                                                                                    <span className="fw-semibold text-muted">{idx + 1}</span>
                                                                                </td>
                                                                                <td style={{ verticalAlign: 'middle', position: 'relative', zIndex: 10 }}>
                                                                                    <div style={{ minWidth: '280px' }}>
                                                                                        <Select
                                                                                            options={productOptions.filter(opt => !comboItems.some((it, i) => it.product_id === opt.value && i !== idx))}
                                                                                            value={productOptions.find(opt => String(opt.value) === String(item.product_id)) || null}
                                                                                            onChange={opt => {
                                                                                                handleChangeItem(idx, 'product_id', opt ? opt.value : '');
                                                                                            }}
                                                                                            placeholder="Tìm kiếm & chọn sản phẩm..."
                                                                                            classNamePrefix="react-select"
                                                                                            styles={{
                                                                                                ...selectStyles,
                                                                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                                                                valueContainer: (base) => ({ 
                                                                                                    ...base, 
                                                                                                    padding: '0 8px',
                                                                                                    display: 'flex',
                                                                                                    alignItems: 'center'
                                                                                                }),
                                                                                                input: (base) => ({
                                                                                                    ...base,
                                                                                                    margin: 0,
                                                                                                    padding: 0,
                                                                                                    position: 'absolute',
                                                                                                    opacity: 0
                                                                                                }),
                                                                                                singleValue: (base) => ({ 
                                                                                                    ...base, 
                                                                                                    margin: 0,
                                                                                                    position: 'relative',
                                                                                                    top: 0,
                                                                                                    transform: 'none',
                                                                                                    maxWidth: 'calc(100% - 8px)'
                                                                                                }),
                                                                                                control: (base) => ({
                                                                                                    ...base,
                                                                                                    minHeight: '60px'
                                                                                                })
                                                                                            }}
                                                                                            menuPortalTarget={document.body}
                                                                                            menuPosition="fixed"
                                                                                            components={{
                                                                                                Option: CustomOption,
                                                                                                SingleValue: CustomSingleValue
                                                                                            }}
                                                                                        />
                                                                                        {itemErrors[idx] && <div className="text-danger small mt-1">{itemErrors[idx]}</div>}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="text-center align-middle">
                                                                                    <div>
                                                                                        <input
                                                                                            type="number"
                                                                                            className="form-control form-control-sm"
                                                                                            min={1}
                                                                                            max={productStock ?? undefined}
                                                                                            value={item.quantity}
                                                                                            onChange={e => handleChangeItem(idx, 'quantity', e.target.value)}
                                                                                            onInput={e => enforceQuantityValidity(e.target, productStock)}
                                                                                            onInvalid={e => enforceQuantityValidity(e.target, productStock)}
                                                                                            placeholder="Số lượng"
                                                                                            style={{ width: '80px', margin: '0 auto' }}
                                                                                            required
                                                                                        />
                                                                                    </div>
                                                                                </td>
                                                                                <td className="text-center align-middle">
                                                                                    <button
                                                                                        type="button"
                                                                                        className="btn btn-sm btn-danger"
                                                                                        onClick={() => handleRemoveItem(idx)}
                                                                                        disabled={comboItems.length === 1}
                                                                                        title="Xóa sản phẩm"
                                                                                    >
                                                                                        <i className="fas fa-trash"></i>
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        )})}
                                                                    </tbody>
                                                                </table>
                                                            </div>
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
                                                            Mô tả combo
                                                        </label>
                                                        <CustomEditor
                                                            data={description}
                                                            onReady={() => register('description')}
                                                            onChange={data => setValue('description', data)}
                                                            folder='combos'
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
                                                                    // Nếu chọn chi nhánh, tự động tắt "Toàn hệ thống"
                                                                    if (values.length > 0) {
                                                                        setApplyToAllBranches(false);
                                                                    }
                                                                }}
                                                                placeholder="Tìm kiếm & chọn chi nhánh..."
                                                                classNamePrefix="react-select"
                                                                styles={{
                                                                    ...selectStyles,
                                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                                }}
                                                                menuPortalTarget={document.body}
                                                                menuPosition="fixed"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab Thời gian bán */}
                                    {activeTab === 'thoi-gian' && (
                                        <div className="tab-pane fade show active">
                                            <div className="row mb-3">
                                                <div className="col-md-12">
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold">Loại thời gian bán</label>
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="timeType"
                                                                id="flexibleTime"
                                                                checked={isFlexibleTime}
                                                                onChange={() => {
                                                                    setIsFlexibleTime(true);
                                                                    setSelectedTimeSlotIds([]);
                                                                }}
                                                            />
                                                            <label className="form-check-label" htmlFor="flexibleTime">
                                                                Bán linh hoạt
                                                            </label>
                                                        </div>
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="timeType"
                                                                id="fixedTime"
                                                                checked={!isFlexibleTime}
                                                                onChange={() => setIsFlexibleTime(false)}
                                                            />
                                                            <label className="form-check-label" htmlFor="fixedTime">
                                                                Thời gian cố định
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {!isFlexibleTime && (
                                                <div className="row mb-3">
                                                    <div className="col-md-12">
                                                        <div className="mb-3">
                                                            <label className="form-label fw-semibold">Chọn khung giờ bán</label>
                                                            <Select
                                                                options={timeSlotOptions}
                                                                isMulti
                                                                value={timeSlotOptions.filter(opt => selectedTimeSlotIds.includes(opt.value))}
                                                                onChange={opts => {
                                                                    const values = opts ? opts.map(opt => opt.value) : [];
                                                                    setSelectedTimeSlotIds(values);
                                                                }}
                                                                placeholder="Tìm kiếm & chọn khung giờ..."
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

                                {/* Nút hành động */}
                                <div className="mt-4 mb-0">
                                    <div className="d-flex justify-content-center detail-action-buttons">
                                        <Permission permission={PERMISSIONS.COMBOS_DELETE}>
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => setShowDeleteModal(true)}
                                                disabled={isSubmitting}
                                            >
                                                <i className="fas fa-trash me-1"></i><span className="d-none d-sm-inline">Xóa</span>
                                            </button>
                                        </Permission>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => navigation('/combo')}
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
                                            <span className="d-none d-sm-inline">{isSubmitting ? "Đang gửi..." : "Cập nhật"}</span>
                                            {isSubmitting && <span className="d-sm-none">...</span>}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Bạn chắc chắn muốn xóa combo này?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="danger"
                        onClick={async () => {
                            setShowDeleteModal(false);
                            try {
                                dispatch(actions.controlLoading(true));
                                const response = await requestApi(`api/admin/combos/${params.id}`, 'DELETE', []);
                                dispatch(actions.controlLoading(false));
                                if (response.data && response.data.success) {
                                    toast.success(response.data.message || "Xóa combo thành công!", toastSuccessConfig);
                                    navigation('/combo');
                                } else {
                                    toast.error(response.data.message || "Xóa combo thất bại", toastErrorConfig);
                                }
                            } catch (e) {
                                dispatch(actions.controlLoading(false));
                                if (e.response && e.response.data && e.response.data.message) {
                                    toast.error(e.response.data.message, toastErrorConfig);
                                } else {
                                    toast.error("Lỗi khi xóa combo", toastErrorConfig);
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

export default ComboUpdate;