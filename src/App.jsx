// src/App.jsx
import FinanceApp from './components/FinanceApp';

const API_URL = 'https://walletback-aghp.onrender.com'; // БЕЗ /api

export default function App() {
  return <FinanceApp apiUrl={API_URL} />;
}