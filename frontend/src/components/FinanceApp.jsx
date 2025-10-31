// FinanceApp.jsx
// Полностью обновлённый клиентский компонент.
// Требования: React, lucide-react (тонкие иконки)
// Подключается к backend: https://walletback-aghp.onrender.com
import React, { useEffect, useState, useRef } from "react";
import {
  Wallet,
  History,
  PiggyBank,
  Settings,
  Plus,
  LogIn,
  LogOut,
} from "lucide-react";

// --- Конфигурация ---
const API_BASE = "https://walletback-aghp.onrender.com"; // твой backend
const LS_KEY = "finance_settings_v2";
const SESSION_KEY = "finance_session_v2";

// --- Вспомогательные форматы ---
const formatBYN = (v) => {
  const n = Number(v || 0);
  try {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(n);
  } catch {
    return `Br${Math.round(n)}`;
  }
};
const formatUSD = (v) => {
  const n = Number(v || 0);
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
  } catch {
    return `$${(Math.round(n*100)/100).toFixed(2)}`;
  }
};
const shortDate = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};
const shortTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};

// Категории с emoji
const categoriesMeta = {
  Еда: "🍔", Транспорт: "🚗", Развлечения: "🎉", Счета: "💡", Покупки: "🛒",
  Здоровье: "💊", Другое: "💼", Зарплата: "💵", Фриланс: "👨‍💻", Подарки: "🎁",
  Инвестиции: "📈", Отпуск: "🏖️", Накопления: "💰", "Экстренный фонд": "🚨", Цель: "🎯"
};
const categoriesList = {
  expense: ["Еда","Транспорт","Развлечения","Счета","Покупки","Здоровье","Другое"],
  income: ["Зарплата","Фриланс","Подарки","Инвестиции","Другое"],
  savings: ["Накопления","Отпуск","Экстренный фонд","Цель","Другое"]
};

