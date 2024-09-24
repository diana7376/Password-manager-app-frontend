
import React from 'react';

import { Navigate } from 'react-router-dom';
import {useAppContext} from "../AppContext";

const PrivateRoute = ({ children }) => {
    const { loggedIn } = useAppContext()

    return loggedIn
        ? children
        : <Navigate to="/login" />;
};

export default PrivateRoute;