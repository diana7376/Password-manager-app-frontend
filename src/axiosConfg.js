import axios from 'axios';
import { BASE_URL } from './apiConstants';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
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

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Unauthorized error (401) - Trigger automatic logout
            localStorage.removeItem('token'); // Remove the token
            message.error('Session expired, please log in again.');
            const navigate = useNavigate();
            navigate('/login'); // Redirect to login
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;
