import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import {PasswordProvider} from "./PasswordContext";

const root = createRoot(document.getElementById('root'));
root.render(
    // -- context provider
    <PasswordProvider>
        <Router>
            <App />
        </Router>
    </PasswordProvider>

);