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

// Импортируем наши новые модули
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
import { useWallets } from '../hooks/useWallets'
import { useTransactions } from '../hooks/useTransactions'
import AddTransactionModal from './modals/AddTransactionModal'
import WalletSettingsModal from './modals/WalletSettingsModal'

function FinanceApp() {
  // Основные состояния из оригинального файла
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
  const [showWalletSettings, setShowWalletSettings] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showAddDebtModal, setShowAddDebtModal] = useState(false)
  const [showSystemSettings, setShowSystemSettings] = useState(false)
  const [showSecondGoalModal, setShowSecondGoalModal] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  
  // Состояния для UI
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [safeAreaInset, setSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  const [contentSafeAreaInset, setContentSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  
  // Состояния для пользователя и авторизации
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [tgPhotoUrl, setTgPhotoUrl] = useState("")
  const [tgUserId, setTgUserId] = useState("")
  const [showLinkedUsers, setShowLinkedUsers] = useState(false)
  const [linkedUsers, setLinkedUsers] = useState([])
  const [currentTelegramId, setCurrentTelegramId] = useState("")
  
  // Состояния для транзакций и комментариев
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [detailsCommentText, setDetailsCommentText] = useState('')
  const [transactionComments, setTransactionComments] = useState({})
  
  // Состояния для второй цели
  const [secondGoalName, setSecondGoalName] = useState('')
  const [secondGoalAmount, setSecondGoalAmount] = useState(0)
  const [secondGoalSavings, setSecondGoalSavings] = useState(0)
  const [secondGoalInitialAmount, setSecondGoalInitialAmount] = useState(0)
  const [secondGoalInput, setSecondGoalInput] = useState('0')
  const [selectedSavingsGoal, setSelectedSavingsGoal] = useState('main')
  
  // Состояния для бюджетов
  const [budgets, setBudgets] = useState({})
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState('')
  const [budgetLimitInput, setBudgetLimitInput] = useState('')
  const [budgetPeriod, setBudgetPeriod] = useState('month')
  const [showBudgetKeyboard, setShowBudgetKeyboard] = useState(false)
  
  // Состояния для долгов
  const [debts, setDebts] = useState([])
  const [debtType, setDebtType] = useState('owe')
  const [debtPerson, setDebtPerson] = useState('')
  const [debtAmount, setDebtAmount] = useState('')
  const [debtDescription, setDebtDescription] = useState('')
  const [debtModalDragOffset, setDebtModalDragOffset] = useState(0)
  const [isDebtModalDragging, setIsDebtModalDragging] = useState(false)
  
  // Состояния для системных настроек
  const [systemSettingsDragOffset, setSystemSettingsDragOffset] = useState(0)
  const [isSystemSettingsDragging, setIsSystemSettingsDragging] = useState(false)
  
  // Состояния для графиков
  const [chartView, setChartView] = useState('pie')
  const [chartType, setChartType] = useState('expense')
  const [savingsTab, setSavingsTab] = useState('savings')
  
  // Состояния для модальных окон
  const [sheetDragOffset, setSheetDragOffset] = useState(0)
  const [selectedTransactionWallet, setSelectedTransactionWallet] = useState('main')
  
  // Используем наши хуки
  const {
    wallets,
    currentWalletId,
    currentWallet,
    setCurrentWalletId,
    addWallet,
    updateWallet,
    deleteWallet,
    getWalletOptions,
    isMainWallet,
    getWalletBalance,
    getWalletStats
  } = useWallets()
  
  const {
    transactions,
    likedTransactions,
    transactionComments: hookTransactionComments,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    toggleTransactionLike,
    addTransactionComment,
    deleteTransactionComment,
    getFilteredTransactions,
    getTransactionStats,
    getChartData: getHookChartData,
    calculateBalance
  } = useTransactions()
  
  // Фильтрация транзакций по текущему кошельку
  const filteredTransactions = useMemo(() => {
    if (currentWalletId === 'main') {
      return transactions
    } else {
      return transactions.filter(tx => tx.walletId === currentWalletId)
    }
  }, [transactions, currentWalletId])
  
  // Вибрации
  const { vibrate, vibrateSuccess, vibrateError, vibrateSelect } = createVibrationFunctions()
  
  // Telegram WebApp инициализация
  const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp
  
  useEffect(() => {
    if (!tg) return
    
    // Инициализация Telegram WebApp
    tg.ready()
    tg.expand()
    
    // Получение данных пользователя
    const user = tg.initDataUnsafe?.user
    if (user) {
      setTgUserId(user.id.toString())
      setDisplayName(user.first_name || "Пользователь")
      setTgPhotoUrl(user.photo_url)
      setCurrentTelegramId(user.id.toString())
    }
    
    // Обработка событий
    if (tg.onEvent) {
      tg.onEvent('fullscreenChanged', () => {
        setIsFullscreen(tg.isFullscreen || false)
      })
      
      tg.onEvent('themeChanged', () => {
        const newTheme = tg.colorScheme || "light"
        setTheme(newTheme)
      })
      
      tg.onEvent('viewportChanged', () => {
        if (tg.isExpanded === false && tg.expand) {
          tg.expand()
        }
      })
    }
    
    // Установка безопасных зон
    setSafeAreaInset({
      top: (tg.safeAreaInset && tg.safeAreaInset.top) || 0,
      bottom: (tg.safeAreaInset && tg.safeAreaInset.bottom) || 0,
      left: (tg.safeAreaInset && tg.safeAreaInset.left) || 0,
      right: (tg.safeAreaInset && tg.safeAreaInset.right) || 0,
    })
    
    setContentSafeAreaInset({
      top: (tg.contentSafeAreaInset && tg.contentSafeAreaInset.top) || 0,
      bottom: (tg.contentSafeAreaInset && tg.contentSafeAreaInset.bottom) || 0,
      left: (tg.contentSafeAreaInset && tg.contentSafeAreaInset.left) || 0,
      right: (tg.contentSafeAreaInset && tg.contentSafeAreaInset.right) || 0,
    })
    
    setIsFullscreen(tg.isFullscreen || false)
    setTheme(tg.colorScheme || "light")
    
    // Автоматический полноэкранный режим
    if (tg.requestFullscreen && tg.exitFullscreen && !fullscreenEnabled) {
      setTimeout(() => {
        try {
          tg.requestFullscreen()
          setFullscreenEnabled(true)
          localStorage.setItem("fullscreenEnabled", "true")
        } catch (e) {
          console.warn("Auto fullscreen failed", e)
        }
      }, 1000)
    }
    
    setIsReady(true)
  }, [tg, fullscreenEnabled])
  
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
          // Автовход
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
  
  // Функции для работы с транзакциями
  const handleAddTransaction = (transactionData) => {
    const newTransaction = addTransaction({
      ...transactionData,
      walletId: selectedTransactionWallet,
      created_by_telegram_id: tgUserId,
      created_by_name: displayName,
      telegram_photo_url: tgPhotoUrl,
    })
    
    // Обновление баланса
    const amount = Number(transactionData.amount)
    if (transactionData.type === 'income') {
      setIncome(prev => prev + amount)
      setBalance(prev => prev + amount)
    } else if (transactionData.type === 'expense') {
      setExpenses(prev => prev + amount)
      setBalance(prev => prev - amount)
    } else if (transactionData.type === 'savings') {
      setSavings(prev => prev + amount)
      setBalance(prev => prev - amount)
    }
    
    vibrateSuccess()
  }
  
  const handleDeleteTransaction = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId)
    if (!transaction) return
    
    if (!window.confirm("Удалить эту транзакцию?")) return
    
    deleteTransaction(transactionId)
    
    // Обновление баланса
    const amount = Number(transaction.amount)
    if (transaction.type === 'income') {
      setIncome(prev => prev - amount)
      setBalance(prev => prev - amount)
    } else if (transaction.type === 'expense') {
      setExpenses(prev => prev - amount)
      setBalance(prev => prev + amount)
    } else if (transaction.type === 'savings') {
      setSavings(prev => prev - amount)
      setBalance(prev => prev + amount)
    }
    
    vibrateSuccess()
  }
  
  const toggleLike = (transactionId) => {
    toggleTransactionLike(transactionId)
    vibrate()
  }
  
  const openTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionDetails(true)
  }
  
  // Функции для работы с кошельками
  const handleWalletUpdate = (walletId, updates) => {
    updateWallet(walletId, updates)
    vibrateSuccess()
  }
  
  const handleWalletDelete = (walletId) => {
    try {
      deleteWallet(walletId)
      // Удаляем транзакции этого кошелька
      setTransactions(prev => prev.filter(tx => tx.walletId !== walletId))
      vibrateSuccess()
    } catch (error) {
      alert(error.message)
      vibrateError()
    }
  }
  
  const handleWalletAdd = (walletData) => {
    const newWallet = addWallet(walletData)
    setCurrentWalletId(newWallet.id)
    vibrateSuccess()
  }
  
  // Функции для работы с комментариями
  const handleAddComment = (txId, commentText) => {
    const newComment = addTransactionComment(txId, {
      text: commentText,
      author: displayName,
      telegram_id: tgUserId,
    })
    
    // Сохранение на сервер (если нужно)
    if (user && user.email) {
      // API вызов для сохранения комментария
    }
  }
  
  const handleDeleteComment = (txId, commentId) => {
    deleteTransactionComment(txId, commentId)
    vibrate()
    
    // Удаление с сервера (если нужно)
    if (user && user.email) {
      // API вызов для удаления комментария
    }
  }
  
  // Экспорт в PDF
  const exportToPDF = async () => {
    // Здесь будет логика экспорта в PDF
    vibrateSelect()
    alert('Экспорт в PDF будет доступен в следующем обновлении')
  }
  
  // Функция переключения полноэкранного режима
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
  
  if (!isReady || isLoading) {
    return (
      <div className={`w-full h-screen flex items-center justify-center gradient-bg`}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-blue-600 animate-spin mx-auto mb-4 glass-button"></div>
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
      {/* Основной контент */}
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

              {/* Карусель кошельков */}
              <div className="relative h-32 mb-2">
                {wallets.map((wallet, index) => {
                  const isActive = wallet.id === currentWalletId
                  const translateY = index - wallets.findIndex(w => w.id === currentWalletId)
                  
                  return (
                    <div
                      key={wallet.id}
                      className={`absolute inset-x-0 flex items-center justify-center transition-all duration-500 cursor-pointer`}
                      style={{
                        transform: `translateY(${translateY * 40}px) scale(${isActive ? 1 : 0.8})`,
                        opacity: isActive ? 1 : 0.6,
                        zIndex: isActive ? 10 : 5 - Math.abs(translateY)
                      }}
                      onClick={() => setCurrentWalletId(wallet.id)}
                    >
                      <div
                        className={`p-4 rounded-2xl backdrop-blur-lg border transition-all ${
                          isActive
                            ? "bg-white/20 border-white/30 shadow-2xl"
                            : "bg-white/10 border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{ backgroundColor: wallet.color + '30' }}
                          >
                            {wallet.icon}
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">{wallet.name}</h3>
                            <p className="text-white/80 text-sm">
                              {formatCurrency(
                                filteredTransactions.reduce((sum, tx) => {
                                  if (tx.type === 'income') return sum + Number(tx.amount)
                                  if (tx.type === 'expense') return sum - Number(tx.amount)
                                  return sum
                                }, 0)
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Подсказка о наличии других кошельков */}
              {wallets.length > 1 && (
                <div className="flex justify-center gap-1 mb-4">
                  {wallets.map((wallet, index) => (
                    <div
                      key={wallet.id}
                      className={`w-2 h-2 rounded-full transition-all ${
                        wallet.id === currentWalletId
                          ? "bg-white/80 w-6"
                          : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Баланс и кнопки */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {balanceVisible ? formatCurrency(balance) : "••••••"}
                    </h1>
                    <button
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="p-2 rounded-full glass-button-matte transition-all"
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
                      <span className="text-green-400 font-medium">+{formatCurrency(income)}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Расходы:</span>{" "}
                      <span className="text-red-400 font-medium">-{formatCurrency(expenses)}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Копилка:</span>{" "}
                      <span className="text-blue-400 font-medium">{formatCurrency(savings)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="p-3 rounded-full glass-button-matte transition-all hover:scale-110"
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
                    className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors touch-none"
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
                        tx={{ ...tx, liked: false, comments: [] }}
                        key={tx.id}
                        categoriesMeta={categoriesMeta}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        theme={theme}
                        onDelete={handleDeleteTransaction}
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg glass-button-matte transition-all`}
                  >
                    <span className="text-lg">{wallets.find(w => w.id === selectedTransactionWallet)?.icon}</span>
                    <span className={`text-sm ${
                      theme === "dark" ? "text-white" : "text-gray-700"
                    }`}>
                      {wallets.find(w => w.id === selectedTransactionWallet)?.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 ${
                      theme === "dark" ? "text-white" : "text-gray-700"
                    }`} />
                  </button>
                  {/* Кнопка экспорта */}
                  <button
                    onClick={() => exportToPDF()}
                    className={`p-2 rounded-lg transition-colors touch-none ${
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
                    className={`p-2 rounded-lg transition-colors touch-none ${
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
                      tx={{ ...tx, liked: false, comments: [] }}
                      key={tx.id}
                      categoriesMeta={categoriesMeta}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      theme={theme}
                      onDelete={handleDeleteTransaction}
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
                  onClick={() => setShowWalletSettings(true)}
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
                      {formatCurrency(balance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Общие доходы
                    </span>
                    <span className={`text-sm font-bold text-green-500`}>
                      +{formatCurrency(income)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Общие расходы
                    </span>
                    <span className={`text-sm font-bold text-red-500`}>
                      -{formatCurrency(expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Накопления
                    </span>
                    <span className={`text-sm font-bold text-blue-500`}>
                      {formatCurrency(savings)}
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
              icon={<History className="h-4 w-[4px28]" />}
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
              active={activeTab === "settings"}
              onClick={() => {
                setActiveTab("settings")
                vibrate()
              }}
              icon={<Settings className="h-4 w-[px8]" />}
              theme={theme}
            />
          </div>
        </div>
      </div>
      
      {/* Модальные окна */}
      <AddTransactionModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTransaction={handleAddTransaction}
        theme={theme}
        wallets={wallets}
        selectedWalletId={selectedTransactionWallet}
        onWalletChange={setSelectedTransactionWallet}
      />
      
      <WalletSettingsModal
        show={showWalletSettings}
        onClose={() => setShowWalletSettings(false)}
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
