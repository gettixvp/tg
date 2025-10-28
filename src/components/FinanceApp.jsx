// src/components/FinanceApp.jsx
import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  History,
  Settings,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';

const FinanceApp = ({ apiUrl }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState('light');
  const [currency, setCurrency] = useState('RUB');
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [savings, setSavings] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // === Telegram API (с проверкой) ===
  const tg = typeof window !== 'undefined' && window.Telegram?.WebApp;
  const haptic = tg?.HapticFeedback;

  // Полноэкранный режим
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.requestFullscreen?.();
      setTheme(tg.colorScheme || 'light');
    }
  }, [tg]);

  // === Fallback first_name ===
  const getFirstName = () => {
    if (tg?.initDataUnsafe?.user?.first_name) {
      return tg.initDataUnsafe.user.first_name;
    }
    if (email) {
      return email.split('@')[0] || 'User';
    }
    return 'User';
  };

  // === Аутентификация (без зависимости от TG user) ===
  const handleAuth = async () => {
    if (!email || !password) {
      alert('Введите email и пароль');
      return;
    }

    const firstName = getFirstName();

    try {
      const res = await fetch(`${apiUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName, // Всегда валидная строка
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      // Успешный вход
      setUser({ ...data.user, first_name: firstName });
      setCurrency(data.user.currency || 'RUB');
      setBalance(data.user.balance || 0);
      setIncome(data.user.income || 0);
      setExpenses(data.user.expenses || 0);
      setSavings(data.user.savings || 0);
      setTransactions(data.transactions || []);
      setIsAuthenticated(true);
      setShowAuthModal(false);

      if (haptic) haptic.impactOccurred('light');
    } catch (err) {
      console.error(err);
      alert('Ошибка сети. Проверьте backend URL.');
    }
  };

  // === Сохранение данных ===
  const saveUserData = async () => {
    if (!user?.id) return;
    try {
      await fetch(`${apiUrl}/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance, income, expenses, savings, currency }),
      });
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const saveTransaction = async (tx) => {
    if (!user?.id) return;
    try {
      await fetch(`${apiUrl}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, ...tx }),
      });
    } catch (err) {
      console.error('Tx save error:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      saveUserData();
    }
  }, [balance, income, expenses, savings, currency]);

  // === Добавление транзакции ===
  const addTransaction = async () => {
    if (!amount || !description) return;

    const newTx = {
      id: Date.now(),
      type: transactionType,
      amount: parseFloat(amount),
      description,
      category: category || 'Другое',
      date: new Date().toISOString(),
    };

    setTransactions(prev => [newTx, ...prev]);
    await saveTransaction(newTx);

    if (transactionType === 'income') {
      setIncome(i => i + newTx.amount);
      setBalance(b => b + newTx.amount);
    } else if (transactionType === 'expense') {
      setExpenses(e => e + newTx.amount);
      setBalance(b => b - newTx.amount);
    } else if (transactionType === 'savings') {
      setSavings(s => s + newTx.amount);
      setBalance(b => b - newTx.amount);
    }

    setAmount('');
    setDescription('');
    setCategory('');
    setShowAddModal(false);
    if (haptic) haptic.impactOccurred('light');
  };

  // === Вибро ===
  const vibrate = () => {
    if (haptic) haptic.impactOccurred('light');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    vibrate();
  };

  const handleThemeChange = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    vibrate();
  };

  const handleCurrencyChange = (newCur) => {
    setCurrency(newCur);
    vibrate();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowAuthModal(true);
    vibrate();
  };

  // === Валюты ===
  const currencies = [
    { code: 'RUB', symbol: '₽', name: 'Российский рубль' },
    { code: 'BYN', symbol: 'Br', name: 'Белорусский рубль' },
    { code: 'USD', symbol: '$', name: 'Доллар США' },
    { code: 'EUR', symbol: '€', name: 'Евро' },
    { code: 'UAH', symbol: '₴', name: 'Гривна' },
  ];

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];

  const formatCurrency = (value) => {
    const formatted = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
    return formatted.replace(/[^\d.,\s]/g, currentCurrency.symbol);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Вчера, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const categories = {
    expense: ['Еда', 'Транспорт', 'Развлечения', 'Счета', 'Покупки', 'Здоровье', 'Другое'],
    income: ['Зарплата', 'Фриланс', 'Подарки', 'Инвестиции', 'Другое'],
    savings: ['Отпуск', 'Накопления', 'Экстренный фонд', 'Цель', 'Другое'],
  };

  // === Стили ===
  const bgColor = theme === 'dark' ? 'bg-black' : 'bg-gray-50';
  const cardBg = theme === 'dark' ? 'bg-zinc-900' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-zinc-800' : 'border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100';

  // === Модалка входа ===
  if (showAuthModal) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
        <div className={`${cardBg} rounded-2xl p-6 w-full max-w-md shadow-lg`}>
          <h2 className={`text-2xl font-bold ${textPrimary} mb-6 text-center`}>
            {tg ? 'Вход в аккаунт' : 'Вход (браузер)'}
          </h2>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full p-4 rounded-xl ${inputBg} ${textPrimary} placeholder:${textSecondary}`}
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full p-4 rounded-xl ${inputBg} ${textPrimary} placeholder:${textSecondary}`}
            />
            <button
              onClick={handleAuth}
              className="w-full py-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition"
            >
              Войти / Зарегистрироваться
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className={textPrimary}>Загрузка...</p>
        </div>
      </div>
    );
  }

  // === Основной UI (без изменений) ===
  return (
    <div className={`min-h-screen ${bgColor} pb-20`}>
      {/* Header */}
      <div className={`${cardBg} ${textPrimary} p-6 rounded-b-3xl shadow-sm`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Привет, {user.first_name || 'Пользователь'}!</h1>
            <p className={`text-sm ${textSecondary}`}>Баланс: {formatCurrency(balance)}</p>
          </div>
          <button
            onClick={() => { setShowSettingsModal(true); vibrate(); }}
            className={`p-3 rounded-full ${inputBg}`}
          >
            <Settings size={20} />
          </button>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'} rounded-2xl p-6 text-white`}>
          <p className="text-sm opacity-90 mb-1">Общий баланс</p>
          <h2 className="text-4xl font-bold mb-4">{formatCurrency(balance)}</h2>
          <div className="flex justify-between text-xs">
            <div><p className="opacity-80">Доходы</p><p className="font-semibold">{formatCurrency(income)}</p></div>
            <div><p className="opacity-80">Расходы</p><p className="font-semibold">{formatCurrency(expenses)}</p></div>
            <div><p className="opacity-80">Накоплено</p><p className="font-semibold">{formatCurrency(savings)}</p></div>
          </div>
        </div>
      </div>

      {/* Остальной UI — вставьте из предыдущего кода (overview, history, savings, modal, nav) */}
      {/* ... (всё остальное без изменений) ... */}
    </div>
  );
};

export default FinanceApp;