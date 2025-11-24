"use client"

import { useEffect, useState, useRef, memo, useMemo } from "react"
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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement)

// Импортируем наши модули
import { API_BASE, LS_KEY, SESSION_KEY, categoriesMeta, categoriesList, currencies, walletIcons, walletColors } from '../constants'
import { 
  formatCurrency, 
  formatDate, 
  createVibrationFunctions, 
  blurAll, 
  transliterate, 
  getSheetStyle, 
  getChartData, 
  generateId 
} from '../utils'
import NavButton from './NavButton'
import CommentRow from './CommentRow'
import TxRow from './TxRow'
import AddTransactionModal from './modals/AddTransactionModal'
import WalletSettingsModal from './modals/WalletSettingsModal'

function FinanceApp() {
  // Telegram WebApp
  const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp
  
  // Основные состояния из оригинала
  const [theme, setTheme] = useState("light")
  const [currency, setCurrency] = useState("RUB")
  const [balance, setBalance] = useState(0)
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [savings, setSavings] = useState(0)
  const [goalSavings, setGoalSavings] = useState(0)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [fullscreenEnabled, setFullscreenEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Состояния для модальных окон
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
  const [safeAreaInset, setSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  const [contentSafeAreaInset, setContentSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalInput, setGoalInput] = useState("50000")
  const [goalName, setGoalName] = useState("Моя цель")
  const [showSavingsSettingsModal, setShowSavingsSettingsModal] = useState(false)
  const [initialSavingsAmount, setInitialSavingsAmount] = useState(0)
  const [initialSavingsInput, setInitialSavingsInput] = useState("0")
  const [showNumKeyboard, setShowNumKeyboard] = useState(false)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [detailsCommentText, setDetailsCommentText] = useState('')
  const [transactionComments, setTransactionComments] = useState({})
  const [sheetDragOffset, setSheetDragOffset] = useState(0)
  const [isSheetDragging, setIsSheetDragging] = useState(false)
  const [sheetStartY, setSheetStartY] = useState(0)
  const [showLinkedUsers, setShowLinkedUsers] = useState(false)
  const [linkedUsers, setLinkedUsers] = useState([])
  const [currentTelegramId, setCurrentTelegramId] = useState("")
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [displayName, setDisplayName] = useState("Пользователь")
  const [tgPhotoUrl, setTgPhotoUrl] = useState("")
  const [tgUserId, setTgUserId] = useState("")
  const [showLinkedUsersDropdown, setShowLinkedUsersDropdown] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showAddDebtModal, setShowAddDebtModal] = useState(false)
  const [showSystemSettings, setShowSystemSettings] = useState(false)
  const [showSecondGoalModal, setShowSecondGoalModal] = useState(false)
  const [secondGoalName, setSecondGoalName] = useState('')
  const [secondGoalAmount, setSecondGoalAmount] = useState(0)
  const [secondGoalSavings, setSecondGoalSavings] = useState(0)
  const [secondGoalInitialAmount, setSecondGoalInitialAmount] = useState(0)
  const [secondGoalInput, setSecondGoalInput] = useState('0')
  const [selectedSavingsGoal, setSelectedSavingsGoal] = useState('main')
  const [budgets, setBudgets] = useState({})
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState('')
  const [budgetLimitInput, setBudgetLimitInput] = useState('')
  const [budgetPeriod, setBudgetPeriod] = useState('month')
  const [showBudgetKeyboard, setShowBudgetKeyboard] = useState(false)
  const [debts, setDebts] = useState([])
  const [debtType, setDebtType] = useState('owe')
  const [debtPerson, setDebtPerson] = useState('')
  const [debtAmount, setDebtAmount] = useState('')
  const [debtDescription, setDebtDescription] = useState('')
  const [debtModalDragOffset, setDebtModalDragOffset] = useState(0)
  const [isDebtModalDragging, setIsDebtModalDragging] = useState(false)
  const [systemSettingsDragOffset, setSystemSettingsDragOffset] = useState(0)
  const [isSystemSettingsDragging, setIsSystemSettingsDragging] = useState(false)
  const [chartView, setChartView] = useState('pie')
  const [savingsTab, setSavingsTab] = useState('savings')
  const [selectedTransactionWallet, setSelectedTransactionWallet] = useState('main')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [likedTransactions, setLikedTransactions] = useState(new Set())
  
  // Кошельки
  const [wallets, setWallets] = useState([
    { id: 'main', name: 'Основной', icon: '💰', color: '#3b82f6' }
  ])
  const [currentWalletId, setCurrentWalletId] = useState('main')
  
  // Вибрации
  const { vibrate, vibrateSuccess, vibrateError, vibrateSelect } = createVibrationFunctions()

  // Оригинальная инициализация Telegram WebApp с полноэкранным режимом
  useEffect(() => {
    if (tg) {
      tg.ready && tg.ready()
      if (tg.expand) tg.expand()

      if (tg.disableVerticalSwipes) {
        tg.disableVerticalSwipes()
      }

      setTheme(tg.colorScheme || "light")

      // Загружаем настройку fullscreen из localStorage
      const savedFullscreenEnabled = localStorage.getItem("fullscreenEnabled")
      const shouldEnableFullscreen = savedFullscreenEnabled !== "false" // По умолчанию true

      const startFullscreen = async () => {
        try {
          if (tg.requestFullscreen && shouldEnableFullscreen) {
            if (!tg.isFullscreen) {
              tg.requestFullscreen()
            }
            setTimeout(() => {
              if (!tg.isFullscreen && tg.requestFullscreen && shouldEnableFullscreen) {
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
      }

      const handleThemeChanged = () => {
        setTheme(tg.colorScheme || "light")
      }

      const handleViewportChanged = () => {
        updateSafeArea()
        updateContentSafeArea()
        if (tg.isExpanded === false && tg.expand) {
          tg.expand()
        }
      }

      // Установка начальных значений
      updateSafeArea()
      updateContentSafeArea()
      setIsFullscreen(tg.isFullscreen || false)

      // Подписка на события
      if (tg.onEvent) {
        tg.onEvent('fullscreenChanged', handleFullscreenChanged)
        tg.onEvent('themeChanged', handleThemeChanged)
        tg.onEvent('viewportChanged', handleViewportChanged)
      }

      // Получение данных пользователя
      const user = tg.initDataUnsafe?.user
      if (user) {
        setTgUserId(user.id.toString())
        setDisplayName(user.first_name || "Пользователь")
        setTgPhotoUrl(user.photo_url)
        setCurrentTelegramId(user.id.toString())
      }

      setIsReady(true)
    }
  }, [tg])

  // Загрузка сохраненных настроек
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setCurrency(parsed.currency || "RUB")
        setGoalSavings(parsed.goalSavings || 0)
        setTheme(parsed.theme || "light")
        setBalanceVisible(parsed.balanceVisible !== false)
        setFullscreenEnabled(parsed.fullscreenEnabled || false)
      }

      const session = localStorage.getItem(SESSION_KEY)
      if (session) {
        const sessionData = JSON.parse(session)
        if (sessionData?.email && sessionData?.token) {
          setUser({ email: sessionData.email, token: sessionData.token })
          setIsAuthenticated(true)
        }
      }
    } catch (e) {
      console.warn("Failed to parse settings", e)
    }
  }, [])

  // Сохранение настроек
  useEffect(() => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        currency,
        goalSavings,
        theme,
        balanceVisible,
        fullscreenEnabled,
      }),
    )
  }, [currency, goalSavings, theme, balanceVisible, fullscreenEnabled])

  // Применение темы
  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#111827' : '#ffffff'
    document.body.style.color = theme === 'dark' ? '#f3f4f6' : '#111827'
  }, [theme])

  // Получение текущей валюты
  const currentCurrency = currencies.find((c) => c.code === currency) || currencies[1]
  
  // Текущий кошелек
  const currentWallet = wallets.find(w => w.id === currentWalletId) || wallets[0]
  
  // Фильтрация транзакций по текущему кошельку
  const filteredTransactions = useMemo(() => {
    if (currentWalletId === 'main') {
      return transactions
    } else {
      return transactions.filter(tx => tx.walletId === currentWalletId)
    }
  }, [transactions, currentWalletId])

  // Функция переключения полноэкранного режима (оригинальная)
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

  // Функции для работы с транзакциями
  const addTransaction = () => {
    if (!amount || !category) return

    const newTx = {
      id: Date.now().toString(),
      type: transactionType,
      amount: Number(amount),
      description,
      category,
      date: new Date().toISOString(),
      created_by_telegram_id: tgUserId || null,
      created_by_name: displayName || null,
      telegram_photo_url: tgPhotoUrl || null,
      walletId: selectedTransactionWallet,
      liked: false,
      comments: []
    }

    setTransactions(prev => [newTx, ...prev])

    // Обновление баланса
    const amountNum = Number(amount)
    if (transactionType === "income") {
      setIncome(prev => prev + amountNum)
      setBalance(prev => prev + amountNum)
    } else if (transactionType === "expense") {
      setExpenses(prev => prev + amountNum)
      setBalance(prev => prev - amountNum)
    } else if (transactionType === "savings") {
      setSavings(prev => prev + amountNum)
      setBalance(prev => prev - amountNum)
    }

    setAmount("")
    setDescription("")
    setCategory("")
    setShowAddModal(false)
    vibrateSuccess()
  }

  const deleteTransaction = (txId) => {
    const tx = transactions.find((t) => t.id === txId)
    if (!tx) return

    setTransactions(prev => prev.filter(t => t.id !== txId))

    // Обновление баланса
    const amountNum = Number(tx.amount)
    if (tx.type === "income") {
      setIncome(prev => prev - amountNum)
      setBalance(prev => prev - amountNum)
    } else if (tx.type === "expense") {
      setExpenses(prev => prev - amountNum)
      setBalance(prev => prev + amountNum)
    } else if (tx.type === "savings") {
      setSavings(prev => prev - amountNum)
      setBalance(prev => prev + amountNum)
    }

    vibrateSuccess()
  }

  const toggleLike = (txId) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === txId ? { ...tx, liked: !tx.liked } : tx
    ))
    vibrate()
  }

  const openTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionDetails(true)
  }

  // Функции для работы с кошельками
  const handleWalletAdd = (walletData) => {
    const newWallet = {
      id: Date.now().toString(),
      ...walletData
    }
    setWallets(prev => [...prev, newWallet])
    setCurrentWalletId(newWallet.id)
    vibrateSuccess()
  }
  
  const handleWalletUpdate = (walletId, updates) => {
    setWallets(prev => prev.map(w => 
      w.id === walletId ? { ...w, ...updates } : w
    ))
    vibrateSuccess()
  }
  
  const handleWalletDelete = (walletId) => {
    if (walletId === 'main') {
      alert("Нельзя удалить основной кошелек")
      return
    }
    
    setWallets(prev => prev.filter(w => w.id !== walletId))
    if (currentWalletId === walletId) {
      setCurrentWalletId('main')
    }
    
    // Удаляем транзакции этого кошелька
    setTransactions(prev => prev.filter(tx => tx.walletId !== walletId))
    vibrateSuccess()
  }

  // Остальные функции из оригинала...
  const handleSheetTouchStart = (e) => {
    setSheetStartY(e.touches[0].clientY)
    setIsSheetDragging(true)
  }

  const handleSheetTouchMove = (e) => {
    if (!isSheetDragging) return
    const diff = e.touches[0].clientY - sheetStartY
    if (diff > 0) {
      setSheetDragOffset(diff)
    }
  }

  const handleSheetTouchEnd = () => {
    setIsSheetDragging(false)
    if (sheetDragOffset > 100) {
      setShowAddModal(false)
      setShowChart(false)
      setShowGoalModal(false)
      setShowSavingsSettingsModal(false)
      setShowTransactionDetails(false)
    }
    setSheetDragOffset(0)
  }

  if (!isReady || isLoading) {
    return (
      <div className={`w-full h-screen flex items-center justify-center gradient-bg`}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-white/80 font-medium">
            {!isReady ? "Инициализация..." : "Загрузка данных..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col overflow-hidden gradient-bg`}
      style={{
        paddingTop: isFullscreen ? (safeAreaInset.top || 0) : 0,
        paddingLeft: safeAreaInset.left || 0,
        paddingRight: safeAreaInset.right || 0,
      }}
    >
      {/* Основной контент - используем оригинальную структуру */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "overview" && (
          <div style={{ paddingTop: isFullscreen ? '48px' : '16px' }}>
            {/* Заголовок с балансом - оригинальный дизайн */}
            <header className="relative overflow-hidden px-4 pb-4">
              {/* Градиент на заднем плане */}
              <div
                className="absolute inset-0 opacity-30 blur-3xl"
                style={{
                  background:
                    theme === "dark"
                      ? "radial-gradient(circle at 50% 20%, #3b82f6 0%, transparent 70%)"
                      : "radial-gradient(circle at 50% 20%, #6366f1 0%, transparent 70%)",
                  top: "-20px",
                  height: "200px",
                }}
              />

              {/* Баланс и кнопки */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {balanceVisible ? formatCurrency(balance, currency, currentCurrency) : "••••••"}
                    </h1>
                    <button
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="p-2 rounded-full bg-white/20 backdrop-blur-md transition-all hover:bg-white/30"
                    >
                      {balanceVisible ? (
                        <EyeOff className="w-5 h-5 text-white/80" />
                      ) : (
                        <Eye className="w-5 h-5 text-white/80" />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-4 text-white/80 text-sm">
                    <div>
                      <span className="text-white/60">Доходы:</span>{" "}
                      <span className="text-green-400 font-medium">+{formatCurrency(income, currency, currentCurrency)}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Расходы:</span>{" "}
                      <span className="text-red-400 font-medium">-{formatCurrency(expenses, currency, currentCurrency)}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Копилка:</span>{" "}
                      <span className="text-blue-400 font-medium">{formatCurrency(savings, currency, currentCurrency)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowAddModal(true)
                    setShowNumKeyboard(false)
                    vibrate()
                  }}
                  className="p-3 rounded-full bg-white/20 backdrop-blur-md transition-all hover:bg-white/30 hover:scale-110"
                >
                  <Plus className="w-6 h-6 text-white" />
                </button>
              </div>
            </header>

            {/* Последние операции */}
            <div className="px-4">
              <div
                className={`rounded-2xl p-4 border backdrop-blur-lg shadow-lg ${
                  theme === "dark"
                    ? "bg-gray-900/70 border-gray-700/70"
                    : "bg-white/96 border-slate-200/80"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                    Последние операции {currentWalletId !== 'main' && `(${currentWallet.name})`}
                  </h3>
                  <button
                    onClick={() => setActiveTab("history")}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                  >
                    Все →
                  </button>
                </div>
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                        theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <History className={`w-6 h-6 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                    </div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      {currentWalletId !== 'main' ? `Нет операций в ${currentWallet.name}` : 'Пока нет операций'}
                    </p>
                    <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                      {currentWalletId !== 'main' ? 'Добавьте первую операцию в этот кошелек' : 'Добавьте первую транзакцию'}
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredTransactions.slice(0, 4).map((tx) => (
                      <TxRow
                        tx={tx}
                        key={tx.id}
                        categoriesMeta={categoriesMeta}
                        formatCurrency={(value) => formatCurrency(value, currency, currentCurrency)}
                        formatDate={formatDate}
                        theme={theme}
                        onDelete={deleteTransaction}
                        showCreator={showLinkedUsers}
                        onToggleLike={toggleLike}
                        onOpenDetails={openTransactionDetails}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "history" && (
          <div style={{ paddingTop: isFullscreen ? '48px' : '16px' }}>
            <div
              className={`backdrop-blur-lg rounded-2xl p-4 border shadow-lg mx-4 ${
                theme === "dark"
                  ? "bg-gray-900/70 border-gray-700/70"
                  : "bg-white/96 border-slate-200/80"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  История операций {currentWalletId !== 'main' && `(${currentWallet.name})`}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Кнопка выбора кошелька */}
                  <button
                    onClick={() => setSelectedTransactionWallet(
                      wallets[(wallets.findIndex(w => w.id === selectedTransactionWallet) + 1) % wallets.length].id
                    )}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md transition-all`}
                  >
                    <span className="text-lg">{wallets.find(w => w.id === selectedTransactionWallet)?.icon}</span>
                    <span className={`text-sm text-white`}>
                      {wallets.find(w => w.id === selectedTransactionWallet)?.name}
                    </span>
                    <ChevronDown className="w-4 h-4 text-white" />
                  </button>
                  {/* Кнопка экспорта */}
                  <button
                    onClick={() => alert('Экспорт в PDF будет доступен в следующем обновлении')}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-green-100 hover:bg-green-200"
                    }`}
                    title="Экспорт в PDF"
                  >
                    <Download className={`w-4 h-4 ${theme === "dark" ? "text-green-400" : "text-green-600"}`} />
                  </button>
                  {/* Кнопка диаграммы */}
                  <button
                    onClick={() => {
                      setShowChart(true)
                      setChartType("expense")
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-blue-100 hover:bg-blue-200"
                    }`}
                    title="Показать диаграмму"
                  >
                    <BarChart3 className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                  </button>
                </div>
              </div>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <History className={`w-6 h-6 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                  </div>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {currentWalletId !== 'main' ? `Нет операций в ${currentWallet.name}` : 'Нет операций'}
                  </p>
                </div>
              ) : (
                <div>
                  {filteredTransactions.map((tx) => (
                    <TxRow
                      tx={tx}
                      key={tx.id}
                      categoriesMeta={categoriesMeta}
                      formatCurrency={(value) => formatCurrency(value, currency, currentCurrency)}
                      formatDate={formatDate}
                      theme={theme}
                      onDelete={deleteTransaction}
                      showCreator={showLinkedUsers}
                      onToggleLike={toggleLike}
                      onOpenDetails={openTransactionDetails}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === "savings" && (
          <div style={{ paddingTop: isFullscreen ? '48px' : '16px' }}>
            {/* Вкладка копилки - оригинальный дизайн */}
            <div className="px-4">
              <div
                className={`rounded-2xl p-4 border backdrop-blur-lg shadow-lg ${
                  theme === "dark"
                    ? "bg-gray-900/70 border-gray-700/70"
                    : "bg-white/96 border-slate-200/80"
                }`}
              >
                <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  Копилка
                </h3>
                
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🐖</div>
                  <p className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                    {formatCurrency(savings, currency, currentCurrency)}
                  </p>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Накоплено
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTransactionType("savings")
                      setShowAddModal(true)
                      setShowNumKeyboard(false)
                      vibrate()
                    }}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all shadow-lg text-sm touch-none active:scale-95 ${
                      theme === "dark"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Пополнить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "settings" && (
          <div style={{ paddingTop: isFullscreen ? '48px' : '16px' }}>
            <div
              className={`backdrop-blur-lg rounded-2xl p-4 border shadow-lg mx-4 ${
                theme === "dark"
                  ? "bg-gray-900/70 border-gray-700/70"
                  : "bg-white/96 border-slate-200/80"
              }`}
            >
              <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                Настройки
              </h3>
              
              {/* Настройки кошельков */}
              <div className="mb-6">
                <button
                  onClick={() => {/* TODO: Добавить модальное окно */}}
                  className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                    theme === "dark"
                      ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                      : "bg-gray-50/90 border-gray-200/80 hover:bg-gray-100/90"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                    <div className="text-left">
                      <p className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                        Управление кошельками
                      </p>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        Добавить, редактировать или удалить кошельки
                      </p>
                    </div>
                  </div>
                  <Settings className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                </button>
              </div>

              {/* Полноэкранный режим - оригинальная реализация */}
              {tg && (tg.requestFullscreen || tg.exitFullscreen) && (
                <div className="mb-6">
                  <label
                    className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Полноэкранный режим
                  </label>
                  <button
                    onClick={toggleFullscreen}
                    style={{ touchAction: 'manipulation' }}
                    className={`w-full p-3 border rounded-xl transition-all text-left text-sm active:scale-95 flex items-center gap-2 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
                        : "bg-white border-slate-200 text-gray-900 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="w-4 h-4" />
                        <span>Выключить</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4" />
                        <span>Включить</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Статистика */}
              <div className={`p-4 rounded-xl border ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-700/50"
                  : "bg-gray-50/90 border-gray-200/80"
              }`}>
                <h4 className={`font-medium mb-3 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  Статистика
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Текущий баланс
                    </span>
                    <span className={`text-sm font-bold ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                      {formatCurrency(balance, currency, currentCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Общие доходы
                    </span>
                    <span className={`text-sm font-bold text-green-500`}>
                      +{formatCurrency(income, currency, currentCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Общие расходы
                    </span>
                    <span className={`text-sm font-bold text-red-500`}>
                      -{formatCurrency(expenses, currency, currentCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Накопления
                    </span>
                    <span className={`text-sm font-bold text-blue-500`}>
                      {formatCurrency(savings, currency, currentCurrency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Навигация - оригинальный дизайн */}
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
            className={`w-full max-w-md backdrop-blur-xl rounded-full p-1.5 border shadow-2xl flex items-center justify-around pointer-events-auto px-0 flex-row gap-px py-3.5 ${
              theme === "dark" ? "bg-gray-800/25 border-gray-700/30" : "bg-white/25 border-white/40"
            }`}
          >
            <NavButton
              active={activeTab === "overview"}
              onClick={() => {
                setActiveTab("overview")
                vibrate()
              }}
              icon={<Wallet className="h-4 w-7" />}
              theme={theme}
            />
            <NavButton
              active={activeTab === "history"}
              onClick={() => {
                setActiveTab("history")
                vibrate()
              }}
              icon={<History className="h-4 w-7" />}
              theme={theme}
            />
            <button
              onClick={() => {
                setShowAddModal(true)
                setShowNumKeyboard(false)
                vibrate()
              }}
              className="p-2.5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
            <NavButton
              active={activeTab === "savings"}
              onClick={() => {
                setActiveTab("savings")
                vibrate()
              }}
              icon={<PiggyBank className="h-4 w-7" />}
              theme={theme}
            />
            <NavButton
              active={activeTab === "settings"}
              onClick={() => {
                setActiveTab("settings")
                vibrate()
              }}
              icon={<Settings className="h-4 w-7" />}
              theme={theme}
            />
          </div>
        </div>
      </div>
      
      {/* Модальные окна */}
      <AddTransactionModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTransaction={addTransaction}
        theme={theme}
        wallets={wallets}
        selectedWalletId={selectedTransactionWallet}
        onWalletChange={setSelectedTransactionWallet}
      />
      
      <WalletSettingsModal
        show={false} // TODO: Добавить состояние
        onClose={() => {}}
        wallets={wallets}
        currentWalletId={currentWalletId}
        onWalletUpdate={handleWalletUpdate}
        onWalletDelete={handleWalletDelete}
        onWalletAdd={handleWalletAdd}
        theme={theme}
      />
    </div>
  )
}

export default FinanceApp
