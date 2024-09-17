import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App'; // Adjust path as needed

ReactDOM.render(
    // -- contexxt provider
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
);