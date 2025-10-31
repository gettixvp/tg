import React, { useState, useEffect, useRef } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  History,
  Settings,
  LogOut,
  LogIn,
} from 'lucide-react';

const LS_KEY = 'finance_settings_v2';

const categoriesMeta = {
  'Еда': { color: 'bg-orange-400', icon: '🍔' },
  'Транспорт': { color: 'bg-blue-400', icon: '🚗' },
  'Развлечения': { color: 'bg-pink-400', icon: '🎉' },
  'Счета': { color: 'bg-teal-400', icon: '💡' },
  'Покупки': { color: 'bg-purple-400', icon: '🛒' },
  'Здоровье': { color: 'bg-yellow-400', icon: '💊' },
  'Другое': { color: 'bg-gray-400', icon: '💼' },
  'Зарплата': { color: 'bg-green-400', icon: '💵' },
  'Фриланс': { color: 'bg-cyan-400', icon: '👨‍💻' },
  'Подарки': { color: 'bg-yellow-300', icon: '🎁' },
  'Инвестиции': { color: 'bg-indigo-400', icon: '📈' },
  'Отпуск': { color: 'bg-blue-300', icon: '🏖️' },
  'Накопления': { color: 'bg-blue-800', icon: '💰' },
  'Экстренный фонд': { color: 'bg-red-400', icon: '🚨' },
  'Цель': { color: 'bg-emerald-300', icon: '🎯' },
};

const categoriesList = {
  expense: ['Еда', 'Транспорт', 'Развлечения', 'Счета', 'Покупки', 'Здоровье', 'Другое'],
  income: ['Зарплата', 'Фриланс', 'Подарки', 'Инвестиции', 'Другое'],
  savings: ['Отпуск', 'Накопления', 'Экстренный фонд', 'Цель', 'Другое'],
};

const currencies = [
  { code: 'RUB', symbol: '₽', name: 'Российский рубль' },
  { code: 'BYN', symbol: 'Br', name: 'Белорусский рубль' },
  { code: 'USD', symbol: '$', name: 'Доллар США' },
  { code: 'EUR', symbol: '€', name: 'Евро' },
  { code: 'UAH', symbol: '₴', name: 'Гривна' },
];

