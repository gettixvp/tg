import React from 'react';
import FinanceApp from './components/FinanceApp';

// ПРАВИЛЬНО: только домен, без /api
const API_URL = 'https://finance-backend.onrender.com'; // ← ТОЛЬКО ДОМЕН

export default function App() {
  return <FinanceApp apiUrl={API_URL} />;
}