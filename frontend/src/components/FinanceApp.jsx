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
  LogIn,
} from 'lucide-react';

const LS_KEY = 'finance_settings_v2';

const FinanceApp = ({ apiUrl }) => {
  // =================== Состояния ===================
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState('light');
  const [currency, setCurrency] = useState('RUB');
  const [goalSavings, setGoalSavings] = useState(50000);
  const [balance, setBalance] = useState(10000);
  const [income, setIncome] = useState(50000);
  const [expenses, setExpenses] = useState(30000);
  const [savings, setSavings] = useState(10000);
  const [transactions, setTransactions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState('');
  const [transactionType, setTransactionType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authCurrency, setAuthCurrency] = useState('RUB');
  const [safeAreaInset, setSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  // =================== Telegram API ===================
  const tg = typeof window !== 'undefined' && window.Telegram?.WebApp;
  const haptic = tg?.HapticFeedback;

  // =================== Haptic Utils ===================
  const vibrate = () => haptic?.impactOccurred && haptic.impactOccurred('light');
  const vibrateSuccess = () => haptic?.notificationOccurred && haptic.notificationOccurred('success');
  const vibrateError = () => haptic?.notificationOccurred && haptic.notificationOccurred('error');
  const vibrateWarning = () => haptic?.notificationOccurred && haptic.notificationOccurred('warning');
  const vibrateSelect = () => haptic?.selectionChanged && haptic.selectionChanged();

  // =================== Safe Area ===================
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      setTheme(tg.colorScheme || 'light');

      // Safe area
      const updateSafeArea = () => {
        setSafeAreaInset({
          top: tg.safeAreaInset?.top || 0,
          bottom: tg.safeAreaInset?.bottom || 0,
          left: tg.safeAreaInset?.left || 0,
          right: tg.safeAreaInset?.right || 0,
        });
      };
      tg.onEvent?.('safeAreaChanged', updateSafeArea);
      updateSafeArea();

      return () => {
        tg.offEvent?.('safeAreaChanged', updateSafeArea);
      };
    }
  }, [tg]);

  const displayName = tg?.initDataUnsafe?.user?.first_name || 'Гость';

  // =================== Сессия (localStorage) ===================
  useEffect(() => {
    // При старте подтянуть настройки и сессию
    const ls = localStorage.getItem(LS_KEY);
    if (ls) {
      try {
        const data = JSON.parse(ls);
        setCurrency(data.currency || 'RUB');
        setGoalSavings(data.goalSavings || 50000);
        setTheme(data.theme || 'light');
        setEmail(data.email || '');
        setPassword(data.password || '');
        setAuthCurrency(data.authCurrency || 'RUB');
        setIsAuthenticated(data.isAuthenticated || false);
        if (data.user) setUser(data.user);
      } catch { }
    }
    const session = localStorage.getItem('finance_session');
    if (session) {
      const { email, token } = JSON.parse(session);
      autoLogin(email, token);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Сохранять все настройки и вход при изменении
    localStorage.setItem(LS_KEY, JSON.stringify({
      currency, goalSavings, theme, email, password, authCurrency, isAuthenticated, user
    }));
  }, [currency, goalSavings, theme, email, password, authCurrency, isAuthenticated, user]);

  const autoLogin = async (email, token) => {
    try {
      const res = await fetch(`${apiUrl}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...data.user, first_name: displayName });
        setIsAuthenticated(true);
        loadUserData(data.user.id);
        vibrateSuccess();
      }
    } catch (err) {
      localStorage.removeItem('finance_session');
      vibrateError();
    }
  };

  const saveSession = () => {
    const token = btoa(email + ':' + btoa(password));
    localStorage.setItem('finance_session', JSON.stringify({ email, token }));
  };

  // =================== Аутентификация ===================
  const handleAuth = async () => {
    if (!email || !password) {
      vibrateError();
      return alert('Введите email и пароль');
    }
    try {
      const res = await fetch(`${apiUrl}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, first_name: displayName, currency: authCurrency }),
      });
      if (!res.ok) {
        let msg = '';
        try {
          msg = (await res.json()).error || await res.text();
        } catch {
          msg = res.status + ' ' + res.statusText;
        }
        vibrateError();
        alert(`Ошибка: ${msg}`);
        return;
      }
      const data = await res.json();
      setUser({ ...data.user, first_name: displayName });
      setCurrency(authCurrency);
      setIsAuthenticated(true);
      saveSession();
      loadUserData(data.user.id);
      setShowAuthModal(false);
      vibrateSuccess();
    } catch (err) {
      vibrateError();
      alert('Нет связи с сервером');
    }
  };

  const loadUserData = async (userId) => {
    try {
      const res = await fetch(`${apiUrl}/api/user/${email}`);
      const data = await res.json();
      setBalance(data.balance || 0);
      setIncome(data.income || 0);
      setExpenses(data.expenses || 0);
      setSavings(data.savings || 0);
      setCurrency(data.currency || 'RUB');
      setGoalSavings(data.goal_savings || 50000);

      const txRes = await fetch(`${apiUrl}/api/transactions?user_id=${userId}`);
      setTransactions(await txRes.json());
    } catch (err) {
      vibrateError();
      console.error('Load error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('finance_session');
    setIsAuthenticated(false);
    setUser(null);
    setBalance(10000); setIncome(50000); setExpenses(30000); setSavings(10000);
    setTransactions([]);
    vibrateWarning();
  };

  // =================== Сохранение ===================
  const saveUserData = async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      await fetch(`${apiUrl}/api/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance, income, expenses, savings, currency, goalSavings }),
      });
    } catch (err) {}
  };

  useEffect(() => { saveUserData(); }, [balance, income, expenses, savings, goalSavings]); // eslint-disable-line

  // =================== Транзакции ===================
  const addTransaction = async () => {
    if (!amount) {
      vibrateError();
      return;
    }
    // Если имя Telegram отличается от основного, добавляем имя Telegram к описанию
    let txDesc = description;
    if (displayName && user && displayName !== user.first_name) {
      txDesc = (description ? `${displayName}: ${description}` : displayName);
    }
    const newTx = {
      id: Date.now(),
      type: transactionType,
      amount: parseFloat(amount),
      description: txDesc || '', // Описание не обязательно
      category: category || 'Другое',
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTx, ...prev]);
    if (isAuthenticated) saveTransaction(newTx);

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
    setAmount(''); setDescription(''); setCategory(''); setShowAddModal(false);
    vibrateSuccess();
  };

  const saveTransaction = async (tx) => {
    await fetch(`${apiUrl}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, ...tx }),
    });
  };

  // =================== График Chart.js ===================
  useEffect(() => {
    if (!showChart || !window.Chart) return;

    const canvas = document.getElementById('financeChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (window.financeChart) window.financeChart.destroy();

    const data = chartType === 'income'
      ? transactions.filter(t => t.type === 'income')
      : transactions.filter(t => t.type === 'expense');

    const categoriesData = {};
    data.forEach(t => {
      categoriesData[t.category] = (categoriesData[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(categoriesData);
    const values = Object.values(categoriesData);
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    window.financeChart = new window.Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, labels.length),
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
    // eslint-disable-next-line
  }, [showChart, chartType, transactions]);

  // =================== UI Цвета ===================
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
    const standardSymbol = Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(0).replace(/\d\s/g, '');
    return formatted.replace(standardSymbol, currentCurrency.symbol);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    if (date.toDateString() === yesterday.toDateString()) return `Вчера, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const categoriesList = {
    expense: ['Еда', 'Транспорт', 'Развлечения', 'Счета', 'Покупки', 'Здоровье', 'Другое'],
    income: ['Зарплата', 'Фриланс', 'Подарки', 'Инвестиции', 'Другое'],
    savings: ['Отпуск', 'Накопления', 'Экстренный фонд', 'Цель', 'Другое'],
  };

  const bgColor = theme === 'dark' ? 'bg-black' : 'bg-gray-50';
  const cardBg = theme === 'dark' ? 'bg-zinc-900' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-zinc-800' : 'border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100';
  const themeToggleBg = theme === 'dark' ? 'bg-yellow-400' : 'bg-zinc-800';

  // =================== РЕНДЕР ===================
  return (
    <div
      className={`min-h-screen ${bgColor} pb-20`}
      style={{
        paddingTop: safeAreaInset.top || 0,
        paddingBottom: safeAreaInset.bottom || 0,
        paddingLeft: safeAreaInset.left || 0,
        paddingRight: safeAreaInset.right || 0,
      }}
    >
      {/* Header — только на Обзор, без иконки настроек */}
      {activeTab === 'overview' && (
        <div className={`${cardBg} ${textPrimary} p-6 rounded-b-3xl shadow-sm`}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Привет, {isAuthenticated ? user?.first_name : displayName}!</h1>
            <p className={`text-sm ${textSecondary}`}>{isAuthenticated ? 'Аккаунт подключён' : 'Демо-режим'}</p>
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
      )}

      {/* Контент */}
      <div className="p-4">
        {/* Обзор */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className={`${cardBg} rounded-xl p-4 ${borderColor} border cursor-pointer`} onClick={() => { setChartType('income'); setShowChart(true); vibrate(); }}>
                <div className="bg-green-100 p-2 rounded-lg w-fit mb-2"><TrendingUp size={16} className="text-green-600" /></div>
                <p className={`text-xs ${textSecondary}`}>Доход</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(income)}</p>
              </div>
              <div className={`${cardBg} rounded-xl p-4 ${borderColor} border cursor-pointer`} onClick={() => { setChartType('expense'); setShowChart(true); vibrate(); }}>
                <div className="bg-red-100 p-2 rounded-lg w-fit mb-2"><TrendingDown size={16} className="text-red-600" /></div>
                <p className={`text-xs ${textSecondary}`}>Расход</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(expenses)}</p>
              </div>
              <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
                <div className="bg-blue-100 p-2 rounded-lg w-fit mb-2"><PiggyBank size={16} className="text-blue-600" /></div>
                <p className={`text-xs ${textSecondary}`}>Копилка</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(savings)}</p>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Последние операции</h3>
              {transactions.length === 0 ? (
                <p className={`text-center py-8 ${textSecondary}`}>Пока нет операций</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-green-100' : tx.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'}`}>
                          {tx.type === 'income' ? <TrendingUp size={18} className="text-green-600" /> :
                            tx.type === 'expense' ? <TrendingDown size={18} className="text-red-600" /> :
                              <PiggyBank size={18} className="text-blue-600" />}
                        </div>
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{tx.description || '—'}</p>
                          <p className={`text-xs ${textSecondary}`}>{tx.category} • {formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0">
                        <p className={`font-bold ${tx.type === 'income' ? 'text-green-600' : tx.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <span className="text-xs text-gray-400">{formatTime(tx.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* История */}
        {activeTab === 'history' && (
          <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>История операций</h3>
            {transactions.length === 0 ? (
              <p className={`text-center py-8 ${textSecondary}`}>Нет операций</p>
            ) : (
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className={`flex items-center justify-between pb-3 ${borderColor} border-b last:border-0`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-green-100' : tx.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        {tx.type === 'income' ? <TrendingUp size={18} className="text-green-600" /> :
                          tx.type === 'expense' ? <TrendingDown size={18} className="text-red-600" /> :
                            <PiggyBank size={18} className="text-blue-600" />}
                      </div>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{tx.description || '—'}</p>
                        <p className={`text-xs ${textSecondary}`}>{tx.category} • {formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0">
                      <p className={`font-bold ${tx.type === 'income' ? 'text-green-600' : tx.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <span className="text-xs text-gray-400">{formatTime(tx.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Копилка */}
        {activeTab === 'savings' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Копилка</h3>
              <div className={`bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-6 text-white mb-4`}>
                <p className="text-sm opacity-90 mb-1">Накоплено</p>
                <h2 className="text-4xl font-bold mb-2">{formatCurrency(savings)}</h2>
                <p className="text-sm opacity-80">Цель: {formatCurrency(goalSavings)}</p>
                <div className="w-full bg-white/20 rounded-full h-3 mt-2">
                  <div className="bg-white h-3 rounded-full transition-all" style={{ width: `${Math.min((savings / goalSavings) * 100, 100)}%` }}></div>
                </div>
                <p className="text-sm mt-2">{Math.round((savings / goalSavings) * 100)}% достигнуто</p>
              </div>
              <button onClick={() => { setTransactionType('savings'); setShowAddModal(true); vibrate(); }} className="w-full py-3 bg-blue-500 text-white rounded-xl">
                Пополнить копилку
              </button>
            </div>

            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>История пополнений</h3>
              {transactions.filter(t => t.type === 'savings').length === 0 ? (
                <p className={`text-center py-8 ${textSecondary}`}>Начните копить!</p>
              ) : (
                <div className="space-y-3">
                  {transactions.filter(t => t.type === 'savings').map(tx => (
                    <div key={tx.id} className={`flex items-center justify-between pb-3 ${borderColor} border-b last:border-0`}>
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg"><PiggyBank size={18} className="text-blue-600" /></div>
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{tx.description || '—'}</p>
                          <p className={`text-xs ${textSecondary}`}>{tx.category} • {formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0">
                        <p className="font-bold text-blue-600">+{formatCurrency(tx.amount)}</p>
                        <span className="text-xs text-gray-400">{formatTime(tx.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Настройки */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* 1. Вход / Регистрация */}
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Аккаунт</h3>
              {!isAuthenticated ? (
                <button onClick={() => { setShowAuthModal(true); vibrate(); }} className="w-full py-3 bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2">
                  <LogIn size={18} /> Войти
                </button>
              ) : (
                <button onClick={handleLogout} className="w-full py-3 bg-red-500 text-white rounded-xl flex items-center justify-center gap-2">
                  <LogOut size={18} /> Выйти
                </button>
              )}
            </div>
            {/* 2. Тема */}
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Тема</h3>
              <button
                onClick={() => { setTheme(t => t === 'dark' ? 'light' : 'dark'); vibrate(); }}
                className={`p-3 rounded-full ${themeToggleBg} flex items-center justify-center`}
                aria-label="Сменить тему"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            {/* 3. Валюта */}
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Валюта</h3>
              <select value={currency} onChange={e => { setCurrency(e.target.value); vibrateSelect(); }} className={`w-full p-3 rounded-xl ${inputBg} ${textPrimary}`}>
                {currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>)}
              </select>
            </div>
            {/* 4. Цель копилки */}
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Цель копилки</h3>
              <input type="number" value={goalSavings} onChange={e => setGoalSavings(parseFloat(e.target.value) || 0)} className={`w-full p-3 rounded-xl ${inputBg} ${textPrimary}`} placeholder="Цель" />
            </div>
          </div>
        )}
      </div>

      {/* График */}
      {showChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-2xl p-6 w-full max-w-md`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>{chartType === 'income' ? 'Доходы' : 'Расходы'} по категориям</h3>
            <div className="relative h-64">
              <canvas id="financeChart"></canvas>
            </div>
            <button onClick={() => { setShowChart(false); vibrate(); }} className="mt-4 w-full py-3 bg-gray-500 text-white rounded-xl">Закрыть</button>
          </div>
        </div>
      )}

      {/* Модалка добавления */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className={`${cardBg} rounded-t-3xl w-full max-w-md p-6`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Новая операция</h3>
            <div className="flex gap-2 mb-4">
              {['expense', 'income', 'savings'].map(type => (
                <button key={type} onClick={() => { setTransactionType(type); vibrateSelect(); }} className={`flex-1 py-3 rounded-xl font-medium ${transactionType === type ? type === 'income' ? 'bg-green-500 text-white' : type === 'expense' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white' : `${inputBg} ${textSecondary}`}`}>
                  {type === 'income' ? 'Доход' : type === 'expense' ? 'Расход' : 'Копилка'}
                </button>
              ))}
            </div>
            <input type="number" placeholder="Сумма" value={amount} onChange={e => setAmount(e.target.value)} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary} text-lg font-bold`} />
            <input type="text" placeholder="Описание (необязательно)" value={description} onChange={e => setDescription(e.target.value)} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <select value={category} onChange={e => setCategory(e.target.value)} className={`w-full p-4 rounded-xl mb-4 ${inputBg} ${textPrimary}`}>
              <option value="">Категория</option>
              {categoriesList[transactionType].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => { setShowAddModal(false); vibrate(); }} className={`flex-1 py-4 rounded-xl ${inputBg} ${textPrimary} font-medium`}>Отмена</button>
              <button onClick={addTransaction} className={`flex-1 py-4 rounded-xl ${transactionType === 'income' ? 'bg-green-500' : transactionType === 'expense' ? 'bg-red-500' : 'bg-blue-500'} text-white font-medium`}>Добавить</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка входа */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-2xl p-6 w-full max-w-md`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Вход / Регистрация</h3>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <p className={`text-sm ${textSecondary} mb-2`}>Имя: {displayName}</p>
            <select value={authCurrency} onChange={e => setAuthCurrency(e.target.value)} className={`w-full p-4 rounded-xl mb-4 ${inputBg} ${textPrimary}`}>
              {currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => { setShowAuthModal(false); vibrate(); }} className={`flex-1 py-3 ${inputBg} ${textPrimary} rounded-xl`}>Отмена</button>
              <button onClick={handleAuth} className="flex-1 py-3 bg-blue-500 text-white rounded-xl">Войти</button>
            </div>
          </div>
        </div>
      )}

      {/* Нижняя навигация */}
      <div className={`fixed bottom-0 left-0 right-0 ${cardBg} ${borderColor} border-t`}>
        <div className="flex justify-around items-center p-4 max-w-md mx-auto">
          <button onClick={() => { setActiveTab('overview'); vibrate(); }} className={`flex flex-col items-center ${activeTab === 'overview' ? 'text-blue-500' : textSecondary}`}><Wallet size={24} /><span className="text-xs mt-1">Обзор</span></button>
          <button onClick={() => { setActiveTab('history'); vibrate(); }} className={`flex flex-col items-center ${activeTab === 'history' ? 'text-blue-500' : textSecondary}`}><History size={24} /><span className="text-xs mt-1">История</span></button>
          <button onClick={() => { setShowAddModal(true); vibrate(); }} className="flex flex-col items-center -mt-6"><div className="bg-blue-500 text-white p-4 rounded-full shadow-lg"><Plus size={28} /></div></button>
          <button onClick={() => { setActiveTab('savings'); vibrate(); }} className={`flex flex-col items-center ${activeTab === 'savings' ? 'text-blue-500' : textSecondary}`}><PiggyBank size={24} /><span className="text-xs mt-1">Копилка</span></button>
          <button onClick={() => { setActiveTab('settings'); vibrate(); }} className={`flex flex-col items-center ${activeTab === 'settings' ? 'text-blue-500' : textSecondary}`}><Settings size={24} /><span className="text-xs mt-1">Настройки</span></button>
        </div>
      </div>
    </div>
  );
};

export default FinanceApp;