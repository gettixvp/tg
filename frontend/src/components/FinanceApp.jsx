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
} from "lucide-react";

const LS_KEY = "finance_settings_v2";

const categoriesMeta = {
  Еда: { color: "bg-orange-400", icon: "🍔" },
  Транспорт: { color: "bg-blue-400", icon: "🚗" },
  Развлечения: { color: "bg-pink-400", icon: "🎉" },
  Счета: { color: "bg-teal-400", icon: "💡" },
  Покупки: { color: "bg-purple-400", icon: "🛒" },
  Здоровье: { color: "bg-yellow-400", icon: "💊" },
  Другое: { color: "bg-gray-400", icon: "💼" },
  Зарплата: { color: "bg-green-400", icon: "💵" },
  Фриланс: { color: "bg-cyan-400", icon: "👨‍💻" },
  Подарки: { color: "bg-yellow-300", icon: "🎁" },
  Инвестиции: { color: "bg-indigo-400", icon: "📈" },
  Отпуск: { color: "bg-blue-300", icon: "🏖️" },
  Накопления: { color: "bg-blue-800", icon: "💰" },
  "Экстренный фонд": { color: "bg-red-400", icon: "🚨" },
  Цель: { color: "bg-emerald-300", icon: "🎯" },
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
  const [activeTab, setActiveTab] = useState("overview"); // overview | history | savings | settings
  const [theme, setTheme] = useState("dark");
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

  // Goal modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(goalSavings));

  // Telegram WebApp optional detection
  const tg = typeof window !== "undefined" && window.Telegram?.WebApp;
  const haptic = tg?.HapticFeedback;
  const vibrate = () => haptic?.impactOccurred && haptic.impactOccurred("light");
  const vibrateSuccess = () => haptic?.notificationOccurred && haptic.notificationOccurred("success");
  const vibrateError = () => haptic?.notificationOccurred && haptic.notificationOccurred("error");
  const vibrateSelect = () => haptic?.selectionChanged && haptic.selectionChanged();

  const displayName = (tg?.initDataUnsafe?.user?.first_name) || "Гость";

  // SafeArea & theme from Telegram (if any)
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand?.();
      setTheme(tg.colorScheme || "dark");
      const updateSafeArea = () => {
        setSafeAreaInset({
          top: tg.safeAreaInset?.top || 0,
          bottom: tg.safeAreaInset?.bottom || 0,
          left: tg.safeAreaInset?.left || 0,
          right: tg.safeAreaInset?.right || 0,
        });
      };
      updateSafeArea();
      tg.onEvent?.("safeAreaChanged", updateSafeArea);
      return () => tg.offEvent?.("safeAreaChanged", updateSafeArea);
    }
  }, [tg]);

  // Keyboard detection for mobile (hide bottom controls)
  useEffect(() => {
    let prevHeight = typeof window !== "undefined" ? window.innerHeight : 0;
    const onResize = () => {
      const cur = window.innerHeight;
      // if viewport height reduced substantially => keyboard open
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
          if (data.goalSavings) { setGoalSavings(data.goalSavings); setGoalInput(String(data.goalSavings)); }
          if (typeof data.isAuthenticated === "boolean") setIsAuthenticated(data.isAuthenticated);
          if (data.user) setUser(data.user);
        }
      }
      const session = localStorage.getItem("finance_session");
      if (session) {
        // optional: auto login using saved token (implementation depends on backend)
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
    if (document.activeElement && typeof document.activeElement.blur === "function") document.activeElement.blur();
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
      // replace default symbol with custom symbol if necessary
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
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) {
      return `Сегодня, ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return `Вчера, ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };
  const formatTime = (dateString) => dateString ? new Date(dateString).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "";

  // Tx row
  const TxRow = ({ tx }) => (
    <div key={tx.id} className="flex items-center justify-between pb-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full text-xl ${categoriesMeta[tx.category]?.color ?? "bg-gray-200"}`}>
          {categoriesMeta[tx.category]?.icon ?? "💼"}
        </div>
        <div>
          <p className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>{tx.description || "—"}</p>
          <p className="text-xs text-gray-400">{tx.category} • {formatDate(tx.date)}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0">
        <p className={`font-bold ${tx.type === "income" ? "text-emerald-400" : tx.type === "expense" ? "text-rose-400" : "text-sky-400"}`}>
          {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
        </p>
        <span className="text-xs text-gray-400">{formatTime(tx.date)}</span>
      </div>
    </div>
  );

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

    // update totals
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

    setAmount(""); setDescription(""); setCategory(""); setShowAddModal(false);
    vibrateSuccess();

    // optional: save to server if authenticated (non-blocking)
    if (isAuthenticated && user?.id && apiUrl) {
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

  // Auth (demo / placeholder)
  const handleAuth = async () => {
    blurAll();
    if (!email || !password) {
      vibrateError();
      return alert("Введите email и пароль");
    }
    // demo success
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
    setBalance(10000); setIncome(50000); setExpenses(30000); setSavings(10000); setTransactions([]);
    vibrateError();
  };

  // Chart rendering safe (if Chart.js exists)
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
    data.forEach((t) => { categoriesData[t.category] = (categoriesData[t.category] || 0) + t.amount; });

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
      if (window.financeChart) { window.financeChart.destroy(); delete window.financeChart; }
    };
  }, [showChart, chartType, transactions]);

  // Theme-based helpers
  const isDark = theme === "dark";
  const pageBg = isDark
    ? "bg-[radial-gradient(ellipse_at_top_left,_#071033,_#021024)]"
    : "bg-[radial-gradient(ellipse_at_top_left,_#e8f0ff,_#f8faff)]";
  const cardBg = isDark ? "bg-zinc-900/75" : "bg-white/75";
  const cardBorder = isDark ? "border-zinc-800/60" : "border-gray-200";
  const textPrimary = isDark ? "text-gray-100" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-300" : "text-gray-600";
  const inputBg = isDark ? "bg-zinc-800/60" : "bg-gray-100/70";
  const accent = isDark ? "text-sky-300" : "text-blue-600";

  // savings progress compute
  const savingsProgress = Math.min((savings || 0) / (goalSavings || 1), 1);
  const savingsPct = Math.round(savingsProgress * 100);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-400 ${pageBg}`}
      style={{
        paddingTop: safeAreaInset.top || 0,
        paddingBottom: safeAreaInset.bottom || 0,
        paddingLeft: safeAreaInset.left || 0,
        paddingRight: safeAreaInset.right || 0,
        backgroundAttachment: "fixed",
      }}
    >
      <div className={`fixed inset-0 ${isDark ? "bg-black/20" : "bg-white/5"} pointer-events-none`} />

      {/* Header */}
      <header className={`p-6 ${cardBg} ${cardBorder} border-b rounded-b-2xl shadow-sm backdrop-blur-sm`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>Привет, {user?.first_name || "гость"}!</h1>
            <p className={`text-sm ${textSecondary}`}>Общий баланс</p>
          </div>

          {/* Removed theme switch from header as requested */}
          <div className="flex items-center gap-3 opacity-0 pointer-events-none">
            {/* kept placeholder to avoid layout shift */}
            <div className="text-sm text-gray-400">{currency}</div>
            <button className="px-3 py-2 rounded-lg border"> </button>
          </div>
        </div>

        <div
          className={`mt-5 rounded-2xl p-6 ${isDark ? "bg-gradient-to-br from-sky-800/70 to-violet-900/70" : "bg-gradient-to-br from-blue-400 to-purple-400"} text-white shadow-lg backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Баланс</p>
              <h2 className="text-4xl font-bold leading-tight">{formatCurrency(balance)}</h2>
            </div>

            {/* removed income/expense mini column to keep balance single */}
            <div />
          </div>
        </div>
      </header>

      {/* Main container */}
      <main className="p-4 flex-1 w-full max-w-md mx-auto">
        {/* Overview */}
        {activeTab === "overview" && (
          <section className="space-y-4">
            <div className={`rounded-xl p-4 ${cardBg} ${cardBorder} border`}> 
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Последние операции</h3>
              {transactions.length === 0 ? (
                <p className={`${textSecondary} text-center py-8`}>Пока нет операций</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 6).map((tx) => <TxRow tx={tx} key={tx.id} />)}
                </div>
              )}
            </div>
          </section>
        )}

        {/* History */}
        {activeTab === "history" && (
          <section className={`rounded-xl p-4 ${cardBg} ${cardBorder} border`}> 
            <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>История операций</h3>
            {transactions.length === 0 ? (
              <p className={`${textSecondary} text-center py-8`}>Нет операций</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => <TxRow tx={tx} key={tx.id} />)}
              </div>
            )}
          </section>
        )}

        {/* Savings */}
        {activeTab === "savings" && (
          <section className="space-y-4">
            <div className={`rounded-xl p-4 ${cardBg} ${cardBorder} border flex flex-col`}> 
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-xl text-gray-100">Копилка</div>
                <div className="text-sm text-gray-300">{formatCurrency(savings)} / {formatCurrency(goalSavings)}</div>
              </div>

              {/* Thick horizontal progress bar - IT style gradient */}
              <div className="w-full mb-3">
                <div className="w-full rounded-xl h-5 bg-[rgba(255,255,255,0.06)] overflow-hidden" style={{ boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.03)" : "inset 0 1px 0 rgba(0,0,0,0.04)"}}>
                  <div
                    className="h-full rounded-xl transition-all"
                    style={{
                      width: `${savingsPct}%`,
                      background: isDark
                        ? `linear-gradient(90deg, rgba(96,165,250,0.95), rgba(59,130,246,0.95))`
                        : `linear-gradient(90deg, rgba(59,130,246,0.95), rgba(96,165,250,0.95))`,
                      boxShadow: "0 6px 18px rgba(59,130,246,0.16)",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <div>{savingsPct}%</div>
                  <div className="text-right">До цели</div>
                </div>
              </div>

              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => { setShowGoalModal(true); vibrate(); }}
                  className="flex-1 py-2 bg-slate-700/20 text-sky-200 rounded-xl hover:bg-slate-700/30 transition"
                >Изменить цель</button>
                <button
                  onClick={() => { setTransactionType("savings"); setShowAddModal(true); vibrate(); }}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow transition"
                >
                  <Plus size={16} /> Пополнить
                </button>
              </div>
            </div>

            <div className={`rounded-xl p-4 ${cardBg} ${cardBorder} border`}> 
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>История пополнений</h3>
              {transactions.filter((t) => t.type === "savings").length === 0 ? (
                <p className={`${textSecondary} text-center py-8`}>Начните копить!</p>
              ) : (
                <div className="space-y-3">
                  {transactions.filter((t) => t.type === "savings").map((tx) => <TxRow tx={tx} key={tx.id} />)}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <section className="space-y-4">
            <div className={`rounded-xl p-4 ${cardBg} ${cardBorder} border`}> 
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Аккаунт</h3>

            <button onClick={handleResetAll} className="w-full py-3 mb-3 bg-gray-600 text-white rounded-xl flex items-center justify-center gap-2">
              Сбросить баланс
            </button>
              {isAuthenticated ? (
                <>
                  <div className="mb-2 font-semibold text-lg">{user?.first_name || user?.email}</div>
                  <button onClick={handleLogout} className="w-full py-3 bg-rose-500 text-white rounded-xl flex items-center justify-center gap-2">
                    <LogOut size={18} /> Выйти
                  </button>
                </>
              ) : (
                <button onClick={() => { setShowAuthModal(true); }} className="w-full py-3 bg-sky-600 text-white rounded-xl flex items-center justify-center gap-2">
                  <LogIn size={18} /> Войти
                </button>
              )}
            </div>

            <div className={`rounded-xl p-4 ${cardBg} ${cardBorder} border`}> 
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Тема</h3>
              <button onClick={() => { setTheme((t) => (t === "dark" ? "light" : "dark")); }} className="underline text-sky-300">
                Сменить тему на {isDark ? "светлую" : "тёмную"}
              </button>
            </div>

            <div className={`rounded-xl p-4 ${cardBg} ${cardBorder} border`}> 
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Валюта</h3>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`w-full p-3 rounded-xl ${inputBg} ${textPrimary}`}>
                {currencies.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>)}
              </select>
            </div>
          </section>
        )}
      </main>

      {/* Modals (Add, Auth, Chart, Goal) */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className={`w-full max-w-md p-6 rounded-t-3xl ${cardBg} ${cardBorder} border backdrop-blur-sm`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Цель накопления</h3>
            <input type="number" value={goalInput} min={0} onChange={(e) => setGoalInput(e.target.value.replace(/^0+/, ""))} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <div className="flex gap-3">
              <button onClick={() => { setShowGoalModal(false); }} className={`flex-1 py-3 rounded-xl ${inputBg} ${textPrimary}`}>Отмена</button>
              <button onClick={() => { const n = parseInt(goalInput, 10); if (!Number.isNaN(n) && n >= 0) setGoalSavings(n); setShowGoalModal(false); }} className="flex-1 py-3 bg-sky-500 text-white rounded-xl">Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {showChart && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className={`w-full max-w-md p-6 rounded-2xl ${cardBg} ${cardBorder} border backdrop-blur-sm`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>{chartType === "income" ? "Доходы" : chartType === "expense" ? "Расходы" : "Копилка"} по категориям</h3>
            <div className="relative h-64">
              <canvas id="financeChart"></canvas>
            </div>
            <button onClick={() => setShowChart(false)} className="mt-4 w-full py-3 bg-gray-500 text-white rounded-xl">Закрыть</button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className={`w-full max-w-md p-6 rounded-t-3xl ${cardBg} ${cardBorder} border backdrop-blur-sm`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Новая операция</h3>

            <div className="flex gap-2 mb-4">
              { ["expense", "income", "savings"].map((type) => (
                <button
                  key={type}
                  onClick={() => { setTransactionType(type); vibrateSelect(); }}
                  className={`flex-1 py-3 rounded-xl font-medium transition ${transactionType === type ? (type === "income" ? "bg-emerald-500 text-white" : type === "expense" ? "bg-rose-500 text-white" : "bg-sky-500 text-white") : `${inputBg} ${textSecondary}`}`}
                >
                  {type === "income" ? "Доход" : type === "expense" ? "Расход" : "Копилка"}
                </button>
              )) }
            </div>

            <input type="number" placeholder="Сумма" value={amount} onChange={(e) => setAmount(e.target.value.replace(/^0+/, ""))} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <input type="text" placeholder="Описание (необязательно)" value={description} onChange={(e) => setDescription(e.target.value)} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full p-4 rounded-xl mb-4 ${inputBg} ${textPrimary}`}>
              <option value="">Категория</option>
              {categoriesList[transactionType].map((cat) => <option key={cat} value={cat}>{(categoriesMeta[cat]?.icon ? categoriesMeta[cat].icon + " " : "") + cat}</option>)}
            </select>

            <div className="flex gap-3">
              <button onClick={() => setShowAddModal(false)} className={`flex-1 py-4 rounded-xl ${inputBg} ${textPrimary}`}>Отмена</button>
              <button onClick={addTransaction} className={`flex-1 py-4 rounded-xl ${transactionType === "income" ? "bg-emerald-500" : transactionType === "expense" ? "bg-rose-500" : "bg-sky-500"} text-white`}>Добавить</button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className={`w-full max-w-md p-6 rounded-2xl ${cardBg} ${cardBorder} border backdrop-blur-sm`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Вход / Регистрация</h3>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <p className={`text-sm ${textSecondary} mb-2`}>Имя: {displayName}</p>
            <select value={authCurrency} onChange={(e) => setAuthCurrency(e.target.value)} className={`w-full p-4 rounded-xl mb-4 ${inputBg} ${textPrimary}`}>
              {currencies.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>)}
            </select>

            <div className="flex gap-2">
              <button onClick={() => setShowAuthModal(false)} className={`flex-1 py-3 ${inputBg} ${textPrimary} rounded-xl`}>Отмена</button>
              <button onClick={handleAuth} className="flex-1 py-3 bg-sky-500 text-white rounded-xl">Войти</button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM CAPSULE + Floating Plus (right separate) - iOS style, compact, blue accent */}
      {!isKeyboardOpen && (
        <div className="fixed left-1/2 transform -translate-x-1/2 bottom-6 z-40" style={{ width: "min(680px, calc(100% - 40px))" }}>
          <div className="relative flex items-center justify-center">
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <div
                className={`rounded-full py-2 px-4 backdrop-blur-md ${isDark ? "bg-black/40 border border-white/6 shadow-[0_6px_20px_rgba(2,6,23,0.5)]" : "bg-white/70 border border-gray-100 shadow-[0_6px_20px_rgba(59,130,246,0.06)]"}`}
                style={{ maxWidth: 520, width: "calc(100% - 84px)", borderRadius: 28, height: 56 }}
              >
                <div className="flex items-center justify-between px-2">
                  <NavButton compact active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); vibrate(); }} icon={<Wallet size={18} />} label="Главная" />

                  <NavButton compact active={activeTab === "history"} onClick={() => { setActiveTab("history"); vibrate(); }} icon={<History size={18} />} label="История" />

                  <NavButton compact active={activeTab === "savings"} onClick={() => { setActiveTab("savings"); vibrate(); }} icon={<PiggyBank size={18} />} label="Копилка" />

                  <NavButton compact active={activeTab === "settings"} onClick={() => { setActiveTab("settings"); vibrate(); }} icon={<Settings size={18} />} label="Настройки" />
                </div>
              </div>

              {/* Floating plus sits to the right inside outer container (separate element) */}
              <div style={{ width: 84, display: "flex", justifyContent: "flex-end", marginLeft: 12 }}>
                <button
                  onClick={() => { setShowAddModal(true); vibrate(); }}
                  className={`relative w-14 h-14 rounded-full backdrop-blur-md ${isDark ? "bg-transparent border border-white/10" : "bg-transparent border border-gray-200"} flex items-center justify-center shadow-lg transition-transform transform hover:scale-105 active:scale-95`}
                  aria-label="Добавить операцию"
                  title="Добавить"
                  style={{
                    background: "transparent",
                  }}
                >
                  {/* circle with blue outline and blue + icon, transparent fill */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center`} style={{ boxShadow: isDark ? "0 8px 24px rgba(59,130,246,0.12)" : "0 8px 24px rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.22)" }}>
                    <Plus size={18} className="text-sky-500" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------
   Small reusable components
   -------------------- */

function NavButton({ icon, label, active, onClick, compact }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 px-3 py-1 transition-all ${compact ? "py-1" : "py-2"}`}>
      <div className={active ? "text-sky-500" : "text-gray-400"}>{icon}</div>
      <span className={`text-[12px] ${active ? "text-sky-500 font-semibold" : "text-gray-400"}`}>{label}</span>
    </button>
  );
}

function TabButton({ children, active, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 px-3 py-1 transition-all">
      <div className={active ? "text-sky-300" : "text-gray-400"}>{children}</div>
      <span className={`text-[11px] ${active ? "text-sky-300 font-semibold" : "text-gray-400"}`}></span>
    </button>
  );
}
