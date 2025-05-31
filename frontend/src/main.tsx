import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

// Apply the saved theme to the HTML element before rendering
const savedTheme = localStorage.getItem('themeMode') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
