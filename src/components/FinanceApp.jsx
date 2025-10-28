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
  // =================== Состояния ===================
  const [user, setUser] = useState(null); // TG user + DB user
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

  // =================== Telegram API ===================
  const tg = window.Telegram?.WebApp;
  const haptic = tg?.HapticFeedback;

  // Полноэкранный режим + готовность
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.requestFullscreen?.();
      setTheme(tg.colorScheme || 'light');
    }
  }, [tg]);

  // Получаем имя из Telegram
  useEffect(() => {
    if (tg?.initDataUnsafe?.user) {
      setUser(prev => ({ ...prev, ...tg.initDataUnsafe.user }));
    }
  }, [tg]);

  // =================== Аутентификация ===================
  const handleAuth = async () => {
    if (!email || !password) return;
    try {
      const res = await fetch(`${apiUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, first_name: user?.first_name || 'User' }),
      });
      const data = await res.json();
      if (data.error) return alert(data.error);

      setUser(prev => ({ ...prev, ...data.user }));
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
      alert('Ошибка входа: ' + err.message);
    }
  };

  // =================== Сохранение/Загрузка данных ===================
  const saveUserData = async () => {
    if (!user?.id) return;
    try {
      await fetch(`${apiUrl}/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance, income, expenses, savings, currency }),
      });
    } catch (err) {
      console.error('Ошибка сохранения:', err);
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
      console.error('Ошибка транзакции:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      saveUserData();
    }
  }, [balance, income, expenses, savings, currency, isAuthenticated, user?.id]);

  // =================== Добавление транзакции ===================
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

  // =================== Виброотклик ===================
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

  // =================== Валюты ===================
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
    return formatted.replace(/[^0-9.,\s]/g, currentCurrency.symbol);
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
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // =================== Категории ===================
  const categories = {
    expense: ['Еда', 'Транспорт', 'Развлечения', 'Счета', 'Покупки', 'Здоровье', 'Другое'],
    income: ['Зарплата', 'Фриланс', 'Подарки', 'Инвестиции', 'Другое'],
    savings: ['Отпуск', 'Накопления', 'Экстренный фонд', 'Цель', 'Другое'],
  };

  // =================== Стили ===================
  const bgColor = theme === 'dark' ? 'bg-black' : 'bg-gray-50';
  const cardBg = theme === 'dark' ? 'bg-zinc-900' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-zinc-800' : 'border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100';

  // =================== Модалка входа ===================
  if (showAuthModal) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
        <div className={`${cardBg} rounded-2xl p-6 w-full max-w-md shadow-lg`}>
          <h2 className={`text-2xl font-bold ${textPrimary} mb-6 text-center`}>Вход / Регистрация</h2>
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
              Войти
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

  // =================== Основной UI ===================
  return (
    <div className={`min-h-screen ${bgColor} pb-20`}>
      {/* Header */}
      <div className={`${cardBg} ${textPrimary} p-6 rounded-b-3xl shadow-sm`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Привет, {user.first_name}! 👋</h1>
            <p className={`text-sm ${textSecondary}`}>Баланс: {formatCurrency(balance)}</p>
          </div>
          <button
            onClick={() => { setShowSettingsModal(true); vibrate(); }}
            className={`p-3 rounded-full ${inputBg}`}
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Balance Card */}
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

      {/* Content */}
      <div className="p-4">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Доход', value: income, Icon: TrendingUp, color: 'green' },
                { label: 'Расход', value: expenses, Icon: TrendingDown, color: 'red' },
                { label: 'Копилка', value: savings, Icon: PiggyBank, color: 'blue' },
              ].map((stat, i) => (
                <div key={i} className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
                  <div className={`bg-${stat.color}-100 p-2 rounded-lg w-fit mb-2`}>
                    <stat.Icon size={16} className={`text-${stat.color}-600`} />
                  </div>
                  <p className={`text-xs ${textSecondary}`}>{stat.label}</p>
                  <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(stat.value)}</p>
                </div>
              ))}
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
                          <p className={`font-medium ${textPrimary}`}>{tx.description}</p>
                          <p className={`text-xs ${textSecondary}`}>{tx.category} • {formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <p className={`font-bold ${tx.type === 'income' ? 'text-green-600' : tx.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>История</h3>
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
                        <p className={`font-medium ${textPrimary}`}>{tx.description}</p>
                        <p className={`text-xs ${textSecondary}`}>{tx.category} • {formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${tx.type === 'income' ? 'text-green-600' : tx.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Savings */}
        {activeTab === 'savings' && (
          <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Копилка</h3>
            <div className="mb-6">
              <div className={`bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-6 text-white`}>
                <p className="text-sm opacity-90 mb-1">Накоплено</p>
                <h2 className="text-4xl font-bold">{formatCurrency(savings)}</h2>
              </div>
            </div>
            {transactions.filter(t => t.type === 'savings').length === 0 ? (
              <p className={`text-center py-8 ${textSecondary}`}>Начните копить!</p>
            ) : (
              <div className="space-y-3">
                {transactions.filter(t => t.type === 'savings').map(tx => (
                  <div key={tx.id} className={`flex items-center justify-between pb-3 ${borderColor} border-b last:border-0`}>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg"><PiggyBank size={18} className="text-blue-600" /></div>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{tx.description}</p>
                        <p className={`text-xs ${textSecondary}`}>{tx.category} • {formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <p className="font-bold text-blue-600">+{formatCurrency(tx.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className={`${cardBg} rounded-t-3xl w-full max-w-md p-6`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Новая операция</h3>
            <div className="flex gap-2 mb-4">
              {['expense', 'income', 'savings'].map(type => (
                <button
                  key={type}
                  onClick={() => { setTransactionType(type); vibrate(); }}
                  className={`flex-1 py-3 rounded-xl font-medium ${
                    transactionType === type
                      ? type === 'income' ? 'bg-green-500 text-white'
                      : type === 'expense' ? 'bg-red-500 text-white'
                      : 'bg-blue-500 text-white'
                      : `${inputBg} ${textSecondary}`
                  }`}
                >
                  {type === 'income' ? 'Доход' : type === 'expense' ? 'Расход' : 'Копилка'}
                </button>
              ))}
            </div>
            <input type="number" placeholder="Сумма" value={amount} onChange={e => setAmount(e.target.value)} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary} text-lg font-bold`} />
            <input type="text" placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <select value={category} onChange={e => setCategory(e.target.value)} className={`w-full p-4 rounded-xl mb-4 ${inputBg} ${textPrimary}`}>
              <option value="">Категория</option>
              {categories[transactionType].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className={`flex-1 py-4 rounded-xl ${inputBg} ${textPrimary} font-medium`}>Отмена</button>
              <button onClick={addTransaction} className={`flex-1 py-4 rounded-xl ${transactionType === 'income' ? 'bg-green-500' : transactionType === 'expense' ? 'bg-red-500' : 'bg-blue-500'} text-white font-medium`}>Добавить</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-2xl p-6 w-full max-w-md`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Настройки</h3>
            <div className="space-y-4">
              <div>
                <label className={`block ${textSecondary} mb-2`}>Тема</label>
                <button onClick={handleThemeChange} className={`p-3 rounded-full ${inputBg}`}>
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
              <div>
                <label className={`block ${textSecondary} mb-2`}>Валюта</label>
                <select value={currency} onChange={e => handleCurrencyChange(e.target.value)} className={`w-full p-3 rounded-xl ${inputBg} ${textPrimary}`}>
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                  ))}
                </select>
              </div>
              <button onClick={handleLogout} className="w-full py-3 bg-red-500 text-white rounded-xl flex items-center justify-center gap-2">
                <LogOut size={18} /> Выйти
              </button>
              <button onClick={() => setShowSettingsModal(false)} className="w-full py-3 bg-gray-500 text-white rounded-xl">Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 ${cardBg} ${borderColor} border-t`}>
        <div className="flex justify-around items-center p-4 max-w-md mx-auto">
          <button onClick={() => handleTabChange('overview')} className={`flex flex-col items-center ${activeTab === 'overview' ? 'text-blue-500' : textSecondary}`}>
            <Wallet size={24} /><span className="text-xs mt-1">Обзор</span>
          </button>
          <button onClick={() => handleTabChange('history')} className={`flex flex-col items-center ${activeTab === 'history' ? 'text-blue-500' : textSecondary}`}>
            <History size={24} /><span className="text-xs mt-1">История</span>
          </button>
          <button onClick={() => { setShowAddModal(true); vibrate(); }} className="flex flex-col items-center -mt-6">
            <div className="bg-blue-500 text-white p-4 rounded-full shadow-lg"><Plus size={28} /></div>
          </button>
          <button onClick={() => handleTabChange('savings')} className={`flex flex-col items-center ${activeTab === 'savings' ? 'text-blue-500' : textSecondary}`}>
            <PiggyBank size={24} /><span className="text-xs mt-1">Копилка</span>
          </button>
          <button onClick={() => { setShowSettingsModal(true); vibrate(); }} className={`flex flex-col items-center ${textSecondary}`}>
            <Settings size={24} /><span className="text-xs mt-1">Настройки</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceApp;