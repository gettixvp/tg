import React from 'react';
import FinanceApp from './components/FinanceApp';

const API_URL = 'https://your-backend.onrender.com/api'; // Вставьте URL вашего backend

export default function App() {
  return <FinanceApp apiUrl={API_URL} />;
}