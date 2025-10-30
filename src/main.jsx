// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// === Chart.js ===
import Chart from 'chart.js/auto';
window.Chart = Chart;

// === Ждём Telegram WebApp ===
const initApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  initApp();
} else {
  setTimeout(initApp, 1000);
}