import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
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

const ImportEdit = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(true); // Track loading state for units
  const [invoiceDetail, setInvoiceDetail] = useState(null); // Lưu toàn bộ invoice detail
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

  useEffect(() => {
    const fetchInitialData = async () => {
      dispatch(actions.controlLoading(true));
      setUnitsLoading(true);
      
      try {
        // Ưu tiên load invoice detail trước
        await fetchInvoiceDetail();
        
        // Load các data khác song song (không cần chờ)
        Promise.all([
          fetchSuppliers(),
          fetchUsers(),
          fetchBranches(),
          // Products sẽ được load trong loadInvoiceItems
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        dispatch(actions.controlLoading(false));
      }
    };
    
    fetchInitialData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tính toán totals khi importItems hoặc discount thay đổi
  useEffect(() => {
    if (dataLoaded) {
      calculateTotals();
    }
  }, [importItems, formData.discount, dataLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search logic
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchKeyword(searchInput);
      if (searchInput || searchInput === '') {
        fetchProducts(searchInput);
      }
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  const fetchInvoiceDetail = async () => {
    try {
      const response = await requestApi(`api/admin/purchase-invoices/${id}`, 'GET');
      
      if (response.data && response.data.data) {
        const invoice = response.data.data;
        
        // Lưu toàn bộ invoice detail
        setInvoiceDetail(invoice);
        
        // Set form data
        setFormData({
          import_code: invoice.invoice_code || '',
          status: invoice.status || 'draft',
          total_amount: parseFloat(invoice.total_amount) || 0,
          discount: parseFloat(invoice.discount_amount) || 0,
          payable_amount: parseFloat(invoice.total_amount) || 0,
          paid_amount: parseFloat(invoice.paid_amount) || 0,
          payment_method: 'Tiền mặt',
          notes: invoice.notes || ''
        });

        // Set date
        if (invoice.invoice_date) {
          setSelectedDate(new Date(invoice.invoice_date));
        }

        // Set supplier
        if (invoice.supplier) {
          setSelectedSupplier(invoice.supplier);
        }

        // Set branch
        if (invoice.branch) {
          setSelectedBranch(invoice.branch);
        }

        // Set user
        if (invoice.user) {
          setSelectedUser({
            value: invoice.user.id,
            label: invoice.user.name || invoice.user.username || 'N/A',
            data: invoice.user
          });
        }

        setDataLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching invoice detail:', error);
      toast.error('Không thể tải thông tin phiếu nhập!', toastErrorConfig);
      navigate('/import');
    }
  };

  // Load invoice items ngay sau khi có detail (không chờ products)
  useEffect(() => {
    const loadInvoiceItems = async () => {
      if (dataLoaded && invoiceDetail && invoiceDetail.details) {
        const details = invoiceDetail.details;
        
        const items = details.map((detail, index) => {
          // Tạo "fake" unit từ data hiện tại để hiển thị ngay
          const currentUnit = {
            product_id: detail.product_id,
            unit_code: detail.product?.product_code || '',
            display_name: detail.product?.name || '',
            unit_name: detail.unit_of_measure,
            unit_price: parseFloat(detail.unit_price),
            cost_price: parseFloat(detail.unit_price)
          };
          
          const item = {
            id: Date.now() + index + Math.random(),
            product_id: detail.product_id,
            code: detail.product?.product_code || '',
            name: detail.product?.name || '',
            unit: detail.unit_of_measure,
            quantity: parseFloat(detail.quantity),
            unit_price: parseFloat(detail.unit_price),
            total: parseFloat(detail.subtotal),
            availableUnits: [currentUnit], // ✅ Có ngay 1 unit để hiển thị dropdown
            selectedUnitIndex: 0
          };
          
          return item;
        });
        
        setImportItems(items);
        
        // Tự động fetch products cho các items này để lấy availableUnits (không blocking UI)
        (async () => {
          try {
            // Fetch từng product bằng cách search theo tên
            const productPromises = details.map(detail => {
              const productName = detail.product?.name || '';
              if (productName) {
                return requestApi(`api/admin/products/search-for-purchase?keyword=${encodeURIComponent(productName)}`, 'GET');
              }
              return Promise.resolve({ data: { data: [] } });
            });
            
            const responses = await Promise.all(productPromises);
            
            // Gộp tất cả units từ các response
            const allProductUnits = responses.flatMap(res => res.data?.data || []);
            
            // Update availableUnits cho từng item (merge với units hiện tại)
            setImportItems(prev => prev.map(item => {
              const allUnitsOfProduct = allProductUnits.filter(p => p.product_id === item.product_id);
              
              if (allUnitsOfProduct.length > 0) {
                // Tìm index của unit hiện tại trong danh sách mới
                const currentUnitIndex = allUnitsOfProduct.findIndex(u => u.unit_name === item.unit);
                
                return {
                  ...item,
                  availableUnits: allUnitsOfProduct, // Thay thế bằng list đầy đủ
                  selectedUnitIndex: currentUnitIndex >= 0 ? currentUnitIndex : 0
                };
              }
              
              // Nếu không tìm thấy units mới, giữ nguyên fake unit cũ
              return item;
            }));
            
            // Cập nhật products state để search vẫn hoạt động
            setProducts(allProductUnits);
            
            // Đánh dấu units đã load xong
            setUnitsLoading(false);
          } catch (error) {
            console.error('Error fetching product units:', error);
            setUnitsLoading(false);
          }
        })();
      }
    };
    
    loadInvoiceItems();
  }, [dataLoaded, invoiceDetail]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Update availableUnits khi user search thêm products mới (optional, ít dùng)
  useEffect(() => {
    if (importItems.length > 0 && products.length > 0 && !unitsLoading) {
      setImportItems(prev => prev.map(item => {
        if (item.availableUnits) return item; // Đã có rồi, không update
        
        const allUnitsOfProduct = products.filter(p => p.product_id === item.product_id);
        const currentUnitIndex = allUnitsOfProduct.findIndex(u => u.unit_name === item.unit);
        
        return {
          ...item,
          availableUnits: allUnitsOfProduct.length > 0 ? allUnitsOfProduct : null,
          selectedUnitIndex: currentUnitIndex >= 0 ? currentUnitIndex : 0
        };
      }));
    }
  }, [products.length, importItems.length, unitsLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSuppliers = async () => {
    try {
      // Giảm limit để nhanh hơn
      const response = await requestApi('api/admin/suppliers?limit=100', 'GET');
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
      // Giảm limit để nhanh hơn
      const response = await requestApi('api/admin/users?limit=50', 'GET');
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
      // Giảm limit để nhanh hơn
      const response = await requestApi('api/admin/branches?limit=50', 'GET');
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

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateInvoice = async (status) => {
    // Validate
    if (importItems.length === 0) {
      toast.error('Vui lòng thêm sản phẩm!', toastErrorConfig);
      return;
    }
    
    // Validate product_id for all items
    const invalidItems = importItems.filter(item => !item.product_id);
    if (invalidItems.length > 0) {
      toast.error('Vui lòng chọn sản phẩm từ danh sách tìm kiếm!', toastErrorConfig);
      return;
    }

    setIsLoading(true);
    dispatch(actions.controlLoading(true));
    try {
      // Payload chỉ gồm các field được phép sửa
      const payload = {
        status: status,
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
      
      const response = await requestApi(`api/admin/purchase-invoices/${id}`, 'PUT', payload);
      dispatch(actions.controlLoading(false));
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Cập nhật phiếu nhập thành công!', toastSuccessConfig);
        navigate('/import');
      } else {
        toast.error(response.data.message || 'Cập nhật phiếu nhập thất bại', toastErrorConfig);
      }
    } catch (error) {
      console.error('Error updating import:', error);
      dispatch(actions.controlLoading(false));
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message, toastErrorConfig);
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật phiếu nhập!', toastErrorConfig);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm format giá tiền VND
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
      
      const allUnitsOfProduct = products.filter(p => p.product_id === product.product_id);
      
      // Parse cost_price an toàn (loại bỏ dấu . nếu có)
      const costPrice = typeof product.cost_price === 'string' 
        ? parseFloat(product.cost_price.replace(/\./g, '')) 
        : parseFloat(product.cost_price) || 0;
      
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
        availableUnits: allUnitsOfProduct,
        selectedUnitIndex: allUnitsOfProduct.findIndex(u => 
          u.unit_code === product.unit_code
        )
      };
      setImportItems(prev => [...prev, newItem]);
      setSelectedProduct(null);
    }
  };

  // Xử lý khi đổi đơn vị
  const handleUnitChange = (itemId, newUnitIndex) => {
    setImportItems(prev => prev.map(item => {
      if (item.id === itemId && item.availableUnits) {
        const newUnit = item.availableUnits[newUnitIndex];
        if (newUnit) {
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

  // Custom Option component
  const CustomOption = ({ innerRef, innerProps, data, isSelected, isFocused }) => {
    const imageUrl = data.data?.image_url 
      ? `${process.env.REACT_APP_IMAGE_SERVER_URL}${data.data.image_url}`
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

  // Custom SingleValue component
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

  // Status badge
  const getStatusBadge = () => {
    const statusMap = {
      'draft': { label: 'Nháp', class: 'bg-secondary' },
      'received': { label: 'Đã nhập hàng', class: 'bg-success' },
      'cancelled': { label: 'Đã hủy', class: 'bg-danger' }
    };
    const status = statusMap[formData.status] || { label: formData.status, class: 'bg-secondary' };
    return <span className={`badge ${status.class}`}>{status.label}</span>;
  };

  if (!dataLoaded) {
    return null; // Hoặc hiển thị loading spinner
  }

  return (
    <div className="container-fluid mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 gap-4">
        {/* Phần bên trái - Tìm kiếm với border (70%) */}
        <div style={{ width: '70%' }} className="border rounded p-3">
          <div className="d-flex align-items-center mb-3">
            <button
              className="btn btn-outline-secondary me-3"
              onClick={() => navigate('/import')}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <h4 className="mb-0 me-4">Cập nhật phiếu nhập</h4>
            
            {/* Thanh tìm kiếm sản phẩm với react-select */}
            <div className="position-relative" style={{ width: '400px' }}>
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
                      <th width="30%">Tên hàng</th>
                      <th width="12%">ĐVT</th>
                      <th width="12%">Số lượng</th>
                      <th width="13%">Đơn giá</th>
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
                        <td className="align-middle">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={item.code}
                            readOnly
                            placeholder="Mã sản phẩm"
                            style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                          />
                        </td>
                        <td className="align-middle">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={item.name}
                            readOnly
                            placeholder="Tên sản phẩm"
                            style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                          />
                        </td>
                        <td className="align-middle">
                          {item.availableUnits && item.availableUnits.length > 0 ? (
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
                              className="form-control form-control-sm"
                              value={item.unit}
                              readOnly
                              placeholder="ĐVT"
                              style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
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

        {/* Phần bên phải - Thông tin phiếu nhập (30%) */}
        <div style={{ width: '30%' }}>
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h6 className="mb-0 fw-bold">Thông tin phiếu nhập</h6>
            </div>
            <div className="card-body">
              {/* Người nhập và Ngày nhập (readonly) */}
              <div className="row mb-3">
                <div className="col-6">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-user me-2 text-muted"></i>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={selectedUser?.label || 'N/A'}
                      readOnly
                      style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-calendar me-2 text-muted"></i>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={moment(selectedDate).format('DD/MM/YYYY HH:mm')}
                      readOnly
                      style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin nhà cung cấp (readonly) */}
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label fw-semibold">Nhà cung cấp</label>
                <div className="col-sm-8">
                  <input
                    type="text"
                    className="form-control"
                    value={selectedSupplier ? `${selectedSupplier.name} - ${selectedSupplier.code}` : 'N/A'}
                    readOnly
                    style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                  />
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
                    readOnly
                    style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                  />
                  </div>
                </div>
              </div>

              {/* Trạng thái */}
              <div className="row mb-3">
                <label className="col-sm-4 col-form-label fw-semibold">Trạng thái</label>
                <div className="col-sm-8">
                  <div className="d-flex align-items-center">
                    {getStatusBadge()}
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


      {/* Nút hành động */}
              <div className="d-flex gap-2">
        <button
                  className="btn btn-primary flex-fill"
          onClick={() => handleUpdateInvoice('draft')}
          disabled={isLoading}
        >
          <i className="fas fa-save me-1"></i>
          Lưu tạm
        </button>
        <button
                  className="btn btn-success flex-fill"
          onClick={() => handleUpdateInvoice('received')}
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

export default ImportEdit;

