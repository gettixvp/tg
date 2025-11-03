"use client"

import { useEffect, useState, useRef } from "react"
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
  Eye,
  EyeOff,
  User,
  Trash2,
  X,
  Maximize2,
  Minimize2,
  CreditCard,
  BarChart3,
} from "lucide-react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

const API_BASE = "https://walletback-aghp.onrender.com"
const LS_KEY = "finance_settings_v3"
const SESSION_KEY = "finance_session_v2"

const categoriesMeta = {
  Еда: {
    color: "from-orange-400 to-red-400",
    icon: "🍕",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    chartColor: "#f97316",
  },
  Транспорт: {
    color: "from-blue-400 to-cyan-400",
    icon: "🚗",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    chartColor: "#3b82f6",
  },
  Развлечения: {
    color: "from-pink-400 to-purple-400",
    icon: "🎉",
    bgColor: "bg-pink-100",
    textColor: "text-pink-700",
    chartColor: "#ec4899",
  },
  Счета: {
    color: "from-teal-400 to-green-400",
    icon: "💡",
    bgColor: "bg-teal-100",
    textColor: "text-teal-700",
    chartColor: "#14b8a6",
  },
  Покупки: {
    color: "from-purple-400 to-indigo-400",
    icon: "🛍",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    chartColor: "#a855f7",
  },
  Здоровье: {
    color: "from-yellow-400 to-orange-400",
    icon: "💊",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    chartColor: "#eab308",
  },
  Другое: {
    color: "from-gray-400 to-slate-400",
    icon: "💼",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    chartColor: "#64748b",
  },
  Зарплата: {
    color: "from-green-400 to-emerald-400",
    icon: "💵",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    chartColor: "#10b981",
  },
  Фриланс: {
    color: "from-cyan-400 to-blue-400",
    icon: "👨‍💻",
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-700",
    chartColor: "#06b6d4",
  },
  Подарки: {
    color: "from-yellow-300 to-amber-300",
    icon: "🎁",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    chartColor: "#fbbf24",
  },
  Инвестиции: {
    color: "from-indigo-400 to-purple-400",
    icon: "📈",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-700",
    chartColor: "#6366f1",
  },
  Отпуск: {
    color: "from-blue-300 to-sky-300",
    icon: "🖼️",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    chartColor: "#38bdf8",
  },
  Накопления: {
    color: "from-blue-800 to-indigo-800",
    icon: "💰",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    chartColor: "#1e40af",
  },
  "Экстренный фонд": {
    color: "from-red-400 to-pink-400",
    icon: "🚨",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    chartColor: "#ef4444",
  },
  Цель: {
    color: "from-emerald-300 to-green-300",
    icon: "🎯",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    chartColor: "#34d399",
  },
}

const categoriesList = {
  expense: ["Еда", "Транспорт", "Развлечения", "Счета", "Покупки", "Здоровье", "Другое"],
  income: ["Зарплата", "Фриланс", "Подарки", "Инвестиции", "Другое"],
  savings: ["Отпуск", "Накопления", "Экстренный фонд", "Цель", "Другое"],
}

const currencies = [
  { code: "RUB", symbol: "₽", name: "Российский рубль" },
  { code: "BYN", symbol: "Br", name: "Белорусский рубль" },
  { code: "USD", symbol: "$", name: "Доллар США" },
  { code: "EUR", symbol: "€", name: "Евро" },
]

function NavButton({ active, onClick, icon, theme }) {
  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-full transition-all transform active:scale-95 touch-none ${
        active
          ? theme === "dark"
            ? "bg-gray-700 text-blue-400"
            : "bg-blue-100 text-blue-600"
          : theme === "dark"
            ? "text-gray-400 hover:text-gray-300"
            : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {icon}
    </button>
  )
}

