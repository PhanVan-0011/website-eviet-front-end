import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment';
import { actions } from '../../redux/actions';
import requestApi from '../../helpers/api';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';

const Import = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [importItems, setImportItems] = useState([
    {
      id: 1,
      code: 'SP000015',
      name: 'Sữa Vinamilk 180ml',
      unit: 'Hộp',
      quantity: 1,
      unit_price: 5000,
      discount: 0,
      total: 5000,
      notes: 'Ghi chú...',
      featured_image: { thumb_url: 'sua-vinamilk.jpg' }
    }
  ]);
  const [formData, setFormData] = useState({
    import_code: '',
    status: 'Phiếu tạm',
    total_amount: 0,
    discount: 0,
    supplier_return_cost: 0,
    payable_amount: 0,
    paid_amount: 0,
    payment_method: 'Tiền mặt',
    debt_amount: 0
  });

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
    fetchUsers();
    calculateTotals();
    setDefaultUser(); // Set default user
  }, [importItems, formData.discount, formData.supplier_return_cost]);

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

  // Debug logs
  useEffect(() => {
    console.log('Products:', products);
    console.log('Product Options:', productOptions);
  }, [products]);

  useEffect(() => {
    console.log('Users:', users);
    console.log('User Options:', userOptions);
  }, [users]);

  useEffect(() => {
    console.log('Suppliers:', suppliers);
    console.log('Supplier Options:', supplierOptions);
  }, [suppliers]);

  const fetchSuppliers = async () => {
    try {
      const response = await requestApi('api/admin/suppliers?limit=1000', 'GET');
      if (response.data && response.data.data) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      // Fallback data for testing
      setSuppliers([
        { id: 1, name: 'Nhà cung cấp A', code: 'NCC001', balance_due: 1000000 },
        { id: 2, name: 'Nhà cung cấp B', code: 'NCC002', balance_due: 500000 },
        { id: 3, name: 'Nhà cung cấp C', code: 'NCC003', balance_due: 0 }
      ]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await requestApi('api/admin/products?limit=1000', 'GET');
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback data for testing theo cấu trúc API thực tế
      setProducts([
        { 
          id: 15,
          product_code: 'SP000015',
          name: 'Sữa Vinamilk 180ml',
          description: 'Sữa tươi nguyên chất',
          status: 1,
          featured_image: { thumb_url: 'sua-vinamilk.jpg' },
          categories: [],
          stock_quantity: 100, // Thêm field này cho tính năng hiển thị tồn kho
          sale_price: 5000, // Thêm field này cho giá bán
          unit: 'Hộp' // Thêm field này cho đơn vị tính
        },
        { 
          id: 17,
          product_code: 'SP000017',
          name: 'Trà xanh Wonder 345ml',
          description: 'Trà xanh thiên nhiên',
          status: 1,
          featured_image: { thumb_url: 'tra-xanh.jpg' },
          categories: [],
          stock_quantity: 30,
          sale_price: 1000,
          unit: 'Chai'
        }
      ]);
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
      // Fallback data for testing
      setUsers([
        { id: 1, name: 'Nguyễn Văn A', username: 'admin1' },
        { id: 2, name: 'Trần Thị B', username: 'user1' },
        { id: 3, name: 'Lê Văn C', username: 'user2' }
      ]);
    }
  };

  const calculateTotals = () => {
    const totalAmount = importItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const payableAmount = totalAmount - formData.discount - formData.supplier_return_cost;
    const debtAmount = payableAmount - formData.paid_amount;
    
    setFormData(prev => ({
      ...prev,
      total_amount: totalAmount,
      payable_amount: payableAmount,
      debt_amount: debtAmount
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
        if (field === 'quantity' || field === 'unit_price' || field === 'discount') {
          updatedItem.total = (updatedItem.quantity || 0) * (updatedItem.unit_price || 0) - (updatedItem.discount || 0);
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
      discount: 0,
      total: 0,
      notes: ''
    };
    setImportItems(prev => [...prev, newItem]);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        supplier_id: selectedSupplier?.id,
        items: importItems
      };
      
      const response = await requestApi('/api/admin/imports', 'POST', payload);
      if (response.data && response.data.success) {
        toast.success('Lưu phiếu nhập tạm thành công!');
        // Reset form sau khi lưu thành công
        resetForm();
      }
    } catch (error) {
      console.error('Error saving import:', error);
      toast.error('Có lỗi xảy ra khi lưu phiếu nhập!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        status: 'Hoàn thành',
        supplier_id: selectedSupplier?.id,
        items: importItems
      };
      
      const response = await requestApi('/api/admin/imports', 'POST', payload);
      if (response.data && response.data.success) {
        toast.success('Hoàn thành phiếu nhập thành công!');
        // Reset form sau khi hoàn thành
        resetForm();
      }
    } catch (error) {
      console.error('Error completing import:', error);
      toast.error('Có lỗi xảy ra khi hoàn thành phiếu nhập!');
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
        discount: 0,
        total: 0,
        notes: ''
      }
    ]);
    setFormData({
      import_code: '',
      status: 'Phiếu tạm',
      total_amount: 0,
      discount: 0,
      supplier_return_cost: 0,
      payable_amount: 0,
      paid_amount: 0,
      payment_method: 'Tiền mặt',
      debt_amount: 0
    });
    setSelectedSupplier(null);
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Tạo options cho react-select
  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.product_code || 'N/A'} - ${p.name || 'N/A'} (Tồn: ${p.stock_quantity || p.stock || 0}, Giá: ${formatVND(p.sale_price || 0)})`,
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

  // Xử lý khi chọn sản phẩm từ react-select
  const handleProductSelect = (selectedOption) => {
    if (selectedOption && selectedOption.data) {
      const product = selectedOption.data;
      const newItem = {
        id: Date.now(),
        code: product.product_code || product.code || product.sku || '',
        name: product.name || '',
        unit: product.unit || 'Hộp',
        quantity: 1,
        unit_price: product.sale_price || product.price || 0,
        discount: 0,
        total: product.sale_price || product.price || 0,
        notes: '',
        featured_image: product.featured_image || null
      };
      setImportItems(prev => [...prev, newItem]);
      setSelectedProduct(null); // Reset selection
    }
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
            {data.data?.product_code || data.data?.code || 'N/A'} - {data.data?.name || 'N/A'}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Tồn: {data.data?.stock_quantity || data.data?.stock || 0} | Giá: {formatVND(data.data?.sale_price || 0)}
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
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={data.data?.name || 'Product'}
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
    <div className="container-fluid mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 gap-4">
        {/* Phần bên trái - Tìm kiếm với border (70%) */}
        <div style={{ width: '70%' }} className="border rounded p-3">
          <div className="d-flex align-items-center mb-3">
            <button
              className="btn btn-outline-secondary me-3"
              onClick={() => navigate('/')}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <h4 className="mb-0 me-4">Nhập hàng</h4>
            
            {/* Thanh tìm kiếm sản phẩm với react-select */}
            <div className="position-relative" style={{ width: '400px' }}>
              <Select
                value={selectedProduct}
                onChange={handleProductSelect}
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

          {/* Bảng sản phẩm */}
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0 fw-bold">Danh sách sản phẩm nhập</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th width="4%" className="text-center"></th>
                      <th width="4%" className="text-center">STT</th>
                      <th width="12%">Mã hàng</th>
                      <th width="25%">Tên hàng</th>
                      <th width="10%">ĐVT</th>
                      <th width="10%">Số lượng</th>
                      <th width="12%">Đơn giá</th>
                      <th width="10%">Giảm giá</th>
                      <th width="13%">Thành tiền</th>
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
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={item.code}
                            onChange={(e) => handleItemChange(item.id, 'code', e.target.value)}
                            placeholder="Mã sản phẩm"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={item.name}
                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                            placeholder="Tên sản phẩm"
                          />
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={item.unit}
                            onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                          >
                            <option value="Hộp">Hộp</option>
                            <option value="Can">Can</option>
                            <option value="Thùng">Thùng</option>
                            <option value="Chai">Chai</option>
                            <option value="Kg">Kg</option>
                            <option value="Gói">Gói</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm text-center"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm text-end"
                            value={item.unit_price}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (value >= 0) {
                                handleItemChange(item.id, 'unit_price', value);
                              }
                            }}
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm text-end"
                            value={item.discount}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (value >= 0) {
                                handleItemChange(item.id, 'discount', value);
                              }
                            }}
                            min="0"
                          />
                        </td>
                        <td className="text-end align-middle">
                          <span className="fw-bold text-primary">{formatVND(item.total)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Phần bên phải - Thông tin phiếu nhập (30%) */}
        <div style={{ width: '30%' }}>
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0 fw-bold">Thông tin phiếu nhập</h6>
            </div>
            <div className="card-body">
              {/* Người nhập và Ngày nhập cùng hàng với icon */}
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
                      placeholder="Chọn người nhập"
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
                      placeholderText="Chọn ngày và giờ"
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
                    <small className="text-muted">Nợ: {formatVND(selectedSupplier.balance_due || 0)}</small>
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
                    <span className="badge bg-warning text-dark">{formData.status}</span>
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
                  value={formatVND(formData.total_amount)}
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
                  type="number"
                    className="form-control text-end"
                  value={formData.discount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (value >= 0) {
                        handleFormChange('discount', value);
                      }
                    }}
                    placeholder="15"
                    min="0"
                  />
                </div>
              </div>

              {/* Chi phí nhập trả NCC */}
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label fw-semibold">Chi phí trả NCC</label>
                <div className="col-sm-8">
                <input
                  type="number"
                    className="form-control text-end"
                  value={formData.supplier_return_cost}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (value >= 0) {
                        handleFormChange('supplier_return_cost', value);
                      }
                    }}
                    placeholder="0"
                    min="0"
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
                  value={formatVND(formData.payable_amount)}
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
                  type="number"
                    className="form-control text-end"
                  value={formData.paid_amount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (value >= 0) {
                        handleFormChange('paid_amount', value);
                      }
                    }}
                    placeholder="0"
                    min="0"
                />
                <div className="mt-1">
                    <small className="text-muted">Tiền mặt</small>
                  </div>
                </div>
              </div>

              {/* Tính vào công nợ */}
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label fw-semibold">Công nợ</label>
                <div className="col-sm-8">
                <input
                  type="text"
                    className="form-control text-end"
                  value={formatVND(formData.debt_amount)}
                  readOnly
                    style={{ backgroundColor: '#f8f9fa', color: formData.debt_amount < 0 ? '#dc3545' : '#198754' }}
                />
                </div>
              </div>


      {/* Nút hành động */}
              <div className="d-flex gap-2">
        <button
                  className="btn btn-primary flex-fill"
          onClick={handleSaveDraft}
          disabled={isLoading}
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
    </div>
  );
};

export default Import;
