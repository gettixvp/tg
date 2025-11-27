"use client"

import { useEffect, useState, useRef, useMemo } from "react"
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
  Heart,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Send,
  RefreshCw,
  PieChart,
  BarChart2,
  TrendingUpIcon,
  Download,
  UserPlus,
  Users,
} from "lucide-react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from "chart.js"
import { Pie, Bar, Line } from "react-chartjs-2"

// Import constants and utilities
import { API_BASE, currencies, categoriesMeta, categoriesList } from "../constants"
import { formatCurrency, formatDate, blurAll } from "../utils"

// Import components
import { NavButton } from "./ui/NavButton"
import { NumericKeyboard } from "./ui/NumericKeyboard"
import { CommentRow } from "./ui/CommentRow"
import { TransactionRow } from "./ui/TransactionRow"
import { LinkedUserRow } from "./ui/LinkedUserRow"

// Import hooks
import { useTelegram } from "../hooks/useTelegram"
import { useAuth } from "../hooks/useAuth"
import { useFinanceData } from "../hooks/useFinanceData"
import { useSettings } from "../hooks/useSettings"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement)

export default function FinanceApp({ apiUrl = API_BASE }) {
  const API_URL = apiUrl
  const mainContentRef = useRef(null)

  // Telegram integration
  const {
    tg,
    haptic,
    tgUser,
    tgUserId,
    displayName,
    tgPhotoUrl,
    safeAreaInset,
    contentSafeAreaInset,
    isFullscreen,
    isReady,
    vibrate,
    vibrateSuccess,
    vibrateError,
  } = useTelegram()

  // Settings
  const {
    theme,
    setTheme,
    currency,
    setCurrency,
    goalSavings,
    setGoalSavings,
    balanceVisible,
    setBalanceVisible,
    fullscreenEnabled,
    setFullscreenEnabled,
    isKeyboardOpen,
    setIsKeyboardOpen,
  } = useSettings()

  // UI State - declare critical state first
  const [isLoading, setIsLoading] = useState(true)

  // Authentication
  const { user, isAuthenticated, login, register, logout } = useAuth(tgUserId, displayName, setIsLoading)

  // Local auth state (since useAuth doesn't expose setters)
  const [localUser, setLocalUser] = useState(null)
  const [localIsAuthenticated, setLocalIsAuthenticated] = useState(false)

  // Finance data
  const {
    balance,
    income,
    expenses,
    savings,
    transactions,
    linkedUsers,
    likedTransactions,
    transactionComments,
    setBalance,
    setIncome,
    setExpenses,
    setSavings,
    setTransactions,
    loadLinkedUsers,
    removeLinkedUser,
    saveToServer,
    addTransaction,
    deleteTransaction,
    toggleLike,
    loadTransactionComments,
    addComment,
    deleteComment,
    applyUserData,
  } = useFinanceData(user, isAuthenticated, setIsLoading)

  // Rest of UI State
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("login")
  const [showChart, setShowChart] = useState(false)
  const [chartType, setChartType] = useState("expense")
  const [transactionType, setTransactionType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [authCurrency, setAuthCurrency] = useState("BYN")
  const [showPassword, setShowPassword] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalInput, setGoalInput] = useState("50000")
  const [goalName, setGoalName] = useState("Моя цель")
  const [showSavingsSettingsModal, setShowSavingsSettingsModal] = useState(false)
  const [initialSavingsAmount, setInitialSavingsAmount] = useState(0)
  const [initialSavingsInput, setInitialSavingsInput] = useState("0")
  const [showNumKeyboard, setShowNumKeyboard] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(3.2)
  const [showLinkedUsers, setShowLinkedUsers] = useState(false)
  const [showLinkedUsersDropdown, setShowLinkedUsersDropdown] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [detailsCommentText, setDetailsCommentText] = useState("")
  
  // Additional state for features
  const [secondGoalName, setSecondGoalName] = useState('')
  const [secondGoalAmount, setSecondGoalAmount] = useState(0)
  const [secondGoalSavings, setSecondGoalSavings] = useState(0)
  const [secondGoalInitialAmount, setSecondGoalInitialAmount] = useState(0)
  const [showSecondGoalModal, setShowSecondGoalModal] = useState(false)
  const [secondGoalInput, setSecondGoalInput] = useState('0')
  const [selectedSavingsGoal, setSelectedSavingsGoal] = useState('main')
  
  const [budgets, setBudgets] = useState({})
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState('')
  const [budgetLimitInput, setBudgetLimitInput] = useState('')
  const [budgetPeriod, setBudgetPeriod] = useState('month')
  const [showBudgetKeyboard, setShowBudgetKeyboard] = useState(false)
  
  const [chartView, setChartView] = useState('pie')
  const [savingsTab, setSavingsTab] = useState('savings')
  const [debts, setDebts] = useState([])
  const [showAddDebtModal, setShowAddDebtModal] = useState(false)
  const [debtType, setDebtType] = useState('owe')
  const [showSystemSettings, setShowSystemSettings] = useState(false)
  const [debtPerson, setDebtPerson] = useState('')
  const [debtAmount, setDebtAmount] = useState('')
  const [debtDescription, setDebtDescription] = useState('')

  // Effects
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
      setTheme(tg.colorScheme || "light")
      
      const startFullscreen = async () => {
        try {
          if (tg.requestFullscreen && fullscreenEnabled) {
            if (!tg.isFullscreen) {
              tg.requestFullscreen()
            }
            setTimeout(() => {
              if (!tg.isFullscreen && tg.requestFullscreen && fullscreenEnabled) {
                tg.requestFullscreen()
              }
            }, 300)
          }
        } catch (e) {
          console.warn("Auto fullscreen failed", e)
        }
      }

      startFullscreen()
    }
  }, [tg, fullscreenEnabled])

  useEffect(() => {
    if (isReady) {
      setIsLoading(false)
    }
  }, [isReady])

  // Keep alive effect
  useEffect(() => {
    const keepAlive = async () => {
      try {
        await fetch(`${API_BASE}/api/health`).catch(() => {})
      } catch (e) {
        console.warn('[KeepAlive] Failed to ping backend', e)
      }
    }

    keepAlive()
    const interval = setInterval(keepAlive, 14 * 60 * 1000)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        keepAlive()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const currentCurrency = currencies.find((c) => c.code === currency) || currencies[1]

  const toggleFullscreen = async () => {
    if (tg && tg.requestFullscreen && tg.exitFullscreen) {
      try {
        if (isFullscreen) {
          tg.exitFullscreen()
          setFullscreenEnabled(false)
          localStorage.setItem("fullscreenEnabled", "false")
        } else {
          tg.requestFullscreen()
          setFullscreenEnabled(true)
          localStorage.setItem("fullscreenEnabled", "true")
        }
      } catch (e) {
        console.warn("Fullscreen toggle failed", e)
      }
    }
  }

  const handleAddTransaction = async () => {
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
      user_id: localUser?.id || null,
      type: transactionType,
      amount: n,
      converted_amount_usd: convertedUSD || null,
      description: description || "",
      category: category || "Другое",
      date: new Date().toISOString(),
      created_by_telegram_id: tgUserId || null,
      created_by_name: displayName || null,
      telegram_photo_url: tgPhotoUrl || null,
      savings_goal: transactionType === 'savings' ? selectedSavingsGoal : null,
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
      if (selectedSavingsGoal === 'main') {
        newSavings += convertedUSD
        setSavings(newSavings)
      } else {
        setSecondGoalSavings(secondGoalSavings + convertedUSD)
      }
      newBalance -= n
      setBalance(newBalance)
    }

    setAmount("")
    setDescription("")
    setCategory("")
    setShowAddModal(false)
    vibrateSuccess()

    try {
      await addTransaction(newTx)
      await saveToServer(newBalance, newIncome, newExpenses, newSavings, goalSavings)
    } catch (e) {
      console.error("Failed to save transaction", e)
      alert("Ошибка сохранения транзакции")
    }
  }

  const handleDeleteTransaction = async (transactionId) => {
    try {
      const tx = transactions.find(t => t.id === transactionId)
      if (!tx) return

      // Update local state first
      setTransactions(prev => prev.filter(t => t.id !== transactionId))
      
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
        const convertedUSD = tx.converted_amount_usd || (tx.amount * exchangeRate)
        if (tx.savings_goal === 'main') {
          newSavings -= convertedUSD
          setSavings(newSavings)
        } else {
          setSecondGoalSavings(secondGoalSavings - convertedUSD)
        }
        newBalance += tx.amount
        setBalance(newBalance)
      }

      await deleteTransaction(transactionId)
      await saveToServer(newBalance, newIncome, newExpenses, newSavings, goalSavings)
      vibrateSuccess()
    } catch (e) {
      console.error("Failed to delete transaction", e)
      vibrateError()
      alert("Ошибка удаления транзакции")
    }
  }

  const handleLogin = async () => {
    try {
      const result = await login(email, password, displayName)
      if (result) {
        setLocalUser(result.user)
        setLocalIsAuthenticated(result.isEmailAuth)
        setBalance(Number(result.user.balance || 0))
        setIncome(Number(result.user.income || 0))
        setExpenses(Number(result.user.expenses || 0))
        setSavings(Number(result.user.savings_usd || 0))
        setTransactions(result.transactions || [])
        
        if (result.isEmailAuth && result.user.email) {
          loadLinkedUsers(result.user.email)
        }
        
        setShowAuthModal(false)
        setEmail("")
        setPassword("")
        vibrateSuccess()
      }
    } catch (e) {
      vibrateError()
      alert("Ошибка входа. Проверьте email и пароль.")
    }
  }

  const handleRegister = async () => {
    try {
      const result = await register(email, password, displayName, authCurrency)
      if (result) {
        setLocalUser(result.user)
        setLocalIsAuthenticated(result.isEmailAuth)
        setBalance(Number(result.user.balance || 0))
        setIncome(Number(result.user.income || 0))
        setExpenses(Number(result.user.expenses || 0))
        setSavings(Number(result.user.savings_usd || 0))
        setTransactions(result.transactions || [])
        
        if (result.isEmailAuth && result.user.email) {
          loadLinkedUsers(result.user.email)
        }
        
        setShowAuthModal(false)
        setEmail("")
        setPassword("")
        vibrateSuccess()
      }
    } catch (e) {
      vibrateError()
      alert("Ошибка регистрации. Попробуйте другой email.")
    }
  }

  const handleLogout = () => {
    logout()
    setLocalUser(null)
    setLocalIsAuthenticated(false)
    setBalance(0)
    setIncome(0)
    setExpenses(0)
    setSavings(0)
    setTransactions([])
    setLinkedUsers([])
    vibrateSuccess()
  }

  // Chart data preparation
  const chartData = useMemo(() => {
    const filteredTransactions = transactions.filter(tx => tx.type === chartType)
    const categoryTotals = {}
    
    filteredTransactions.forEach(tx => {
      const category = tx.category || 'Другое'
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0
      }
      categoryTotals[category] += tx.amount
    })

    const labels = Object.keys(categoryTotals)
    const data = Object.values(categoryTotals)
    const colors = labels.map(cat => categoriesMeta[cat]?.chartColor || '#64748b')

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        borderWidth: 2,
      }]
    }
  }, [transactions, chartType, theme])

  if (!isReady || isLoading) {
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
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
            {!isReady ? "Инициализация..." : "Загрузка данных..."}
          </p>
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
        paddingTop: isFullscreen ? (safeAreaInset.top || 0) : 0,
        paddingLeft: safeAreaInset.left || 0,
        paddingRight: safeAreaInset.right || 0,
      }}
    >
      {activeTab === "overview" && (
        <header className="relative overflow-hidden flex-shrink-0 z-20 px-4 pb-4" style={{ paddingTop: isFullscreen ? '48px' : '16px' }}>
          {/* Градиент на заднем плане */}
          <div 
            className="absolute inset-0 opacity-30 blur-3xl"
            style={{
              background: theme === "dark" 
                ? "radial-gradient(circle at 50% 20%, #3b82f6 0%, transparent 70%)"
                : "radial-gradient(circle at 50% 20%, #6366f1 0%, transparent 70%)",
              top: "-20px",
              height: "200px"
            }}
          />
          <div
            className="relative overflow-hidden rounded-2xl p-4 z-10"
            style={{ backgroundColor: theme === "dark" ? "#3b82f6" : "#6366f1" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 flex-1">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/80">Общий баланс</p>
                  <p className="text-2xl font-bold text-white">{balanceVisible ? formatCurrency(balance) : "••••••"}</p>
                </div>
              </div>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all touch-none"
              >
                {balanceVisible ? (
                  <Eye className="w-4 h-4 text-white" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl p-2.5 bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-1 mb-0.5">
                  <TrendingUp className="w-3 h-3 text-emerald-300" />
                  <span className="text-xs text-white/90">Доходы</span>
                </div>
                <p className="text-base font-bold text-white">{balanceVisible ? formatCurrency(income) : "••••••"}</p>
              </div>
              <div className="rounded-xl p-2.5 bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-1 mb-0.5">
                  <TrendingDown className="w-3 h-3 text-rose-300" />
                  <span className="text-xs text-white/90">Расходы</span>
                </div>
                <p className="text-base font-bold text-white">{balanceVisible ? formatCurrency(expenses) : "••••••"}</p>
              </div>
            </div>
          </div>
        </header>
      )}

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
          className="px-4 pt-2 pb-4"
          style={{
            minHeight: "100%",
            touchAction: "pan-y",
          }}
        >
          {!localIsAuthenticated ? (
            /* Auth Screen */
            <div className="p-4">
              <div className={`max-w-sm mx-auto p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h2 className="text-xl font-bold mb-6 text-center">Добро пожаловать!</h2>
                <p className={`text-center mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Войдите или зарегистрируйтесь для управления финансами
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Пароль
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full p-3 rounded-lg border pr-10 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        placeholder="••••••••"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {authMode === 'register' && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Валюта по умолчанию
                      </label>
                      <select
                        value={authCurrency}
                        onChange={(e) => setAuthCurrency(e.target.value)}
                        className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        {currencies.map(curr => (
                          <option key={curr.code} value={curr.code}>{curr.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <button
                    onClick={authMode === 'login' ? handleLogin : handleRegister}
                    className="w-full p-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                  </button>
                  
                  <button
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className={`w-full p-3 rounded-lg font-semibold transition-colors ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {authMode === 'login' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Есть аккаунт? Войдите'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Main App Content */
            <>
              {activeTab === "overview" && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    {/* Основная копилка */}
                    <div
                      onClick={() => {
                        setActiveTab("savings")
                        vibrateSuccess()
                      }}
                      className={`rounded-xl p-3 border flex-1 cursor-pointer transition-all touch-none active:scale-95 ${
                        theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <div className={`p-1.5 rounded-lg ${theme === "dark" ? "bg-blue-900/40" : "bg-blue-100"}`}>
                            <PiggyBank className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                          </div>
                          <div>
                            <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{goalName || "Копилка"}</p>
                          </div>
                        </div>
                        {/* Маленькая круговая диаграмма */}
                        <div className="relative w-14 h-14 flex-shrink-0">
                          <svg className="w-14 h-14 transform -rotate-90">
                            <circle
                              cx="28"
                              cy="28"
                              r="24"
                              stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
                              strokeWidth="5"
                              fill="none"
                            />
                            <circle
                              cx="28"
                              cy="28"
                              r="24"
                              stroke={theme === "dark" ? "#3b82f6" : "#6366f1"}
                              strokeWidth="5"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 24}`}
                              strokeDashoffset={`${2 * Math.PI * 24 * (1 - (savings * exchangeRate / goalSavings))}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-xs font-bold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                              {Math.round((savings * exchangeRate / goalSavings) * 100) || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Последние транзакции */}
                  <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Последние транзакции</h3>
                      <button
                        onClick={() => setActiveTab("transactions")}
                        className={`text-sm ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                      >
                        Все
                      </button>
                    </div>
                    <div className="space-y-2">
                      {transactions.slice(0, 5).map(tx => (
                        <TransactionRow
                          key={tx.id}
                          tx={tx}
                          categoriesMeta={categoriesMeta}
                          formatCurrency={formatCurrency}
                          formatDate={formatDate}
                          theme={theme}
                          onDelete={handleDeleteTransaction}
                          onToggleLike={toggleLike}
                          tgPhotoUrl={tgPhotoUrl}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "transactions" && (
                <div className="space-y-2">
                  {transactions.map(tx => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      categoriesMeta={categoriesMeta}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      theme={theme}
                      onDelete={handleDeleteTransaction}
                      onToggleLike={toggleLike}
                      tgPhotoUrl={tgPhotoUrl}
                    />
                  ))}
                </div>
              )}

              {activeTab === "chart" && (
                <div className="space-y-4">
                  <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <h3 className="font-semibold mb-4">Аналитика</h3>
                    
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setChartType('expense')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          chartType === 'expense' 
                            ? 'bg-red-500 text-white' 
                            : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Расходы
                      </button>
                      <button
                        onClick={() => setChartType('income')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          chartType === 'income' 
                            ? 'bg-green-500 text-white' 
                            : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Доходы
                      </button>
                    </div>
                    
                    <div className="h-64">
                      <Pie data={chartData} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: theme === 'dark' ? '#f3f4f6' : '#111827',
                              padding: 20,
                            }
                          }
                        }
                      }} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "savings" && (
                <div className="space-y-4">
                  <div className={`rounded-xl p-4 border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                    <h3 className="font-semibold mb-4">Накопления</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">{goalName}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Целевая сумма:</span>
                            <span className="font-medium">{formatCurrency(goalSavings, 'BYN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Накоплено:</span>
                            <span className="font-medium text-blue-500">${savings.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min((savings * exchangeRate / goalSavings) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 ${theme === 'dark' ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-lg border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
           style={{ paddingBottom: `${safeAreaInset.bottom}px` }}>
        <div className="flex justify-around p-2">
          <NavButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={<Wallet className="w-5 h-5" />}
            theme={theme}
          />
          <NavButton
            active={activeTab === "transactions"}
            onClick={() => setActiveTab("transactions")}
            icon={<History className="w-5 h-5" />}
            theme={theme}
          />
          <NavButton
            active={activeTab === "chart"}
            onClick={() => setActiveTab("chart")}
            icon={<BarChart3 className="w-5 h-5" />}
            theme={theme}
          />
          <NavButton
            active={activeTab === "savings"}
            onClick={() => setActiveTab("savings")}
            icon={<PiggyBank className="w-5 h-5" />}
            theme={theme}
          />
        </div>
      </div>

      {/* Floating Action Button */}
      {localIsAuthenticated && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className={`w-full max-w-lg rounded-t-3xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}
               style={{ paddingBottom: `${safeAreaInset.bottom + 20}px` }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Добавить транзакцию</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Тип
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTransactionType('expense')}
                    className={`p-3 rounded-lg font-medium transition-colors ${
                      transactionType === 'expense' 
                        ? 'bg-red-500 text-white' 
                        : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Расход
                  </button>
                  <button
                    onClick={() => setTransactionType('income')}
                    className={`p-3 rounded-lg font-medium transition-colors ${
                      transactionType === 'income' 
                        ? 'bg-green-500 text-white' 
                        : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Доход
                  </button>
                  <button
                    onClick={() => setTransactionType('savings')}
                    className={`p-3 rounded-lg font-medium transition-colors ${
                      transactionType === 'savings' 
                        ? 'bg-blue-500 text-white' 
                        : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Копилка
                  </button>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Сумма
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onFocus={() => setShowNumKeyboard(true)}
                  className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="0"
                  readOnly
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Категория
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="">Выберите категорию</option>
                  {categoriesList[transactionType]?.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Описание
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="Необязательно"
                />
              </div>
              
              <button
                onClick={handleAddTransaction}
                className="w-full p-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Numeric Keyboard */}
      {showNumKeyboard && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <NumericKeyboard
            onNumberPress={(num) => setAmount(prev => prev + num)}
            onBackspace={() => setAmount(prev => prev.slice(0, -1))}
            onDone={() => setShowNumKeyboard(false)}
            theme={theme}
          />
        </div>
      )}
    </div>
  )
}
