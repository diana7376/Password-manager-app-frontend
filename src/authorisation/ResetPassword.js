import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // To capture the uidb64 and token from the URL
import axios from '../axiosConfg'; // Make sure axios is properly configured
import { message } from 'antd';
import './resetPassword.css'; // Add any styles you need

const ResetPassword = () => {
  const { uidb64, token } = useParams(); // Capture the uid and token from the URL params

  // Log the uidb64 and token to the console for debugging
  useEffect(() => {
    console.log('UID:', uidb64, 'Token:', token);
  }, [uidb64, token]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
    }

    try {
        const response = await axios.post(`/reset/${uidb64}/${token}/`, {
            new_password: newPassword,
        });

        if (response.status === 200) {
            setSuccess('Password reset successfully! You can now log in with your new password.');
        }
    } catch (err) {
        setError('Error resetting password. Please try again later.');
    }
};


  return (
    <div className="auth-container">
      <div className="form-wrapper">
        <h2>Reset Password</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form onSubmit={handleResetPassword}>
          <div className="input-group">
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
