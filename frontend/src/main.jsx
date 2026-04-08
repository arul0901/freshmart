import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css';
import './styles/theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Apply saved theme on load
const savedTheme = localStorage.getItem('fm_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