function TxRow({ tx, categoriesMeta, formatCurrency, formatDate, theme, onDelete }) {
  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef(0)

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    setIsSwiping(true)
  }

  const handleTouchMove = (e) => {
    if (!isSwiping) return
    const diff = e.touches[0].clientX - startX.current
    if (diff < 0) {
      setSwipeX(Math.max(diff, -80))
    } else if (swipeX < 0) {
      setSwipeX(Math.min(0, swipeX + diff / 2))
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    if (swipeX < -40) {
      setSwipeX(-80)
    } else {
      setSwipeX(0)
    }
  }

  const categoryInfo = categoriesMeta[tx.category] || categoriesMeta["Другое"]

  return (
    <div className="relative mb-2 overflow-hidden rounded-xl">
      <div
        onClick={() => {
          if (swipeX === -80) {
            onDelete(tx.id)
            setSwipeX(0)
          }
        }}
        className={`absolute inset-y-0 right-0 w-20 flex items-center justify-center cursor-pointer ${
          theme === "dark" ? "bg-red-600" : "bg-red-500"
        }`}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </div>

      <div
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping ? "none" : "transform 0.3s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex items-center justify-between p-3 rounded-xl backdrop-blur-sm border transition-all duration-300 hover:shadow-md ${
          theme === "dark"
            ? "bg-gray-800/80 border-gray-700/50 hover:bg-gray-700/80"
            : "bg-white/90 border-gray-200/50 hover:bg-white shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${categoryInfo.color} shadow-md flex-shrink-0`}
          >
            <span className="text-lg">{categoryInfo.icon}</span>
          </div>

          <div className="min-w-0 flex-1">
            {tx.description && (
              <p className={`font-semibold text-sm truncate ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                {tx.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryInfo.bgColor} ${categoryInfo.textColor} flex-shrink-0`}
              >
                {tx.category}
              </span>
              <span className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                {formatDate(tx.date)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right ml-2 flex-shrink-0">
          <p
            className={`font-bold text-sm ${
              tx.type === "income" ? "text-emerald-600" : tx.type === "expense" ? "text-rose-600" : "text-blue-600"
            }`}
          >
            {tx.type === "income" ? "+" : "-"}
            {formatCurrency(tx.amount)}
          </p>
        </div>
      </div>
    </div>
  )
}

function NumericKeyboard({ onNumberPress, onBackspace, onDone, theme }) {
  return (
    <div
      className={`grid grid-cols-3 gap-2 p-4 rounded-t-2xl ${
        theme === "dark" ? "bg-gray-800 border-t border-gray-700" : "bg-gray-100 border-t border-gray-200"
      }`}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "⌫"].map((key) => (
        <button
          key={key}
          onClick={() => {
            if (key === "⌫") onBackspace()
            else onNumberPress(key.toString())
          }}
          className={`p-4 rounded-xl text-xl font-semibold transition-all touch-none active:scale-95 ${
            theme === "dark"
              ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
              : "bg-white text-gray-900 hover:bg-gray-50 shadow-sm"
          }`}
        >
          {key}
        </button>
      ))}
      <button
        onClick={onDone}
        className="col-span-3 p-4 rounded-xl text-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all touch-none active:scale-95"
      >
        Готово
      </button>
    </div>
  )
}

export default function FinanceApp({ apiUrl = API_BASE }) {
  const API_URL = apiUrl
  const mainContentRef = useRef(null)

  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [theme, setTheme] = useState("light")
  const [currency, setCurrency] = useState("BYN")
  const [goalSavings, setGoalSavings] = useState(50000)
  const [balance, setBalance] = useState(0)
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [savings, setSavings] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("login")
  const [showChart, setShowChart] = useState(false)
  const [chartType, setChartType] = useState("")
  const [transactionType, setTransactionType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authCurrency, setAuthCurrency] = useState("BYN")
  const [safeAreaInset, setSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  const [contentSafeAreaInset, setContentSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalInput, setGoalInput] = useState("50000")
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [showNumKeyboard, setShowNumKeyboard] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(3.2)

  const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp
  const haptic = tg && tg.HapticFeedback
  const vibrate = () => haptic && haptic.impactOccurred && haptic.impactOccurred("light")
  const vibrateSuccess = () => haptic && haptic.notificationOccurred && haptic.notificationOccurred("success")
  const vibrateError = () => haptic && haptic.notificationOccurred && haptic.notificationOccurred("error")
  const vibrateSelect = () => haptic && haptic.selectionChanged && haptic.selectionChanged()

  const tgUser = tg && tg.initDataUnsafe && tg.initDataUnsafe.user
  const tgUserId = tgUser && tgUser.id
  const displayName = (tgUser && tgUser.first_name) || "Пользователь"
  const tgPhotoUrl = tgUser && tgUser.photo_url

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/BYN")
        const data = await res.json()
        setExchangeRate(data.rates.USD || 3.2)
      } catch (e) {
        console.warn("Failed to fetch exchange rate", e)
      }
    }
    fetchRate()
  }, [])

  useEffect(() => {
    if (tg) {
      tg.ready && tg.ready()
      if (tg.expand) tg.expand()

      if (tg.disableVerticalSwipes) {
        tg.disableVerticalSwipes()
      }

      setTheme(tg.colorScheme || "light")

      const startFullscreen = async () => {
        try {
          if (tg.requestFullscreen) {
            if (!tg.isFullscreen) {
              tg.requestFullscreen()
            }
            setTimeout(() => {
              if (!tg.isFullscreen && tg.requestFullscreen) {
                tg.requestFullscreen()
              }
            }, 300)
          }
        } catch (e) {
          console.warn("Auto fullscreen failed", e)
        }
      }

      startFullscreen()

      const updateSafeArea = () => {
        setSafeAreaInset({
          top: (tg.safeAreaInset && tg.safeAreaInset.top) || 0,
          bottom: (tg.safeAreaInset && tg.safeAreaInset.bottom) || 0,
          left: (tg.safeAreaInset && tg.safeAreaInset.left) || 0,
          right: (tg.safeAreaInset && tg.safeAreaInset.right) || 0,
        })
      }

      const updateContentSafeArea = () => {
        setContentSafeAreaInset({
          top: (tg.contentSafeAreaInset && tg.contentSafeAreaInset.top) || 0,
          bottom: (tg.contentSafeAreaInset && tg.contentSafeAreaInset.bottom) || 0,
          left: (tg.contentSafeAreaInset && tg.contentSafeAreaInset.left) || 0,
          right: (tg.contentSafeAreaInset && tg.contentSafeAreaInset.right) || 0,
        })
      }

      const handleFullscreenChanged = () => {
        setIsFullscreen(tg.isFullscreen || false)
        updateSafeArea()
        updateContentSafeArea()
      }

      // Listen for theme changes
      const handleThemeChanged = () => {
        const newTheme = tg.colorScheme || "light"
        setTheme(newTheme)
      }

      // Listen for viewport changes (when app is minimized/expanded)
      const handleViewportChanged = () => {
        if (tg.isExpanded === false && tg.expand) {
          tg.expand()
        }
        updateContentSafeArea()
      }

      updateSafeArea()
      updateContentSafeArea()
      handleFullscreenChanged()

      if (tg.onEvent) {
        tg.onEvent("safeAreaChanged", updateSafeArea)
        tg.onEvent("contentSafeAreaChanged", updateContentSafeArea)
        tg.onEvent("fullscreenChanged", handleFullscreenChanged)
        tg.onEvent("themeChanged", handleThemeChanged)
        tg.onEvent("viewportChanged", handleViewportChanged)
      }

      setIsReady(true)

      return () => {
        if (tg.offEvent) {
          tg.offEvent("safeAreaChanged", updateSafeArea)
          tg.offEvent("contentSafeAreaChanged", updateContentSafeArea)
          tg.offEvent("fullscreenChanged", handleFullscreenChanged)
          tg.offEvent("themeChanged", handleThemeChanged)
          tg.offEvent("viewportChanged", handleViewportChanged)
        }
      }
    } else {
      setIsReady(true)
    }
  }, [tg])

  useEffect(() => {
    try {
      const ls = localStorage.getItem(LS_KEY)
      if (ls) {
        const data = JSON.parse(ls)
        if (data) {
          if (data.currency) setCurrency(data.currency)
          if (data.theme) setTheme(data.theme)
          if (data.goalSavings) {
            setGoalSavings(data.goalSavings)
            setGoalInput(String(data.goalSavings))
          }
          if (data.balanceVisible !== undefined) setBalanceVisible(data.balanceVisible)
        }
      }

      const session = localStorage.getItem(SESSION_KEY)
      if (session) {
        const sessionData = JSON.parse(session)
        if (sessionData?.email && sessionData?.token) {
          autoAuth(sessionData.email, sessionData.token)
        }
      } else if (tgUserId) {
        autoAuthTelegram(tgUserId)
      }
    } catch (e) {
      console.warn("Failed to parse settings", e)
    }
  }, [tgUserId])

  useEffect(() => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        currency,
        goalSavings,
        theme,
        balanceVisible,
      }),
    )
  }, [currency, goalSavings, theme, balanceVisible])

  useEffect(() => {
    const keepAlive = async () => {
      try {
        await fetch(`${API_BASE}/api/health`).catch(() => {})
      } catch (e) {}
    }

    keepAlive()
    const interval = setInterval(keepAlive, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  function blurAll() {
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur()
    }
  }

  const toggleFullscreen = async () => {
    if (tg && tg.requestFullscreen && tg.exitFullscreen) {
      try {
        if (isFullscreen) {
          tg.exitFullscreen()
        } else {
          tg.requestFullscreen()
        }
      } catch (e) {
        console.warn("Fullscreen toggle failed", e)
      }
    }
  }

  const currentCurrency = currencies.find((c) => c.code === currency) || currencies[1]
  const formatCurrency = (value, curr = currency) => {
    const num = Number(value)
    if (!isFinite(num)) return `${curr === "USD" ? "$" : currentCurrency.symbol}0`
    const symbol = curr === "USD" ? "$" : currentCurrency.symbol
    try {
      const formatted = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: curr,
        minimumFractionDigits: curr === "USD" ? 2 : 0,
      }).format(num)
      const sample = Intl.NumberFormat("ru-RU", { style: "currency", currency: curr }).format(0)
      const stdSym = sample.replace(/\d|\s|,|\.|0/g, "").trim()
      if (stdSym && symbol && stdSym !== symbol) {
        return formatted.replace(stdSym, symbol)
      }
      return formatted
    } catch {
      return `${symbol}${Math.round(num)}`
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const d = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === today.toDateString()) {
      return `Сегодня, ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return `Вчера, ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`
    }
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
  }

  async function autoAuthTelegram(telegramId) {
    try {
      const tgEmail = `tg_${telegramId}@telegram.user`
      const resp = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tgEmail,
          password: `tg_${telegramId}`,
          first_name: displayName,
        }),
      })

      if (!resp.ok) throw new Error("auth failed")
      const json = await resp.json()
      applyUser(json.user, json.transactions || [], false)
    } catch (e) {
      console.warn("autoAuthTelegram failed", e)
    }
  }

  async function autoAuth(email, token) {
    try {
      const resp = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: atob(token), // Decode password from base64
          first_name: displayName,
        }),
      })

      if (!resp.ok) throw new Error("auth failed")
      const json = await resp.json()
      applyUser(json.user, json.transactions || [], true) // Mark as authenticated
    } catch (e) {
      console.warn("autoAuth failed", e)
      localStorage.removeItem(SESSION_KEY) // Clear session if auth fails
    }
  }

  function applyUser(u, txs = [], isEmailAuth = false) {
    setUser(u)
    setIsAuthenticated(isEmailAuth) // Set authentication status
    setBalance(Number(u.balance || 0))
    setIncome(Number(u.income || 0))
    setExpenses(Number(u.expenses || 0))
    setSavings(Number(u.savings_usd || 0)) // Ensure savings is treated as USD
    setGoalSavings(Number(u.goal_savings || 50000)) // Set goal savings from user data
    setGoalInput(String(Number(u.goal_savings || 50000)))
    setTransactions(txs || [])
  }

  const saveToServer = async (newBalance, newIncome, newExpenses, newSavings) => {
    if (user && user.email) {
      try {
        await fetch(`${API_BASE}/api/user/${user.email}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            balance: newBalance,
            income: newIncome,
            expenses: newExpenses,
            savings: newSavings, // Savings in USD
            goalSavings, // Also save goalSavings
          }),
        })
      } catch (e) {
        console.warn("Failed to save to server", e)
        alert("Ошибка сохранения данных на сервер.") // Notify user
      }
    }
  }

  const addTransaction = async () => {
    blurAll()
    setShowNumKeyboard(false)
    const n = Number(amount)
    if (!isFinite(n) || n <= 0) {
      vibrateError()
      alert("Введите корректную сумму > 0")
      return
    }

    let convertedUSD = 0
    if (transactionType === "savings") {
      convertedUSD = n * exchangeRate
    }

    const newTx = {
      id: Date.now(),
      user_id: user?.id || null,
      type: transactionType,
      amount: n,
      converted_amount_usd: convertedUSD || null,
      description: description || "",
      category: category || "Другое",
      date: new Date().toISOString(),
    }

    setTransactions((p) => [newTx, ...p])

    let newBalance = balance
    let newIncome = income
    let newExpenses = expenses
    let newSavings = savings

    if (transactionType === "income") {
      newIncome += n
      newBalance += n
      setIncome(newIncome)
      setBalance(newBalance)
    } else if (transactionType === "expense") {
      newExpenses += n
      newBalance -= n
      setExpenses(newExpenses)
      setBalance(newBalance)
    } else {
      newSavings += convertedUSD
      newBalance -= n
      setSavings(newSavings)
      setBalance(newBalance)
    }

    setAmount("")
    setDescription("")
    setCategory("")
    setShowAddModal(false)
    vibrateSuccess()

    if (user && user.email) {
      try {
        await fetch(`${API_URL}/api/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.email,
            type: newTx.type,
            amount: newTx.amount,
            description: newTx.description,
            category: newTx.category,
            converted_amount_usd: convertedUSD || null,
          }),
        })

        await saveToServer(newBalance, newIncome, newExpenses, newSavings)
      } catch (e) {
        console.warn("Failed to save tx", e)
      }
    }
  }

  const deleteTransaction = async (txId) => {
    vibrate()
    const tx = transactions.find((t) => t.id === txId)
    if (!tx) return

    if (!window.confirm("Удалить эту транзакцию?")) return

    setTransactions((p) => p.filter((t) => t.id !== txId))

    let newBalance = balance
    let newIncome = income
    let newExpenses = expenses
    let newSavings = savings

    if (tx.type === "income") {
      newIncome -= tx.amount
      newBalance -= tx.amount
      setIncome(newIncome)
      setBalance(newBalance)
    } else if (tx.type === "expense") {
      newExpenses -= tx.amount
      newBalance += tx.amount
      setExpenses(newExpenses)
      setBalance(newBalance)
    } else {
      newSavings -= tx.converted_amount_usd || 0
      newBalance += tx.amount
      setSavings(newSavings)
      setBalance(newBalance)
    }

    vibrateSuccess()

    if (user && user.email) {
      try {
        await fetch(`${API_BASE}/api/transactions/${txId}`, {
          method: "DELETE",
        })
        await saveToServer(newBalance, newIncome, newExpenses, newSavings)
      } catch (e) {
        console.warn("Failed to delete tx", e)
      }
    }
  }

  const handleAuth = async () => {
    blurAll()
    if (!email || !password) {
      vibrateError()
      alert("Введите email и пароль")
      return
    }

    try {
      const payload = {
        email,
        password,
        first_name: displayName,
      }

      const res = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Ошибка сервера" }))
        alert(err.error || "Ошибка входа")
        vibrateError()
        return
      }

      const json = await res.json()
      applyUser(json.user, json.transactions || [], true)
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          email,
          token: btoa(password),
        }),
      )

      setShowAuthModal(false)
      setEmail("")
      setPassword("")
      setCurrency(authCurrency)
      vibrateSuccess()
    } catch (e) {
      console.error("Auth error:", e)
      alert("Ошибка авторизации")
      vibrateError()
    }
  }

  const handleResetAll = async () => {
    if (!window.confirm("Сбросить данные? Это удалит баланс, доходы, расходы, копилку и операции.")) return

    setBalance(0)
    setIncome(0)
    setExpenses(0)
    setSavings(0)
    setTransactions([])

    if (user && user.email) {
      try {
        await fetch(`${API_BASE}/api/user/${user.email}/reset`, {
          method: "POST",
        })
        vibrateSuccess()
      } catch (e) {
        console.warn("Failed to reset on server", e)
      }
    }
  }

  const handleLogout = async () => {
    blurAll()

    if (user?.id) {
      try {
        await saveToServer(balance, income, expenses, savings)
      } catch (e) {
        console.warn("save on logout failed", e)
      }
    }

    localStorage.removeItem(SESSION_KEY)
    setIsAuthenticated(false)

    if (tgUserId) {
      autoAuthTelegram(tgUserId)
    } else {
      setUser(null)
      setBalance(0)
      setIncome(0)
      setExpenses(0)
      setSavings(0)
      setTransactions([])
    }
    vibrateError()
  }

  const savingsProgress = Math.min((savings || 0) / (goalSavings || 1), 1)
  const savingsPct = Math.round(savingsProgress * 100)

  const getChartData = (type) => {
    const filtered = transactions.filter((t) => t.type === type)
    const categoryTotals = {}

    filtered.forEach((tx) => {
      const cat = tx.category || "Другое"
      categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount
    })

    const labels = Object.keys(categoryTotals)
    const data = Object.values(categoryTotals)
    const colors = labels.map((cat) => categoriesMeta[cat]?.chartColor || "#64748b")

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    }
  }

  if (!isReady) {
    return (
      <div
        className={`w-full h-screen flex items-center justify-center ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900"
            : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
        }`}
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col overflow-hidden ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900"
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      }`}
      style={{
        paddingTop: safeAreaInset.top || 0,
        paddingLeft: safeAreaInset.left || 0,
        paddingRight: safeAreaInset.right || 0,
      }}
    >
      <header className="relative overflow-hidden flex-shrink-0 z-20 px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className={`text-2xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Привет, {(user && user.first_name) || displayName}! 👋
            </h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Добро пожаловать в ваш финансовый помощник
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {tg && (tg.requestFullscreen || tg.exitFullscreen) && (
              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-full backdrop-blur-sm border transition-all touch-none ${
                  theme === "dark"
                    ? "bg-gray-800/50 border-gray-700/30 hover:bg-gray-700/50"
                    : "bg-white/80 border-white/50 hover:bg-white shadow-sm"
                }`}
                title="Полноэкранный режим"
              >
                {isFullscreen ? (
                  <Minimize2 className={`w-4 h-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`} />
                ) : (
                  <Maximize2 className={`w-4 h-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`} />
                )}
              </button>
            )}
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className={`p-2 rounded-full backdrop-blur-sm border transition-all touch-none ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-700/30 hover:bg-gray-700/50"
                  : "bg-white/80 border-white/50 hover:bg-white shadow-sm"
              }`}
            >
              {balanceVisible ? (
                <Eye className={`w-4 h-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`} />
              ) : (
                <EyeOff className={`w-4 h-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`} />
              )}
            </button>
          </div>
        </div>

        <div
          className={`relative overflow-hidden rounded-3xl p-5 shadow-2xl ${
            theme === "dark"
              ? "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
              : "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">Общий баланс</p>
                <p className="text-3xl font-bold text-white">{balanceVisible ? formatCurrency(balance) : "••••••"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-2xl p-3 bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-emerald-300" />
                <span className="text-xs text-white/90">Доходы</span>
              </div>
              <p className="text-lg font-bold text-white">{balanceVisible ? formatCurrency(income) : "••••••"}</p>
            </div>
            <div className="rounded-2xl p-3 bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-rose-300" />
                <span className="text-xs text-white/90">Расходы</span>
              </div>
              <p className="text-lg font-bold text-white">{balanceVisible ? formatCurrency(expenses) : "••••••"}</p>
            </div>
          </div>
        </div>
      </header>

      <main
        ref={mainContentRef}
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          paddingLeft: contentSafeAreaInset.left || 0,
          paddingRight: contentSafeAreaInset.right || 0,
          paddingBottom: Math.max(contentSafeAreaInset.bottom + 80, 96),
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
          height: "100%",
        }}
      >
        <div
          className={`px-4 ${activeTab === "overview" ? "pt-4 pb-4" : "pt-6 pb-4"}`}
          style={{
            minHeight: "100%",
            touchAction: "pan-y",
          }}
        >
          {activeTab === "overview" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`backdrop-blur-sm rounded-xl p-3 border shadow-lg ${
                    theme === "dark" ? "bg-gray-800/70 border-gray-700/20" : "bg-white/80 border-white/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${theme === "dark" ? "bg-blue-900/40" : "bg-blue-100"}`}>
                      <PiggyBank className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                    </div>
                    <div>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Копилка</p>
                      <p className={`text-sm font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                        {savingsPct}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`backdrop-blur-sm rounded-2xl p-4 border shadow-lg ${
                  theme === "dark" ? "bg-gray-800/70 border-gray-700/20" : "bg-white/80 border-white/50"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                    Последние операции
                  </h3>
                  <button
                    onClick={() => setActiveTab("history")}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors touch-none"
                  >
                    Все →
                  </button>
                </div>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <History className={`w-6 h-6 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                    </div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      Пока нет операций
                    </p>
                    <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                      Добавьте первую транзакцию
                    </p>
                  </div>
                ) : (
                  <div>
                    {transactions.slice(0, 4).map((tx) => (
                      <TxRow
                        tx={tx}
                        key={tx.id}
                        categoriesMeta={categoriesMeta}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        theme={theme}
                        onDelete={deleteTransaction}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="animate-fadeIn">
              <div
                className={`backdrop-blur-sm rounded-2xl p-4 border shadow-lg ${
                  theme === "dark" ? "bg-gray-800/70 border-gray-700/20" : "bg-white/80 border-white/50"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                    История операций
                  </h3>
                  <button
                    onClick={() => {
                      setShowChart(true)
                      setChartType("expense")
                    }}
                    className={`p-2 rounded-lg transition-colors touch-none ${
                      theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-blue-100 hover:bg-blue-200"
                    }`}
                  >
                    <BarChart3 className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                  </button>
                </div>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <History className={`w-6 h-6 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                    </div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Нет операций</p>
                  </div>
                ) : (
                  <div>
                    {transactions.map((tx) => (
                      <TxRow
                        tx={tx}
                        key={tx.id}
                        categoriesMeta={categoriesMeta}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        theme={theme}
                        onDelete={deleteTransaction}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "savings" && (
            <div className="space-y-4 animate-fadeIn">
              <div
                className={`rounded-2xl p-4 text-white shadow-2xl ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-gray-800 to-gray-700"
                    : "bg-gradient-to-br from-blue-500 to-purple-600"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Копилка (USD)</h3>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-blue-100"}`}>
                      Ваша цель накопления
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/20 flex-shrink-0">
                    <PiggyBank className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-blue-100"}`}>Прогресс</span>
                    <span className="text-white font-bold">{savingsPct}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${savingsPct}%` }}
                    />
                  </div>
                  <div
                    className={`flex items-center justify-between mt-2 text-xs ${theme === "dark" ? "text-gray-300" : "text-blue-100"}`}
                  >
                    <span>{formatCurrency(savings, "USD")}</span>
                    <span>{formatCurrency(goalSavings, "USD")}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowGoalModal(true)
                      vibrate()
                    }}
                    className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all text-sm touch-none"
                  >
                    Изменить цель
                  </button>
                  <button
                    onClick={() => {
                      setTransactionType("savings")
                      setShowAddModal(true)
                      vibrate()
                    }}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl font-medium transition-all shadow-lg text-sm touch-none ${
                      theme === "dark"
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-white text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Пополнить
                  </button>
                </div>
              </div>

              <div
                className={`backdrop-blur-sm rounded-2xl p-4 border shadow-lg ${
                  theme === "dark" ? "bg-gray-800/70 border-gray-700/20" : "bg-white/80 border-white/50"
                }`}
              >
                <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  История пополнений
                </h3>
                {transactions.filter((t) => t.type === "savings").length === 0 ? (
                  <div className="text-center py-8">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                        theme === "dark" ? "bg-gray-700" : "bg-blue-100"
                      }`}
                    >
                      <PiggyBank className={`w-6 h-6 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                    </div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Начните копить!</p>
                    <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                      Добавьте первое пополнение
                    </p>
                  </div>
                ) : (
                  <div>
                    {transactions
                      .filter((t) => t.type === "savings")
                      .map((tx) => (
                        <TxRow
                          tx={tx}
                          key={tx.id}
                          categoriesMeta={categoriesMeta}
                          formatCurrency={formatCurrency}
                          formatDate={formatDate}
                          theme={theme}
                          onDelete={deleteTransaction}
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4 animate-fadeIn">
              <div
                className={`backdrop-blur-sm rounded-2xl p-4 border shadow-lg ${
                  theme === "dark" ? "bg-gray-800/70 border-gray-700/20" : "bg-white/80 border-white/50"
                }`}
              >
                <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  Аккаунт
                </h3>

                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div
                      className={`flex items-center gap-3 p-3 rounded-xl border ${
                        theme === "dark" ? "bg-green-900/30 border-green-700/30" : "bg-green-50 border-green-200"
                      }`}
                    >
                      {tgPhotoUrl ? (
                        <img
                          src={tgPhotoUrl || "/placeholder.svg"}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            theme === "dark" ? "bg-green-700" : "bg-green-100"
                          }`}
                        >
                          <User className={`w-5 h-5 ${theme === "dark" ? "text-green-300" : "text-green-600"}`} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p
                          className={`font-semibold text-sm truncate ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                        >
                          {(user && user.first_name) || displayName}
                        </p>
                        <p className={`text-xs truncate ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {user && user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm touch-none active:scale-95 ${
                        theme === "dark"
                          ? "bg-rose-700 hover:bg-rose-600 text-white"
                          : "bg-rose-500 hover:bg-rose-600 text-white"
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      Выйти
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={`p-3 rounded-xl border ${
                        theme === "dark" ? "bg-blue-900/30 border-blue-700/30" : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        Войдите в учетную запись через email, чтобы синхронизировать данные на всех устройствах.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowAuthModal(true)
                        setAuthMode("login")
                      }}
                      className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm touch-none active:scale-95 ${
                        theme === "dark"
                          ? "bg-blue-700 hover:bg-blue-600 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      <LogIn className="w-4 h-4" />
                      Войти через Email
                    </button>
                  </div>
                )}
              </div>

              <div
                className={`backdrop-blur-sm rounded-2xl p-4 border shadow-lg ${
                  theme === "dark" ? "bg-gray-800/70 border-gray-700/20" : "bg-white/80 border-white/50"
                }`}
              >
                <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  Настройки
                </h3>

                <div className="space-y-3">
                  <div>
                    <label
                      className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Валюта
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm touch-none ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-100"
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    >
                      {currencies.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Тема
                    </label>
                    <button
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className={`w-full p-3 border rounded-xl transition-all text-left text-sm touch-none active:scale-95 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
                          : "bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {theme === "dark" ? "🌙 Тёмная" : "☀️ Светлая"}
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-4 border ${
                  theme === "dark" ? "bg-red-900/30 border-red-700/30" : "bg-red-50 border-red-200"
                }`}
              >
                <h3 className={`text-lg font-bold mb-3 ${theme === "dark" ? "text-red-300" : "text-red-900"}`}>
                  Опасная зона
                </h3>
                <button
                  onClick={handleResetAll}
                  className={`w-full py-3 rounded-xl font-medium transition-all shadow-lg text-sm touch-none active:scale-95 ${
                    theme === "dark"
                      ? "bg-red-700 hover:bg-red-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  Сбросить все данные
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-4 shadow-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
          >
            <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              Цель накопления (USD)
            </h3>
            <div className="mb-4">
              <label
                className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Сумма цели
              </label>
              <input
                type="number"
                value={goalInput}
                min={0}
                onChange={(e) => setGoalInput(e.target.value.replace(/^0+/, ""))}
                className={`w-full p-3 border rounded-xl transition-all text-lg font-bold ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="Введите сумму"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGoalModal(false)}
                className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  const n = Number.parseInt(goalInput, 10)
                  if (!Number.isNaN(n) && n >= 0) setGoalSavings(n)
                  setShowGoalModal(false)
                }}
                className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                  theme === "dark"
                    ? "bg-blue-700 hover:bg-blue-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {showChart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-4 shadow-2xl max-h-[80vh] overflow-y-auto ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                {chartType === "income" ? "Доходы" : chartType === "expense" ? "Расходы" : "Копилка"} по категориям
              </h3>
              <button onClick={() => setShowChart(false)} className="touch-none">
                <X className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              </button>
            </div>
            {transactions.filter((t) => t.type === chartType).length > 0 ? (
              <div className="w-full aspect-square">
                <Pie
                  data={getChartData(chartType)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
                          padding: 15,
                          font: { size: 12 },
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                Нет данных для отображения
              </div>
            )}
            <button
              onClick={() => setShowChart(false)}
              className={`mt-4 w-full py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50"
          style={{ touchAction: "none" }}
        >
          <div
            className={`w-full max-w-md rounded-t-2xl shadow-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
            style={{ maxHeight: showNumKeyboard ? "90vh" : "85vh", display: "flex", flexDirection: "column" }}
          >
            <div
              className="p-4 overflow-y-auto flex-1"
              style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
            >
              <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                Новая операция
              </h3>

              <div className="flex gap-2 mb-4">
                {["expense", "income", "savings"].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setTransactionType(type)
                      vibrateSelect()
                    }}
                    className={`flex-1 py-2 rounded-xl font-medium transition text-sm touch-none active:scale-95 ${
                      transactionType === type
                        ? type === "income"
                          ? "bg-emerald-500 text-white"
                          : type === "expense"
                            ? "bg-rose-500 text-white"
                            : "bg-blue-500 text-white"
                        : theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type === "income" ? "Доход" : type === "expense" ? "Расход" : "Копилка"}
                  </button>
                ))}
              </div>

              <div className="mb-3">
                {transactionType === "savings" && (
                  <p className={`text-xs mb-2 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                    💡 Введите сумму в {currentCurrency.symbol} - будет конвертировано в USD (курс: 1{" "}
                    {currentCurrency.code} ≈ {exchangeRate.toFixed(2)} USD)
                  </p>
                )}
                <input
                  type="text"
                  placeholder="Сумма"
                  value={amount}
                  onFocus={() => setShowNumKeyboard(true)}
                  readOnly
                  className={`w-full p-3 border rounded-xl mb-3 transition-all text-sm ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
              </div>

              <input
                type="text"
                placeholder="Описание (необязательно)"
                value={description}
                onFocus={() => setShowNumKeyboard(false)}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-3 border rounded-xl mb-3 transition-all text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onFocus={() => setShowNumKeyboard(false)}
                className={`w-full p-3 border rounded-xl mb-4 transition-all text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
              >
                <option value="">Категория</option>
                {categoriesList[transactionType].map((cat) => (
                  <option key={cat} value={cat}>
                    {(categoriesMeta[cat]?.icon ? categoriesMeta[cat].icon + " " : "") + cat}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setShowNumKeyboard(false)
                    blurAll()
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  Отмена
                </button>
                <button
                  onClick={addTransaction}
                  className={`flex-1 py-3 rounded-xl text-white font-medium transition-all text-sm touch-none active:scale-95 ${
                    transactionType === "income"
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : transactionType === "expense"
                        ? "bg-rose-500 hover:bg-rose-600"
                        : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  Добавить
                </button>
              </div>
            </div>

            {showNumKeyboard && (
              <NumericKeyboard
                onNumberPress={(num) => {
                  if (amount.includes(".") && num === ".") return
                  setAmount((prev) => prev + num)
                }}
                onBackspace={() => setAmount((prev) => prev.slice(0, -1))}
                onDone={() => setShowNumKeyboard(false)}
                theme={theme}
              />
            )}
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-4 shadow-2xl max-h-[90vh] overflow-y-auto ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              {authMode === "login" ? "Вход через Email" : "Регистрация"}
            </h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 rounded-xl font-medium transition text-sm touch-none active:scale-95 ${
                  authMode === "login"
                    ? "bg-blue-500 text-white"
                    : theme === "dark"
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Вход
              </button>
              <button
                onClick={() => setAuthMode("register")}
                className={`flex-1 py-2 rounded-xl font-medium transition text-sm touch-none active:scale-95 ${
                  authMode === "register"
                    ? "bg-blue-500 text-white"
                    : theme === "dark"
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Регистрация
              </button>
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 border rounded-xl mb-3 transition-all text-sm ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              }`}
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 border rounded-xl mb-3 transition-all text-sm ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              }`}
            />
            <p className={`text-xs mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Имя: {displayName}</p>
            <select
              value={authCurrency}
              onChange={(e) => setAuthCurrency(e.target.value)}
              className={`w-full p-3 border rounded-xl mb-4 transition-all text-sm ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              }`}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAuthModal(false)
                  setEmail("")
                  setPassword("")
                }}
                className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Отмена
              </button>
              <button
                onClick={handleAuth}
                className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                  theme === "dark"
                    ? "bg-blue-700 hover:bg-blue-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {authMode === "login" ? "Войти" : "Зарегистрироваться"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isKeyboardOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
          style={{
            paddingBottom: Math.max(safeAreaInset.bottom, 8),
            paddingLeft: safeAreaInset.left || 0,
            paddingRight: safeAreaInset.right || 0,
          }}
        >
          <div className="flex items-center justify-center p-2">
            <div
              className={`w-full max-w-md backdrop-blur-md rounded-full p-1.5 border shadow-2xl flex items-center justify-around pointer-events-auto ${
                theme === "dark" ? "bg-gray-800/90 border-gray-700/20" : "bg-white/90 border-white/50"
              }`}
            >
              <NavButton
                active={activeTab === "overview"}
                onClick={() => {
                  setActiveTab("overview")
                  vibrate()
                }}
                icon={<Wallet className="w-4 h-4" />}
                theme={theme}
              />
              <NavButton
                active={activeTab === "history"}
                onClick={() => {
                  setActiveTab("history")
                  vibrate()
                }}
                icon={<History className="w-4 h-4" />}
                theme={theme}
              />
              <button
                onClick={() => {
                  setShowAddModal(true)
                  vibrate()
                }}
                className="p-2.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95 touch-none"
              >
                <Plus className="w-4 h-4" />
              </button>
              <NavButton
                active={activeTab === "savings"}
                onClick={() => {
                  setActiveTab("savings")
                  vibrate()
                }}
                icon={<PiggyBank className="w-4 h-4" />}
                theme={theme}
              />
              <NavButton
                active={activeTab === "settings"}
                onClick={() => {
                  setActiveTab("settings")
                  vibrate()
                }}
                icon={<Settings className="w-4 h-4" />}
                theme={theme}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        main {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
        }
        
        main::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        
        input[type="text"],
        input[type="number"],
        input[type="email"],
        input[type="password"],
        select,
        textarea {
          font-size: 16px !important;
          touch-action: manipulation;
        }
        
        input, select, textarea {
          transition: none !important;
        }
      `}</style>
    </div>
  )
}
