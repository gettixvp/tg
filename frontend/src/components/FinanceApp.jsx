"use client";

import React, { useEffect, useState } from "react";
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
  Target,
  CreditCard,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";

const LS_KEY = "finance_settings_v2";

const categoriesMeta = {
  Еда: { color: "from-orange-400 to-red-400", icon: "🍔", bgColor: "bg-orange-100", textColor: "text-orange-700" },
  Транспорт: { color: "from-blue-400 to-cyan-400", icon: "🚗", bgColor: "bg-blue-100", textColor: "text-blue-700" },
  Развлечения: { color: "from-pink-400 to-purple-400", icon: "🎉", bgColor: "bg-pink-100", textColor: "text-pink-700" },
  Счета: { color: "from-teal-400 to-green-400", icon: "💡", bgColor: "bg-teal-100", textColor: "text-teal-700" },
  Покупки: { color: "from-purple-400 to-indigo-400", icon: "🛒", bgColor: "bg-purple-100", textColor: "text-purple-700" },
  Здоровье: { color: "from-yellow-400 to-orange-400", icon: "💊", bgColor: "bg-yellow-100", textColor: "text-yellow-700" },
  Другое: { color: "from-gray-400 to-slate-400", icon: "💼", bgColor: "bg-gray-100", textColor: "text-gray-700" },
  Зарплата: { color: "from-green-400 to-emerald-400", icon: "💵", bgColor: "bg-green-100", textColor: "text-green-700" },
  Фриланс: { color: "from-cyan-400 to-blue-400", icon: "👨‍💻", bgColor: "bg-cyan-100", textColor: "text-cyan-700" },
  Подарки: { color: "from-yellow-300 to-amber-300", icon: "🎁", bgColor: "bg-yellow-100", textColor: "text-yellow-700" },
  Инвестиции: { color: "from-indigo-400 to-purple-400", icon: "📈", bgColor: "bg-indigo-100", textColor: "text-indigo-700" },
  Отпуск: { color: "from-blue-300 to-sky-300", icon: "🏖️", bgColor: "bg-blue-100", textColor: "text-blue-700" },
  Накопления: { color: "from-blue-800 to-indigo-800", icon: "💰", bgColor: "bg-blue-100", textColor: "text-blue-700" },
  "Экстренный фонд": { color: "from-red-400 to-pink-400", icon: "🚨", bgColor: "bg-red-100", textColor: "text-red-700" },
  Цель: { color: "from-emerald-300 to-green-300", icon: "🎯", bgColor: "bg-emerald-100", textColor: "text-emerald-700" },
};

const categoriesList = {
  expense: ["Еда", "Транспорт", "Развлечения", "Счета", "Покупки", "Здоровье", "Другое"],
  income: ["Зарплата", "Фриланс", "Подарки", "Инвестиции", "Другое"],
  savings: ["Отпуск", "Накопления", "Экстренный фонд", "Цель", "Другое"],
};

const currencies = [
  { code: "RUB", symbol: "₽", name: "Российский рубль" },
  { code: "BYN", symbol: "Br", name: "Белорусский рубль" },
  { code: "USD", symbol: "$", name: "Доллар США" },
  { code: "EUR", symbol: "€", name: "Евро" },
  { code: "UAH", symbol: "₴", name: "Гривна" },
];

