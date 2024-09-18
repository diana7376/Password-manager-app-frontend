import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../axiosConfg';
import { message } from 'antd';

import './login.css';

const Register = ({ onLogout }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {

    //const handleSubmit = async (e) => {

        e.preventDefault(); // Prevent the default form submission

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }


        // Registration request
        axios.post('/register/', {
            username,
            email,
            password,
            password2: confirmPassword // Include password2 in the request
        })
            .then((response) => {
                localStorage.setItem('token', response.data.access); // Store access token
                // Success notification
                message.success('Registration successful! Redirecting to login...');
                setError(''); // Clear any previous error
                // Redirect to the login page after 3 seconds
                    navigate('/login');
            })
            .catch((error) => {
                if (error.response) {
                    console.log('Response error:', error.response.data);
                    message.error('Registration failed: ' + (error.response?.data?.detail || 'Unknown error')); // Error notification
                } else if (error.request) {
                    console.log('No response received:', error.request);
                    message.error('No response from the server'); // Error notification
                } else {
                    console.log('Error setting up request:', error.message);
                    message.error('Error setting up request'); // Error notification
                }
            });
    };

    return (
        <div className="auth-container">
            <div className="form-wrapper">
                <h2>Register</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Confirm Password:</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-btn">Register</button>
                    <div className="old-user">
                        <p className="have-an-acc">
                            Already have an account?
                            <span
                                className="login-link"
                                onClick={() => navigate('/login')}

                                style={{ cursor: 'pointer', marginLeft: '5px' }}
                            >
                                Login here
                            </span>

                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;

