import React, { useState } from 'react';
import axios from '../axiosConfg';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import './forgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [messageSuccess, setMessageSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const response = await axios.post('/password_reset/', { email });
        message.success('Password reset email sent. Check your inbox.');
    } catch (err) {
        if (err.response?.status === 404) {
            message.error('Email not found.');
        } else {
            message.error('An error occurred. Please try again later.');
        }
    }
    };

    return (
        <div className="auth-container">
            <div className="form-wrapper">
                <h2>Forgot Password</h2>
                {error && <p className="error">{error}</p>}
                {messageSuccess && <p className="success">{messageSuccess}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-btn">Submit</button>
                    <div className="back-to-login">
                        <span
                            onClick={() => navigate('/login')}
                            style={{ cursor: 'pointer', color: '#007bff' }}
                        >
                            Back to Login
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
