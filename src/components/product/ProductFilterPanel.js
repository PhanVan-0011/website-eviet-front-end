import React, { useState } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';

const ProductFilterPanel = ({ 
    categories = [],
    suppliers = [],
    brands = [],
    selectedCategories,
    setSelectedCategories,
    selectedSuppliers,
    setSelectedSuppliers,
    selectedBrands,
    setSelectedBrands,
    creationTimeFilter,
    setCreationTimeFilter,
    customDateFrom,
    setCustomDateFrom,
    customDateTo,
    setCustomDateTo,
    productStatus,
    setProductStatus,
    directSale,
    setDirectSale,
    isVisible = true,
    onToggleVisibility
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);

    const handleToggle = () => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 600);
        onToggleVisibility();
    };

    // Custom styles for react-select
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '38px',
            border: '1px solid #ced4da',
            borderRadius: '0.375rem',
            boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
            '&:hover': {
                borderColor: '#86b7fe'
            }
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#0d6efd',
            borderRadius: '0.25rem'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: 'white',
            fontSize: '0.875rem'
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: 'white',
            '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white'
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#e7f1ff' : 'white',
            color: state.isSelected ? 'white' : '#212529',
            '&:hover': {
                backgroundColor: state.isSelected ? '#0d6efd' : '#e7f1ff'
            }
        })
    };

    // Format options for react-select
    const categoryOptions = categories.map(cat => ({
        value: cat.id,
        label: cat.name
    }));

    const supplierOptions = suppliers.map(supplier => ({
        value: supplier.id,
        label: supplier.name
    }));

    const brandOptions = brands.map(brand => ({
        value: brand.id,
        label: brand.name
    }));

    return (
        <>
            {/* Toggle Button */}
            <button
                className={`btn btn-outline-secondary btn-sm filter-toggle-btn ${isPulsing ? 'pulse' : ''}`}
                onClick={handleToggle}
                title={isVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                key={isVisible ? 'open' : 'closed'}
            >
                {isVisible ? (
                    <i className="fas fa-angle-left"></i>
                ) : (
                    <i className="fas fa-angle-right"></i>
                )}
            </button>
            
            <div 
                className={`position-relative filter-panel ${isVisible ? 'col-md-2' : 'col-md-0'} transition-all d-flex flex-column`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {isVisible && (
                    <div className="p-3 filter-content">
                        <h6 className="fw-bold mb-3 text-primary text-center" style={{ fontSize: '0.9rem' }}>
                            <i className="fas fa-filter me-1"></i>
                            Sản phẩm
                        </h6>

                        {/* Nhóm hàng */}
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="form-label fw-bold mb-0" style={{ fontSize: '0.875rem' }}>
                                    Nhóm hàng
                                </label>
                                <button 
                                    className="btn btn-link p-0 text-primary" 
                                    style={{ fontSize: '0.75rem', textDecoration: 'none' }}
                                    title="Thêm nhóm hàng mới"
                                >
                                    Thêm mới
                                </button>
                            </div>
                            <Select
                                isMulti
                                options={categoryOptions}
                                value={selectedCategories}
                                onChange={setSelectedCategories}
                                placeholder="Chọn nhóm hàng"
                                styles={customSelectStyles}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>

                        {/* Thời gian tạo */}
                        <div className="mb-3">
                            <label className="form-label fw-bold mb-2" style={{ fontSize: '0.875rem' }}>
                                Thời gian tạo
                            </label>
                            <div className="mb-2">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="creationTime"
                                        id="allTime"
                                        value="all"
                                        checked={creationTimeFilter === 'all'}
                                        onChange={(e) => setCreationTimeFilter(e.target.value)}
                                    />
                                    <label className="form-check-label d-flex align-items-center" htmlFor="allTime">
                                        <i className="fas fa-calendar-alt me-2 text-muted" style={{ fontSize: '0.75rem' }}></i>
                                        Toàn thời gian
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="creationTime"
                                        id="customTime"
                                        value="custom"
                                        checked={creationTimeFilter === 'custom'}
                                        onChange={(e) => setCreationTimeFilter(e.target.value)}
                                    />
                                    <label className="form-check-label d-flex align-items-center" htmlFor="customTime">
                                        <i className="fas fa-calendar-alt me-2 text-muted" style={{ fontSize: '0.75rem' }}></i>
                                        Tùy chỉnh
                                    </label>
                                </div>
                            </div>
                             {creationTimeFilter === 'custom' && (
                                 <div className="row g-2">
                                     <div className="col-6">
                                         <DatePicker
                                             selected={customDateFrom}
                                             onChange={setCustomDateFrom}
                                             selectsStart
                                             startDate={customDateFrom}
                                             endDate={customDateTo}
                                             placeholderText="Từ ngày"
                                             dateFormat="dd/MM/yyyy"
                                             locale={vi}
                                             className="form-control form-control-sm"
                                             popperPlacement="bottom-start"
                                             showMonthDropdown
                                             showYearDropdown
                                             dropdownMode="select"
                                             dateFormatCalendar="MM/yyyy"
                                         />
                                     </div>
                                     <div className="col-6">
                                         <DatePicker
                                             selected={customDateTo}
                                             onChange={setCustomDateTo}
                                             selectsEnd
                                             startDate={customDateFrom}
                                             endDate={customDateTo}
                                             minDate={customDateFrom}
                                             placeholderText="Đến ngày"
                                             dateFormat="dd/MM/yyyy"
                                             locale={vi}
                                             className="form-control form-control-sm"
                                             popperPlacement="bottom-end"
                                             showMonthDropdown
                                             showYearDropdown
                                             dropdownMode="select"
                                             dateFormatCalendar="MM/yyyy"
                                         />
                                     </div>
                                 </div>
                             )}
                        </div>

                        {/* Nhà cung cấp */}
                        <div className="mb-3">
                            <label className="form-label fw-bold mb-2" style={{ fontSize: '0.875rem' }}>
                                Nhà cung cấp
                            </label>
                            <Select
                                isMulti
                                options={supplierOptions}
                                value={selectedSuppliers}
                                onChange={setSelectedSuppliers}
                                placeholder="Chọn nhà cung cấp"
                                styles={customSelectStyles}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>

                        {/* Thương hiệu */}
                        <div className="mb-3">
                            <label className="form-label fw-bold mb-2" style={{ fontSize: '0.875rem' }}>
                                Thương hiệu
                            </label>
                            <Select
                                isMulti
                                options={brandOptions}
                                value={selectedBrands}
                                onChange={setSelectedBrands}
                                placeholder="Chọn thương hiệu"
                                styles={customSelectStyles}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>

                        {/* Trạng thái hàng hóa */}
                        <div className="mb-3">
                            <label className="form-label fw-bold mb-2" style={{ fontSize: '0.875rem' }}>
                                Trạng thái hàng hóa
                            </label>
                            <Select
                                options={[
                                    { value: 'all', label: 'Tất cả' },
                                    { value: 'active', label: 'Đang kinh doanh' },
                                    { value: 'inactive', label: 'Ngừng kinh doanh' }
                                ]}
                                value={productStatus ? { value: productStatus, label: productStatus === 'all' ? 'Tất cả' : productStatus === 'active' ? 'Đang kinh doanh' : 'Ngừng kinh doanh' } : null}
                                onChange={(selectedOption) => setProductStatus(selectedOption ? selectedOption.value : 'all')}
                                placeholder="Chọn trạng thái"
                                styles={customSelectStyles}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                isClearable={false}
                            />
                        </div>

                        {/* Bán trực tiếp */}
                        <div className="mb-3">
                            <label className="form-label fw-bold mb-2" style={{ fontSize: '0.875rem' }}>
                                Bán trực tiếp
                            </label>
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className={`btn btn-sm flex-fill ${directSale === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => setDirectSale('all')}
                                >
                                    Tất cả
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm flex-fill ${directSale === 'yes' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => setDirectSale('yes')}
                                >
                                    Có
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm flex-fill ${directSale === 'no' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    onClick={() => setDirectSale('no')}
                                >
                                    Không
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </>
    );
};

export default ProductFilterPanel;
