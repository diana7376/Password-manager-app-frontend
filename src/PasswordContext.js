// PasswordContext.js
import { createContext, useState } from 'react';

export const PasswordContext = createContext();

export const PasswordProvider = ({ children }) => {
    const [passwordItems, setPasswordItems] = useState([]);

    return (
        <PasswordContext.Provider value={{ passwordItems, setPasswordItems }}>
            {children}
        </PasswordContext.Provider>
    );
};