// --- Компонент ---
export default function FinanceApp() {
  const tg = typeof window !== "undefined" && window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user || null;
  const telegramAvatar = tgUser?.photo_url || null;

  // UI / auth
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview|history|savings|settings
  const [theme, setTheme] = useState("bank-dark");

  // Finance state: canonical model:
  // - balanceBYN, incomeBYN, expensesBYN stored in BYN
  // - savingsUsd stored in USD (копилка в долларах)
  const [balanceBYN, setBalanceBYN] = useState(0);
  const [incomeBYN, setIncomeBYN] = useState(0);
  const [expensesBYN, setExpensesBYN] = useState(0);
  const [savingsUsd, setSavingsUsd] = useState(0);
  const [goalSavingsUsd, setGoalSavingsUsd] = useState(0);

  const [transactions, setTransactions] = useState([]);

  // Forms & modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [txType, setTxType] = useState("expense"); // expense|income|savings
  const [txAmount, setTxAmount] = useState("");
  const [txDescription, setTxDescription] = useState("");
  const [txCategory, setTxCategory] = useState("");

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInputUsd, setGoalInputUsd] = useState("");

  // NBRB rate (BYN per 1 USD)
  const [nbrbRate, setNbrbRate] = useState(null);
  const [loadingRate, setLoadingRate] = useState(false);

  // refs for scroll and sizing
  const mainRef = useRef(null);

  // init: load settings, session, fetch rate
  useEffect(() => {
    try {
      const ls = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      if (ls.theme) setTheme(ls.theme);
      if (ls.goalSavingsUsd) { setGoalSavingsUsd(Number(ls.goalSavingsUsd) || 0); setGoalInputUsd(String(ls.goalSavingsUsd || "")); }
    } catch (e) {}

    // session
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
      if (s?.email && s?.token) {
        // try auto auth via token (server will accept)
        autoAuth(s.email, s.token);
      }
    } catch (e) {}

    fetchNbrbRate();
    const id = setInterval(fetchNbrbRate, 10*60*1000); // update rate every 10 min
    return () => clearInterval(id);
  }, []);

  // persist theme & goalUSD
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ theme, goalSavingsUsd }));
  }, [theme, goalSavingsUsd]);

  // Telegram mini app expand + make main scrollable
  useEffect(() => {
    try { if (tg) { tg.ready(); tg.expand?.(); } } catch (e) {}
    if (mainRef.current) {
      mainRef.current.style.maxHeight = "calc(100vh - 140px)";
      mainRef.current.style.overflowY = "auto";
    }
  }, []);

  // --- Helpers: vibrations ---
  const vibrate = () => { try { tg?.HapticFeedback?.selectionChanged?.(); } catch(e){} };
  const vibrateSuccess = () => { try { tg?.HapticFeedback?.notificationOccurred?.("success"); } catch(e){} };
  const vibrateError = () => { try { tg?.HapticFeedback?.notificationOccurred?.("error"); } catch(e){} };

  // --- NBRB fetch ---
  async function fetchNbrbRate() {
    setLoadingRate(true);
    try {
      const res = await fetch("https://api.nbrb.by/exrates/rates/USD?paramMode=2");
      if (!res.ok) throw new Error("rate failed");
      const j = await res.json();
      const rate = Number(j.Cur_OfficialRate) || null;
      setNbrbRate(rate);
      setLoadingRate(false);
      return rate;
    } catch (e) {
      console.warn("nbrb error", e);
      setLoadingRate(false);
      return null;
    }
  }

  // --- Auth / session ---
  async function autoAuth(email, token) {
    try {
      const resp = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, first_name: tgUser?.first_name || "" })
      });
      if (!resp.ok) { localStorage.removeItem(SESSION_KEY); return; }
      const json = await resp.json();
      applyUser(json.user, json.transactions || []);
    } catch (e) {
      console.warn("autoAuth", e);
      localStorage.removeItem(SESSION_KEY);
    }
  }

  async function handleAuth() {
    if (!authEmail || (!authPassword && !tgUser)) return alert("Введите email и пароль (или используйте Telegram имя)");
    try {
      const payload = { email: authEmail, password: authPassword, first_name: tgUser?.first_name || "" };
      const res = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:"Ошибка"}));
        return alert(err.error || "Ошибка при входе");
      }
      const json = await res.json();
      applyUser(json.user, json.transactions || []);
      // store session simple
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: authEmail, token: btoa(authPassword || "") }));
      setShowAuthModal(false);
      vibrateSuccess();
    } catch (e) {
      console.error("auth", e);
      alert("Ошибка аутентификации");
      vibrateError();
    }
  }

  function applyUser(u, txs=[]) {
    setUser(u);
    setIsAuthenticated(true);
    setBalanceBYN(Number(u.balance || 0));
    setIncomeBYN(Number(u.income || 0));
    setExpensesBYN(Number(u.expenses || 0));
    // backend stores savings_usd; keep compatibility if older field named savings
    setSavingsUsd(Number(u.savings_usd || u.savings || 0));
    setGoalSavingsUsd(Number(u.goal_savings || 0));
    setGoalInputUsd(String(u.goal_savings || ""));
    setTransactions(Array.isArray(txs) ? txs : []);
  }

  async function handleLogout() {
    // persist before logout if possible
    if (user?.id) {
      try {
        await fetch(`${API_BASE}/api/user/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            balance: balanceBYN,
            income: incomeBYN,
            expenses: expensesBYN,
            savings: savingsUsd,
            goalSavings: goalSavingsUsd
          })
        });
      } catch (e) { console.warn("persist on logout failed", e); }
    }

    setIsAuthenticated(false);
    setUser(null);
    setBalanceBYN(0); setIncomeBYN(0); setExpensesBYN(0); setSavingsUsd(0);
    setTransactions([]);
    localStorage.removeItem(SESSION_KEY);
    vibrate();
  }

  // --- Transactions logic ---
  async function addTransaction() {
    const n = Number(txAmount);
    if (!isFinite(n) || n <= 0) return alert("Введите корректную сумму > 0");

    const baseTx = {
      id: Date.now(),
      user_id: user?.id || null,
      type: txType,
      amount: n, // BYN (user input)
      converted_amount_usd: null,
      description: txDescription || "",
      category: txCategory || "",
      date: new Date().toISOString()
    };

    // Local optimistic update
    setTransactions(prev => [baseTx, ...prev]);

    if (txType === "income") {
      setIncomeBYN(v => v + n);
      setBalanceBYN(b => b + n);
    } else if (txType === "expense") {
      setExpensesBYN(v => v + n);
      setBalanceBYN(b => b - n);
    } else {
      // savings: convert BYN -> USD using NBRB
      const rate = nbrbRate || await fetchNbrbRate();
      if (!rate) { alert("Не удалось получить курс НБРБ. Попробуйте позже."); return; }
      const usd = Number((n / rate).toFixed(2));
      baseTx.converted_amount_usd = usd;
      // update local
      setSavingsUsd(s => Number((s + usd).toFixed(2)));
      setBalanceBYN(b => b - n);
    }

    // persist to backend
    try {
      await fetch(`${API_BASE}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || null,
          type: baseTx.type,
          amount: baseTx.amount,
          converted_amount_usd: baseTx.converted_amount_usd,
          description: baseTx.description,
          category: baseTx.category
        })
      });

      if (user?.id) {
        await fetch(`${API_BASE}/api/user/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            balance: balanceBYN,
            income: incomeBYN,
            expenses: expensesBYN,
            savings: savingsUsd, // backend stores in savings_usd
            goalSavings: goalSavingsUsd
          })
        });
      }
    } catch (e) {
      console.warn("persist tx failed", e);
    }

    // reset form
    setTxAmount(""); setTxCategory(""); setTxDescription(""); setShowAddModal(false);
    vibrateSuccess();
  }

  // --- Goal editing (USD) ---
  function openGoalModal() {
    setGoalInputUsd(String(goalSavingsUsd || ""));
    setShowGoalModal(true);
  }
  async function saveGoal() {
    const val = Number(goalInputUsd || 0);
    setGoalSavingsUsd(val);
    setShowGoalModal(false);
    // persist to backend
    if (user?.id) {
      try {
        await fetch(`${API_BASE}/api/user/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            balance: balanceBYN,
            income: incomeBYN,
            expenses: expensesBYN,
            savings: savingsUsd,
            goalSavings: val
          })
        });
      } catch (e) { console.warn("save goal failed", e); }
    }
    vibrateSuccess();
  }

  // --- Fetch txs for user (refresh) ---
  async function fetchTransactionsForUser(userId) {
    try {
      const res = await fetch(`${API_BASE}/api/transactions?user_id=${userId}`);
      if (!res.ok) return;
      const rows = await res.json();
      setTransactions(rows);
    } catch (e) { console.warn("fetch txs", e); }
  }

  // --- UI Components ---
  function TxRow({ tx }) {
    const emoji = categoriesMeta[tx.category] || "•";
    const label = tx.type === "income" ? `+${formatBYN(tx.amount)}` :
      tx.type === "expense" ? `-${formatBYN(tx.amount)}` :
      `-${formatBYN(tx.amount)} → ${formatUSD(tx.converted_amount_usd || 0)}`;

    return (
      <div style={styles.txRow}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={styles.txIcon}>{emoji}</div>
          <div>
            <div style={styles.txTitle}>{tx.description || "—"}</div>
            <div style={styles.txMeta}>{tx.category || "—"} • {shortDate(tx.date)}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...styles.txAmount, color: tx.type === "income" ? "#059669" : tx.type === "expense" ? "#dc2626" : "#1e40af" }}>
            {label}
          </div>
          <div style={styles.txTime}>{shortTime(tx.date)}</div>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div style={styles.app(theme)}>
      {/* MAIN SCROLLABLE */}
      <main ref={mainRef} style={styles.main}>
        {/* Overview: only here show big gradient balance */}
        {activeTab === "overview" && (
          <section style={styles.overviewCard}>
            <div>
              <div style={styles.smallLabel}>Общий баланс</div>
              <div style={styles.bigBalance}>{formatBYN(balanceBYN)}</div>
            </div>
            <div style={styles.rightSplit}>
              <div style={styles.splitItem}>
                <div style={styles.splitLabel}>Доход</div>
                <div style={styles.splitValue}>{formatBYN(incomeBYN)}</div>
              </div>
              <div style={styles.splitItem}>
                <div style={styles.splitLabel}>Расход</div>
                <div style={styles.splitValue}>{formatBYN(expensesBYN)}</div>
              </div>
            </div>
          </section>
        )}

        {/* Last transactions */}
        {(activeTab === "overview" || activeTab === "history") && (
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>{activeTab === "overview" ? "Последние операции" : "История операций"}</h3>
            <div>
              {transactions.length === 0 ? <div style={styles.empty}>Пока нет операций</div> : (
                (activeTab === "overview" ? transactions.slice(0,8) : transactions).map(tx => <TxRow key={tx.id} tx={tx} />)
              )}
            </div>
          </section>
        )}

        {/* Savings tab */}
        {activeTab === "savings" && (
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Копилка</h3>

            <div style={styles.savingsCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Копилка</div>
                <div style={{ color: "#93c5fd" }}>{formatUSD(savingsUsd)} / {goalSavingsUsd ? formatUSD(goalSavingsUsd) : "—"}</div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={styles.progressBg}>
                  <div style={{ ...styles.progressFill, width: `${goalSavingsUsd ? Math.min(100, Math.round((savingsUsd/goalSavingsUsd)*100)) : 0}%` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <div style={{ fontWeight: 700 }}>{goalSavingsUsd ? `${Math.round((savingsUsd/goalSavingsUsd)*100)}%` : "0%"}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12 }}>До цели</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button onClick={openGoalModal} style={styles.primaryBtn}>Изменить цель</button>
                <button onClick={() => { setTxType("savings"); setShowAddModal(true); }} style={styles.primaryBtnAlt}><Plus size={14} /> Пополнить</button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <h4 style={styles.smallTitle}>История пополнений</h4>
              {transactions.filter(t => t.type === "savings").length === 0 ? <div style={styles.empty}>Пополните копилку</div> : transactions.filter(t => t.type === "savings").map(tx => <TxRow key={tx.id} tx={tx} />)}
            </div>
          </section>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Настройки</h3>
            <div style={styles.settingsCard}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={styles.avatarWrap}>
                  {telegramAvatar ? <img src={telegramAvatar} alt="avatar" style={styles.avatarImg} /> : <div style={styles.avatarPh}>👤</div>}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{isAuthenticated ? (user?.first_name || user?.email) : "гость"}</div>
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>{isAuthenticated ? user?.email : ""}</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                {!isAuthenticated ? (
                  <button style={styles.primaryBtn} onClick={() => setShowAuthModal(true)}><LogIn size={14} /> Войти</button>
                ) : (
                  <button style={styles.dangerBtn} onClick={handleLogout}><LogOut size={14} /> Выйти</button>
                )}
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={styles.ghostBtn} onClick={() => { setTheme("bank-dark"); }}>Тёмная</button>
                  <button style={styles.ghostBtn} onClick={() => { setTheme("bank-light"); }}>Светлая</button>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Add modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700 }}>Новая операция</div>
              <button style={styles.iconBtn} onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => setTxType("expense")} style={txType === "expense" ? styles.typeBtnActive : styles.typeBtn}>Расход</button>
              <button onClick={() => setTxType("income")} style={txType === "income" ? styles.typeBtnActive : styles.typeBtn}>Доход</button>
              <button onClick={() => setTxType("savings")} style={txType === "savings" ? styles.typeBtnActive : styles.typeBtn}>Копилка</button>
            </div>

            <input type="number" placeholder="Сумма (BYN)" value={txAmount} onChange={e => setTxAmount(e.target.value)} style={styles.input} />
            <input placeholder="Описание" value={txDescription} onChange={e => setTxDescription(e.target.value)} style={styles.input} />
            <select value={txCategory} onChange={e => setTxCategory(e.target.value)} style={styles.input}>
              <option value="">Категория</option>
              {categoriesList[txType].map(c => <option key={c} value={c}>{(categoriesMeta[c] ? categoriesMeta[c]+" " : "") + c}</option>)}
            </select>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button style={styles.secondaryBtn} onClick={() => setShowAddModal(false)}>Отмена</button>
              <button style={styles.primaryBtn} onClick={addTransaction}>Добавить</button>
            </div>
          </div>
        </div>
      )}

      {/* Auth modal (no name input) */}
      {showAuthModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Вход / Регистрация</div>
            <input placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={styles.input} />
            <input placeholder="Пароль" type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={styles.input} />
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{tgUser?.first_name ? `Имя из Telegram: ${tgUser.first_name}` : "Имя будет использовано автоматически"}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={styles.secondaryBtn} onClick={() => setShowAuthModal(false)}>Отмена</button>
              <button style={styles.primaryBtn} onClick={handleAuth}>Войти / Зарегистрироваться</button>
            </div>
          </div>
        </div>
      )}

      {/* Goal modal (USD) */}
      {showGoalModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Цель копилки (USD)</div>
            <input placeholder="Сумма цели (USD)" value={goalInputUsd} onChange={e => setGoalInputUsd(e.target.value)} style={styles.input} />
            <div style={{ display: "flex", gap: 8 }}>
              <button style={styles.secondaryBtn} onClick={() => setShowGoalModal(false)}>Отмена</button>
              <button style={styles.primaryBtn} onClick={saveGoal}>Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM: oval capsule with icons (no labels) and centered plus button above it */}
      <div style={styles.bottomWrap}>
        <div style={styles.capsule}>
          <button onClick={() => { setActiveTab("overview"); vibrate(); }} style={styles.navIcon}><Wallet size={18} /></button>
          <button onClick={() => { setActiveTab("history"); vibrate(); }} style={styles.navIcon}><History size={18} /></button>
          <button onClick={() => { setActiveTab("savings"); vibrate(); }} style={styles.navIcon}><PiggyBank size={18} /></button>
          <button onClick={() => { setActiveTab("settings"); vibrate(); }} style={styles.navIcon}><Settings size={18} /></button>
        </div>

        {/* Plus centered visually over capsule (but separate element) */}
        <div style={styles.plusHolder}>
          <button onClick={() => { setTxType("income"); setShowAddModal(true); vibrate(); }} style={styles.plusBtn}>
            <Plus size={18} color="#2563EB" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- styles (inline JS) ---
