const API_URL = 'https://walletback-aghp.onrender.com'; // БЕЗ /api

export default function App() {
  return (
    <div id="app">
      <FinanceApp apiUrl={API_URL} />
    </div>
  );
}