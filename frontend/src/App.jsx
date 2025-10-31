import FinanceApp from './components/FinanceApp';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  return <FinanceApp apiUrl={API_URL} />;
}