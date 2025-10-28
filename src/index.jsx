import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

window.storage = {
  async get(key) {
    const data = localStorage.getItem(key);
    return data ? { value: data } : null;
  },
  async set(key, value) {
    localStorage.setItem(key, value);
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);