export default function FinanceApp({ apiUrl }) {
  // ===== Состояния =====
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState('light');
  const [currency, setCurrency] = useState('RUB');
  const [goalSavings, setGoalSavings] = useState(50000);
  const [goalInput, setGoalInput] = useState('50000');
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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // refs для автофокуса
  const amountInputRef = useRef(null);

  // ===== Telegram API =====
  const tg = typeof window !== 'undefined' && window.Telegram?.WebApp;
  const haptic = tg?.HapticFeedback;

  // ===== Haptic =====
  const vibrate = () => haptic?.impactOccurred && haptic.impactOccurred('light');
  const vibrateSuccess = () => haptic?.notificationOccurred && haptic.notificationOccurred('success');
  const vibrateError = () => haptic?.notificationOccurred && haptic.notificationOccurred('error');
  const vibrateSelect = () => haptic?.selectionChanged && haptic.selectionChanged();

  // ===== Safe Area =====
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
      return () => tg.offEvent?.('safeAreaChanged', updateSafeArea);
    }
  }, [tg]);

  const displayName = tg?.initDataUnsafe?.user?.first_name || 'Гость';

  // ===== Keyboard =====
  useEffect(() => {
    let prevHeight = window.innerHeight;
    const onResize = () => {
      setIsKeyboardOpen(window.innerHeight < prevHeight - 120);
      prevHeight = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function blurAll() {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  }

  // ===== Session =====
  useEffect(() => {
    const ls = localStorage.getItem(LS_KEY);
    if (ls) {
      try {
        const data = JSON.parse(ls);
        setCurrency(data.currency || 'RUB');
        setGoalSavings(data.goalSavings || 50000);
        setGoalInput(data.goalSavings?.toString() || '50000');
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
        await loadUserData(data.user.id);
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

  // ===== Auth =====
  const handleAuth = async () => {
    blurAll();
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
        try { msg = (await res.json()).error || await res.text(); }
        catch { msg = res.status + ' ' + res.statusText; }
        vibrateError();
        alert(`Ошибка: ${msg}`);
        return;
      }
      const data = await res.json();
      setUser({ ...data.user, first_name: displayName });
      setCurrency(authCurrency);
      setIsAuthenticated(true);
      saveSession();
      await loadUserData(data.user.id);
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
      setGoalInput((data.goal_savings ?? 50000).toString());

      const txRes = await fetch(`${apiUrl}/api/transactions?user_id=${userId}`);
      setTransactions(await txRes.json());
    } catch (err) {
      vibrateError();
      console.error('Load error:', err);
    }
  };

  const handleLogout = () => {
    blurAll();
    localStorage.removeItem('finance_session');
    setIsAuthenticated(false);
    setUser(null);
    setBalance(10000);
    setIncome(50000);
    setExpenses(30000);
    setSavings(10000);
    setTransactions([]);
    vibrateError();
  };

  // ===== Сохранение =====
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

  // ===== Транзакции =====
  const addTransaction = async () => {
    blurAll();
    if (!amount) {
      vibrateError();
      return;
    }
    let txDesc = description;
    if (displayName && user && displayName !== user.first_name) {
      txDesc = (description ? `${displayName}: ${description}` : displayName);
    }
    const newTx = {
      id: Date.now(),
      type: transactionType,
      amount: parseFloat(amount),
      description: txDesc || '',
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

  // ===== Chart.js =====
  useEffect(() => {
    if (!showChart || !window.Chart) return;
    const canvas = document.getElementById('financeChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (window.financeChart) window.financeChart.destroy();

    const data = chartType === 'income'
      ? transactions.filter(t => t.type === 'income')
      : chartType === 'expense'
      ? transactions.filter(t => t.type === 'expense')
      : transactions.filter(t => t.type === 'savings');

    const categoriesData = {};
    data.forEach(t => {
      categoriesData[t.category] = (categoriesData[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(categoriesData);
    const values = Object.values(categoriesData);
    const colors = labels.map(cat => categoriesMeta[cat]?.color?.replace('bg-', '').replace('-400','') || '#ccc');
    window.financeChart = new window.Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }, [showChart, chartType, transactions]);

  // ===== Форматирование =====
  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const formatCurrency = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '';
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

  const cardBg = theme === 'dark' ? 'bg-zinc-900' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-zinc-800' : 'border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100';

  // ===== Pie chart данные для главной =====
  function getPieData(type) {
    const data = transactions.filter(t => t.type === type);
    const catList = categoriesList[type];
    const catData = {};
    catList.forEach(cat => { catData[cat] = 0; });
    data.forEach(tx => { catData[tx.category] = (catData[tx.category] || 0) + tx.amount; });
    const labels = catList;
    const values = catList.map(cat => catData[cat]);
    const colors = catList.map(cat => ({
      'expense': categoriesMeta[cat]?.color || 'bg-gray-300',
      'income': categoriesMeta[cat]?.color || 'bg-gray-300',
      'savings': categoriesMeta[cat]?.color || 'bg-gray-300',
    })[type].replace('bg-', '').replace('-400',''));
    return { labels, values, colors };
  }

  // ====== Транзакция (универсальная строка для истории/копилки) ======
  const TxRow = ({ tx }) => (
    <div key={tx.id} className="flex items-center justify-between pb-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full text-xl ${categoriesMeta[tx.category]?.color ?? 'bg-gray-200'}`}>
          {categoriesMeta[tx.category]?.icon ?? '💼'}
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
  );

  // ===== РЕНДЕР =====
  return (
    <div
      className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'} pb-20`}
      style={{
        paddingTop: safeAreaInset.top || 0,
        paddingBottom: safeAreaInset.bottom || 0,
        paddingLeft: safeAreaInset.left || 0,
        paddingRight: safeAreaInset.right || 0,
      }}
    >

      {/* Header — только на Обзор, только для гостя */}
      {activeTab === 'overview' && (
        <div className={`${cardBg} ${textPrimary} p-6 rounded-b-3xl shadow-sm`}>
          {!isAuthenticated && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Привет, гость!</h1>
              <p className={`text-sm ${textSecondary}`}>Войдите в аккаунт для синхронизации.</p>
            </div>
          )}
        </div>
      )}

      <div className="p-4 flex-1 w-full max-w-md mx-auto">

        {/* ========== ГЛАВНАЯ ========== */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Доходы */}
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border flex flex-col items-center`}>
              <div className="font-bold text-xl mb-2">Доходы</div>
              <div className="flex flex-col items-center">
                <div className="h-32 w-32">
                  <canvas
                    id="incomePie"
                    height="128"
                    width="128"
                    style={{ width: 128, height: 128 }}
                  ></canvas>
                </div>
                <div className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(income)}</div>
              </div>
              <button
                className="mt-2 text-xs text-blue-500 underline"
                onClick={() => { setChartType('income'); setShowChart(true); vibrate(); blurAll(); }}
              >Показать по категориям</button>
            </div>

            {/* Расходы */}
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border flex flex-col items-center`}>
              <div className="font-bold text-xl mb-2">Расходы</div>
              <div className="flex flex-col items-center">
                <div className="h-32 w-32">
                  <canvas
                    id="expensePie"
                    height="128"
                    width="128"
                    style={{ width: 128, height: 128 }}
                  ></canvas>
                </div>
                <div className="mt-2 text-2xl font-bold text-red-500">{formatCurrency(expenses)}</div>
              </div>
              <button
                className="mt-2 text-xs text-blue-500 underline"
                onClick={() => { setChartType('expense'); setShowChart(true); vibrate(); blurAll(); }}
              >Показать по категориям</button>
            </div>

            {/* Копилка (баланс + pie) */}
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border flex flex-col items-center`}>
              <div className="font-bold text-xl mb-2">Копилка</div>
              <div className="flex flex-col items-center">
                <div className="h-32 w-32">
                  <canvas
                    id="savingsPie"
                    height="128"
                    width="128"
                    style={{ width: 128, height: 128 }}
                  ></canvas>
                </div>
                <div className="mt-2 text-2xl font-bold text-blue-600">{formatCurrency(savings)}</div>
              </div>
              <button
                className="mt-2 text-xs text-blue-500 underline"
                onClick={() => { setActiveTab('savings'); vibrate(); blurAll(); }}
              >Перейти в копилку</button>
            </div>
          </div>
        )}

        {/* ========== ИСТОРИЯ ========== */}
        {activeTab === 'history' && (
          <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>История операций</h3>
            {transactions.length === 0 ? (
              <p className={`text-center py-8 ${textSecondary}`}>Нет операций</p>
            ) : (
              <div className="space-y-3">
                {transactions.map(tx => <TxRow tx={tx} key={tx.id} />)}
              </div>
            )}
          </div>
        )}

        {/* ========== КОПИЛКА ========== */}
        {activeTab === 'savings' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border flex flex-col items-center`}>
              <div className="font-bold text-xl mb-2">Копилка</div>
              <div className="relative flex flex-col items-center w-full">
                {/* Диаграмма круговая прогресса */}
                <div
                  className="relative flex items-center justify-center mb-3"
                  style={{ width: 160, height: 160 }}
                >
                  {/* Прогресс кольцо */}
                  <svg width="160" height="160">
                    <circle
                      cx="80" cy="80" r="72"
                      fill="none"
                      stroke="#D1D5DB"
                      strokeWidth="14"
                    />
                    <circle
                      cx="80" cy="80" r="72"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="14"
                      strokeDasharray={2 * Math.PI * 72}
                      strokeDashoffset={
                        2 * Math.PI * 72 * (1 - Math.min((savings || 0) / (goalSavings || 1), 1))
                      }
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.5s' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(savings)}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">из {formatCurrency(goalSavings)}</span>
                    <span className="text-xs text-gray-400 mt-1">
                      {goalSavings ? Math.round((savings / goalSavings) * 100) : 0}%
                    </span>
                  </div>
                </div>
                {/* Поле ввода цели */}
                <div className="w-full flex flex-col items-center mt-2">
                  <span className="text-sm text-gray-400">Цель:</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-36 mt-1 mb-2 px-3 py-2 rounded-xl text-center text-lg border outline-none text-blue-900"
                    value={goalInput}
                    min={0}
                    onChange={e => {
                      const val = e.target.value.replace(/^0+/, ''); // убрать ведущие нули
                      setGoalInput(val);
                      if (val === '') return setGoalSavings(0);
                      const num = parseInt(val, 10);
                      if (!isNaN(num)) setGoalSavings(num);
                    }}
                    onFocus={() => setIsKeyboardOpen(true)}
                    onBlur={() => setIsKeyboardOpen(false)}
                    onKeyDown={e => { if (e.key === 'Enter') blurAll(); }}
                    placeholder="Ваша цель"
                  />
                </div>
              </div>
              <button
                onClick={() => { setTransactionType('savings'); setShowAddModal(true); vibrate(); blurAll(); }}
                className="w-14 h-14 flex items-center justify-center font-bold text-2xl text-blue-600 mt-4 mb-1 select-none"
                style={{ background: 'none', border: 'none' }}
              >+</button>
              <span className="text-xs text-gray-400">Пополнить копилку</span>
            </div>

            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>История пополнений</h3>
              {transactions.filter(t => t.type === 'savings').length === 0 ? (
                <p className={`text-center py-8 ${textSecondary}`}>Начните копить!</p>
              ) : (
                <div className="space-y-3">
                  {transactions.filter(t => t.type === 'savings').map(tx => <TxRow tx={tx} key={tx.id} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== НАСТРОЙКИ ========== */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* 1. Вход / Регистрация и приветствие для авторизованного */}
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Аккаунт</h3>
              {isAuthenticated ? (
                <div>
                  <div className="mb-2 font-semibold text-lg">
                    Привет, {user?.first_name || user?.email}!
                  </div>
                  <button onClick={() => { blurAll(); handleLogout(); }} className="w-full py-3 bg-red-500 text-white rounded-xl flex items-center justify-center gap-2">
                    <LogOut size={18} /> Выйти
                  </button>
                </div>
              ) : (
                <button onClick={() => { setShowAuthModal(true); vibrate(); blurAll(); }} className="w-full py-3 bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2">
                  <LogIn size={18} /> Войти
                </button>
              )}
            </div>
            {/* 2. Тема */}
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Тема</h3>
              <span
                onClick={() => { setTheme(t => t === 'dark' ? 'light' : 'dark'); vibrate(); blurAll(); }}
                className="cursor-pointer underline text-blue-500"
                style={{ userSelect: 'none' }}
              >
                Сменить тему на {theme === 'dark' ? 'светлую' : 'тёмную'}
              </span>
            </div>
            {/* 3. Валюта */}
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Валюта</h3>
              <select value={currency} onChange={e => { setCurrency(e.target.value); vibrateSelect(); blurAll(); }} className={`w-full p-3 rounded-xl ${inputBg} ${textPrimary}`}>
                {currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* График */}
      {showChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-2xl p-6 w-full max-w-md`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>
              {chartType === 'income'
                ? 'Доходы'
                : chartType === 'expense'
                ? 'Расходы'
                : 'Копилка'} по категориям
            </h3>
            <div className="relative h-64">
              <canvas id="financeChart"></canvas>
            </div>
            <button onClick={() => { setShowChart(false); vibrate(); blurAll(); }} className="mt-4 w-full py-3 bg-gray-500 text-white rounded-xl">Закрыть</button>
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
                <button key={type} onClick={() => { setTransactionType(type); vibrateSelect(); blurAll(); }} className={`flex-1 py-3 rounded-xl font-medium ${transactionType === type ? type === 'income' ? 'bg-green-500 text-white' : type === 'expense' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white' : `${inputBg} ${textSecondary}`}`}>
                  {type === 'income' ? 'Доход' : type === 'expense' ? 'Расход' : 'Копилка'}
                </button>
              ))}
            </div>
            <input
              ref={amountInputRef}
              type="number"
              inputMode="decimal"
              placeholder="Сумма"
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/^0+/,''))}
              onFocus={() => setIsKeyboardOpen(true)}
              onBlur={() => setIsKeyboardOpen(false)}
              onKeyDown={e => { if (e.key === 'Enter') blurAll(); }}
              className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary} text-lg font-bold`}
            />
            <input
              type="text"
              placeholder="Описание (необязательно)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onFocus={() => setIsKeyboardOpen(true)}
              onBlur={() => setIsKeyboardOpen(false)}
              onKeyDown={e => { if (e.key === 'Enter') blurAll(); }}
              className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`}
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className={`w-full p-4 rounded-xl mb-4 ${inputBg} ${textPrimary}`}
              onFocus={() => setIsKeyboardOpen(true)}
              onBlur={() => setIsKeyboardOpen(false)}
            >
              <option value="">Категория</option>
              {categoriesList[transactionType].map(cat => (
                <option key={cat} value={cat}>
                  {categoriesMeta[cat]?.icon ? categoriesMeta[cat].icon + ' ' : ''}{cat}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => { setShowAddModal(false); vibrate(); blurAll(); }} className={`flex-1 py-4 rounded-xl ${inputBg} ${textPrimary} font-medium`}>Отмена</button>
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
              <button onClick={() => { setShowAuthModal(false); vibrate(); blurAll(); }} className={`flex-1 py-3 ${inputBg} ${textPrimary} rounded-xl`}>Отмена</button>
              <button onClick={handleAuth} className="flex-1 py-3 bg-blue-500 text-white rounded-xl">Войти</button>
            </div>
          </div>
        </div>
      )}

      {/* Нижняя навигация */}
      {!isKeyboardOpen && (
        <div className={`fixed bottom-0 left-0 right-0 ${cardBg} ${borderColor} border-t transition-all duration-200`}>
          <div className="flex justify-around items-center p-4 max-w-md mx-auto">
            <button onClick={() => { setActiveTab('overview'); vibrate(); blurAll(); }} className={`flex flex-col items-center ${activeTab === 'overview' ? 'text-blue-500' : textSecondary}`}><Wallet size={24} /><span className="text-xs mt-1">Главная</span></button>
            <button onClick={() => { setActiveTab('history'); vibrate(); blurAll(); }} className={`flex flex-col items-center ${activeTab === 'history' ? 'text-blue-500' : textSecondary}`}><History size={24} /><span className="text-xs mt-1">История</span></button>
            <button onClick={() => { setShowAddModal(true); vibrate(); blurAll(); }} className="flex flex-col items-center text-blue-600 text-3xl font-bold -mt-6">+</button>
            <button onClick={() => { setActiveTab('savings'); vibrate(); blurAll(); }} className={`flex flex-col items-center ${activeTab === 'savings' ? 'text-blue-500' : textSecondary}`}><PiggyBank size={24} /><span className="text-xs mt-1">Копилка</span></button>
            <button onClick={() => { setActiveTab('settings'); vibrate(); blurAll(); }} className={`flex flex-col items-center ${activeTab === 'settings' ? 'text-blue-500' : textSecondary}`}><Settings size={24} /><span className="text-xs mt-1">Настройки</span></button>
          </div>
        </div>
      )}
    </div>
  );
}