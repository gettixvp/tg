import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Chart.js
import Chart from 'chart.js/auto';
window.Chart = Chart;

// Ждём Telegram WebApp
const initApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Ждём загрузку Telegram WebApp
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  initApp();
} else {
  // Fallback: ждём 1 сек
  setTimeout(init casketApp, 1000);
}