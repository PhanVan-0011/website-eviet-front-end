import React from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { createPortal } from 'react-dom';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';

// Custom styles cho react-select
export const selectStyles = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '38px',
        height: '38px',
        border: '1px solid #ced4da',
        borderRadius: '0.375rem',
        boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
        '&:hover': {
            borderColor: '#86b7fe'
        }
    }),
    valueContainer: (provided) => ({
        ...provided,
        height: '36px',
        minHeight: '36px'
    }),
    inputContainer: (provided) => ({
        ...provided,
        height: '36px',
        minHeight: '36px'
    }),
    placeholder: (provided) => ({
        ...provided,
        lineHeight: '36px'
    }),
    singleValue: (provided) => ({
        ...provided,
        lineHeight: '36px'
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

// 1. Select Single
export const FilterSelectSingle = ({ 
    label, 
    value, 
    onChange, 
    options = [], 
    placeholder = "Chọn...",
    className = "mb-3" 
}) => {
    return (
        <div className={className}>
            <label className="form-label fw-bold mb-2" style={{ fontSize: '0.875rem' }}>
                {label}
            </label>
            <Select
                options={options}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                styles={selectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
                isClearable={false}
            />
        </div>
    );
};

// 2. Select Multi
export const FilterSelectMulti = ({ 
    label, 
    value, 
    onChange, 
    options = [], 
    placeholder = "Chọn...",
    className = "mb-3",
    onCreateNew = null,
    createNewLabel = "Tạo mới"
}) => {
    return (
        <div className={className}>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-bold mb-0" style={{ fontSize: '0.875rem' }}>
                    {label}
                </label>
                {onCreateNew && (
                    <button
                        type="button"
                        className="btn btn-link p-0 text-primary text-decoration-none"
                        onClick={onCreateNew}
                        style={{ fontSize: '0.8rem' }}
                    >
                        {createNewLabel}
                    </button>
                )}
            </div>
            <Select
                isMulti
                options={options}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                styles={selectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
            />
        </div>
    );
};

// 3. Checkbox Group
export const FilterCheckboxGroup = ({ 
    label, 
    value = [], 
    onChange, 
    options = [],
    className = "mb-3" 
}) => {
    const handleCheckboxChange = (optionValue, checked) => {
        if (checked) {
            onChange([...value, optionValue]);
        } else {
            onChange(value.filter(v => v !== optionValue));
        }
    };

    return (
        <div className={className}>
            <label className="form-label fw-bold mb-2" style={{ fontSize: '0.875rem' }}>
                {label}
            </label>
            <div className="d-flex flex-column gap-2">
                {options.map((option) => (
                    <div key={option.value} className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id={`${label}_${option.value}`}
                            checked={value.includes(option.value)}
                            onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={`${label}_${option.value}`}>
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 4. Radio Group
export const FilterRadioGroup = ({ 
    label, 
    value, 
    onChange, 
    options = [],
    className = "mb-3" 
}) => {
    return (
        <div className={className}>
            <label className="form-label fw-bold mb-2" style={{ fontSize: '0.875rem' }}>
                {label}
            </label>
            <div className="d-flex flex-column gap-2">
                {options.map((option) => (
                    <div key={option.value} className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name={label}
                            id={`${label}_${option.value}`}
                            value={option.value}
                            checked={value === option.value}
                            onChange={(e) => onChange(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor={`${label}_${option.value}`}>
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 5. Button Group
export const FilterButtonGroup = ({ 
    label, 
    value, 
    onChange, 
    options = [],
    className = "mb-3" 
}) => {
    return (
        <div className={className}>
            <label className="form-label fw-bold mb-2" style={{ fontSize: '0.875rem' }}>
                {label}
            </label>
            <div className="d-flex gap-2">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        className={`btn btn-sm flex-fill ${value === option.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => onChange(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

// 6. Date Range
export const FilterDateRange = ({ 
    label, 
    value = { from: null, to: null }, 
    onChange,
    className = "mb-3" 
}) => {
    return (
        <div className={className}>
            <label className="form-label fw-bold mb-2" style={{ fontSize: '0.875rem' }}>
                {label}
            </label>
            <div className="row g-2">
                <div className="col-6">
                    <DatePicker
                        selected={value.from}
                        onChange={(date) => onChange({ ...value, from: date })}
                        selectsStart
                        startDate={value.from}
                        endDate={value.to}
                        placeholderText="Từ ngày"
                        dateFormat="dd/MM/yyyy"
                        locale={vi}
                        className="form-control"
                        style={{ height: '38px' }}
                        popperPlacement="bottom-start"
                        popperContainer={({ children }) => createPortal(children, document.body)}
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        dateFormatCalendar="MM/yyyy"
                    />
                </div>
                <div className="col-6">
                    <DatePicker
                        selected={value.to}
                        onChange={(date) => onChange({ ...value, to: date })}
                        selectsEnd
                        startDate={value.from}
                        endDate={value.to}
                        minDate={value.from}
                        placeholderText="Đến ngày"
                        dateFormat="dd/MM/yyyy"
                        locale={vi}
                        className="form-control"
                        style={{ height: '38px' }}
                        popperPlacement="bottom-end"
                        popperContainer={({ children }) => createPortal(children, document.body)}
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        dateFormatCalendar="MM/yyyy"
                    />
                </div>
            </div>
        </div>
    );
};

// 7. Text Input
export const FilterTextInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder = "Nhập...",
    type = "text",
    className = "mb-3" 
}) => {
    return (
        <div className={className}>
            <label className="form-label fw-bold mb-2" style={{ fontSize: '0.875rem' }}>
                {label}
            </label>
            <input
                type={type}
                className="form-control"
                style={{ height: '38px' }}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};

// 8. Number Range
export const FilterNumberRange = ({ 
    label, 
    value = { min: '', max: '' }, 
    onChange,
    className = "mb-3" 
}) => {
    return (
        <div className={className}>
            <label className="form-label fw-bold mb-2" style={{ fontSize: '0.875rem' }}>
                {label}
            </label>
            <div className="row g-2">
                <div className="col-6">
                    <input
                        type="number"
                        className="form-control"
                        style={{ height: '38px' }}
                        value={value.min}
                        onChange={(e) => onChange({ ...value, min: e.target.value })}
                        placeholder="Từ"
                    />
                </div>
                <div className="col-6">
                    <input
                        type="number"
                        className="form-control"
                        style={{ height: '38px' }}
                        value={value.max}
                        onChange={(e) => onChange({ ...value, max: e.target.value })}
                        placeholder="Đến"
                    />
                </div>
            </div>
        </div>
    );
};

// 9. Filter Toggle Button (riêng biệt)
export const FilterToggleButton = ({ 
    isVisible, 
    onToggle, 
    isPulsing = false,
    className = "" 
}) => {
    return (
        <button
            type="button"
            className={`btn btn-outline-secondary btn-sm filter-toggle-btn ${isPulsing ? 'pulse' : ''} ${className}`}
            onClick={onToggle}
            title={isVisible ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
        >
            {isVisible ? (
                <i className="fas fa-angle-left"></i>
            ) : (
                <i className="fas fa-angle-right"></i>
            )}
        </button>
    );
};
