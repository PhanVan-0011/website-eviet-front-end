import requestApi from './api';

/**
 * Trích xuất path ảnh từ URL đầy đủ
 * @param {string} imageUrl - URL đầy đủ của ảnh
 * @returns {string} - Path ảnh để gửi lên API
 */
export const extractImagePath = (imageUrl) => {
    const baseUrl = process.env.REACT_APP_API_URL + 'api/images/';
    if (imageUrl.startsWith(baseUrl)) {
        return imageUrl.replace(baseUrl, '');
    }
    return imageUrl;
};

/**
 * Gọi API xóa ảnh từ server
 * @param {string} imageUrl - URL ảnh cần xóa
 * @param {string} folder - Thư mục chứa ảnh (posts, products, combos, etc.)
 * @returns {Promise} - Response từ API
 */
export const deleteImage = async (imageUrl, folder = 'posts') => {
    try {
        const imagePath = extractImagePath(imageUrl);
        console.log('Đang xóa ảnh:', imagePath, 'trong thư mục:', folder);
        
        const response = await requestApi(
            'api/delete-image',
            'DELETE',
            { 
                image_path: imagePath,
                folder: folder 
            },
            'json'
        );
        
        console.log('Xóa ảnh thành công:', imagePath, 'từ thư mục:', folder);
        return response;
    } catch (error) {
        console.error('Lỗi khi xóa ảnh:', imageUrl, 'từ thư mục:', folder, error);
        throw error;
    }
};
