import React, { createContext, useState, useContext } from 'react';
import axios from './axiosConfg';
import { config } from './crud_operation';
import { message } from 'antd';

const PasswordContext = createContext();

export const PasswordProvider = ({ children }) => {
    const [passwordItems, setPasswordItems] = useState([]);

    // Fetch passwords from the API
    const fetchPasswords = () => {
        axios.get('http://127.0.0.1:8000/api/password-items/', config)
            .then(response => {
                setPasswordItems(response.data);  // Update context state with fresh data
            })
            .catch(error => {
                console.error('Error fetching passwords:', error);
            });
    };



    const addPassword = (newPassword) => {
        setPasswordItems(prevItems => [...prevItems, newPassword]);  // Add the new password to the context state
    };

    const updatePassword = (updatedPassword) => {
        setPasswordItems(prevItems =>
            prevItems.map(item => item.id === updatedPassword.id ? updatedPassword : item)
        );  // Update the specific item in the context
    };

    const deletePassword = (passwordId) => {
        setPasswordItems(prevItems => prevItems.filter(item => item.id !== passwordId));  // Remove the deleted item from context
    };


    return (
        <PasswordContext.Provider value={{
            passwordItems,
            fetchPasswords,
            addPassword,
            updatePassword,
            deletePassword
        }}>
            {children}
        </PasswordContext.Provider>
    );
};

export const usePasswordContext = () => useContext(PasswordContext);
