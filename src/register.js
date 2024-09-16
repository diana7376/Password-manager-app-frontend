import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from './axiosConfg'; // Ensure this is the correct path

const Register = ({ onLogout }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post('/register/', {
                username,
                email,
                password,
                password2: confirmPassword // Include password2 in the request
            });
            localStorage.setItem('token', response.data.access); // Store the access token
            navigate('/'); // Redirect to the main page
        } catch (error) {
            setError('Registration failed: ' + (error.response?.data?.detail || 'Unknown error'));
        }
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
                </form>
            </div>
        </div>
    );
};

export default Register;