export default function FinanceApp({ apiUrl }) {
  // States
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [theme, setTheme] = useState("light");
  const [currency, setCurrency] = useState("RUB");
  const [goalSavings, setGoalSavings] = useState(50000);
  const [balance, setBalance] = useState(10000);
  const [income, setIncome] = useState(50000);
  const [expenses, setExpenses] = useState(30000);
  const [savings, setSavings] = useState(10000);
  const [transactions, setTransactions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState("");
  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authCurrency, setAuthCurrency] = useState("RUB");
  const [safeAreaInset, setSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState("50000");
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Telegram WebApp optional detection
  const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
  const haptic = tg && tg.HapticFeedback;
  const vibrate = () => haptic && haptic.impactOccurred && haptic.impactOccurred("light");
  const vibrateSuccess = () => haptic && haptic.notificationOccurred && haptic.notificationOccurred("success");
  const vibrateError = () => haptic && haptic.notificationOccurred && haptic.notificationOccurred("error");
  const vibrateSelect = () => haptic && haptic.selectionChanged && haptic.selectionChanged();

  const displayName = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.first_name) || "Вадим";

  // SafeArea & theme from Telegram (if any)
  useEffect(() => {
    if (tg) {
      tg.ready();
      if (tg.expand) tg.expand();
      setTheme(tg.colorScheme || "light");
      const updateSafeArea = () => {
        setSafeAreaInset({
          top: (tg.safeAreaInset && tg.safeAreaInset.top) || 0,
          bottom: (tg.safeAreaInset && tg.safeAreaInset.bottom) || 0,
          left: (tg.safeAreaInset && tg.safeAreaInset.left) || 0,
          right: (tg.safeAreaInset && tg.safeAreaInset.right) || 0,
        });
      };
      updateSafeArea();
      if (tg.onEvent) tg.onEvent("safeAreaChanged", updateSafeArea);
      return () => {
        if (tg.offEvent) tg.offEvent("safeAreaChanged", updateSafeArea);
      };
    }
  }, [tg]);

  // Keyboard detection for mobile
  useEffect(() => {
    let prevHeight = typeof window !== "undefined" ? window.innerHeight : 0;
    const onResize = () => {
      const cur = window.innerHeight;
      setIsKeyboardOpen(cur < prevHeight - 120);
      prevHeight = cur;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Load settings
  useEffect(() => {
    try {
      const ls = localStorage.getItem(LS_KEY);
      if (ls) {
        const data = JSON.parse(ls);
        if (data) {
          if (data.currency) setCurrency(data.currency);
          if (data.theme) setTheme(data.theme);
          if (data.goalSavings) { 
            setGoalSavings(data.goalSavings); 
            setGoalInput(String(data.goalSavings)); 
          }
          if (typeof data.isAuthenticated === "boolean") setIsAuthenticated(data.isAuthenticated);
          if (data.user) setUser(data.user);
        }
      }
    } catch (e) {
      console.warn("Failed to parse settings", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({
      currency, goalSavings, theme, email, password, authCurrency, isAuthenticated, user
    }));
  }, [currency, goalSavings, theme, email, password, authCurrency, isAuthenticated, user]);

  // Helpers
  function blurAll() {
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
  }

  const currentCurrency = currencies.find((c) => c.code === currency) || currencies[0];
  const formatCurrency = (value) => {
    const num = Number(value);
    if (!isFinite(num)) return `${currentCurrency.symbol}0`;
    try {
      const formatted = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
      }).format(num);
      const sample = Intl.NumberFormat("ru-RU", { style: "currency", currency }).format(0);
      const stdSym = sample.replace(/\d|\s|,|\.|0/g, "").trim();
      if (stdSym && currentCurrency.symbol && stdSym !== currentCurrency.symbol) {
        return formatted.replace(stdSym, currentCurrency.symbol);
      }
      return formatted;
    } catch {
      return `${currentCurrency.symbol}${Math.round(num)}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today); 
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) {
      return `Сегодня, ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return `Вчера, ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  // Transaction row component
  const TxRow = ({ tx }) => {
    const categoryInfo = categoriesMeta[tx.category] || categoriesMeta["Другое"];
    return (
      <div className="group flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${categoryInfo.color} shadow-lg`}>
            <span className="text-2xl">{categoryInfo.icon}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{tx.description || "—"}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
                {tx.category}
              </span>
              <span className="text-sm text-gray-500">{formatDate(tx.date)}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold text-xl ${
            tx.type === "income" ? "text-emerald-600" : 
            tx.type === "expense" ? "text-rose-600" : "text-blue-600"
          }`}>
            {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
          </p>
        </div>
      </div>
    );
  };

  // Add transaction
  const addTransaction = async () => {
    blurAll();
    const n = Number(amount);
    if (!isFinite(n) || n <= 0) {
      vibrateError();
      return alert("Введите корректную сумму > 0");
    }
    const txDesc = (displayName && user && displayName !== user.first_name)
      ? (description ? `${displayName}: ${description}` : displayName)
      : (description || "");
    const newTx = {
      id: Date.now(),
      type: transactionType,
      amount: n,
      description: txDesc,
      category: category || "Другое",
      date: new Date().toISOString(),
    };
    setTransactions((p) => [newTx, ...p]);

    if (transactionType === "income") {
      setIncome((i) => i + n);
      setBalance((b) => b + n);
    } else if (transactionType === "expense") {
      setExpenses((e) => e + n);
      setBalance((b) => b - n);
    } else {
      setSavings((s) => s + n);
      setBalance((b) => b - n);
    }

    setAmount(""); 
    setDescription(""); 
    setCategory(""); 
    setShowAddModal(false);
    vibrateSuccess();

    if (isAuthenticated && user && user.id && apiUrl) {
      try {
        await fetch(`${apiUrl}/api/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id, ...newTx }),
        });
      } catch (e) {
        console.warn("Failed to save tx", e);
      }
    }
  };

  // Auth
  const handleAuth = async () => {
    blurAll();
    if (!email || !password) {
      vibrateError();
      return alert("Введите email и пароль");
    }
    const fakeUser = { id: Date.now(), email, first_name: displayName };
    setUser(fakeUser);
    setIsAuthenticated(true);
    setCurrency(authCurrency);
    setShowAuthModal(false);
    const token = btoa(email + ":" + btoa(password));
    localStorage.setItem("finance_session", JSON.stringify({ email, token }));
    vibrateSuccess();
  };

  const handleResetAll = () => {
    if (!window.confirm("Сбросить данные? Это удалит баланс, доходы, расходы, копилку и операции.")) return;
    setBalance(0);
    setIncome(0);
    setExpenses(0);
    setSavings(0);
    setTransactions([]);
  };

  const handleLogout = () => {
    blurAll();
    localStorage.removeItem("finance_session");
    setIsAuthenticated(false);
    setUser(null);
    setBalance(10000); 
    setIncome(50000); 
    setExpenses(30000); 
    setSavings(10000); 
    setTransactions([]);
    vibrateError();
  };

  // Chart rendering
  useEffect(() => {
    if (!showChart || !window.Chart) return;
    const canvas = document.getElementById("financeChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.financeChart) window.financeChart.destroy();

    const data = chartType === "income"
      ? transactions.filter((t) => t.type === "income")
      : chartType === "expense"
      ? transactions.filter((t) => t.type === "expense")
      : transactions.filter((t) => t.type === "savings");

    const categoriesData = {};
    data.forEach((t) => { 
      categoriesData[t.category] = (categoriesData[t.category] || 0) + t.amount; 
    });

    const labels = Object.keys(categoriesData);
    const values = Object.values(categoriesData);
    const palette = ["#60A5FA", "#F472B6", "#34D399", "#F97316", "#A78BFA", "#FCA5A5", "#60A5FA"];
    const bgColors = labels.map((_, i) => palette[i % palette.length]);

    window.financeChart = new window.Chart(ctx, {
      type: "pie",
      data: { labels, datasets: [{ data: values, backgroundColor: bgColors }] },
      options: { responsive: true, plugins: { legend: { position: "bottom" } } },
    });

    return () => {
      if (window.financeChart) { 
        window.financeChart.destroy(); 
        delete window.financeChart; 
      }
    };
  }, [showChart, chartType, transactions]);

  const savingsProgress = Math.min((savings || 0) / (goalSavings || 1), 1);
  const savingsPct = Math.round(savingsProgress * 100);

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50"
      style={{
        paddingTop: safeAreaInset.top || 0,
        paddingBottom: safeAreaInset.bottom || 0,
        paddingLeft: safeAreaInset.left || 0,
        paddingRight: safeAreaInset.right || 0,
      }}
    >
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative px-6 pt-12 pb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Привет, {(user && user.first_name) || displayName}! 👋
              </h1>
              <p className="text-blue-100">Добро пожаловать в ваш финансовый помощник</p>
            </div>
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
            >
              {balanceVisible ? <Eye className="w-5 h-5 text-white" /> : <EyeOff className="w-5 h-5 text-white" />}
            </button>
          </div>

          {/* Balance Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/20">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Общий баланс</p>
                  <p className="text-white text-3xl font-bold">
                    {balanceVisible ? formatCurrency(balance) : "••••••"}
                  </p>
                </div>
              </div>
            </div>

            {/* Income/Expense Row */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-emerald-500/20 rounded-2xl p-4 border border-emerald-400/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-300" />
                  <span className="text-emerald-100 text-sm">Доходы</span>
                </div>
                <p className="text-emerald-200 text-xl font-bold">
                  {balanceVisible ? formatCurrency(income) : "••••••"}
                </p>
              </div>
              <div className="bg-rose-500/20 rounded-2xl p-4 border border-rose-400/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-rose-300" />
                  <span className="text-rose-100 text-sm">Расходы</span>
                </div>
                <p className="text-rose-200 text-xl font-bold">
                  {balanceVisible ? formatCurrency(expenses) : "••••••"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 -mt-4 relative z-10 pb-32">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100">
                    <PiggyBank className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Копилка</p>
                    <p className="text-gray-900 text-lg font-bold">{formatCurrency(savings)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Цель</p>
                    <p className="text-gray-900 text-lg font-bold">{savingsPct}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Последние операции</h3>
                <button 
                  onClick={() => setActiveTab("history")}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                >
                  Все →
                </button>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Пока нет операций</p>
                  <p className="text-gray-400 text-sm mt-1">Добавьте первую транзакцию</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 4).map((tx) => <TxRow tx={tx} key={tx.id} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">История операций</h3>
              <button
                onClick={() => { setShowChart(true); setChartType("expense"); }}
                className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </button>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Нет операций</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => <TxRow tx={tx} key={tx.id} />)}
              </div>
            )}
          </div>
        )}

        {/* Savings */}
        {activeTab === "savings" && (
          <div className="space-y-6">
            {/* Savings Goal Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Копилка</h3>
                  <p className="text-blue-100">Ваша цель накопления</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/20">
                  <PiggyBank className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-blue-100">Прогресс</span>
                  <span className="text-white font-bold">{savingsPct}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${savingsPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-sm text-blue-100">
                  <span>{formatCurrency(savings)}</span>
                  <span>{formatCurrency(goalSavings)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowGoalModal(true); vibrate(); }}
                  className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-2xl font-medium transition-all"
                >
                  Изменить цель
                </button>
                <button
                  onClick={() => { setTransactionType("savings"); setShowAddModal(true); vibrate(); }}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-2xl font-medium hover:bg-blue-50 transition-all shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Пополнить
                </button>
              </div>
            </div>

            {/* Savings History */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">История пополнений</h3>
              {transactions.filter((t) => t.type === "savings").length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PiggyBank className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-gray-500">Начните копить!</p>
                  <p className="text-gray-400 text-sm mt-1">Добавьте первое пополнение</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.filter((t) => t.type === "savings").map((tx) => <TxRow tx={tx} key={tx.id} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Account Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Аккаунт</h3>
              
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-200">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">
                        {((user && user.first_name) || (user && user.email) || "U")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{(user && user.first_name) || "Пользователь"}</p>
                      <p className="text-gray-600 text-sm">{user && user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    Выйти
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)} 
                  className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <LogIn className="w-5 h-5" />
                  Войти
                </button>
              )}
            </div>

            {/* Settings Options */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Настройки</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Валюта</label>
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)} 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Тема</label>
                  <button 
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 hover:bg-gray-100 transition-all text-left"
                  >
                    {theme === "dark" ? "🌙 Тёмная" : "☀️ Светлая"}
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-red-900 mb-4">Опасная зона</h3>
              <button 
                onClick={handleResetAll} 
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-medium transition-all shadow-lg"
              >
                Сбросить все данные
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Цель накопления</h3>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Сумма цели</label>
              <input 
                type="number" 
                value={goalInput} 
                min={0} 
                onChange={(e) => setGoalInput(e.target.value.replace(/^0+/, ""))} 
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xl font-bold"
                placeholder="Введите сумму"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowGoalModal(false)} 
                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition-all"
              >
                Отмена
              </button>
              <button 
                onClick={() => { 
                  const n = parseInt(goalInput, 10); 
                  if (!Number.isNaN(n) && n >= 0) setGoalSavings(n); 
                  setShowGoalModal(false); 
                }} 
                className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-medium transition-all"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {showChart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {chartType === "income" ? "Доходы" : chartType === "expense" ? "Расходы" : "Копилка"} по категориям
            </h3>
            <div className="relative h-64">
              <canvas id="financeChart"></canvas>
            </div>
            <button 
              onClick={() => setShowChart(false)} 
              className="mt-6 w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition-all"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Новая операция</h3>

            <div className="flex gap-2 mb-6">
              {["expense", "income", "savings"].map((type) => (
                <button
                  key={type}
                  onClick={() => { setTransactionType(type); vibrateSelect(); }}
                  className={`flex-1 py-3 rounded-2xl font-medium transition ${
                    transactionType === type 
                      ? (type === "income" ? "bg-emerald-500 text-white" : type === "expense" ? "bg-rose-500 text-white" : "bg-blue-500 text-white") 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type === "income" ? "Доход" : type === "expense" ? "Расход" : "Копилка"}
                </button>
              ))}
            </div>

            <input 
              type="number" 
              placeholder="Сумма" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value.replace(/^0+/, ""))} 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <input 
              type="text" 
              placeholder="Описание (необязательно)" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-6 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">Категория</option>
              {categoriesList[transactionType].map((cat) => (
                <option key={cat} value={cat}>{(categoriesMeta[cat]?.icon ? categoriesMeta[cat].icon + " " : "") + cat}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition-all"
              >
                Отмена
              </button>
              <button 
                onClick={addTransaction} 
                className={`flex-1 py-4 rounded-2xl text-white font-medium transition-all ${
                  transactionType === "income" ? "bg-emerald-500 hover:bg-emerald-600" : 
                  transactionType === "expense" ? "bg-rose-500 hover:bg-rose-600" : 
                  "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Вход / Регистрация</h3>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <input 
              type="password" 
              placeholder="Пароль" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="text-sm text-gray-600 mb-4">Имя: {displayName}</p>
            <select 
              value={authCurrency} 
              onChange={(e) => setAuthCurrency(e.target.value)} 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl mb-6 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowAuthModal(false)} 
                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition-all"
              >
                Отмена
              </button>
              <button 
                onClick={handleAuth} 
                className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-medium transition-all"
              >
                Войти
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {!isKeyboardOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <div className="flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl p-4 border border-white/20 shadow-2xl flex items-center justify-around">
              <NavButton 
                active={activeTab === "overview"} 
                onClick={() => { setActiveTab("overview"); vibrate(); }} 
                icon={<Wallet className="w-6 h-6" />} 
                label="Главная" 
              />
              <NavButton 
                active={activeTab === "history"} 
                onClick={() => { setActiveTab("history"); vibrate(); }} 
                icon={<History className="w-6 h-6" />} 
                label="История" 
              />
              <button
                onClick={() => { setShowAddModal(true); vibrate(); }}
                className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95"
              >
                <Plus className="w-6 h-6" />
              </button>
              <NavButton 
                active={activeTab === "savings"} 
                onClick={() => { setActiveTab("savings"); vibrate(); }} 
                icon={<PiggyBank className="w-6 h-6" />} 
                label="Копилка" 
              />
              <NavButton 
                active={activeTab === "settings"} 
                onClick={() => { setActiveTab("settings"); vibrate(); }} 
                icon={<Settings className="w-6 h-6" />} 
                label="Настройки" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className="flex flex-col items-center gap-1 px-3 py-2 transition-all"
    >
      <div className={active ? "text-blue-600" : "text-gray-400"}>{icon}</div>
      <span className={`text-xs ${active ? "text-blue-600 font-semibold" : "text-gray-400"}`}>{label}</span>
    </button>
  );
}
