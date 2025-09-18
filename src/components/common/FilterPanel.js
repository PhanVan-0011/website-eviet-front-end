import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';

const FilterPanel = ({ 
    filterStatus, 
    setFilterStatus, 
    filterPayment, 
    setFilterPayment, 
    filterOrderDateFrom, 
    setFilterOrderDateFrom, 
    filterOrderDateTo, 
    setFilterOrderDateTo,
    paymentMethods = [],
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

    return (
        <>
            {/* Toggle Button - luôn hiển thị bên ngoài */}
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
                <div className="p-2 filter-content">
                    <h6 className="fw-bold mb-2 text-primary text-center" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-filter me-1"></i>
                        Bộ lọc
                    </h6>

                    {/* Trạng thái */}
                    <div className="mb-2">
                        <label className="form-label fw-semibold mb-1" htmlFor="filterStatus" style={{ fontSize: '0.8rem' }}>
                            <i className="fas fa-toggle-on me-1 text-info"></i>Trạng thái
                        </label>
                        <select
                            id="filterStatus"
                            className="form-select form-select-sm shadow-sm"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="processing">Đang xử lý</option>
                            <option value="shipped">Đã gửi hàng</option>
                            <option value="delivered">Đã giao</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="mb-2">
                        <label className="form-label fw-semibold mb-1" htmlFor="filterPayment" style={{ fontSize: '0.8rem' }}>
                            <i className="fas fa-credit-card me-1 text-success"></i>Phương thức thanh toán
                        </label>
                        <select
                            id="filterPayment"
                            className="form-select form-select-sm shadow-sm"
                            value={filterPayment}
                            onChange={e => setFilterPayment(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            {paymentMethods.map(method => (
                                <option key={method.code} value={method.code}>
                                    {method.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Thời gian */}
                    <div className="mb-2">
                        <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.8rem' }}>
                            <i className="fas fa-calendar-alt me-1 text-warning"></i>Thời gian
                        </label>
                        
                        {/* Từ ngày */}
                        <div className="mb-1">
                            <label className="form-label small mb-1" htmlFor="filterOrderDateFrom" style={{ fontSize: '0.75rem' }}>
                                Từ ngày
                            </label>
                            <DatePicker
                                selected={filterOrderDateFrom}
                                onChange={date => setFilterOrderDateFrom(date)}
                                locale={vi}
                                dateFormat="dd/MM/yyyy"
                                className="form-control form-control-sm shadow-sm"
                                placeholderText="Từ ngày"
                                id="filterOrderDateFrom"
                                autoComplete="off"
                                isClearable
                            />
                        </div>

                        {/* Đến ngày */}
                        <div className="mb-1">
                            <label className="form-label small mb-1" htmlFor="filterOrderDateTo" style={{ fontSize: '0.75rem' }}>
                                Đến ngày
                            </label>
                            <DatePicker
                                selected={filterOrderDateTo}
                                onChange={date => setFilterOrderDateTo(date)}
                                locale={vi}
                                dateFormat="dd/MM/yyyy"
                                className="form-control form-control-sm shadow-sm"
                                placeholderText="Đến ngày"
                                id="filterOrderDateTo"
                                autoComplete="off"
                                isClearable
                            />
                        </div>

                        {/* Quick time options */}
                        <div className="d-flex flex-wrap gap-1 mt-1">
                            <button 
                                className="btn btn-outline-primary btn-sm quick-filter-btn"
                                onClick={() => {
                                    const today = new Date();
                                    setFilterOrderDateFrom(today);
                                    setFilterOrderDateTo(today);
                                }}
                            >
                                Hôm nay
                            </button>
                            <button 
                                className="btn btn-outline-primary btn-sm quick-filter-btn"
                                onClick={() => {
                                    const today = new Date();
                                    const yesterday = new Date(today);
                                    yesterday.setDate(yesterday.getDate() - 1);
                                    setFilterOrderDateFrom(yesterday);
                                    setFilterOrderDateTo(yesterday);
                                }}
                            >
                                Hôm qua
                            </button>
                            <button 
                                className="btn btn-outline-primary btn-sm quick-filter-btn"
                                onClick={() => {
                                    const today = new Date();
                                    const weekAgo = new Date(today);
                                    weekAgo.setDate(weekAgo.getDate() - 7);
                                    setFilterOrderDateFrom(weekAgo);
                                    setFilterOrderDateTo(today);
                                }}
                            >
                                7 ngày
                            </button>
                        </div>
                    </div>

                </div>
            )}
            </div>
        </>
    );
};

export default FilterPanel;
