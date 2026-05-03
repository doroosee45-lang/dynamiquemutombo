import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ✅ Sans StrictMode — évite les doubles rendus qui causent le #418
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);