/**
 * Format số tiền VND với dấu chấm phân cách hàng nghìn
 * @param {number|string} value - Giá trị cần format
 * @returns {string} - Chuỗi đã format hoặc chuỗi rỗng nếu invalid
 */
export const formatVND = (value) => {
    if (value === null || value === undefined) return '';
    
    // Xử lý chuỗi có dấu phẩy và số thập phân như "161,000.00"
    let cleanValue = value;
    if (typeof value === 'string') {
        // Loại bỏ dấu phẩy và chuyển thành số
        cleanValue = value.replace(/,/g, '');
    }
    
    // Chuyển về số và làm tròn thành số nguyên
    const numValue = Math.round(parseFloat(cleanValue));
    if (isNaN(numValue)) return '';
    
    // Format với dấu chấm phân cách hàng nghìn
    return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parse chuỗi VND đã format thành số nguyên
 * @param {string} formattedValue - Chuỗi đã format (ví dụ: "1.000.000" hoặc "161,000.00")
 * @returns {number} - Số nguyên hoặc 0 nếu invalid
 */
export const parseVND = (formattedValue) => {
    if (!formattedValue) return 0;
    
    // Loại bỏ dấu chấm và dấu phẩy, chuyển về số
    const cleanValue = formattedValue.toString().replace(/[.,]/g, '');
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
