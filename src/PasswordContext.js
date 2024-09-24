import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { config } from './crud_operation';
import {URLS} from "./apiConstants";

const PasswordContext = createContext();

export const PasswordProvider = ({ children }) => {
    const [passwordItems, setPasswordItems] = useState([]);

    // Fetch passwords from the API
    const fetchPasswords = () => {
        axios.get(URLS.ALL_PASSWORDS, config)
            .then(response => {
                if (Array.isArray(response.data.passwords)) {
                    setPasswordItems(response.data.passwords);  // Update context state with fresh data
                } else {
                    console.error('Unexpected response format, expected an array:', response.data);
                }
            })
            .catch(error => {
                console.error('Error fetching passwords:', error);
            });
    };

    const addPassword = (newPassword) => {
        setPasswordItems(prevItems => {
            // Ensure prevItems is an array
            return Array.isArray(prevItems) ? [...prevItems, newPassword] : [newPassword];
        });
    };

    const updatePassword = (updatedPassword) => {
        setPasswordItems(prevItems => {
            return Array.isArray(prevItems)
                ? prevItems.map(item => item.passId === updatedPassword.passId ? updatedPassword : item)
                : [updatedPassword];
        });
    };

    const deletePassword = (passwordId) => {
        setPasswordItems(prevItems => {
            return Array.isArray(prevItems)
                ? prevItems.filter(item => item.passId !== passwordId)
                : [];
        });
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
