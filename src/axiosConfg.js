import axios from 'axios';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {BASE_URL} from "./constants";

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: BASE_URL, // Your backend URL
});

// Interceptor to add token to headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Retrieve token inside the interceptor
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

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
