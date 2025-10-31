import React, { useEffect, useState } from 'react';
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
  // --- State ---
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview | history | savings | settings
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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Goal modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState(goalSavings.toString());

  // Telegram WebApp detection (optional)
  const tg = typeof window !== 'undefined' && window.Telegram?.WebApp;
  const haptic = tg?.HapticFeedback;
  const vibrate = () => haptic?.impactOccurred && haptic.impactOccurred('light');
  const vibrateSuccess = () => haptic?.notificationOccurred && haptic.notificationOccurred('success');
  const vibrateError = () => haptic?.notificationOccurred && haptic.notificationOccurred('error');
  const vibrateSelect = () => haptic?.selectionChanged && haptic.selectionChanged();

  const displayName = (tg?.initDataUnsafe?.user?.first_name) || 'Гость';

  useEffect(() => {
    // Safe area from Telegram WebApp
    if (tg) {
      tg.ready();
      tg.expand?.();
      setTheme(tg.colorScheme || 'light');
      const updateSafeArea = () => {
        setSafeAreaInset({
          top: tg.safeAreaInset?.top || 0,
          bottom: tg.safeAreaInset?.bottom || 0,
          left: tg.safeAreaInset?.left || 0,
          right: tg.safeAreaInset?.right || 0,
        });
      };
      updateSafeArea();
      tg.onEvent?.('safeAreaChanged', updateSafeArea);
      return () => tg.offEvent?.('safeAreaChanged', updateSafeArea);
    }
  }, [tg]);

  // Keyboard detection (mobile)
  useEffect(() => {
    let prevHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
    const onResize = () => {
      const cur = window.innerHeight;
      setIsKeyboardOpen(cur < prevHeight - 120);
      prevHeight = cur;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const ls = localStorage.getItem(LS_KEY);
      if (ls) {
        const data = JSON.parse(ls);
        if (data.currency) setCurrency(data.currency);
        if (data.goalSavings) { setGoalSavings(data.goalSavings); setGoalInput(String(data.goalSavings)); }
        if (data.theme) setTheme(data.theme);
        if (data.email) setEmail(data.email);
        if (data.password) setPassword(data.password);
        if (typeof data.isAuthenticated === 'boolean') setIsAuthenticated(data.isAuthenticated);
        if (data.user) setUser(data.user);
        if (data.authCurrency) setAuthCurrency(data.authCurrency);
      }
      const session = localStorage.getItem('finance_session');
      if (session) {
        const { email: sEmail, token } = JSON.parse(session);
        // try auto-login if needed (token shape is custom)
        if (sEmail && token) {
          // do not await here — background
          // autoLogin(sEmail, token); // keep commented-out to avoid accidental network calls
        }
      }
    } catch (e) {
      // ignore parse errors
      console.warn('LS parse error', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({
      currency, goalSavings, theme, email, password, authCurrency, isAuthenticated, user
    }));
  }, [currency, goalSavings, theme, email, password, authCurrency, isAuthenticated, user]);

  // Utility: blur active element
  function blurAll() {
    if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur();
  }

  // Currency formatter
  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const formatCurrency = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '';
    try {
      const formatted = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
      }).format(value);
      // replace standard symbol with custom symbol (if necessary)
      const sample = Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(0);
      const standardSymbol = sample.replace(/\d|\s|,|\.|0/g, '').trim();
      if (currentCurrency.symbol && standardSymbol) return formatted.replace(standardSymbol, currentCurrency.symbol);
      return formatted;
    } catch {
      return `${currentCurrency.symbol}${value}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    if (date.toDateString() === yesterday.toDateString()) return `Вчера, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };
  const formatTime = (dateString) => dateString ? new Date(dateString).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '';

  // Transaction row component
  const TxRow = ({ tx }) => (
    <div key={tx.id} className="flex items-center justify-between pb-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full text-xl ${categoriesMeta[tx.category]?.color ?? 'bg-gray-200'}`}>
          {categoriesMeta[tx.category]?.icon ?? '💼'}
        </div>
        <div>
          <p className="font-medium text-sm">{tx.description || '—'}</p>
          <p className="text-xs text-gray-400">{tx.category} • {formatDate(tx.date)}</p>
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

  // Add transaction
  const addTransaction = async () => {
    blurAll();
    if (!amount || isNaN(Number(amount))) {
      vibrateError();
      return alert('Введите корректную сумму');
    }
    const num = parseFloat(amount);
    const txDesc = (displayName && user && displayName !== user.first_name)
      ? (description ? `${displayName}: ${description}` : displayName)
      : description || '';
    const newTx = {
      id: Date.now(),
      type: transactionType,
      amount: num,
      description: txDesc,
      category: category || 'Другое',
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTx, ...prev]);

    // update totals locally
    if (transactionType === 'income') {
      setIncome(i => i + num);
      setBalance(b => b + num);
    } else if (transactionType === 'expense') {
      setExpenses(e => e + num);
      setBalance(b => b - num);
    } else {
      // savings
      setSavings(s => s + num);
      setBalance(b => b - num);
    }

    // reset modal inputs
    setAmount(''); setDescription(''); setCategory(''); setShowAddModal(false);
    vibrateSuccess();

    // Save to server if authenticated (non-blocking)
    if (isAuthenticated && user?.id) {
      try {
        await fetch(`${apiUrl}/api/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, ...newTx }),
        });
      } catch (err) {
        console.warn('tx save failed', err);
      }
    }
  };

  // Simple auth handler (example)
  const handleAuth = async () => {
    blurAll();
    if (!email || !password) {
      vibrateError();
      return alert('Введите email и пароль');
    }
    // Example request (depends on backend). We'll simulate success for local demo:
    try {
      // const res = await fetch(`${apiUrl}/api/auth`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email, password, first_name: displayName, currency: authCurrency})});
      // handle res...
      // For now, fake success:
      const fakeUser = { id: Date.now(), email, first_name: displayName };
      setUser(fakeUser);
      setIsAuthenticated(true);
      setCurrency(authCurrency);
      setShowAuthModal(false);
      vibrateSuccess();
      // save session locally (simplified)
      const token = btoa(email + ':' + btoa(password));
      localStorage.setItem('finance_session', JSON.stringify({ email, token }));
    } catch (err) {
      vibrateError();
      alert('Ошибка при входе');
    }
  };

  const handleLogout = () => {
    blurAll();
    localStorage.removeItem('finance_session');
    setIsAuthenticated(false);
    setUser(null);
    // reset demo data
    setBalance(10000); setIncome(50000); setExpenses(30000); setSavings(10000); setTransactions([]);
    vibrateError();
  };

  // Chart rendering (if Chart.js is loaded externally)
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
    const bgColors = labels.map((lbl, i) => {
      // fallback palette
      const palette = ['#60A5FA','#F472B6','#34D399','#F97316','#A78BFA','#FCA5A5','#60A5FA'];
      return palette[i % palette.length];
    });

    window.financeChart = new window.Chart(ctx, {
      type: 'pie',
      data: { labels, datasets: [{ data: values, backgroundColor: bgColors }] },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    return () => {
      if (window.financeChart) { window.financeChart.destroy(); delete window.financeChart; }
    };
  }, [showChart, chartType, transactions]);

  // Styling helpers
  const cardBg = theme === 'dark' ? 'bg-zinc-900' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-zinc-800' : 'border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100';

  // --- Render ---
  return (
    <div
      className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'} pb-32 transition-colors duration-300`}
      style={{
        paddingTop: safeAreaInset.top || 0,
        paddingBottom: safeAreaInset.bottom || 0,
        paddingLeft: safeAreaInset.left || 0,
        paddingRight: safeAreaInset.right || 0,
      }}
    >
      {/* Header on overview */}
      {activeTab === 'overview' && (
        <div className={`${cardBg} ${textPrimary} p-6 rounded-b-3xl shadow-sm`}>
          {!isAuthenticated && (
            <div className="mb-4">
              <h1 className="text-2xl font-bold">Привет, гость!</h1>
              <p className={`text-sm ${textSecondary}`}>Войдите для синхронизации и бэкапа.</p>
            </div>
          )}
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

      <div className="p-4 flex-1 w-full max-w-md mx-auto">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div
                className={`${cardBg} rounded-xl p-4 ${borderColor} border cursor-pointer flex flex-col items-center hover:scale-[1.02] transform transition`}
                onClick={() => { setChartType('income'); setShowChart(true); vibrate(); blurAll(); }}
                role="button"
                tabIndex={0}
              >
                <div className="bg-green-100 p-2 rounded-lg w-fit mb-2"><TrendingUp size={16} className="text-green-600" /></div>
                <div className="font-bold text-green-700 mb-1">Доход</div>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(income)}</p>
              </div>
              <div
                className={`${cardBg} rounded-xl p-4 ${borderColor} border cursor-pointer flex flex-col items-center hover:scale-[1.02] transform transition`}
                onClick={() => { setChartType('expense'); setShowChart(true); vibrate(); blurAll(); }}
                role="button"
                tabIndex={0}
              >
                <div className="bg-red-100 p-2 rounded-lg w-fit mb-2"><TrendingDown size={16} className="text-red-600" /></div>
                <div className="font-bold text-red-700 mb-1">Расход</div>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(expenses)}</p>
              </div>
              <div
                className={`${cardBg} rounded-xl p-4 ${borderColor} border cursor-pointer flex flex-col items-center hover:scale-[1.02] transform transition`}
                onClick={() => { setActiveTab('savings'); vibrate(); blurAll(); }}
                role="button"
                tabIndex={0}
              >
                <div className="bg-blue-100 p-2 rounded-lg w-fit mb-2"><PiggyBank size={16} className="text-blue-600" /></div>
                <div className="font-bold text-blue-700 mb-1">Копилка</div>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(savings)}</p>
              </div>
            </div>

            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Последние операции</h3>
              {transactions.length === 0 ? (
                <p className={`text-center py-8 ${textSecondary}`}>Пока нет операций</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(tx => <TxRow tx={tx} key={tx.id} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
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

        {/* Savings */}
        {activeTab === 'savings' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border flex flex-col items-center`}>
              <div className="font-bold text-xl mb-2">Копилка</div>
              <div className="relative flex items-center justify-center mb-3" style={{ width: 160, height: 160 }}>
                <svg width="160" height="160">
                  <circle cx="80" cy="80" r="72" fill="none" stroke="#E5E7EB" strokeWidth="14" />
                  <circle
                    cx="80" cy="80" r="72"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="14"
                    strokeDasharray={2 * Math.PI * 72}
                    strokeDashoffset={2 * Math.PI * 72 * (1 - Math.min((savings || 0) / (goalSavings || 1), 1))}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(savings)}</span>
                  <span className="text-xs text-gray-400 mt-1">из {formatCurrency(goalSavings)}</span>
                  <span className="text-xs text-gray-400 mt-1">{goalSavings ? Math.round((savings / goalSavings) * 100) : 0}%</span>
                </div>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => { setShowGoalModal(true); vibrate(); blurAll(); }}
                  className="flex-1 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-semibold transition"
                >
                  Изменить цель
                </button>
                <button
                  onClick={() => { setTransactionType('savings'); setShowAddModal(true); vibrate(); blurAll(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:scale-[1.02] transform transition text-white rounded-xl shadow"
                >
                  <Plus size={16} /> Пополнить
                </button>
              </div>
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

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Аккаунт</h3>
              {isAuthenticated ? (
                <div>
                  <div className="mb-2 font-semibold text-lg">Привет, {user?.first_name || user?.email}!</div>
                  <button onClick={handleLogout} className="w-full py-3 bg-red-500 text-white rounded-xl flex items-center justify-center gap-2">
                    <LogOut size={18} /> Выйти
                  </button>
                </div>
              ) : (
                <button onClick={() => { setShowAuthModal(true); vibrate(); blurAll(); }} className="w-full py-3 bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2">
                  <LogIn size={18} /> Войти
                </button>
              )}
            </div>

            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Тема</h3>
              <button
                onClick={() => { setTheme(t => t === 'dark' ? 'light' : 'dark'); vibrate(); blurAll(); }}
                className="underline text-blue-500"
              >
                Сменить тему на {theme === 'dark' ? 'светлую' : 'тёмную'}
              </button>
            </div>

            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Валюта</h3>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={`w-full p-3 rounded-xl ${inputBg} ${textPrimary}`}>
                {currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>)}
              </select>
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className={`${cardBg} rounded-t-3xl w-full max-w-md p-6`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Цель накопления</h3>
            <input
              type="number"
              value={goalInput}
              min={0}
              onChange={e => setGoalInput(e.target.value.replace(/^0+/, ''))}
              className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary} text-lg font-bold`}
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowGoalModal(false); vibrate(); blurAll(); }} className={`flex-1 py-4 rounded-xl ${inputBg} ${textPrimary}`}>Отмена</button>
              <button onClick={() => {
                const n = parseInt(goalInput, 10);
                if (!isNaN(n) && n >= 0) setGoalSavings(n);
                setShowGoalModal(false); vibrateSuccess(); blurAll();
              }} className="flex-1 py-4 rounded-xl bg-blue-500 text-white">Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {showChart && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className={`${cardBg} rounded-2xl p-6 w-full max-w-md`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>
              {chartType === 'income' ? 'Доходы' : chartType === 'expense' ? 'Расходы' : 'Копилка'} по категориям
            </h3>
            <div className="relative h-64">
              <canvas id="financeChart"></canvas>
            </div>
            <button onClick={() => { setShowChart(false); vibrate(); blurAll(); }} className="mt-4 w-full py-3 bg-gray-500 text-white rounded-xl">Закрыть</button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className={`${cardBg} rounded-t-3xl w-full max-w-md p-6`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Новая операция</h3>
            <div className="flex gap-2 mb-4">
              {['expense', 'income', 'savings'].map(type => (
                <button
                  key={type}
                  onClick={() => { setTransactionType(type); vibrateSelect(); blurAll(); }}
                  className={`flex-1 py-3 rounded-xl font-medium transition ${
                    transactionType === type
                      ? (type === 'income' ? 'bg-green-500 text-white' : type === 'expense' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white')
                      : ` ${inputBg} ${textSecondary}`
                  }`}
                >
                  {type === 'income' ? 'Доход' : type === 'expense' ? 'Расход' : 'Копилка'}
                </button>
              ))}
            </div>

            <input type="number" placeholder="Сумма" value={amount} onChange={e => setAmount(e.target.value.replace(/^0+/, ''))}
              className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary} text-lg font-bold`} />
            <input type="text" placeholder="Описание (необязательно)" value={description} onChange={e => setDescription(e.target.value)}
              className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <select value={category} onChange={e => setCategory(e.target.value)} className={`w-full p-4 rounded-xl mb-4 ${inputBg} ${textPrimary}`}>
              <option value="">Категория</option>
              {categoriesList[transactionType].map(cat => (
                <option key={cat} value={cat}>{categoriesMeta[cat]?.icon ? categoriesMeta[cat].icon + ' ' : ''}{cat}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button onClick={() => { setShowAddModal(false); vibrate(); blurAll(); }} className={`flex-1 py-4 rounded-xl ${inputBg} ${textPrimary}`}>Отмена</button>
              <button onClick={addTransaction} className={`flex-1 py-4 rounded-xl ${transactionType === 'income' ? 'bg-green-500' : transactionType === 'expense' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>Добавить</button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
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

      {/* Bottom capsule bar (centered) + floating plus to the right */}
      {!isKeyboardOpen && (
        <>
          {/* Capsule container - centered and not full width */}
          <div
            aria-hidden
            className="fixed left-1/2 transform -translate-x-1/2 bottom-6 z-40"
            style={{ width: 'min(680px, calc(100% - 40px))' }}
          >
            <div
              className="relative flex items-center justify-center"
            >
              {/* Capsule itself */}
              <div
                className="w-full mx-auto rounded-full py-3 px-4 backdrop-blur-lg bg-white/60 dark:bg-black/40 border border-white/10 dark:border-zinc-800/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] flex items-center justify-between gap-6"
                style={{ maxWidth: 520 }}
              >
                <div className="flex-1 flex items-center justify-around">
                  <TabButton label="Главная" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); vibrate(); blurAll(); }}>
                    <Wallet size={20} />
                  </TabButton>

                  <TabButton label="История" active={activeTab === 'history'} onClick={() => { setActiveTab('history'); vibrate(); blurAll(); }}>
                    <History size={20} />
                  </TabButton>

                  {/* Placeholder space for visual balance where plus used to be center in old UI */}
                  <div className="w-12" />

                  <TabButton label="Копилка" active={activeTab === 'savings'} onClick={() => { setActiveTab('savings'); vibrate(); blurAll(); }}>
                    <PiggyBank size={20} />
                  </TabButton>

                  <TabButton label="Настройки" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); vibrate(); blurAll(); }}>
                    <Settings size={20} />
                  </TabButton>
                </div>
              </div>

              {/* Floating plus to the right of the capsule */}
              <div
                className="absolute right-[-44px] -top-6"
                style={{ pointerEvents: 'none' /* outer wrapper disables accidental clicks */ }}
              >
                <button
                  onClick={() => { setShowAddModal(true); vibrate(); blurAll(); }}
                  className="pointer-events-auto w-14 h-14 rounded-full backdrop-blur-md bg-white/40 dark:bg-black/30 border border-white/20 flex items-center justify-center shadow-lg transition transform hover:scale-105 active:scale-95"
                  aria-label="Добавить операцию"
                  title="Добавить"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-inner">
                    <Plus size={18} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------
   TabButton — вспомогательный компонент (внутри файла)
   Используется только для кнопок в капсуле.
   ------------------------ */
function TabButton({ children, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-2 py-1 transition transform ${active ? 'scale-[1.02]' : 'hover:scale-105'} focus:outline-none`}
      aria-pressed={active}
      title={label}
    >
      <div className={`${active ? 'text-blue-600' : 'text-gray-400'}`}>{children}</div>
      <span className={`text-[10px] ${active ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{label}</span>
    </button>
  );
}
