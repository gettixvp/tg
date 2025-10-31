// FinanceApp.jsx — переработанный финальный файл
// Замени этим файлом существующий FinanceApp.jsx
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

/*
  Ключевые изменения:
  - Убран верхний бар "Финансы / Текущее состояние"
  - Большой блок "Общий баланс" показывается ТОЛЬКО на Главной
  - Копилка хранится и отображается в BYN (убрана конвертация в USD)
  - Убрано требование ввода имени при регистрации — используем Telegram имя (если есть)
  - Возвращены emoji в категории и операциях
  - Нижняя капсула: 4 вкладки в одном пузыре, иконки и шрифт уменьшены, плюс справа (меньше)
  - Улучшена прокрутка: основной контейнер scrollable, tg.expand() вызывается
  - Темы переделаны в нейтральный банковский стиль
  - WebSocket / backend — оставлены прежние вызовы (не трогаем)
*/

const API_BASE = "https://walletback-aghp.onrender.com";
const LS_KEY = "finance_settings_v2";
const SESSION_KEY = "finance_session_v2";

// Categories with emoji restored
const categoriesMeta = {
  Еда: { icon: "🍔" },
  Транспорт: { icon: "🚗" },
  Развлечения: { icon: "🎉" },
  Счета: { icon: "💡" },
  Покупки: { icon: "🛒" },
  Здоровье: { icon: "💊" },
  Другое: { icon: "💼" },
  Зарплата: { icon: "💵" },
  Фриланс: { icon: "👨‍💻" },
  Подарки: { icon: "🎁" },
  Инвестиции: { icon: "📈" },
  Отпуск: { icon: "🏖️" },
  Накопления: { icon: "💰" },
  "Экстренный фонд": { icon: "🚨" },
  Цель: { icon: "🎯" },
};

const categoriesList = {
  expense: ["Еда", "Транспорт", "Развлечения", "Счета", "Покупки", "Здоровье", "Другое"],
  income: ["Зарплата", "Фриланс", "Подарки", "Инвестиции", "Другое"],
  savings: ["Накопления", "Отпуск", "Экстренный фонд", "Цель", "Другое"],
};

function formatBYN(v) {
  const n = Number(v || 0);
  try {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "BYN", minimumFractionDigits: 0 }).format(n);
  } catch {
    return `Br${Math.round(n)}`;
  }
}

function shortDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}
function shortTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function FinanceApp() {
  // Telegram WebApp
  const tg = typeof window !== "undefined" && window.Telegram?.WebApp;
  const tgUser = tg?.initDataUnsafe?.user || null;
  const telegramAvatar = tgUser?.photo_url || null;

  // App state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview|history|savings|settings
  const [theme, setTheme] = useState("bank-dark"); // 'bank-dark' | 'bank-light'

  // finance state (all in BYN)
  const [balance, setBalance] = useState(0); // BYN
  const [income, setIncome] = useState(0); // BYN
  const [expenses, setExpenses] = useState(0); // BYN
  const [savings, setSavings] = useState(0); // BYN (копилка теперь в BYN)
  const [goalSavings, setGoalSavings] = useState(0); // BYN

  const [transactions, setTransactions] = useState([]);

  // Add modal / forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [txType, setTxType] = useState("expense");
  const [txAmount, setTxAmount] = useState("");
  const [txDescription, setTxDescription] = useState("");
  const [txCategory, setTxCategory] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  // UI refs
  const mainRef = useRef(null);

  // load settings / session
  useEffect(() => {
    try {
      const ls = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      if (ls.theme) setTheme(ls.theme);
      if (ls.goalSavings) setGoalSavings(Number(ls.goalSavings) || 0);
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
      if (s?.email && s?.token) {
        // auto auth using token (backend supports token)
        autoAuth(s.email, s.token);
      }
    } catch (e) { /* ignore */ }

    // Telegram miniapp: try expand to full height
    try {
      if (tg) {
        tg.ready();
        tg.expand?.();
      }
    } catch (e) {}
    // make main area scrollable height-aware
    setTimeout(() => {
      if (mainRef.current) {
        mainRef.current.style.maxHeight = `calc(100vh - 120px)`;
      }
    }, 120);
  }, []);

  // persist theme/goal
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ theme, goalSavings }));
  }, [theme, goalSavings]);

  // helpers
  function vibrateSuccess() { try { tg?.HapticFeedback?.notificationOccurred?.("success"); } catch(e){} }
  function vibrateError() { try { tg?.HapticFeedback?.notificationOccurred?.("error"); } catch(e){} }
  function vibrate() { try { tg?.HapticFeedback?.impactOccurred?.("light"); } catch(e){} }

  // API helpers
  async function autoAuth(email, token) {
    try {
      const resp = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, first_name: tgUser?.first_name || "" })
      });
      if (!resp.ok) throw new Error("auth failed");
      const json = await resp.json();
      applyUser(json.user, json.transactions || []);
    } catch (e) {
      console.warn("autoAuth failed", e);
      localStorage.removeItem(SESSION_KEY);
    }
  }

  async function handleAuth() {
    if (!authEmail || !authPassword) return alert("Введите email и пароль");
    try {
      const payload = { email: authEmail, password: authPassword, first_name: tgUser?.first_name || "" };
      const res = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({error:""}));
        return alert(err.error || "Ошибка входа");
      }
      const json = await res.json();
      applyUser(json.user, json.transactions || []);
      // store session token (demo)
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email: authEmail, token: btoa(authPassword) }));
      setShowAuthModal(false);
      vibrateSuccess();
    } catch (e) {
      console.error(e);
      alert("Ошибка авторизации");
      vibrateError();
    }
  }

  function applyUser(u, txs = []) {
    setUser(u);
    setIsAuthenticated(true);
    setBalance(Number(u.balance || 0));
    setIncome(Number(u.income || 0));
    setExpenses(Number(u.expenses || 0));
    // savings stored in BYN now
    setSavings(Number(u.savings_usd || u.savings || 0));
    setGoalSavings(Number(u.goal_savings || 0));
    setTransactions(txs || []);
    setIsAuthenticated(true);
  }

  // logout
  async function handleLogout() {
    // save user snapshot to backend
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
    setIsAuthenticated(false);
    setUser(null);
    setBalance(0); setIncome(0); setExpenses(0); setSavings(0); setTransactions([]);
    localStorage.removeItem(SESSION_KEY);
    vibrate();
  }

  // add transaction (savings now in BYN)
  async function addTransaction() {
    const n = Number(txAmount);
    if (!isFinite(n) || n <= 0) return alert("Введите корректную сумму > 0");

    const tx = {
      id: Date.now(),
      user_id: user?.id || null,
      type: txType,
      amount: n,
      description: txDescription || "",
      category: txCategory || "",
      date: new Date().toISOString()
    };

    // Update local state
    setTransactions(prev => [tx, ...prev]);

    if (txType === "income") {
      setIncome(v => v + n);
      setBalance(b => b + n);
    } else if (txType === "expense") {
      setExpenses(e => e + n);
      setBalance(b => b - n);
    } else {
      // savings: now stored in BYN
      setSavings(s => s + n);
      setBalance(b => b - n);
    }

    // persist to backend (fire and forget)
    try {
      await fetch(`${API_BASE}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || null,
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          category: tx.category,
          converted_amount_usd: null // not used anymore
        })
      });
      // update user snapshot
      if (user?.id) {
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
      }
    } catch (e) {
      console.warn("persist tx failed", e);
    }

    // reset form
    setTxAmount(""); setTxCategory(""); setTxDescription(""); setShowAddModal(false);
    vibrateSuccess();
  }

  // UI: ensure main area scrollable for telegram mini app
  useEffect(() => {
    try {
      if (tg) tg.expand?.();
    } catch (e) {}
  }, [activeTab]);

  // Adjust nav capsule width to fit labels: set min widths
  // (handled in styles below)

  // Small components inline:
  function TxRow({ tx }) {
    const icon = categoriesMeta[tx.category]?.icon || "•";
    const amountLabel = tx.type === "income" ? `+${formatBYN(tx.amount)}` :
      tx.type === "expense" ? `-${formatBYN(tx.amount)}` :
        `-${formatBYN(tx.amount)}`; // savings - displayed as BYN
    return (
      <div className="tx-row" style={styles.txRow}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={styles.txIcon}>{icon}</div>
          <div>
            <div style={{ ...styles.txTitle }}>{tx.description || "—"}</div>
            <div style={styles.txMeta}>{tx.category || "—"} • {shortDate(tx.date)}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...styles.txAmount, color: tx.type === "income" ? "#059669" : tx.type === "expense" ? "#dc2626" : "#2563eb" }}>
            {amountLabel}
          </div>
          <div style={styles.txTime}>{shortTime(tx.date)}</div>
        </div>
      </div>
    );
  }

  // ---- Layout render ----
  return (
    <div style={styles.appRoot(theme)}>
      {/* No top finance bar — removed as requested */}

      {/* Main scrollable area */}
      <main ref={mainRef} style={styles.main}>
        {/* Only on overview show big balance */}
        {activeTab === "overview" && (
          <section style={styles.overviewCard(theme)}>
            <div>
              <div style={styles.smallLabel}>Общий баланс</div>
              <div style={styles.bigBalance}>{formatBYN(balance)}</div>
            </div>
            <div style={styles.balanceSplit}>
              <div style={styles.splitCol}>
                <div style={styles.splitLabel}>Доход</div>
                <div style={styles.splitVal}>{formatBYN(income)}</div>
              </div>
              <div style={styles.splitCol}>
                <div style={styles.splitLabel}>Расход</div>
                <div style={styles.splitVal}>{formatBYN(expenses)}</div>
              </div>
            </div>
          </section>
        )}

        {/* Transactions / content */}
        {activeTab === "overview" && (
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Последние операции</h3>
            <div>
              {transactions.length === 0 ? (
                <div style={styles.empty}>Пока нет операций</div>
              ) : transactions.slice(0, 8).map(tx => <TxRow key={tx.id} tx={tx} />)}
            </div>
          </section>
        )}

        {activeTab === "history" && (
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>История операций</h3>
            <div>
              {transactions.length === 0 ? (
                <div style={styles.empty}>Нет операций</div>
              ) : transactions.map(tx => <TxRow key={tx.id} tx={tx} />)}
            </div>
          </section>
        )}

        {activeTab === "savings" && (
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Копилка</h3>

            <div style={styles.savingsCard(theme)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: theme === "bank-dark" ? "#fff" : "#0f172a" }}>Копилка</div>
                <div style={{ color: theme === "bank-dark" ? "#d1d5db" : "#6b7280" }}>{formatBYN(savings)} / {goalSavings ? formatBYN(goalSavings) : "—"}</div>
              </div>

              {/* thick progress bar in deep blue */}
              <div style={{ marginTop: 12 }}>
                <div style={styles.progressBg}>
                  <div style={{ ...styles.progressFill, width: `${goalSavings ? Math.min(100, Math.round((savings / goalSavings) * 100)) : 0}%` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <div style={{ color: theme === "bank-dark" ? "#fff" : "#0f172a", fontWeight: 600 }}>{goalSavings ? `${Math.round((savings / goalSavings) * 100)}%` : "0%"}</div>
                  <div style={{ color: "#6b7280", fontSize: 12 }}>До цели</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button style={styles.primaryBtn}>Изменить цель</button>
                <button style={styles.primaryBtnAlt} onClick={() => { setTxType("savings"); setShowAddModal(true); }}>Пополнить</button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <h4 style={styles.smallTitle}>История пополнений</h4>
              {transactions.filter(t => t.type === "savings").length === 0 ? (
                <div style={styles.empty}>Пополните копилку</div>
              ) : transactions.filter(t => t.type === "savings").map(tx => <TxRow key={tx.id} tx={tx} />)}
            </div>
          </section>
        )}

        {activeTab === "settings" && (
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Настройки</h3>

            <div style={styles.settingsCard(theme)}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={styles.avatarWrap}>
                  {telegramAvatar ? <img src={telegramAvatar} alt="avatar" style={styles.avatarImg} /> : <div style={styles.avatarPlaceholder}>👤</div>}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{isAuthenticated ? (user?.first_name || user?.email) : "гость"}</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>{isAuthenticated ? user?.email : ""}</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                {!isAuthenticated ? (
                  <button style={styles.primaryBtn} onClick={() => setShowAuthModal(true)}><LogIn size={14} style={{ marginRight: 8 }} /> Войти / Регистрация</button>
                ) : (
                  <button style={styles.dangerBtn} onClick={handleLogout}><LogOut size={14} style={{ marginRight: 8 }} /> Выйти</button>
                )}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <h4 style={styles.smallTitle}>Управление</h4>
              <div style={styles.controlRow}>
                <button style={styles.secondaryBtn} onClick={() => {
                  if (!confirm("Сбросить все данные? Это действие необратимо.")) return;
                  // reset everything to zeros
                  setBalance(0); setIncome(0); setExpenses(0); setSavings(0); setTransactions([]);
                }}>Сбросить баланс</button>
                <button style={styles.secondaryBtn} onClick={() => {
                  const val = prompt("Новая цель копилки (BYN)", String(goalSavings || ""));
                  if (val !== null) setGoalSavings(Number(val || 0));
                }}>Изменить цель копилки</button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <h4 style={styles.smallTitle}>Тема</h4>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={styles.ghostBtn} onClick={() => setTheme("bank-dark")}>Тёмная</button>
                <button style={styles.ghostBtn} onClick={() => setTheme("bank-light")}>Светлая</button>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Add modal */}
      {showAddModal && (
        <div style={styles.modalWrap}>
          <div style={styles.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 700 }}>Новая операция</div>
              <button onClick={() => setShowAddModal(false)} style={styles.iconBtn}>✕</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {["expense", "income", "savings"].map(t => (
                <button key={t} onClick={() => setTxType(t)} style={txType === t ? styles.typeBtnActive : styles.typeBtn}>{t === "income" ? "Доход" : t === "expense" ? "Расход" : "Копилка"}</button>
              ))}
            </div>

            <input type="number" placeholder="Сумма (BYN)" value={txAmount} onChange={e => setTxAmount(e.target.value)} style={styles.input} />
            <input placeholder="Описание (необязательно)" value={txDescription} onChange={e => setTxDescription(e.target.value)} style={styles.input} />
            <select value={txCategory} onChange={e => setTxCategory(e.target.value)} style={styles.input}>
              <option value="">Категория</option>
              {categoriesList[txType].map(c => <option key={c} value={c}>{(categoriesMeta[c]?.icon ? categoriesMeta[c].icon + " " : "") + c}</option>)}
            </select>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button style={styles.secondaryBtn} onClick={() => setShowAddModal(false)}>Отмена</button>
              <button style={styles.primaryBtn} onClick={addTransaction}>Добавить</button>
            </div>
          </div>
        </div>
      )}

      {/* Auth modal (no name input; we use telegram name if present) */}
      {showAuthModal && (
        <div style={styles.modalWrap}>
          <div style={styles.modal}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>Вход / Регистрация</div>
            <input placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} style={styles.input} />
            <input placeholder="Пароль" type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={styles.input} />
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{tgUser?.first_name ? `Имя из Telegram: ${tgUser.first_name}` : "Имя будет запрошено при регистрации"}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={styles.secondaryBtn} onClick={() => setShowAuthModal(false)}>Отмена</button>
              <button style={styles.primaryBtn} onClick={handleAuth}>Войти / Зарегистрироваться</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom capsule with 4 tabs in one oval and smaller icons/font; plus to the right smaller */}
      <div style={styles.bottomWrap}>
        <div style={styles.capsule}>
          <div style={styles.navInner}>
            <NavBtn active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={<Wallet size={16} />} label="Главная" />
            <NavBtn active={activeTab === "history"} onClick={() => setActiveTab("history")} icon={<History size={16} />} label="История" />
            <NavBtn active={activeTab === "savings"} onClick={() => setActiveTab("savings")} icon={<PiggyBank size={16} />} label="Копилка" />
            <NavBtn active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Settings size={16} />} label="Настройки" />
          </div>
        </div>

        <div style={styles.plusWrap}>
          <button onClick={() => { setTxType("expense"); setShowAddModal(true); }} style={styles.plusBtn}>
            <Plus size={14} color="#2563EB" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- small components / styles ---------------- */

function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ ...styles.navBtn, ...(active ? styles.navBtnActive : {}) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ opacity: active ? 1 : 0.6 }}>{icon}</div>
        <div style={{ fontSize: 12, fontWeight: active ? 600 : 500 }}>{label}</div>
      </div>
    </button>
  );
}

const styles = {
  appRoot: (theme) => ({
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: theme === "bank-dark" ? "#071032" : "#f7fbff",
    color: theme === "bank-dark" ? "#e6eefc" : "#0f172a",
    fontFamily: "Inter, Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif",
  }),
  main: {
    padding: 16,
    flex: 1,
    overflowY: "auto",
    maxWidth: 520,
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box"
  },
  overviewCard: (theme) => ({
    borderRadius: 14,
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    background: theme === "bank-dark" ? "linear-gradient(90deg,#08204b,#071033)" : "linear-gradient(90deg,#e6f0ff,#eef6ff)",
    color: theme === "bank-dark" ? "#fff" : "#0f172a",
    boxShadow: theme === "bank-dark" ? "0 8px 24px rgba(2,6,23,0.6)" : "0 6px 20px rgba(59,130,246,0.06)",
    marginBottom: 12
  }),
  smallLabel: { fontSize: 13, opacity: 0.9, marginBottom: 6 },
  bigBalance: { fontSize: 28, fontWeight: 800, lineHeight: 1.05 },
  balanceSplit: { display: "flex", gap: 12, alignItems: "center" },
  splitCol: { textAlign: "right" },
  splitLabel: { fontSize: 12, color: "#cbd5e1" },
  splitVal: { fontWeight: 700 },

  section: { marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
  empty: { textAlign: "center", padding: 24, color: "#94a3b8" },

  txRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(148,163,184,0.06)" },
  txIcon: { width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(148,163,184,0.06)" },
  txTitle: { fontWeight: 600 },
  txMeta: { fontSize: 12, color: "#94a3b8" },
  txAmount: { fontWeight: 700 },
  txTime: { fontSize: 11, color: "#94a3b8" },

  savingsCard: (theme) => ({ padding: 12, borderRadius: 12, background: theme === "bank-dark" ? "#06122b" : "#fff", boxShadow: theme === "bank-dark" ? "0 8px 20px rgba(2,6,23,0.6)" : "0 6px 20px rgba(59,130,246,0.06)" }),
  progressBg: { width: "100%", height: 12, borderRadius: 8, background: "rgba(255,255,255,0.04)", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#1e3a8a,#2563eb)", boxShadow: "0 8px 20px rgba(37,99,235,0.12)" },

  primaryBtn: { padding: "10px 14px", borderRadius: 12, background: "#2563EB", color: "#fff", border: "none", fontWeight: 700 },
  primaryBtnAlt: { padding: "10px 14px", borderRadius: 12, background: "#0f172a", color: "#fff", border: "none", fontWeight: 700 },
  secondaryBtn: { padding: "10px 12px", borderRadius: 10, background: "#f1f5f9", border: "none" },
  dangerBtn: { padding: "10px 12px", borderRadius: 10, background: "#ef4444", color: "#fff", border: "none" },
  ghostBtn: { padding: "8px 10px", borderRadius: 10, background: "transparent", border: "1px solid rgba(148,163,184,0.12)" },

  modalWrap: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 60 },
  modal: { width: "100%", maxWidth: 520, borderRadius: 14, padding: 16, background: "#fff", boxShadow: "0 20px 40px rgba(2,6,23,0.3)" },
  input: { width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e6eefc", marginBottom: 8 },

  typeBtn: { flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(2,6,23,0.04)", background: "#f8fafc" },
  typeBtnActive: { flex: 1, padding: 10, borderRadius: 10, border: "none", background: "#2563EB", color: "#fff" },

  settingsCard: (theme) => ({ padding: 12, borderRadius: 12, background: theme === "bank-dark" ? "#071033" : "#fff" }),
  avatarWrap: { width: 56, height: 56, borderRadius: 12, overflow: "hidden", background: "rgba(148,163,184,0.06)", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarImg: { width: 56, height: 56, objectFit: "cover" },
  avatarPlaceholder: { fontSize: 22 },

  controlRow: { display: "flex", gap: 8 },

  bottomWrap: { position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 18, zIndex: 70, display: "flex", alignItems: "center", gap: 12, width: "min(720px, calc(100% - 40px))", justifyContent: "center" },
  capsule: { background: "rgba(255,255,255,0.9)", borderRadius: 999, padding: "8px 14px", boxShadow: "0 10px 30px rgba(2,6,23,0.08)", width: "calc(100% - 110px)", maxWidth: 580, display: "flex", alignItems: "center", justifyContent: "center" },
  navInner: { display: "flex", justifyContent: "space-between", width: "100%" },
  navBtn: { background: "transparent", border: "none", padding: "8px 8px", borderRadius: 10, minWidth: 74 },
  navBtnActive: { background: "rgba(37,99,235,0.08)" },

  plusWrap: { width: 110, display: "flex", justifyContent: "flex-end" },
  plusBtn: { width: 44, height: 44, borderRadius: 999, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(37,99,235,0.22)" },

  iconBtn: { border: "none", background: "transparent", fontSize: 16 },

  // small typography
  smallTitle: { fontSize: 13, fontWeight: 700, marginBottom: 8 },
};

