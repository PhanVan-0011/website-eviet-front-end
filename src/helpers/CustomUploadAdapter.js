import requestApi from './api';


export default class CustomUploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file
            .then(file => {
                const data = new FormData();
                data.append('image', file);

                // Luôn luôn cộng IMAGE_SERVER_URL vào trước url trả về
                return requestApi(
                    'api/upload-image',
                    'POST',
                    data,
                    'json',
                    'multipart/form-data'
                ).then(response => {
                    let url = '';
                    if (response.data && response.data.url) {
                        url = process.env.REACT_APP_API_URL + 'api/images/' + response.data.url.replace(/^\//, '');
                        return { default: url };
                    } else if (response.data && response.data.data && response.data.data.url) {
                        url = process.env.REACT_APP_API_URL + 'api/images/' + response.data.data.url.replace(/^\//, '');
                        return { default: url };
                    } else {
                        return Promise.reject(response.data?.message || 'Upload thất bại');
                    }
                }).catch((e) => {
                    console.log(e);
                    return Promise.reject(e);
                });
            });
    }

    abort() {
        // Không cần xử lý gì đặc biệt
    }
}
