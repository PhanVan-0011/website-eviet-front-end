import axios from 'axios';

export default function requestApi(endpoint, method, body=[], responseType= 'json'){
    const baseURL = process.env.REACT_APP_API_URL;
 
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': '*',
    
    };
    const instance = axios.create({
        headers: headers,
    });

    instance.interceptors.request.use(
        config => {
            console.log(localStorage.getItem('access_token'))
            console.log(`request sucesss: ${endpoint}`);
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        },
        error => {
            // Handle request error here
            return Promise.reject(error);
        }
    );

    instance.interceptors.response.use(
        response => {
            // Handle response data here
            console.log(`response sucesss: ${endpoint}`);
            return response;
        },
        async(error) => {
            // Thêm cơ chế ngăn chặn vòng lặp vô tận khi request sai
            if(error.response && error.response.status === 419) {
                try {
                    const configOriginal = error.config;
                    console.log('call refresh token api');
                    const refreshToken = localStorage.getItem('refresh_token');
                      const refreshResponse = await instance.post(`${baseURL}/auth/refresh-token`, {'refresh_token': refreshToken});
                   
                      const {access_token, refresh_token} = refreshResponse.data;
    

                      localStorage.setItem('access_token', access_token); // Lưu token vào localStorage   
                      localStorage.setItem('refresh_token', refresh_token); // Lưu token vào localStorage
                      // Retry the original request with the new access token
                      configOriginal.headers['Authorization'] = `Bearer ${access_token}`;
                    
                      console.log('call refresh token api success');
                      return instance(configOriginal);
                } catch (error) {
                    if(error.response && error.response.status === 400) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        window.location.href = '/login'; 
                    }
                    return Promise.reject(error);
                }
            }
            return Promise.reject(error);
        }
    );

    return instance.request({
        method: method,
        url: `${baseURL}${endpoint}`,
        data: body,
        responseType: responseType,
    });
}