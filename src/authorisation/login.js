import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfg';
import { message } from 'antd';
import './login.css';

const Login = ({ onLogout }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        axios.post('/token/', { username, password })
            .then((response) =>{
                localStorage.setItem('token', response.data.access); // Store the access token
                message.success('Login successful! Welcome...');
                setError('');
                navigate('/passwords');

            })
            .catch ((error)=>{
            setError('Invalid credentials: ' + (error.response?.data?.detail || 'Unknown error'));
        })
    };

    return (
        <div className="auth-container">
            <div className="form-wrapper">
                <h2>Login</h2>
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
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-btn">Login</button>
                    <div className="new-user">
                        <p className="new-to-lockr">
                            New to LockR?
                            <span
                                className="register-link"
                                onClick={() => navigate('/register')}
                                style={{cursor: 'pointer', marginLeft: '5px'}}
                            >
                            Register here
                        </span>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;