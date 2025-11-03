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
} from "lucide-react"

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
      className={`p-3 rounded-2xl transition-all duration-300 transform active:scale-95 touch-none ${
        active
          ? theme === "dark"
            ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg"
            : "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg"
          : theme === "dark"
            ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
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
    <div className="relative mb-3 overflow-hidden rounded-2xl">
      <button
        onClick={() => {
          if (swipeX === -80) {
            onDelete(tx.id)
            setSwipeX(0)
          }
        }}
        className={`absolute inset-y-0 right-0 w-20 flex items-center justify-center rounded-2xl transition-all ${
          swipeX === -80 ? "opacity-100" : "opacity-0 pointer-events-none"
        } ${theme === "dark" ? "bg-red-600" : "bg-red-500"}`}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </button>

      <div
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping ? "none" : "transform 0.3s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex items-center justify-between p-4 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:shadow-xl ${
          theme === "dark"
            ? "bg-gray-800/70 border-gray-700/30 hover:bg-gray-700/70"
            : "bg-white/80 border-white/50 hover:bg-white/90 shadow-lg"
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${categoryInfo.color} shadow-lg flex-shrink-0`}
          >
            <span className="text-xl">{categoryInfo.icon}</span>
          </div>

          <div className="min-w-0 flex-1">
            {tx.description && (
              <p className={`font-semibold text-sm truncate ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                {tx.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.bgColor} ${categoryInfo.textColor} flex-shrink-0`}
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
            className={`font-bold text-base ${
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
      className={`grid grid-cols-3 gap-3 p-4 rounded-t-3xl backdrop-blur-xl ${
        theme === "dark" ? "bg-gray-800/90 border-t border-gray-700/50" : "bg-white/90 border-t border-gray-200/50"
      }`}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "⌫"].map((key) => (
        <button
          key={key}
          onClick={() => {
            if (key === "⌫") onBackspace()
            else onNumberPress(key.toString())
          }}
          className={`p-4 rounded-2xl text-xl font-semibold transition-all touch-none active:scale-95 shadow-lg ${
            theme === "dark"
              ? "bg-gray-700/80 text-gray-100 hover:bg-gray-600/80 backdrop-blur-sm"
              : "bg-white/90 text-gray-900 hover:bg-white backdrop-blur-sm"
          }`}
        >
          {key}
        </button>
      ))}
      <button
        onClick={onDone}
        className="col-span-3 p-4 rounded-2xl text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all touch-none active:scale-95 shadow-xl"
      >
        Готово
      </button>
    </div>
  )
}

export default function FinanceApp({ apiUrl = API_BASE }) {
  const API_URL = apiUrl

  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authCurrency, setAuthCurrency] = useState("BYN")
  const [theme, setTheme] = useState("light")
  const [currency, setCurrency] = useState("BYN")
  const [goalSavings, setGoalSavings] = useState(50000)
  const [exchangeRate, setExchangeRate] = useState(3.2)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [safeAreaInset, setSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  const [contentSafeAreaInset, setContentSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  const [isReady, setIsReady] = useState(false)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [transactionType, setTransactionType] = useState("expense")
  const [newTransaction, setNewTransaction] = useState({
    type: "expense",
    amount: "",
    description: "",
    category: "",
  })
  const [showNumKeyboard, setShowNumKeyboard] = useState(false)
  const [balance, setBalance] = useState(0) // Declared balance
  const [income, setIncome] = useState(0) // Declared income
  const [expenses, setExpenses] = useState(0) // Declared expenses
  const [savings, setSavings] = useState(0) // Declared savings
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Declared isAuthenticated

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
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()

      // Block vertical swipes in Telegram
      if (window.Telegram.WebApp.disableVerticalSwipes) {
        window.Telegram.WebApp.disableVerticalSwipes()
      }

      // Listen for theme changes
      const handleThemeChanged = () => {
        const newTheme = window.Telegram.WebApp.colorScheme || "light"
        console.log("[v0] Theme changed to:", newTheme)
        setTheme(newTheme)
      }

      // Listen for viewport changes (when app is minimized/expanded)
      const handleViewportChanged = () => {
        console.log("[v0] Viewport changed, isExpanded:", window.Telegram.WebApp.isExpanded)
        if (!window.Telegram.WebApp.isExpanded) {
          window.Telegram.WebApp.expand()
        }
      }

      if (window.Telegram.WebApp.onEvent) {
        window.Telegram.WebApp.onEvent("themeChanged", handleThemeChanged)
        window.Telegram.WebApp.onEvent("viewportChanged", handleViewportChanged)
      }

      // Set initial theme
      setTheme(window.Telegram.WebApp.colorScheme || "light")

      return () => {
        if (window.Telegram.WebApp.offEvent) {
          window.Telegram.WebApp.offEvent("themeChanged", handleThemeChanged)
          window.Telegram.WebApp.offEvent("viewportChanged", handleViewportChanged)
        }
      }
    }
  }, [])

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

      updateSafeArea()
      updateContentSafeArea()
      handleFullscreenChanged()

      if (tg.onEvent) {
        tg.onEvent("safeAreaChanged", updateSafeArea)
        tg.onEvent("contentSafeAreaChanged", updateContentSafeArea)
        tg.onEvent("fullscreenChanged", handleFullscreenChanged)
      }

      setIsReady(true)

      return () => {
        if (tg.offEvent) {
          tg.offEvent("safeAreaChanged", updateSafeArea)
          tg.offEvent("contentSafeAreaChanged", updateContentSafeArea)
          tg.offEvent("fullscreenChanged", handleFullscreenChanged)
        }
      }
    } else {
      setIsReady(true)
    }
  }, [tg])

  useEffect(() => {
    const fetchSettings = () => {
      try {
        const ls = localStorage.getItem(LS_KEY)
        if (ls) {
          const data = JSON.parse(ls)
          if (data) {
            if (data.currency) setCurrency(data.currency)
            if (data.theme) setTheme(data.theme)
            if (data.goalSavings !== undefined) {
              // Check for undefined to allow 0
              setGoalSavings(data.goalSavings)
            }
            if (data.balanceVisible !== undefined) setBalanceVisible(data.balanceVisible)
          }
        }
      } catch (e) {
        console.warn("Failed to load settings from localStorage:", e)
      }
    }

    const restoreSession = () => {
      try {
        const session = localStorage.getItem(SESSION_KEY)
        if (session) {
          const sessionData = JSON.parse(session)
          if (sessionData?.email && sessionData?.token) {
            autoAuth(sessionData.email, sessionData.token)
          } else if (tgUserId) {
            // Prioritize Telegram user if available and no valid session
            autoAuthTelegram(tgUserId)
          }
        } else if (tgUserId) {
          // If no session and Telegram user exists
          autoAuthTelegram(tgUserId)
        }
      } catch (e) {
        console.warn("Failed to restore session:", e)
      }
    }

    fetchSettings()
    restoreSession()
  }, [tgUserId]) // Dependencies include tgUserId for Telegram auth prioritization

  useEffect(() => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          currency,
          theme,
          goalSavings,
          balanceVisible,
        }),
      )
    } catch (e) {
      console.warn("Failed to save settings to localStorage:", e)
    }
  }, [currency, theme, goalSavings, balanceVisible])

  useEffect(() => {
    const keepAlive = async () => {
      try {
        await fetch(`${API_URL}/health`).catch(() => {})
      } catch (e) {}
    }

    keepAlive()
    const interval = setInterval(keepAlive, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [API_URL])

  const handleDeleteTransaction = async (id) => {
    const tx = transactions.find((t) => t.id === id)
    if (!tx || !user) return

    if (!window.confirm("Удалить эту транзакцию?")) return

    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Ошибка удаления")

      let newBalance = user.balance
      let newIncome = user.income
      let newExpenses = user.expenses
      let newSavings = user.savings_usd

      if (tx.type === "income") {
        newBalance -= Number(tx.amount)
        newIncome -= Number(tx.amount)
      } else if (tx.type === "expense") {
        newBalance += Number(tx.amount)
        newExpenses -= Number(tx.amount)
      } else if (tx.type === "savings") {
        const usdAmount = Number(tx.converted_amount_usd || 0)
        newSavings -= usdAmount
      }

      await fetch(`${API_URL}/user/${user.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          balance: newBalance,
          income: newIncome,
          expenses: newExpenses,
          savings: newSavings,
          goalSavings: user.goal_savings,
        }),
      })

      setUser({
        ...user,
        balance: newBalance,
        income: newIncome,
        expenses: newExpenses,
        savings_usd: newSavings,
      })

      setTransactions(transactions.filter((t) => t.id !== id))
      vibrateSuccess()
    } catch (err) {
      console.error("Delete error:", err)
      alert("Ошибка при удалении транзакции")
      vibrateError()
    }
  }

  const handleAddTransaction = async () => {
    blurAll()
    setShowNumKeyboard(false)
    const amount = Number.parseFloat(newTransaction.amount)
    if (isNaN(amount) || amount <= 0) {
      vibrateError()
      alert("Введите корректную сумму > 0")
      return
    }

    let convertedUSD = null
    if (newTransaction.type === "savings") {
      convertedUSD = amount / exchangeRate
    }

    const txData = {
      user_id: user?.email || null, // Use email as user identifier
      type: newTransaction.type,
      amount: amount,
      converted_amount_usd: convertedUSD,
      description: newTransaction.description,
      category: newTransaction.category || "Другое",
    }

    try {
      const txResponse = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(txData),
      })

      if (!txResponse.ok) {
        const errorData = await txResponse.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Ошибка добавления транзакции")
      }

      const createdTx = await txResponse.json()

      let newBalance = user ? user.balance : 0
      let newIncome = user ? user.income : 0
      let newExpenses = user ? user.expenses : 0
      let newSavings = user ? user.savings_usd : 0

      if (newTransaction.type === "income") {
        newIncome += amount
        newBalance += amount
      } else if (newTransaction.type === "expense") {
        newExpenses += amount
        newBalance -= amount
      } else if (newTransaction.type === "savings") {
        newSavings += convertedUSD || 0
        newBalance -= amount // Deduct from local balance
      }

      // Update user totals on server if authenticated
      if (user && user.email) {
        await fetch(`${API_URL}/user/${user.email}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            balance: newBalance,
            income: newIncome,
            expenses: newExpenses,
            savings: newSavings,
            goalSavings: user.goal_savings,
          }),
        })
        setUser({
          ...user,
          balance: newBalance,
          income: newIncome,
          expenses: newExpenses,
          savings_usd: newSavings,
        })
      }

      setTransactions([createdTx, ...transactions]) // Add to the top
      setShowAddModal(false)
      setNewTransaction({ type: "expense", amount: "", description: "", category: "" }) // Reset form
      vibrateSuccess()
    } catch (err) {
      console.error("Add transaction error:", err)
      alert(err.message || "Ошибка при добавлении транзакции")
      vibrateError()
    }
  }

  const deleteTransaction = async (txId) => {
    vibrate()
    const tx = transactions.find((t) => t.id === txId)
    if (!tx) return

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
      // savings
      newSavings -= tx.converted_amount_usd || 0 // Subtract USD amount
      newBalance += tx.amount // Add back local currency amount
      setSavings(newSavings)
      setBalance(newBalance)
    }

    vibrateSuccess()

    // Save to server if authenticated
    if (user && user.email) {
      try {
        await fetch(`${API_URL}/transactions/${txId}`, {
          method: "DELETE",
        })
        await saveToServer(newBalance, newIncome, newExpenses, newSavings) // Save updated totals
      } catch (e) {
        console.warn("Failed to delete tx", e)
        alert("Ошибка удаления транзакции с сервера.")
        vibrateError()
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

      console.log("[v0] Attempting auth with:", { email, first_name: displayName })

      const res = await fetch(`${API_URL}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      console.log("[v0] Auth response status:", res.status)

      if (!res.ok) {
        const errorText = await res.text()
        console.error("[v0] Auth error response:", errorText)

        let errorMessage = "Ошибка входа"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }

        alert(errorMessage)
        vibrateError()
        return
      }

      const json = await res.json()
      console.log("[v0] Auth successful, user:", json.user)

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
      console.error("[v0] Auth error:", e)
      alert("Ошибка авторизации: " + e.message)
      vibrateError()
    }
  }

  const handleLogout = async () => {
    blurAll()
    // Save current state before logging out
    if (user?.id) {
      try {
        await saveToServer(balance, income, expenses, savings)
      } catch (e) {
        console.warn("save on logout failed", e)
      }
    }
    localStorage.removeItem(SESSION_KEY)
    setIsAuthenticated(false) // Reset authentication status
    setUser(null)
    setBalance(0)
    setIncome(0)
    setExpenses(0)
    setSavings(0)
    setTransactions([])
    vibrateError()
  }

  const handleResetData = async () => {
    if (!user) return
    if (!confirm("Вы уверены? Все данные будут удалены!")) return

    try {
      await fetch(`${API_URL}/user/${user.email}/reset`, { method: "POST" })
      setUser({ ...user, balance: 0, income: 0, expenses: 0, savings_usd: 0 })
      setTransactions([])
      vibrateSuccess()
    } catch (err) {
      console.error("Reset error:", err)
      alert("Ошибка при сбросе данных")
      vibrateError()
    }
  }

  // Modified to handle Telegram user authentication
  async function autoAuthTelegram(telegramId) {
    try {
      const tgEmail = `tg_${telegramId}@telegram.user`
      const resp = await fetch(`${API_URL}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tgEmail,
          password: `tg_${telegramId}`, // Use telegramId as password for simplicity
          first_name: displayName,
        }),
      })

      if (!resp.ok) throw new Error("auth failed")
      const json = await resp.json()
      applyUser(json.user, json.transactions || [], true) // Mark as authenticated
    } catch (e) {
      console.warn("autoAuthTelegram failed", e)
    }
  }

  async function autoAuth(email, token) {
    try {
      const resp = await fetch(`${API_URL}/auth`, {
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
    setTransactions(txs || [])
  }

  const saveToServer = async (newBalance, newIncome, newExpenses, newSavings) => {
    if (user && user.email) {
      try {
        await fetch(`${API_URL}/user/${user.email}`, {
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

  const formatCurrency = (amount) => {
    const curr = currencies.find((c) => c.code === currency) || currencies[0]
    return `${Number(amount).toFixed(2)} ${curr.symbol}`
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })
  }

  const blurAll = () => {
    if (document.activeElement) {
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

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      }`}
    >
      <main
        className="pb-24 overflow-y-auto"
        style={{
          minHeight: "100vh",
          paddingTop: Math.max(contentSafeAreaInset.top, 16),
          paddingBottom: Math.max(contentSafeAreaInset.bottom + 80, 96),
          paddingLeft: contentSafeAreaInset.left || 0,
          paddingRight: contentSafeAreaInset.right || 0,
        }}
      >
        <div className="max-w-md mx-auto px-4">
          {!user ? (
            <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fadeIn">
              <div
                className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl border max-w-sm w-full ${
                  theme === "dark" ? "bg-gray-800/70 border-gray-700/30" : "bg-white/80 border-white/50"
                }`}
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Wallet className="w-10 h-10 text-white" />
                  </div>
                  <h1
                    className={`text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
                  >
                    Finance App
                  </h1>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Управляйте своими финансами
                  </p>
                </div>

                <div className="space-y-3">
                  {tgUserId && (
                    <button
                      onClick={() => {
                        autoAuthTelegram(tgUserId)
                        vibrate()
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      Войти через Telegram
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowAuthModal(true)
                      vibrate()
                    }}
                    className={`w-full font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${
                      theme === "dark"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    }`}
                  >
                    <LogIn className="w-5 h-5" />
                    Войти через Email
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-4 animate-fadeIn">
                  <div
                    className={`backdrop-blur-xl rounded-3xl p-6 shadow-2xl border ${
                      theme === "dark" ? "bg-gray-800/70 border-gray-700/30" : "bg-white/80 border-white/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {tgPhotoUrl ? (
                          <img
                            src={tgPhotoUrl || "/placeholder.svg"}
                            alt="avatar"
                            className="w-12 h-12 rounded-full shadow-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <p className={`font-bold text-lg ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                            {displayName}
                          </p>
                          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setBalanceVisible(!balanceVisible)
                          vibrate()
                        }}
                        className={`p-2 rounded-xl transition-all ${
                          theme === "dark" ? "hover:bg-gray-700/50" : "hover:bg-gray-100"
                        }`}
                      >
                        {balanceVisible ? (
                          <Eye className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                        ) : (
                          <EyeOff className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                        )}
                      </button>
                    </div>

                    <div className="text-center py-6">
                      <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        Текущий баланс
                      </p>
                      <p
                        className={`text-4xl font-bold mb-1 ${
                          balanceVisible
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                            : theme === "dark"
                              ? "text-gray-600"
                              : "text-gray-400"
                        }`}
                      >
                        {balanceVisible ? formatCurrency(balance) : "••••••"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-4 rounded-2xl ${theme === "dark" ? "bg-emerald-900/30" : "bg-emerald-50"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Доход</p>
                        </div>
                        <p className="text-lg font-bold text-emerald-600">
                          {balanceVisible ? formatCurrency(income) : "••••"}
                        </p>
                      </div>
                      <div className={`p-4 rounded-2xl ${theme === "dark" ? "bg-rose-900/30" : "bg-rose-50"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-4 h-4 text-rose-600" />
                          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Расход</p>
                        </div>
                        <p className="text-lg font-bold text-rose-600">
                          {balanceVisible ? formatCurrency(expenses) : "••••"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`backdrop-blur-xl rounded-3xl p-6 shadow-2xl border ${
                      theme === "dark" ? "bg-gray-800/70 border-gray-700/30" : "bg-white/80 border-white/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                        Последние транзакции
                      </h3>
                      <button
                        onClick={() => {
                          setActiveTab("history")
                          vibrate()
                        }}
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-blue-400" : "text-blue-600"
                        } hover:underline`}
                      >
                        Все
                      </button>
                    </div>
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((tx) => (
                        <TxRow
                          key={tx.id}
                          tx={tx}
                          categoriesMeta={categoriesMeta}
                          formatCurrency={formatCurrency}
                          formatDate={formatDate}
                          theme={theme}
                          onDelete={handleDeleteTransaction}
                        />
                      ))}
                      {transactions.length === 0 && (
                        <p className={`text-center py-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                          Нет транзакций
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-4 animate-fadeIn">
                  <div
                    className={`backdrop-blur-xl rounded-3xl p-6 shadow-2xl border ${
                      theme === "dark" ? "bg-gray-800/70 border-gray-700/30" : "bg-white/80 border-white/50"
                    }`}
                  >
                    <h2 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                      История операций
                    </h2>
                    <div className="space-y-3">
                      {transactions.map((tx) => (
                        <TxRow
                          key={tx.id}
                          tx={tx}
                          categoriesMeta={categoriesMeta}
                          formatCurrency={formatCurrency}
                          formatDate={formatDate}
                          theme={theme}
                          onDelete={handleDeleteTransaction}
                        />
                      ))}
                      {transactions.length === 0 && (
                        <p className={`text-center py-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                          Нет транзакций
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "savings" && (
                <div className="space-y-4 animate-fadeIn">
                  <div
                    className={`backdrop-blur-xl rounded-3xl p-6 shadow-2xl border ${
                      theme === "dark" ? "bg-gray-800/70 border-gray-700/30" : "bg-white/80 border-white/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <PiggyBank className="w-6 h-6 text-white" />
                      </div>
                      <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                        Копилка
                      </h2>
                    </div>

                    <div className="text-center py-6 mb-6">
                      <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        Накоплено
                      </p>
                      <p className="text-4xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${savings.toFixed(2)}
                      </p>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                        Цель: ${goalSavings.toFixed(2)}
                      </p>
                    </div>

                    <div className="mb-6">
                      <div
                        className={`h-3 rounded-full overflow-hidden ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min((savings / goalSavings) * 100, 100)}%` }}
                        />
                      </div>
                      <p className={`text-xs text-center mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {((savings / goalSavings) * 100).toFixed(1)}% от цели
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h3 className={`text-lg font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                        История накоплений
                      </h3>
                      {transactions
                        .filter((tx) => tx.type === "savings")
                        .map((tx) => (
                          <TxRow
                            key={tx.id}
                            tx={tx}
                            categoriesMeta={categoriesMeta}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                            theme={theme}
                            onDelete={handleDeleteTransaction}
                          />
                        ))}
                      {transactions.filter((tx) => tx.type === "savings").length === 0 && (
                        <p className={`text-center py-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                          Нет накоплений
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-4 animate-fadeIn">
                  <div
                    className={`backdrop-blur-xl rounded-3xl p-6 shadow-2xl border ${
                      theme === "dark" ? "bg-gray-800/70 border-gray-700/30" : "bg-white/80 border-white/50"
                    }`}
                  >
                    <h2 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                      Настройки
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm font-semibold mb-2 ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Валюта
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => {
                            setCurrency(e.target.value)
                            vibrateSelect()
                          }}
                          className={`w-full p-3 rounded-xl border transition-all ${
                            theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-gray-100"
                              : "bg-white border-gray-200 text-gray-900"
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
                          className={`block text-sm font-semibold mb-2 ${
                            theme === "dark" ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Цель накоплений (USD)
                        </label>
                        <input
                          type="number"
                          value={goalSavings}
                          onChange={(e) => setGoalSavings(Number(e.target.value))}
                          className={`w-full p-3 rounded-xl border transition-all ${
                            theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-gray-100"
                              : "bg-white border-gray-200 text-gray-900"
                          }`}
                        />
                      </div>

                      <button
                        onClick={() => {
                          localStorage.removeItem(SESSION_KEY)
                          setUser(null)
                          setTransactions([])
                          setIsAuthenticated(false)
                          vibrateSuccess()
                        }}
                        className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-5 h-5" />
                        Выйти
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                Новая транзакция
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  vibrate()
                }}
                className={`p-2 rounded-xl transition-all ${
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                <X className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Тип</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "expense", label: "Расход", color: "rose" },
                    { value: "income", label: "Доход", color: "emerald" },
                    { value: "savings", label: "Копилка", color: "blue" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        setNewTransaction({ ...newTransaction, type: type.value })
                        setTransactionType(type.value)
                        vibrateSelect()
                      }}
                      className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                        newTransaction.type === type.value
                          ? `bg-gradient-to-br from-${type.color}-500 to-${type.color}-600 text-white shadow-lg scale-105`
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Сумма ({currency})</label>
                <input
                  type="text"
                  value={newTransaction.amount}
                  onFocus={() => {
                    setShowNumKeyboard(true)
                    if (!newTransaction.amount) {
                      setNewTransaction({ ...newTransaction, amount: "" })
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "")
                    const parts = value.split(".")
                    if (parts.length > 2) {
                      e.target.value = `${parts[0]}.${parts.slice(1).join("")}`
                    }
                    setNewTransaction({ ...newTransaction, amount: e.target.value })
                  }}
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-xl font-bold"
                  placeholder="0.00"
                  readOnly={showNumKeyboard}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Описание</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  onFocus={() => setShowNumKeyboard(false)}
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Например: Зарплата"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Категория</label>
                <input
                  type="text"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  onFocus={() => setShowNumKeyboard(false)}
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Например: Работа"
                />
              </div>

              <button
                onClick={handleAddTransaction}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mt-6"
              >
                Добавить транзакцию
              </button>
            </div>
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

      {showNumKeyboard && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 animate-slide-up"
          style={{
            paddingBottom: Math.max(safeAreaInset.bottom, 8),
            paddingLeft: safeAreaInset.left || 0,
            paddingRight: safeAreaInset.right || 0,
          }}
        >
          <NumericKeyboard
            onNumberPress={(num) => {
              const currentAmount = newTransaction.amount
              const newAmount = currentAmount === "0" ? num : currentAmount + num
              setNewTransaction({ ...newTransaction, amount: newAmount })
              vibrate()
            }}
            onBackspace={() => {
              setNewTransaction({
                ...newTransaction,
                amount: newTransaction.amount.slice(0, -1),
              })
              vibrate()
            }}
            onDone={() => {
              setShowNumKeyboard(false)
              setIsKeyboardOpen(false)
              blurAll()
              vibrate()
            }}
            theme={theme}
          />
        </div>
      )}

      {!showNumKeyboard && !isKeyboardOpen && (
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
                  setIsKeyboardOpen(true) // Indicate keyboard is open conceptually for layout
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

        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
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
