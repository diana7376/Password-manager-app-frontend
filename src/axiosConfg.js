import axios from 'axios';
import { BASE_URL } from './apiConstants';

// Create an Axios instance with a base URL from apiConstants.js
const axiosInstance = axios.create({
    baseURL: `${BASE_URL}/api/`,
});

// Get the token from local storage
export const token = localStorage.getItem('token');
console.log("Used token:", token);
// Request Interceptor to add Authorization headers dynamically
axiosInstance.interceptors.request.use((config) => {
    // Check if a token exists and add it to headers
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default axiosInstance;
