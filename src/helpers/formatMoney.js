/**
 * Format số tiền VND với dấu chấm phân cách hàng nghìn
 * @param {number|string} value - Giá trị cần format
 * @returns {string} - Chuỗi đã format hoặc chuỗi rỗng nếu invalid
 */
export const formatVND = (value) => {
    if (value === null || value === undefined) return '';
    
    // Chuyển về số nguyên trước khi format
    const numValue = parseInt(value);
    if (isNaN(numValue)) return '';
    
    // Format với dấu chấm phân cách hàng nghìn
    return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parse chuỗi VND đã format thành số nguyên
 * @param {string} formattedValue - Chuỗi đã format (ví dụ: "1.000.000")
 * @returns {number} - Số nguyên hoặc 0 nếu invalid
 */
export const parseVND = (formattedValue) => {
    if (!formattedValue) return 0;
    
    // Loại bỏ dấu chấm và chuyển về số
    const cleanValue = formattedValue.toString().replace(/\./g, '');
    const numValue = parseInt(cleanValue);
    
    return isNaN(numValue) ? 0 : numValue;
};

/**
 * Format số tiền VND với đơn vị ₫
 * @param {number|string} value - Giá trị cần format
 * @returns {string} - Chuỗi đã format với đơn vị
 */
export const formatVNDWithUnit = (value) => {
    const formatted = formatVND(value);
    return formatted ? `${formatted} ₫` : '-';
};
