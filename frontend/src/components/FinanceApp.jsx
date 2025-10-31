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

const API_BASE = "https://walletback-aghp.onrender.com";
const LS_KEY = "finance_settings_v2";
const SESSION_KEY = "finance_session_v2";

// Types
interface User {
  id: number;
  email: string;
  first_name: string;
  balance: number;
  income: number;
  expenses: number;
  savings_usd: number;
  goal_savings: number;
}

interface Transaction {
  id: number;
  user_id: number | null;
  type: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface CategoryMeta {
  color: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
    Chart?: any;
    financeChart?: any;
  }
}

// Categories with emoji
const categoriesMeta: Record<string, CategoryMeta> = {
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

const categoriesList: Record<string, string[]> = {
  expense: ["Еда", "Транспорт", "Развлечения", "Счета", "Покупки", "Здоровье", "Другое"],
  income: ["Зарплата", "Фриланс", "Подарки", "Инвестиции", "Другое"],
  savings: ["Отпуск", "Накопления", "Экстренный фонд", "Цель", "Другое"],
};

const currencies: Currency[] = [
  { code: "RUB", symbol: "₽", name: "Российский рубль" },
  { code: "BYN", symbol: "Br", name: "Белорусский рубль" },
  { code: "USD", symbol: "$", name: "Доллар США" },
  { code: "EUR", symbol: "€", name: "Евро" },
  { code: "UAH", symbol: "₴", name: "Гривна" },
];

export default function FinanceApp() {
  // States
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [theme, setTheme] = useState("light");
  const [currency, setCurrency] = useState("BYN");
  const [goalSavings, setGoalSavings] = useState(50000);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [savings, setSavings] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
  const [authCurrency, setAuthCurrency] = useState("BYN");
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

  const displayName = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.first_name) || "Пользователь";

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

  // Load settings and session
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
        }
      }

      // Auto-login if session exists
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const sessionData = JSON.parse(session);
        if (sessionData?.email && sessionData?.token) {
          autoAuth(sessionData.email, sessionData.token);
        }
      }
    } catch (e) {
      console.warn("Failed to parse settings", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({
      currency, goalSavings, theme
    }));
  }, [currency, goalSavings, theme]);

  // Helpers
  function blurAll() {
    if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === "function") {
      (document.activeElement as HTMLElement).blur();
    }
  }

  const currentCurrency = currencies.find((c) => c.code === currency) || currencies[1]; // Default to BYN
  const formatCurrency = (value: number | string): string => {
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

  const formatDate = (dateString: string): string => {
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

  // Backend API functions
  async function autoAuth(email: string, token: string) {
    try {
      const resp = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password: atob(token), // decode base64 token back to password
          first_name: displayName
        })
      });
      
      if (!resp.ok) throw new Error("auth failed");
      const json = await resp.json();
      applyUser(json.user, json.transactions || []);
    } catch (e) {
      console.warn("autoAuth failed", e);
      localStorage.removeItem(SESSION_KEY);
    }
  }

  function applyUser(u: User, txs: Transaction[] = []) {
    setUser(u);
    setIsAuthenticated(true);
    setBalance(Number(u.balance || 0));
    setIncome(Number(u.income || 0));
    setExpenses(Number(u.expenses || 0));
    setSavings(Number(u.savings_usd || 0)); // backend uses savings_usd field
    setGoalSavings(Number(u.goal_savings || 0));
    setTransactions(txs || []);
  }

  // Transaction row component
  const TxRow = ({ tx }: { tx: Transaction }) => {
    const categoryInfo = categoriesMeta[tx.category] || categoriesMeta["Другое"];
    return (
      <div className="group flex items-center justify-between p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-300 hover:shadow-md hover:scale-[1.01] mb-2">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${categoryInfo.color} shadow-md`}>
            <span className="text-lg">{categoryInfo.icon}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{tx.description || "—"}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryInfo.bgColor} ${categoryInfo.textColor}`}>
                {tx.category}
              </span>
              <span className="text-xs text-gray-500">{formatDate(tx.date)}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold text-sm ${
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
    
    const newTx: Transaction = {
      id: Date.now(),
      user_id: user?.id || null,
      type: transactionType,
      amount: n,
      description: description || "",
      category: category || "Другое",
      date: new Date().toISOString(),
    };
    
    setTransactions((p) => [newTx, ...p]);

    let newBalance = balance;
    let newIncome = income;
    let newExpenses = expenses;
    let newSavings = savings;

    if (transactionType === "income") {
      newIncome += n;
      newBalance += n;
      setIncome(newIncome);
      setBalance(newBalance);
    } else if (transactionType === "expense") {
      newExpenses += n;
      newBalance -= n;
      setExpenses(newExpenses);
      setBalance(newBalance);
    } else {
      newSavings += n;
      newBalance -= n;
      setSavings(newSavings);
      setBalance(newBalance);
    }

    setAmount(""); 
    setDescription(""); 
    setCategory(""); 
    setShowAddModal(false);
    vibrateSuccess();

    // Save to backend
    if (isAuthenticated && user && user.id) {
      try {
        await fetch(`${API_BASE}/api/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            type: newTx.type,
            amount: newTx.amount,
            description: newTx.description,
            category: newTx.category,
            converted_amount_usd: null
          }),
        });

        // Update user data
        await fetch(`${API_BASE}/api/user/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            balance: newBalance,
            income: newIncome,
            expenses: newExpenses,
            savings: newSavings,
            goalSavings
          })
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
    
    try {
      const payload = { 
        email, 
        password, 
        first_name: displayName
      };
      
      const res = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:"Ошибка сервера"}));
        alert(err.error || "Ошибка входа");
        vibrateError();
        return;
      }
      
      const json = await res.json();
      applyUser(json.user, json.transactions || []);
      
      // Store session
      localStorage.setItem(SESSION_KEY, JSON.stringify({ 
        email, 
        token: btoa(password) 
      }));
      
      setShowAuthModal(false);
      setEmail("");
      setPassword("");
      setCurrency(authCurrency);
      vibrateSuccess();
    } catch (e) {
      console.error("Auth error:", e);
      alert("Ошибка авторизации");
      vibrateError();
    }
  };

  const handleResetAll = () => {
    if (!window.confirm("Сбросить данные? Это удалит баланс, доходы, расходы, копилку и операции.")) return;
    setBalance(0);
    setIncome(0);
    setExpenses(0);
    setSavings(0);
    setTransactions([]);
  };

  const handleLogout = async () => {
    blurAll();
    
    // Save current state to backend before logout
    if (user?.id) {
      try {
        await fetch(`${API_BASE}/api/user/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            balance,
            income,
            expenses,
            savings,
            goalSavings
          })
        });
      } catch (e) {
        console.warn("save on logout failed", e);
      }
    }
    
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setUser(null);
    setBalance(0); 
    setIncome(0); 
    setExpenses(0); 
    setSavings(0); 
    setTransactions([]);
    vibrateError();
  };

  // Chart rendering
  useEffect(() => {
    if (!showChart || !window.Chart) return;
    const canvas = document.getElementById("financeChart") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.financeChart) window.financeChart.destroy();

    const data = chartType === "income"
      ? transactions.filter((t) => t.type === "income")
      : chartType === "expense"
      ? transactions.filter((t) => t.type === "expense")
      : transactions.filter((t) => t.type === "savings");

    const categoriesData: Record<string, number> = {};
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
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-y-auto"
      style={{
        paddingTop: safeAreaInset.top || 0,
        paddingBottom: safeAreaInset.bottom + (isKeyboardOpen ? 0 : 60) || 60, // Уменьшенный отступ для компактного бара
        paddingLeft: safeAreaInset.left || 0,
        paddingRight: safeAreaInset.right || 0,
        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
      }}
    >
      {/* Header - компактный для мобильных */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative px-4 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Привет, {(user && user.first_name) || displayName}! 👋
              </h1>
              <p className="text-blue-100 text-sm">Добро пожаловать в ваш финансовый помощник</p>
            </div>
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
            >
              {balanceVisible ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
            </button>
          </div>

          {/* Balance Card - компактный */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/20">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-xs">Общий баланс</p>
                  <p className="text-white text-2xl font-bold">
                    {balanceVisible ? formatCurrency(balance) : "••••••"}
                  </p>
                </div>
              </div>
            </div>

            {/* Income/Expense Row - компактный */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-emerald-500/20 rounded-xl p-3 border border-emerald-400/30">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-emerald-300" />
                  <span className="text-emerald-100 text-xs">Доходы</span>
                </div>
                <p className="text-emerald-200 text-lg font-bold">
                  {balanceVisible ? formatCurrency(income) : "••••••"}
                </p>
              </div>
              <div className="bg-rose-500/20 rounded-xl p-3 border border-rose-400/30">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown className="w-3 h-3 text-rose-300" />
                  <span className="text-rose-100 text-xs">Расходы</span>
                </div>
                <p className="text-rose-200 text-lg font-bold">
                  {balanceVisible ? formatCurrency(expenses) : "••••••"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - с правильным скроллингом */}
      <main className="px-4 -mt-3 relative z-10 pb-20" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Quick Stats - компактные */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100">
                    <PiggyBank className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Копилка</p>
                    <p className="text-gray-900 text-sm font-bold">{formatCurrency(savings)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Цель</p>
                    <p className="text-gray-900 text-sm font-bold">{savingsPct}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions - компактные */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Последние операции</h3>
                <button 
                  onClick={() => setActiveTab("history")}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                >
                  Все →
                </button>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <History className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">Пока нет операций</p>
                  <p className="text-gray-400 text-xs mt-1">Добавьте первую транзакцию</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 4).map((tx) => <TxRow tx={tx} key={tx.id} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">История операций</h3>
              <button
                onClick={() => { setShowChart(true); setChartType("expense"); }}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </button>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <History className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Нет операций</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transactions.map((tx) => <TxRow tx={tx} key={tx.id} />)}
              </div>
            )}
          </div>
        )}

        {/* Savings */}
        {activeTab === "savings" && (
          <div className="space-y-4">
            {/* Savings Goal Card - компактная */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">Копилка</h3>
                  <p className="text-blue-100 text-sm">Ваша цель накопления</p>
                </div>
                <div className="p-2 rounded-xl bg-white/20">
                  <PiggyBank className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm">Прогресс</span>
                  <span className="text-white font-bold">{savingsPct}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${savingsPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-blue-100">
                  <span>{formatCurrency(savings)}</span>
                  <span>{formatCurrency(goalSavings)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowGoalModal(true); vibrate(); }}
                  className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all text-sm"
                >
                  Изменить цель
                </button>
                <button
                  onClick={() => { setTransactionType("savings"); setShowAddModal(true); vibrate(); }}
                  className="flex items-center gap-1 px-4 py-2 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-all shadow-lg text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Пополнить
                </button>
              </div>
            </div>

            {/* Savings History */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">История пополнений</h3>
              {transactions.filter((t) => t.type === "savings").length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <PiggyBank className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-gray-500 text-sm">Начните копить!</p>
                  <p className="text-gray-400 text-xs mt-1">Добавьте первое пополнение</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.filter((t) => t.type === "savings").map((tx) => <TxRow tx={tx} key={tx.id} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            {/* Account Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Аккаунт</h3>
              
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">
                        {((user && user.first_name) || (user && user.email) || "U")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{(user && user.first_name) || "Пользователь"}</p>
                      <p className="text-gray-600 text-xs">{user && user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Выйти
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)} 
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Войти
                </button>
              )}
            </div>

            {/* Settings Options */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Настройки</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">Валюта</label>
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)} 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">Тема</label>
                  <button 
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 hover:bg-gray-100 transition-all text-left text-sm"
                  >
                    {theme === "dark" ? "🌙 Тёмная" : "☀️ Светлая"}
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <h3 className="text-lg font-bold text-red-900 mb-3">Опасная зона</h3>
              <button 
                onClick={handleResetAll} 
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all shadow-lg text-sm"
              >
                Сбросить все данные
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Цель накопления</h3>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2 text-sm">Сумма цели</label>
              <input 
                type="number" 
                value={goalInput} 
                min={0} 
                onChange={(e) => setGoalInput(e.target.value.replace(/^0+/, ""))} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-bold"
                placeholder="Введите сумму"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowGoalModal(false)} 
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all text-sm"
              >
                Отмена
              </button>
              <button 
                onClick={() => { 
                  const n = parseInt(goalInput, 10); 
                  if (!Number.isNaN(n) && n >= 0) setGoalSavings(n); 
                  setShowGoalModal(false); 
                }} 
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all text-sm"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {showChart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {chartType === "income" ? "Доходы" : chartType === "expense" ? "Расходы" : "Копилка"} по категориям
            </h3>
            <div className="relative h-64">
              <canvas id="financeChart"></canvas>
            </div>
            <button 
              onClick={() => setShowChart(false)} 
              className="mt-4 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all text-sm"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="w-full max-w-md bg-white rounded-t-2xl p-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Новая операция</h3>

            <div className="flex gap-2 mb-4">
              {["expense", "income", "savings"].map((type) => (
                <button
                  key={type}
                  onClick={() => { setTransactionType(type); vibrateSelect(); }}
                  className={`flex-1 py-2 rounded-xl font-medium transition text-sm ${
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
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            <input 
              type="text" 
              placeholder="Описание (необязательно)" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            >
              <option value="">Категория</option>
              {categoriesList[transactionType].map((cat) => (
                <option key={cat} value={cat}>{(categoriesMeta[cat]?.icon ? categoriesMeta[cat].icon + " " : "") + cat}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button 
                onClick={()=> setShowAddModal(false)} 
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all text-sm"
              >
                Отмена
              </button>
              <button 
                onClick={addTransaction} 
                className={`flex-1 py-3 rounded-xl text-white font-medium transition-all text-sm ${
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Вход / Регистрация</h3>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            <input 
              type="password" 
              placeholder="Пароль" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            <p className="text-xs text-gray-600 mb-3">Имя: {displayName}</p>
            <select 
              value={authCurrency} 
              onChange={(e) => setAuthCurrency(e.target.value)} 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowAuthModal(false)} 
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all text-sm"
              >
                Отмена
              </button>
              <button 
                onClick={handleAuth} 
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all text-sm"
              >
                Войти
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - компактный */}
      {!isKeyboardOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
          <div className="flex items-center justify-center p-2">
            <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-full p-1.5 border border-white/20 shadow-2xl flex items-center justify-around pointer-events-auto">
              <NavButton 
                active={activeTab === "overview"} 
                onClick={() => { setActiveTab("overview"); vibrate(); }} 
                icon={<Wallet className="w-4 h-4" />} 
              />
              <NavButton 
                active={activeTab === "history"} 
                onClick={() => { setActiveTab("history"); vibrate(); }} 
                icon={<History className="w-4 h-4" />} 
              />
              <button
                onClick={() => { setShowAddModal(true); vibrate(); }}
                className="p-2.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
              <NavButton 
                active={activeTab === "savings"} 
                onClick={() => { setActiveTab("savings"); vibrate(); }} 
                icon={<PiggyBank className="w-4 h-4" />} 
              />
              <NavButton 
                active={activeTab === "settings"} 
                onClick={() => { setActiveTab("settings"); vibrate(); }} 
                icon={<Settings className="w-4 h-4" />} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon, active, onClick }: NavButtonProps) {
  return (
    <button 
      onClick={onClick} 
      className="p-2 transition-all"
    >
      <div className={active ? "text-blue-600" : "text-gray-400"}>{icon}</div>
    </button>
  );
}
