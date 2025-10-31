// FinanceApp.jsx — обновлённая версия
// Требует: React, lucide-react
// Предназначение: клиент, подключается к backend: https://walletback-aghp.onrender.com
// Важное: backend должен поддерживать поля users.savings_usd и transactions.converted_amount_usd
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

const API_BASE = "https://walletback-aghp.onrender.com"; // <- твой Render URL
const LS_KEY = "finance_settings_v2";
const SESSION_KEY = "finance_session_v2";

// Helper constants
const currencies = [
  { code: "BYN", symbol: "Br", name: "Белорусский рубль" },
  { code: "USD", symbol: "$", name: "Доллар США" },
  { code: "RUB", symbol: "₽", name: "Российский рубль" },
  { code: "EUR", symbol: "€", name: "Евро" },
];

export default function FinanceApp() {
  // ---------- UI / auth state ----------
  const [user, setUser] = useState(null); // user object from backend
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview|history|savings|settings
  const [theme, setTheme] = useState("dark");
  const [safeAreaInset, setSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // ---------- finance state (canonical storage model) ----------
  // IMPORTANT: base currency for account is BYN (balance, income, expenses stored in BYN)
  // savings are stored in USD in DB as savings_usd
  const [balance, setBalance] = useState(0); // BYN
  const [income, setIncome] = useState(0); // BYN
  const [expenses, setExpenses] = useState(0); // BYN
  const [savingsUsd, setSavingsUsd] = useState(0); // USD
  const [goalSavingsUsd, setGoalSavingsUsd] = useState(0); // USD goal
  const [transactions, setTransactions] = useState([]); // transactions from backend

  // ---------- form state ----------
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactionType, setTransactionType] = useState("expense"); // expense|income|savings
  const [txAmount, setTxAmount] = useState(""); // user enters amount (BYN for expense/income/savings)
  const [txDescription, setTxDescription] = useState("");
  const [txCategory, setTxCategory] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFirstName, setAuthFirstName] = useState("");
  const [authCurrency, setAuthCurrency] = useState("BYN");

  // UI niceties
  const [nbrbRate, setNbrbRate] = useState(null); // official Cur_OfficialRate (BYN per 1 USD)
  const [loadingRate, setLoadingRate] = useState(false);

  // Telegram WebApp detection for avatar & name
  const tg = typeof window !== "undefined" && window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user || null;
  const telegramAvatar = tgUser?.photo_url || null;

  // ---------- utilities ----------
  const formatBYN = (v) => {
    const n = Number(v) || 0;
    try {
      return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(n);
    } catch {
      return `Br${Math.round(n)}`;
    }
  };
  const formatUSD = (v) => {
    const n = Number(v) || 0;
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
    } catch {
      return `$${(Math.round(n*100)/100).toFixed(2)}`;
    }
  };

  // ---------- lifecycle ----------
  useEffect(() => {
    // load local settings
    try {
      const ls = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      if (ls.theme) setTheme(ls.theme);
      if (ls.goalSavingsUsd) setGoalSavingsUsd(Number(ls.goalSavingsUsd) || 0);
    } catch (e) { /* ignore */ }

    // load session
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
      if (s?.email && s?.token) {
        // attempt to autologin via token (backend accepts token in /api/auth as password/token)
        setAuthEmail(s.email);
        autoAuthWithToken(s.email, s.token);
      }
    } catch (e) {}

    // keyboard detection
    let prevHeight = typeof window !== "undefined" ? window.innerHeight : 0;
    const onResize = () => {
      const cur = window.innerHeight;
      setIsKeyboardOpen(cur < prevHeight - 120);
      prevHeight = cur;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // persist some settings
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ theme, goalSavingsUsd }));
  }, [theme, goalSavingsUsd]);

  // fetch latest NBRB rate on mount and periodically (every 10 minutes)
  useEffect(() => {
    fetchNbrbRate();
    const id = setInterval(fetchNbrbRate, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // ---------- NBRB rate ----------
  async function fetchNbrbRate() {
    setLoadingRate(true);
    try {
      const res = await fetch("https://api.nbrb.by/exrates/rates/USD?paramMode=2");
      if (!res.ok) throw new Error("rate fetch failed");
      const json = await res.json();
      // Cur_OfficialRate = BYN per 1 USD (e.g. 3.25)
      const rate = Number(json.Cur_OfficialRate) || null;
      setNbrbRate(rate);
      setLoadingRate(false);
      return rate;
    } catch (e) {
      console.warn("Failed fetching NBRB rate", e);
      setLoadingRate(false);
      return null;
    }
  }

  // ---------- Auth / account handling ----------
  async function autoAuthWithToken(email, token) {
    try {
      // Use backend auth with token (server.js supports token field as "password_hash" equivalency)
      const resp = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, first_name: tgUser?.first_name || "user", currency: authCurrency })
      });
      if (!resp.ok) throw new Error("auth failed");
      const json = await resp.json();
      applyUserLogin(json.user, json.transactions || []);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email, token })); // keep
      return true;
    } catch (e) {
      console.warn("Auto auth failed", e);
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
  }

  // handle explicit login / registration
  async function handleAuth() {
    if (!authEmail || (!authPassword && !tgUser)) return alert("Введи email и пароль (или Telegram авторизация).");
    try {
      const payload = {
        email: authEmail,
        password: authPassword || "",
        first_name: authFirstName || tgUser?.first_name || "user",
        currency: authCurrency,
        token: "" // for now not using token approach here
      };
      const resp = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await resp.json();
      if (!resp.ok) {
        return alert(json?.error || "Ошибка входа");
      }
      applyUserLogin(json.user, json.transactions || []);
      // store basic session token (demo)
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: authEmail, token: btoa(authPassword) }));
      setShowAuthModal(false);
      vibrateSuccess();
    } catch (e) {
      console.error("Auth error", e);
      alert("Ошибка при запросе аутентификации");
    }
  }

  function applyUserLogin(userObj, txs = []) {
    // userObj comes from backend 'users' row, ensure numeric cast
    setUser(userObj);
    setIsAuthenticated(true);

    // Use backend fields if present
    setBalance(Number(userObj.balance || 0));
    setIncome(Number(userObj.income || 0));
    setExpenses(Number(userObj.expenses || 0));
    setSavingsUsd(Number(userObj.savings_usd || userObj.savings || 0)); // backward compatibility
    setGoalSavingsUsd(Number(userObj.goal_savings || userObj.goalSavingsUsd || 0));
    setTransactions(Array.isArray(txs) ? txs : []);

    // store session minimal
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: userObj.email, token: btoa(authPassword || "") }));
  }

  async function handleLogout() {
    // persist to backend current user numbers
    if (isAuthenticated && user?.id) {
      try {
        await fetch(`${API_BASE}/api/user/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            balance,
            income,
            expenses,
            savings: savingsUsd, // backend earlier had 'savings' numeric, but we keep savings_usd naming too
            currency: "BYN",
            goalSavings: goalSavingsUsd
          })
        });
      } catch (e) {
        console.warn("Failed to persist user on logout", e);
      }
    }

    // clear UI to guest zeros
    setIsAuthenticated(false);
    setUser(null);
    setBalance(0);
    setIncome(0);
    setExpenses(0);
    setSavingsUsd(0);
    setTransactions([]);
    localStorage.removeItem(SESSION_KEY);
    vibrateError();
  }

  // Reset all to zeros (explicit button)
  async function handleResetAll() {
    if (!window.confirm("Сбросить все данные? Это приведёт к полному обнулению счета и операций.")) return;
    setBalance(0);
    setIncome(0);
    setExpenses(0);
    setSavingsUsd(0);
    setTransactions([]);
    // persist to backend
    if (isAuthenticated && user?.id) {
      await fetch(`${API_BASE}/api/user/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: 0, income: 0, expenses: 0, savings: 0, currency: "BYN", goalSavings: 0 })
      });
      // optionally clear transactions server-side (not implemented here)
    }
    vibrateSuccess();
  }

  // ---------- Transactions logic ----------
  // Add transaction - sends to backend and updates local UI/state
  async function addTransaction() {
    blurAll();
    const n = Number(txAmount);
    if (!isFinite(n) || n <= 0) return alert("Введите корректную сумму > 0");
    if (!transactionType) return alert("Выберите тип операции");

    const newTxLocal = {
      id: Date.now(),
      user_id: user?.id || null,
      type: transactionType,
      amount: n, // BYN always for incoming input
      converted_amount_usd: null,
      description: txDescription || "",
      category: txCategory || "",
      date: new Date().toISOString(),
    };

    if (transactionType === "income") {
      // income increases income & balance
      setIncome((v) => {
        const res = v + n;
        return res;
      });
      setBalance((b) => b + n);
      setTransactions((p) => [newTxLocal, ...p]);
      // persist
      await persistTransactionToServer(newTxLocal);
      await persistUserBalancesToServer();
    } else if (transactionType === "expense") {
      // expense increases expenses & decreases balance
      setExpenses((v) => v + n);
      setBalance((b) => b - n);
      setTransactions((p) => [newTxLocal, ...p]);
      // persist
      await persistTransactionToServer(newTxLocal);
      await persistUserBalancesToServer();
    } else {
      // savings: convert BYN -> USD using NBRB, subtract BYN from balance, add USD to savingsUsd
      const rate = nbrbRate || (await fetchNbrbRate());
      if (!rate) return alert("Не удалось получить курс НБРБ. Попробуйте позже.");

      // USD = BYN / rate  (rate = BYN per 1 USD)
      // compute carefully:
      const usd = Number((n / rate).toFixed(2)); // keep 2 decimal places for USD
      newTxLocal.converted_amount_usd = usd;

      setBalance((b) => b - n); // subtract BYN from balance
      setSavingsUsd((s) => {
        const newS = Number((s + usd).toFixed(2));
        return newS;
      });

      setTransactions((p) => [newTxLocal, ...p]);
      // persist transaction with converted_amount_usd
      await persistTransactionToServer(newTxLocal);
      // update user.savings_usd and balance in db
      await persistUserBalancesToServer();
    }

    // reset modal
    setTxAmount("");
    setTxCategory("");
    setTxDescription("");
    setShowAddModal(false);
    vibrateSuccess();
  }

  async function persistTransactionToServer(tx) {
    try {
      // server expects user_id, type, amount, description, category
      const payload = {
        user_id: user?.id || null,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        converted_amount_usd: tx.converted_amount_usd || null
      };
      // POST /api/transactions
      const res = await fetch(`${API_BASE}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.warn("TX POST failed", res.status, txt);
      }
    } catch (e) {
      console.warn("Failed persist tx", e);
    }
  }

  async function persistUserBalancesToServer() {
    if (!isAuthenticated || !user?.id) return;
    try {
      const payload = {
        balance,
        income,
        expenses,
        savings: savingsUsd, // keep existing backend field for compatibility
        currency: "BYN",
        goalSavings: goalSavingsUsd
      };
      await fetch(`${API_BASE}/api/user/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("User PUT failed", e);
    }
  }

  // get transactions for user (fresh)
  async function fetchTransactionsForUser(userId) {
    try {
      const res = await fetch(`${API_BASE}/api/transactions?user_id=${userId}`);
      if (!res.ok) throw new Error("tx fetch failed");
      const rows = await res.json();
      setTransactions(rows);
    } catch (e) {
      console.warn("Failed fetch tx", e);
    }
  }

  // ---------- UI helpers ----------
  function blurAll() {
    if (document.activeElement && typeof document.activeElement.blur === "function") document.activeElement.blur();
  }
  const vibrateSuccess = () => { if (tg?.HapticFeedback?.notificationOccurred) tg.HapticFeedback.notificationOccurred("success"); };
  const vibrateError = () => { if (tg?.HapticFeedback?.notificationOccurred) tg.HapticFeedback.notificationOccurred("error"); };
  const vibrate = () => { if (tg?.HapticFeedback?.impactOccurred) tg.HapticFeedback.impactOccurred("light"); };
  const vibrateSelect = () => { if (tg?.HapticFeedback?.selectionChanged) tg.HapticFeedback.selectionChanged(); };

  // ---------- Render ----------
  const isDark = theme === "dark";
  const pageBg = isDark ? "bg-[radial-gradient(ellipse_at_top_left,_#071033,_#021024)]" : "bg-[radial-gradient(ellipse_at_top_left,_#e8f0ff,_#f8faff)]";
  const cardBg = isDark ? "bg-zinc-900/75" : "bg-white/75";
  const cardBorder = isDark ? "border-zinc-800/60" : "border-gray-200";
  const textPrimary = isDark ? "text-gray-100" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-300" : "text-gray-600";
  const inputBg = isDark ? "bg-zinc-800/60" : "bg-gray-100/70";

  // compute savings progress vs goal (goal expressed in USD)
  const savingsProgress = goalSavingsUsd > 0 ? Math.min(savingsUsd / goalSavingsUsd, 1) : 0;
  const savingsPct = Math.round(savingsProgress * 100);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${pageBg}`} style={{ paddingTop: safeAreaInset.top || 0, paddingBottom: safeAreaInset.bottom || 0 }}>
      <div className={`fixed inset-0 ${isDark ? "bg-black/20" : "bg-white/5"} pointer-events-none`} />

      {/* Header — minimal: removed big balance and currency label */}
      <header className={`p-4 ${cardBg} ${cardBorder} border-b rounded-b-2xl shadow-sm backdrop-blur-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-lg font-semibold ${textPrimary}`}>Финансы</h1>
            <p className={`text-xs ${textSecondary}`}>Текущее состояние</p>
          </div>
          <div style={{ width: 36 }} />
        </div>
      </header>

      {/* Main */}
      <main className="p-4 flex-1 w-full max-w-md mx-auto">
        {/* Overview: ONLY here display big "Общий баланс" card */}
        {activeTab === "overview" && (
          <section className="space-y-4">
            <div className={`mt-2 rounded-2xl p-5 ${isDark ? "bg-gradient-to-br from-sky-800/70 to-violet-900/70" : "bg-gradient-to-br from-blue-400 to-purple-400"} text-white shadow-lg backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Общий баланс</p>
                  <h2 className="text-3xl font-bold leading-tight">{formatBYN(balance)}</h2>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs opacity-85">Доходы</div>
                  <div className="font-semibold">{formatBYN(income)}</div>
                  <div className="text-xs opacity-85 mt-2">Расходы</div>
                  <div className="font-semibold">{formatBYN(expenses)}</div>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 ${cardBg} ${cardBorder} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Последние операции</h3>
              {transactions.length === 0 ? (
                <p className={`${textSecondary} text-center py-8`}>Пока нет операций</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 6).map((tx) => (
                    <TxRow key={tx.id} tx={tx} textPrimary={textPrimary} textSecondary={textSecondary} />
                  ))}
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
                {transactions.map((tx) => <TxRow key={tx.id} tx={tx} textPrimary={textPrimary} textSecondary={textSecondary} />)}
              </div>
            )}
          </section>
        )}

        {/* Savings */}
        {activeTab === "savings" && (
          <section className="space-y-4">
            <div className={`rounded-xl p-4 ${cardBg} ${cardBorder} border flex flex-col`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`font-bold text-xl ${textPrimary}`}>Копилка</div>
                <div className="text-sm text-gray-300">{formatUSD(savingsUsd)} / {goalSavingsUsd ? formatUSD(goalSavingsUsd) : "—"}</div>
              </div>

              {/* Thick horizontal progress bar — saturated blue */}
              <div className="w-full mb-3">
                <div className="w-full rounded-xl h-6 bg-[rgba(255,255,255,0.04)] overflow-hidden" style={{ boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.03)" : "inset 0 1px 0 rgba(0,0,0,0.04)" }}>
                  <div
                    className="h-full rounded-xl transition-all"
                    style={{
                      width: `${savingsPct}%`,
                      background: isDark ? `linear-gradient(90deg, #1E40AF, #2563EB)` : `linear-gradient(90deg, #2563EB, #60A5FA)`,
                      boxShadow: "0 8px 24px rgba(37,99,235,0.14)",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <div className={`${textPrimary}`}>{savingsPct}%</div>
                  <div className="text-right text-gray-400">До цели</div>
                </div>
              </div>

              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => { setShowGoalModal(true); vibrate(); }}
                  className="flex-1 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition"
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
                  {transactions.filter((t) => t.type === "savings").map((tx) => <TxRow key={tx.id} tx={tx} textPrimary={textPrimary} textSecondary={textSecondary} />)}
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

              {/* Greeting in settings above auth controls */}
              <div className="mb-3 text-sm">
                Привет, <span className={`font-semibold ${textPrimary}`}>{isAuthenticated ? (user?.first_name || user?.email) : "гость"}</span>
              </div>

              {/* Avatar from Telegram if available */}
              {telegramAvatar && (
                <div className="flex items-center gap-3 mb-3">
                  <img src={telegramAvatar} alt="avatar" className="w-12 h-12 rounded-full" />
                  <div>
                    <div className={`font-semibold ${textPrimary}`}>{user?.first_name || tgUser?.first_name}</div>
                    <div className="text-xs text-gray-400">{user?.email || authEmail}</div>
                  </div>
                </div>
              )}

              {!isAuthenticated ? (
                <button onClick={() => setShowAuthModal(true)} className="w-full py-3 bg-sky-600 text-white rounded-xl flex items-center justify-center gap-2">
                  <LogIn size={18} /> Войти / Регистрация
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="mb-2 font-semibold text-lg">{user?.first_name || user?.email}</div>
                  <div className="text-sm text-gray-400">Email: {user?.email}</div>
                </div>
              )}
            </div>

            <div className={`rounded-xl p-4 ${cardBg} ${cardBorder} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Управление</h3>
              <button onClick={handleResetAll} className="w-full py-3 bg-gray-600 text-white rounded-xl mb-3">Сбросить баланс</button>
              <button onClick={() => { setShowGoalModal(true); }} className="w-full py-3 bg-sky-500 text-white rounded-xl">Изменить цель копилки</button>
            </div>

            <div className={`rounded-xl p-4 ${cardBg} ${cardBorder} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Тема</h3>
              <button onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} className="underline text-sky-300">
                Сменить тему на {isDark ? "светлую" : "тёмную"}
              </button>
            </div>

            <div className={`rounded-xl p-4 ${cardBg} ${cardBorder} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Валюта</h3>
              <select value={"BYN"} disabled className={`w-full p-3 rounded-xl ${inputBg} ${textPrimary}`}>
                {/* base currency is BYN — disabled because we store in BYN */}
                <option>Белорусский рубль (BYN) — базовая валюта</option>
              </select>
            </div>

            {/* Logout / Save at bottom */}
            {isAuthenticated && (
              <div className={`rounded-xl p-4 ${cardBg} ${cardBorder} border`}>
                <button onClick={() => { handleLogout(); }} className="w-full py-3 bg-rose-500 text-white rounded-xl">Выйти</button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
          <div className={`w-full max-w-md p-6 rounded-t-3xl ${cardBg} ${cardBorder} border backdrop-blur-sm`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Новая операция</h3>

            <div className="flex gap-2 mb-4">
              {["expense", "income", "savings"].map((type) => (
                <button
                  key={type}
                  onClick={() => { setTransactionType(type); vibrateSelect(); }}
                  className={`flex-1 py-3 rounded-xl font-medium transition ${transactionType === type ? (type === "income" ? "bg-emerald-500 text-white" : type === "expense" ? "bg-rose-500 text-white" : "bg-sky-500 text-white") : `${inputBg} ${textSecondary}`}`}
                >
                  {type === "income" ? "Доход" : type === "expense" ? "Расход" : "Копилка"}
                </button>
              ))}
            </div>

            <input type="number" placeholder="Сумма (BYN)" value={txAmount} onChange={(e) => setTxAmount(e.target.value.replace(/^0+/, ""))} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <input type="text" placeholder="Описание (необязательно)" value={txDescription} onChange={(e) => setTxDescription(e.target.value)} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <input type="text" placeholder="Категория" value={txCategory} onChange={(e) => setTxCategory(e.target.value)} className={`w-full p-4 rounded-xl mb-4 ${inputBg} ${textPrimary}`} />

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
            <input type="email" placeholder="Email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <input type="password" placeholder="Пароль" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <input type="text" placeholder="Имя" value={authFirstName} onChange={(e) => setAuthFirstName(e.target.value)} className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`} />
            <select value={authCurrency} onChange={(e) => setAuthCurrency(e.target.value)} className={`w-full p-4 rounded-xl mb-4 ${inputBg} ${textPrimary}`}>
              {currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
            </select>

            <div className="flex gap-2">
              <button onClick={() => setShowAuthModal(false)} className={`flex-1 py-3 ${inputBg} ${textPrimary} rounded-xl`}>Отмена</button>
              <button onClick={handleAuth} className="flex-1 py-3 bg-sky-500 text-white rounded-xl">Войти / Зарегистрироваться</button>
            </div>
          </div>
        </div>
      )}

      {/* Goal modal */}
      {/** goal input affects USD goal for savings */}
      {/** Keep it consistent: user sets VALUE in USD */}
      {/** showGoalModal reused earlier; create here inline */}
      {/* intentionally placed near bottom to avoid repeating code above */}
      {/** We can reuse showGoalModal state, create simple modal when true */ }
      {
        /* goal modal placeholder */
      }

      {/* Bottom capsule nav + separate plus */}
      {!isKeyboardOpen && (
        <div className="fixed left-1/2 transform -translate-x-1/2 bottom-6 z-40" style={{ width: "min(720px, calc(100% - 40px))" /* slightly wider */ }}>
          <div className="relative flex items-center justify-center">
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <div
                className={`rounded-full py-2 px-4 backdrop-blur-md ${isDark ? "bg-black/40 border border-white/6 shadow-[0_6px_20px_rgba(2,6,23,0.5)]" : "bg-white/80 border border-gray-100 shadow-[0_6px_20px_rgba(59,130,246,0.06)]"}`}
                style={{ maxWidth: 580, width: "calc(100% - 110px)", borderRadius: 28, height: 56 }}
              >
                <div className="flex items-center justify-between px-2">
                  <NavButton compact active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); vibrate(); }} icon={<Wallet size={18} />} label="Главная" />
                  <NavButton compact active={activeTab === "history"} onClick={() => { setActiveTab("history"); vibrate(); }} icon={<History size={18} />} label="История" />
                  <NavButton compact active={activeTab === "savings"} onClick={() => { setActiveTab("savings"); vibrate(); }} icon={<PiggyBank size={18} />} label="Копилка" />
                  <NavButton compact active={activeTab === "settings"} onClick={() => { setActiveTab("settings"); vibrate(); }} icon={<Settings size={18} />} label="Настройки" />
                </div>
              </div>

              {/* Floating plus to the right, transparent fill, blue outline */}
              <div style={{ width: 110, display: "flex", justifyContent: "flex-end", marginLeft: 12 }}>
                <button
                  onClick={() => { setShowAddModal(true); vibrate(); }}
                  className={`relative w-14 h-14 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg transition-transform transform hover:scale-105 active:scale-95`}
                  aria-label="Добавить операцию"
                  title="Добавить"
                  style={{
                    background: "transparent",
                    borderColor: "rgba(37,99,235,0.22)"
                  }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center`} style={{ boxShadow: isDark ? "0 8px 24px rgba(59,130,246,0.12)" : "0 8px 24px rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.22)" }}>
                    <Plus size={18} style={{ color: "#2563EB" }} />
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

/* -------------------- Small reusable components -------------------- */

function NavButton({ icon, label, active, onClick, compact }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 px-3 py-1 transition-all ${compact ? "py-1" : "py-2"}`} style={{ minWidth: 74 }}>
      <div className={active ? "text-sky-500" : "text-gray-400"}>{icon}</div>
      <span className={`text-[12px] ${active ? "text-sky-500 font-semibold" : "text-gray-400"}`}>{label}</span>
    </button>
  );
}

