import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // Update with your backend URL
});

export const token = localStorage.getItem('token');
// Interceptor to add token to headers
axiosInstance.interceptors.request.use((config) => {
if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
}
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;