const styles = {
  app: (theme) => ({
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: theme === "bank-dark" ? "#071033" : "#f8fafc",
    color: theme === "bank-dark" ? "#e6eefc" : "#0f172a",
    fontFamily: "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif",
    paddingBottom: 110 // space for bottom capsule
  }),
  main: {
    maxWidth: 520,
    margin: "0 auto",
    padding: 16,
    boxSizing: "border-box",
    overflowY: "auto"
  },

  // Overview big gradient card
  overviewCard: {
    borderRadius: 14,
    padding: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    background: "linear-gradient(135deg,#0b1226 0%, #1e3a8a 60%)",
    color: "#fff",
    boxShadow: "0 12px 30px rgba(2,6,23,0.6)",
    marginBottom: 12
  },
  smallLabel: { fontSize: 13, opacity: 0.9 },
  bigBalance: { fontSize: 30, fontWeight: 800, marginTop: 8 },
  rightSplit: { display: "flex", gap: 12, alignItems: "center" },
  splitItem: { textAlign: "right" },
  splitLabel: { fontSize: 12, opacity: 0.85 },
  splitValue: { fontWeight: 700 },

  section: { marginTop: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 10 },
  empty: { textAlign: "center", padding: 20, color: "#94a3b8" },

  // tx row
  txRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(148,163,184,0.06)" },
  txIcon: { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.03)", fontSize: 20 },
  txTitle: { fontWeight: 700 },
  txMeta: { fontSize: 12, color: "#94a3b8" },
  txAmount: { fontWeight: 800 },
  txTime: { fontSize: 11, color: "#94a3b8" },

  // savings
  savingsCard: {
    padding: 14,
    borderRadius: 12,
    background: "#071033",
    color: "#e6eefc",
    boxShadow: "0 8px 24px rgba(2,6,23,0.6)"
  },
  progressBg: { height: 12, borderRadius: 8, background: "rgba(255,255,255,0.04)", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#1e3a8a,#2563eb)", boxShadow: "0 8px 24px rgba(37,99,235,0.12)" },

  primaryBtn: { padding: "10px 14px", borderRadius: 12, background: "#2563EB", color: "#fff", border: "none", fontWeight: 700 },
  primaryBtnAlt: { padding: "10px 12px", borderRadius: 12, background: "#0f172a", color: "#fff", border: "none", fontWeight: 700 },
  secondaryBtn: { padding: "10px 12px", borderRadius: 10, background: "#f1f5f9", border: "none" },
  dangerBtn: { padding: "10px 12px", borderRadius: 10, background: "#ef4444", color: "#fff", border: "none" },
  ghostBtn: { padding: "8px 10px", borderRadius: 10, background: "transparent", border: "1px solid rgba(148,163,184,0.12)" },

  // modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000 },
  modal: { width: "100%", maxWidth: 520, borderRadius: 14, padding: 16, background: "#fff", boxShadow: "0 24px 60px rgba(2,6,23,0.6)", marginBottom: 24 },
  input: { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e6eefc", marginBottom: 8, boxSizing: "border-box" },

  typeBtn: { flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(2,6,23,0.04)", background: "#f8fafc" },
  typeBtnActive: { flex: 1, padding: 10, borderRadius: 10, border: "none", background: "#2563EB", color: "#fff" },

  iconBtn: { border: "none", background: "transparent", fontSize: 18 },

  settingsCard: { padding: 12, borderRadius: 12, background: "#0b1226", color: "#e6eefc" },
  avatarWrap: { width: 64, height: 64, borderRadius: 12, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.03)" },
  avatarImg: { width: 64, height: 64, objectFit: "cover" },
  avatarPh: { fontSize: 26 },

  // bottom capsule + plus
  bottomWrap: { position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 16, zIndex: 900, width: "min(720px, calc(100% - 40px))", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  capsule: { width: "calc(100% - 120px)", maxWidth: 580, borderRadius: 999, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 12px", boxShadow: "0 10px 30px rgba(2,6,23,0.06)" },
  navIcon: { border: "none", background: "transparent", padding: 8, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 52 },

  plusHolder: { position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%) translateY(-36px)", zIndex: 910, display: "flex", alignItems: "center", justifyContent: "center" },
  plusBtn: { width: 56, height: 56, borderRadius: 999, background: "transparent", border: "1px solid rgba(37,99,235,0.22)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(37,99,235,0.08)" },

  smallTitle: { fontSize: 13, fontWeight: 700, marginBottom: 8 },
};

