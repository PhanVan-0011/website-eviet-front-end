import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';

const Import = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [importItems, setImportItems] = useState([]);
  const [formData, setFormData] = useState({
    import_code: '',
    status: 'draft',
    total_amount: 0,
    discount: 0,
    payable_amount: 0,
    paid_amount: 0,
    payment_method: 'Tiền mặt',
    notes: ''
  });

  // Set người nhập mặc định là người dùng hiện tại
  const setDefaultUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const currentUser = JSON.parse(userData);
      setSelectedUser({
        value: currentUser.id,
        label: currentUser.name || currentUser.username || 'N/A',
        data: currentUser
      });
    }
  };

  // Set chi nhánh mặc định từ localStorage hoặc header
  const setDefaultBranch = () => {
    try {
      const selectedBranchData = localStorage.getItem('selectedBranch');
      if (selectedBranchData) {
        const branch = JSON.parse(selectedBranchData);
        setSelectedBranch(branch);
      }
    } catch (error) {
      console.error('Error parsing selected branch:', error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchProducts(''); // Load tất cả sản phẩm ban đầu
    fetchUsers();
    fetchBranches();
    setDefaultUser(); // Set default user
    setDefaultBranch(); // Set default branch
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Tính toán totals khi importItems hoặc discount thay đổi
  useEffect(() => {
    calculateTotals();
  }, [importItems, formData.discount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search logic - giảm từ 400ms xuống 200ms để phản hồi nhanh hơn
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchKeyword(searchInput);
      if (searchInput || searchInput === '') {
        fetchProducts(searchInput);
      }
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const fetchSuppliers = async () => {
    try {
      const response = await requestApi('api/admin/suppliers?limit=1000', 'GET');
      if (response.data && response.data.data) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Không thể tải danh sách nhà cung cấp', toastErrorConfig);
    }
  };

  const fetchProducts = async (keyword = '') => {
    try {
      const endpoint = keyword 
        ? `api/admin/products/search-for-purchase?keyword=${encodeURIComponent(keyword)}`
        : 'api/admin/products/search-for-purchase?keyword=';
      
      const response = await requestApi(endpoint, 'GET');
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await requestApi('api/admin/users?limit=1000', 'GET');
      if (response.data && response.data.data) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng', toastErrorConfig);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await requestApi('api/admin/branches?limit=1000', 'GET');
      if (response.data && response.data.data) {
        setBranches(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Không thể tải danh sách chi nhánh', toastErrorConfig);
    }
  };

  const calculateTotals = () => {
    const totalAmount = importItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const payableAmount = totalAmount - formData.discount;
    
    setFormData(prev => ({
      ...prev,
      total_amount: totalAmount,
      payable_amount: payableAmount
    }));
  };

  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleRemoveSupplier = () => {
    setSelectedSupplier(null);
  };

  const handleItemChange = (id, field, value) => {
    setImportItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total = (updatedItem.quantity || 0) * (updatedItem.unit_price || 0);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveItem = (id) => {
    setImportItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      code: '',
      name: '',
      unit: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
      product_id: null
    };
    setImportItems(prev => [...prev, newItem]);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    // Validate
    if (!selectedSupplier) {
      toast.error('Vui lòng chọn nhà cung cấp!', toastErrorConfig);
      return;
    }
    if (!selectedUser) {
      toast.error('Vui lòng chọn người nhập!', toastErrorConfig);
      return;
    }
    if (!selectedBranch) {
      toast.error('Vui lòng chọn chi nhánh!', toastErrorConfig);
      return;
    }
    if (importItems.length === 0) {
      toast.error('Vui lòng thêm sản phẩm!', toastErrorConfig);
      return;
    }
    
    // Validate product_id for all items
    const invalidItems = importItems.filter(item => !item.product_id);
    if (invalidItems.length > 0) {
      toast.error('Vui lòng chọn sản phẩm từ danh sách tìm kiếm, không được nhập thủ công!', toastErrorConfig);
      return;
    }

    setIsLoading(true);
    dispatch(actions.controlLoading(true));
    try {
      const payload = {
        supplier_id: parseInt(selectedSupplier.id),
        user_id: parseInt(selectedUser.value),
        branch_id: parseInt(selectedBranch.id),
        invoice_date: selectedDate.toISOString(),
        status: 'draft',
        discount_amount: parseFloat(formData.discount) || 0,
        paid_amount: parseFloat(formData.paid_amount) || 0,
        notes: formData.notes || '',
        details: importItems.map(item => ({
          product_id: parseInt(item.product_id),
          unit_of_measure: item.unit,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price)
        }))
      };
      
      console.log('=== PAYLOAD BEFORE SUBMIT (DRAFT) ===', payload);
      
      const response = await requestApi('api/admin/purchase-invoices', 'POST', payload);
      dispatch(actions.controlLoading(false));
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Lưu phiếu nhập nháp thành công!', toastSuccessConfig);
        navigate('/import');
      } else {
        toast.error(response.data.message || 'Lưu phiếu nhập nháp thất bại', toastErrorConfig);
      }
    } catch (error) {
      console.error('Error saving import:', error);
      dispatch(actions.controlLoading(false));
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message, toastErrorConfig);
      } else {
        toast.error('Có lỗi xảy ra khi lưu phiếu nhập!', toastErrorConfig);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    // Validate
    if (!selectedSupplier) {
      toast.error('Vui lòng chọn nhà cung cấp!', toastErrorConfig);
      return;
    }
    if (!selectedUser) {
      toast.error('Vui lòng chọn người nhập!', toastErrorConfig);
      return;
    }
    if (!selectedBranch) {
      toast.error('Vui lòng chọn chi nhánh!', toastErrorConfig);
      return;
    }
    if (importItems.length === 0) {
      toast.error('Vui lòng thêm sản phẩm!', toastErrorConfig);
      return;
    }
    
    // Validate product_id for all items
    const invalidItems = importItems.filter(item => !item.product_id);
    if (invalidItems.length > 0) {
      toast.error('Vui lòng chọn sản phẩm từ danh sách tìm kiếm, không được nhập thủ công!', toastErrorConfig);
      return;
    }

    setIsLoading(true);
    dispatch(actions.controlLoading(true));
    try {
      const payload = {
        supplier_id: parseInt(selectedSupplier.id),
        user_id: parseInt(selectedUser.value),
        branch_id: parseInt(selectedBranch.id),
        invoice_date: selectedDate.toISOString(),
        status: 'received',
        discount_amount: parseFloat(formData.discount) || 0,
        paid_amount: parseFloat(formData.paid_amount) || 0,
        notes: formData.notes || '',
        details: importItems.map(item => ({
          product_id: parseInt(item.product_id),
          unit_of_measure: item.unit,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price)
        }))
      };
      
      console.log('=== PAYLOAD BEFORE SUBMIT (COMPLETE) ===', payload);
      
      const response = await requestApi('api/admin/purchase-invoices', 'POST', payload);
      dispatch(actions.controlLoading(false));
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Hoàn thành phiếu nhập thành công!', toastSuccessConfig);
        navigate('/import');
      } else {
        toast.error(response.data.message || 'Hoàn thành phiếu nhập thất bại', toastErrorConfig);
      }
    } catch (error) {
      console.error('Error completing import:', error);
      dispatch(actions.controlLoading(false));
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message, toastErrorConfig);
      } else {
        toast.error('Có lỗi xảy ra khi hoàn thành phiếu nhập!', toastErrorConfig);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setImportItems([
      {
        id: Date.now(),
        code: '',
        name: '',
        unit: '',
        quantity: 1,
        unit_price: 0,
        total: 0,
        product_id: null
      }
    ]);
    setFormData({
      import_code: '',
      status: 'draft',
      total_amount: 0,
      discount: 0,
      payable_amount: 0,
      paid_amount: 0,
      payment_method: 'Tiền mặt',
      notes: ''
    });
    setSelectedSupplier(null);
    setSelectedBranch(null);
  };

  // Hàm format giá tiền VND (chỉ số, không ký hiệu) - dùng cho input
  const formatVND = (value) => {
    if (typeof value === 'string') {
      value = value.replace(/\D/g, '');
    } else {
      // Làm tròn thành số nguyên để tránh số thập phân
      value = String(Math.round(value) || '');
    }
    if (!value) return '';
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Hàm format hiển thị VND với ký hiệu - dùng cho display
  const formatVNDDisplay = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Tạo options cho react-select
  const productOptions = products.map(p => ({
    value: p.product_id,
    label: `${p.unit_code || 'N/A'} - ${p.display_name || 'N/A'} (${p.unit_name || 'N/A'})`,
    data: p
  }));

  const supplierOptions = suppliers.map(s => ({
    value: s.id,
    label: `${s.name || 'N/A'} - ${s.code || 'N/A'}`,
    data: s
  }));

  const userOptions = users.map(u => ({
    value: u.id,
    label: u.name || u.username || 'N/A',
    data: u
  }));

  const branchOptions = branches.map(b => ({
    value: b.id,
    label: b.name || 'N/A',
    data: b
  }));

  // Xử lý khi chọn sản phẩm từ react-select
  const handleProductSelect = (selectedOption) => {
    if (selectedOption && selectedOption.data) {
      const product = selectedOption.data;
      
      // ✅ Kiểm tra xem sản phẩm này đã tồn tại chưa (cùng product_id và unit_name)
      const existingItem = importItems.find(
        item => item.product_id === product.product_id && item.unit === product.unit_name
      );
      
      if (existingItem) {
        // Nếu đã tồn tại với cùng unit → tăng số lượng lên 1
        handleItemChange(existingItem.id, 'quantity', existingItem.quantity + 1);
        
        setSelectedProduct(null);
        return;
      }
      
      // Lọc tất cả units của sản phẩm này từ products array
      const allUnitsOfProduct = products.filter(p => p.product_id === product.product_id);
      
      // Parse cost_price an toàn (loại bỏ dấu . nếu có)
      const costPrice = typeof product.cost_price === 'string' 
        ? parseFloat(product.cost_price.replace(/\./g, '')) 
        : parseFloat(product.cost_price) || 0;
      
      // Tạo item mới với unit đầu tiên được chọn
      const newItem = {
        id: Date.now(),
        product_id: product.product_id,
        code: product.unit_code || '',
        name: product.display_name || '',
        unit: product.unit_name || 'Hộp',
        quantity: 1,
        unit_price: costPrice,
        total: costPrice,
        image_url: product.image_url || null,
        availableUnits: allUnitsOfProduct, // Lưu tất cả units
        selectedUnitIndex: allUnitsOfProduct.findIndex(u => 
          u.unit_code === product.unit_code
        ) // Index của unit đang chọn
      };
      setImportItems(prev => [...prev, newItem]);
      setSelectedProduct(null); // Reset selection
    }
  };

  // Xử lý khi đổi đơn vị
  const handleUnitChange = (itemId, newUnitIndex) => {
    setImportItems(prev => prev.map(item => {
      if (item.id === itemId && item.availableUnits) {
        const newUnit = item.availableUnits[newUnitIndex];
        if (newUnit) {
          // ✅ Kiểm tra xem unit mới này có bị trùng với sản phẩm khác không
          const isDuplicateUnit = importItems.some(
            existingItem => 
              existingItem.id !== itemId && 
              existingItem.product_id === item.product_id && 
              existingItem.unit === newUnit.unit_name
          );
          
          if (isDuplicateUnit) {
            toast.error(
              `Sản phẩm này đã tồn tại với đơn vị "${newUnit.unit_name}". Không được phép đổi sang unit này!`,
              toastErrorConfig
            );
            return item; // Không thay đổi gì
          }
          
          // Parse cost_price an toàn (loại bỏ dấu . nếu có)
          const newUnitPrice = typeof newUnit.cost_price === 'string'
            ? parseFloat(newUnit.cost_price.replace(/\./g, ''))
            : parseFloat(newUnit.cost_price) || 0;
          const newTotal = item.quantity * newUnitPrice;
          return {
            ...item,
            selectedUnitIndex: newUnitIndex,
            code: newUnit.unit_code,
            name: newUnit.display_name,
            unit: newUnit.unit_name,
            unit_price: newUnitPrice,
            total: newTotal
          };
        }
      }
      return item;
    }));
  };

  // Xử lý tìm kiếm động khi người dùng gõ
  const handleSearchInputChange = (inputValue) => {
    setSearchInput(inputValue);
  };

  // Custom styles cho react-select
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '38px',
      borderColor: '#ced4da',
      '&:hover': {
        borderColor: '#86b7fe'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#e7f1ff' : 'white',
      color: state.isSelected ? 'white' : '#212529',
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px'
    })
  };

  // Custom Option component với hình ảnh
  const CustomOption = ({ innerRef, innerProps, data, isSelected, isFocused }) => {
    const imageUrl = data.data?.image_url 
      ? `${process.env.REACT_APP_IMAGE_SERVER_URL}${data.data.image_url}`
      : null;

    console.log('CustomOption - imageUrl:', imageUrl);
    console.log('CustomOption - data.data?.image_url:', data.data?.image_url);
    console.log('CustomOption - REACT_APP_IMAGE_SERVER_URL:', process.env.REACT_APP_IMAGE_SERVER_URL);
    console.log('CustomOption - full data:', data.data);

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
            alt={data.data?.display_name || 'Product'}
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
            <span className="badge bg-primary me-2">{data.data?.unit_code || 'N/A'}</span>
            {data.data?.display_name || 'N/A'}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Tồn: {data.data?.total_stock || 0} | Giá: {formatVNDDisplay(data.data?.cost_price || 0)}
          </div>
        </div>
      </div>
    );
  };

  // Custom SingleValue component với hình ảnh
  const CustomSingleValue = ({ data }) => {
    const imageUrl = data.data?.image_url 
      ? `${process.env.REACT_APP_IMAGE_SERVER_URL}${data.data.image_url}`
      : null;
 


    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={data.data?.display_name || 'Product'}
            style={{
              width: '24px',
              height: '24px',
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
              width: '24px',
              height: '24px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginRight: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#6c757d'
            }}
          >
            <i className="fas fa-image"></i>
          </div>
        )}
        <span>{data.label}</span>
      </div>
    );
  };


  return (
    <div className="container-fluid mt-4" style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', paddingBottom: 0, overflow: 'hidden' }}>
      {/* Nút quay lại + Thanh tìm kiếm cùng 1 hàng */}
      <div className="d-flex align-items-center mb-3 gap-2">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/')}
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h4 className="mb-0" style={{ minWidth: '120px' }}>Nhập hàng</h4>
        
        {/* Thanh tìm kiếm sản phẩm với react-select */}
        <div className="position-relative" style={{ width: '400px', zIndex: 100 }}>
          <Select
            value={selectedProduct}
            onChange={handleProductSelect}
            onInputChange={handleSearchInputChange}
            options={productOptions}
            components={{
              Option: CustomOption,
              SingleValue: CustomSingleValue
            }}
            styles={{
              ...selectStyles,
              control: (provided) => ({
                ...provided,
                minHeight: '38px',
                borderColor: '#ced4da',
                paddingRight: '40px',
                '&:hover': {
                  borderColor: '#86b7fe'
                }
              }),
              menu: (provided) => ({
                ...provided,
                zIndex: 9999
              })
            }}
            placeholder="Tìm hàng hóa theo mã hoặc tên"
            isClearable
            isSearchable
            className="w-100"
          />
          <Link 
            to="/product/add" 
            className="btn btn-outline-primary btn-sm position-absolute"
            title="Thêm sản phẩm mới"
            style={{ 
              right: '8px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              zIndex: 10,
              padding: '2px 6px'
            }}
          >
            <i className="fas fa-plus"></i>
          </Link>
        </div>
      </div>

      {/* Main Content - 2 khối song song */}
      <div className="d-flex gap-3 flex-grow-1" style={{ minHeight: 0, paddingBottom: '1rem', overflow: 'hidden' }}>
        {/* Phần bên trái - Bảng (60%) */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          {/* Bảng sản phẩm */}
          <div className="card shadow-sm" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <div className="card-header bg-light">
              <h6 className="mb-0 fw-bold">Danh sách sản phẩm nhập</h6>
            </div>
            <div className="card-body p-0 d-flex flex-column" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div className="table-responsive flex-grow-1" style={{ overflowY: 'auto', overflowX: 'auto' }}>
                <table className="table table-hover table-bordered mb-0">
                  <thead className="table-light position-sticky top-0 bg-light" style={{ zIndex: 10 }}>
                    <tr>
                      <th className="text-center" style={{ width: '4%' }}></th>
                      <th className="text-center" style={{ width: '4%' }}>STT</th>
                      <th style={{ width: '12%' }}>Mã hàng</th>
                      <th style={{ width: '30%' }}>Tên hàng</th>
                      <th style={{ width: '12%' }}>ĐVT</th>
                      <th style={{ width: '12%' }}>Số lượng</th>
                      <th style={{ width: '13%' }}>Đơn giá</th>
                      <th style={{ width: '13%' }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importItems.map((item, index) => (
                      <tr key={item.id}>
                        <td className="text-center align-middle">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveItem(item.id)}
                            title="Xóa sản phẩm"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                        <td className="text-center align-middle">
                          {index + 1}
                        </td>
                        <td className="align-middle">
                          <input
                            type="text"
                            className="form-control form-control-sm bg-light"
                            value={item.code}
                            readOnly
                            placeholder="Mã sản phẩm"
                          />
                        </td>
                        <td className="align-middle">
                          <input
                            type="text"
                            className="form-control form-control-sm bg-light"
                            value={item.name}
                            readOnly
                            placeholder="Tên sản phẩm"
                          />
                        </td>
                        <td className="align-middle">
                          {item.availableUnits && item.availableUnits.length > 1 ? (
                            <select
                              className="form-select form-select-sm"
                              value={item.selectedUnitIndex}
                              onChange={(e) => handleUnitChange(item.id, parseInt(e.target.value))}
                            >
                              {item.availableUnits.map((unit, index) => (
                                <option key={index} value={index}>
                                  {unit.unit_name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              className="form-control form-control-sm bg-light"
                              value={item.unit}
                              readOnly
                              placeholder="ĐVT"
                            />
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm text-center"
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (isNaN(val) || val <= 0) {
                                handleItemChange(item.id, 'quantity', '');
                              } else {
                                handleItemChange(item.id, 'quantity', val);
                              }
                            }}
                            placeholder="0"
                            min="0"
                            step="1"
                          />
                        </td>
                        <td>
                          <div className="input-group input-group-sm">
                            <input
                              type="text"
                              className="form-control form-control-sm text-end"
                              value={item.unit_price === 0 || item.unit_price === '' ? '' : formatVND(item.unit_price)}
                              onChange={(e) => {
                                const formatted = formatVND(e.target.value);
                                const rawValue = Number(formatted.replace(/\./g, '')) || 0;
                                handleItemChange(item.id, 'unit_price', rawValue);
                              }}
                              placeholder="0"
                            />
                            <span className="input-group-text">₫</span>
                          </div>
                        </td>
                        <td className="text-end align-middle">
                          <span className="fw-bold text-primary">{formatVNDDisplay(item.total)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Phần bên phải - Thông tin phiếu nhập (40%) */}
        <div style={{ width: '40%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="card shadow-sm" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
            <div className="card-header bg-light">
              <h6 className="mb-0 fw-bold">Thông tin phiếu nhập</h6>
            </div>
            <div className="card-body" style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: 0 }}>
              {/* Người nhập và Ngày nhập */}
              <div className="row mb-3">
                <div className="col-6">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-user me-2 text-primary"></i>
                    <Select
                      value={selectedUser}
                      onChange={setSelectedUser}
                      options={userOptions}
                      styles={{
                        ...selectStyles,
                        control: (provided) => ({
                          ...provided,
                          minHeight: '32px',
                          fontSize: '14px'
                        })
                      }}
                      placeholder="Người nhập"
                      isClearable
                      isSearchable
                    />
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-calendar me-2 text-primary"></i>
                    <DatePicker
                      selected={selectedDate}
                      onChange={setSelectedDate}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy HH:mm"
                      locale={vi}
                      className="form-control form-control-sm"
                      placeholderText="Ngày nhập"
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin nhà cung cấp */}
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label fw-semibold">Nhà cung cấp</label>
                <div className="col-sm-8">
                  <div className="position-relative">
                    <Select
                      value={selectedSupplier ? { value: selectedSupplier.id, label: `${selectedSupplier.name} - ${selectedSupplier.code}` } : null}
                      onChange={(option) => {
                        if (option) {
                          const supplier = suppliers.find(s => s.id === option.value);
                          if (supplier) handleSupplierSelect(supplier);
                        } else {
                          setSelectedSupplier(null);
                        }
                      }}
                      options={supplierOptions}
                      styles={{
                        ...selectStyles,
                        control: (provided) => ({
                          ...provided,
                          minHeight: '38px',
                          borderColor: '#ced4da',
                          paddingRight: '40px',
                          '&:hover': {
                            borderColor: '#86b7fe'
                          }
                        })
                      }}
                      placeholder="Chọn nhà cung cấp"
                      isClearable
                      isSearchable
                      className="w-100"
                    />
                    <Link 
                      to="/supplier/add" 
                      className="btn btn-outline-primary btn-sm position-absolute"
                      title="Thêm nhà cung cấp mới"
                      style={{ 
                        right: '8px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        padding: '2px 6px'
                      }}
                    >
                      <i className="fas fa-plus"></i>
                    </Link>
                  </div>
                {selectedSupplier && (
                  <div className="mt-1">
                    <small className="text-muted">Nợ: {formatVNDDisplay(selectedSupplier.balance_due || 0)}</small>
                  </div>
                )}
                </div>
              </div>

              {/* Mã phiếu nhập */}
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label fw-semibold">Mã phiếu nhập</label>
                <div className="col-sm-8">
                <div className="d-flex">
                  <input
                    type="text"
                    className="form-control"
                    value={formData.import_code}
                    onChange={(e) => handleFormChange('import_code', e.target.value)}
                      placeholder="Mã phiếu tự động"
                  />
                  </div>
                </div>
              </div>

              {/* Trạng thái */}
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label fw-semibold">Trạng thái</label>
                <div className="col-sm-8">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-secondary">Nháp</span>
                  </div>
                </div>
              </div>

              {/* Tổng tiền hàng */}
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label fw-semibold">
                  Tổng tiền hàng
                  <span className="badge bg-primary ms-1">{importItems.length}</span>
                </label>
                <div className="col-sm-8">
                <input
                  type="text"
                    className="form-control fw-bold text-end"
                  value={formatVNDDisplay(formData.total_amount)}
                  readOnly
                    style={{ backgroundColor: '#f8f9fa' }}
                />
                </div>
              </div>

              {/* Giảm giá */}
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label fw-semibold">Giảm giá</label>
                <div className="col-sm-8">
                <input
                  type="text"
                    className="form-control text-end"
                  value={formData.discount === 0 || formData.discount === '' ? '' : formatVND(formData.discount)}
                    onChange={(e) => {
                      const formatted = formatVND(e.target.value);
                      const rawValue = Number(formatted.replace(/\./g, '')) || 0;
                      if (rawValue >= 0) {
                        handleFormChange('discount', rawValue);
                      }
                    }}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Cần trả nhà cung cấp */}
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label fw-semibold text-primary">Cần trả NCC</label>
                <div className="col-sm-8">
                <input
                  type="text"
                    className="form-control fw-bold text-end text-primary"
                  value={formatVNDDisplay(formData.payable_amount)}
                  readOnly
                    style={{ backgroundColor: '#f8f9fa', fontSize: '1.1rem' }}
                />
                </div>
              </div>

              {/* Tiền trả nhà cung cấp */}
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label fw-semibold">
                  Tiền trả NCC
                  <i className="fas fa-credit-card ms-1 text-primary"></i>
                </label>
                <div className="col-sm-8">
                <input
                  type="text"
                    className="form-control text-end"
                  value={formData.paid_amount === 0 || formData.paid_amount === '' ? '' : formatVND(formData.paid_amount)}
                    onChange={(e) => {
                      const formatted = formatVND(e.target.value);
                      const rawValue = Number(formatted.replace(/\./g, '')) || 0;
                      if (rawValue >= 0) {
                        handleFormChange('paid_amount', rawValue);
                      }
                    }}
                    placeholder="0"
                />
                <div className="mt-1">
                    <small className="text-muted">Tiền mặt</small>
                  </div>
                </div>
              </div>

              {/* Công nợ */}
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label fw-semibold text-danger">Công nợ</label>
                <div className="col-sm-8">
                <input
                  type="text"
                    className="form-control fw-bold text-end text-danger"
                  value={formatVNDDisplay(formData.payable_amount - formData.paid_amount)}
                  readOnly
                    style={{ backgroundColor: '#fff5f5' }}
                />
                </div>
              </div>

              {/* Ghi chú */}
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label fw-semibold">Ghi chú</label>
                <div className="col-sm-8">
                  <textarea
                    className="form-control import-notes"
                    value={formData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Nhập ghi chú..."
                  />
                </div>
              </div>
            </div>

            {/* Nút hành động - Cố định ở dưới */}
            <div className="d-flex gap-2" style={{ padding: '1rem', borderTop: '1px solid #dee2e6', flexShrink: 0, backgroundColor: 'white' }}>
              <button
                className="btn btn-primary flex-fill"
                onClick={handleSaveDraft}
                disabled={isLoading}
                style={{ display: formData.status === 'received' ? 'none' : 'block' }}
              >
                <i className="fas fa-save me-1"></i>
                Lưu tạm
              </button>
              <button
                className="btn btn-success flex-fill"
                onClick={handleComplete}
                disabled={isLoading}
              >
                <i className="fas fa-check me-1"></i>
                Hoàn thành
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Import;