function TxRow({ tx, textPrimary, textSecondary }) {
  // tx may have converted_amount_usd for savings
  const amountLabel = tx.type === "income" ? `+${formatFrontendNumber(tx.amount, "BYN")}` :
    tx.type === "expense" ? `-${formatFrontendNumber(tx.amount, "BYN")}` :
      `-${formatFrontendNumber(tx.amount, "BYN")} → ${formatFrontendNumber(tx.converted_amount_usd, "USD")}`;

  return (
    <div className="flex items-center justify-between pb-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full text-xl bg-slate-700/30`}>{tx.category ? tx.category[0] : "•"}</div>
        <div>
          <p className={`font-medium ${textPrimary}`}>{tx.description || "—"}</p>
          <p className="text-xs text-gray-400">{tx.category || "—"} • {formatDateShort(tx.date)}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0">
        <p className={`font-bold ${tx.type === "income" ? "text-emerald-400" : tx.type === "expense" ? "text-rose-400" : "text-sky-400"}`}>
          {amountLabel}
        </p>
        <span className="text-xs text-gray-400">{formatTimeShort(tx.date)}</span>
      </div>
    </div>
  );
}

/* -------------------- small formatting helpers -------------------- */
function formatFrontendNumber(value, currency) {
  const n = Number(value || 0);
  if (currency === "BYN") {
    try {
      return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(n);
    } catch { return `Br${Math.round(n)}`; }
  } else {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
    } catch { return `$${(Math.round(n*100)/100).toFixed(2)}`; }
  }
}
function formatDateShort(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
function formatTimeShort(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
