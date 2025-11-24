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
import '../styles/modern-theme.css'

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
import OverviewTab from './tabs/OverviewTab'
import HistoryTab from './tabs/HistoryTab'
import SettingsTab from './tabs/SettingsTab'

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

  const createSheetTouchEndHandler = (callback) => () => {
    setIsSheetDragging(false)
    if (sheetDragOffset > 100) {
      callback()
    }
    setSheetDragOffset(0)
  }

  // Дополнительные переменные для совместимости
  const conversionRate = 0.016 // Пример курса
  const savingsProgress = savings / goalSavings
  const savingsPct = Math.round(savingsProgress * 100)

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
      className={`fixed inset-0 flex flex-col overflow-hidden ${
        theme === 'dark' ? 'gradient-bg' : 'modern-theme'
      }`}
      style={{
        paddingTop: isFullscreen ? (safeAreaInset.top || 0) : 0,
        paddingLeft: safeAreaInset.left || 0,
        paddingRight: safeAreaInset.right || 0,
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}
    >
      {/* Основной контент - используем табы */}
      <div 
        className="flex-1 overflow-hidden"
        style={{
          minHeight: "100%",
          touchAction: "pan-y",
        }}
      >
        {activeTab === "overview" && (
          <OverviewTab
            theme={theme}
            balance={balance}
            income={income}
            expenses={expenses}
            savings={savings}
            balanceVisible={balanceVisible}
            setBalanceVisible={setBalanceVisible}
            formatCurrency={(value) => formatCurrency(value, currency, currentCurrency)}
            currentWallet={currentWallet}
            wallets={wallets}
            currentWalletId={currentWalletId}
            setCurrentWalletId={setCurrentWalletId}
            filteredTransactions={filteredTransactions}
            setShowAddTransactionModal={setShowAddModal}
            setActiveTab={setActiveTab}
            categoriesMeta={categoriesMeta}
            formatDate={formatDate}
            deleteTransaction={deleteTransaction}
            showLinkedUsers={showLinkedUsers}
            toggleLike={toggleLike}
            openTransactionDetails={openTransactionDetails}
            budgets={budgets}
            showBudgetModal={showBudgetModal}
            setShowBudgetModal={setShowBudgetModal}
            setSelectedBudgetCategory={setSelectedBudgetCategory}
            isFullscreen={isFullscreen}
            goalName={goalName}
            savingsProgress={savingsProgress}
            savingsPct={savingsPct}
            setTransactionType={setTransactionType}
            setShowNumKeyboard={setShowNumKeyboard}
            setIsKeyboardOpen={setIsKeyboardOpen}
            vibrate={vibrate}
          />
        )}
        
        {activeTab === "history" && (
          <HistoryTab
            theme={theme}
            filteredTransactions={filteredTransactions}
            categoriesMeta={categoriesMeta}
            formatCurrency={(value) => formatCurrency(value, currency, currentCurrency)}
            formatDate={formatDate}
            deleteTransaction={deleteTransaction}
            showLinkedUsers={showLinkedUsers}
            toggleLike={toggleLike}
            openTransactionDetails={openTransactionDetails}
            wallets={wallets}
            selectedTransactionWallet={selectedTransactionWallet}
            setSelectedTransactionWallet={setSelectedTransactionWallet}
            setShowChart={setShowChart}
            setChartType={setChartType}
            isFullscreen={isFullscreen}
          />
        )}
        
        {activeTab === "savings" && (
          <div style={{ paddingTop: isFullscreen ? '48px' : '16px' }}>
            {/* Вкладка копилки - оригинальный дизайн */}
            <div className="px-4">
              {/* Верхние вкладки: Копилка / Долги */}
              <div className={`mx-4 p-1.5 rounded-full ${
                theme === "dark" ? "bg-gray-800/80" : "bg-gray-200/80"
              } backdrop-blur-lg`}>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setSavingsTab('savings')
                      vibrateSelect()
                    }}
                    className={`flex-1 py-3 rounded-full font-bold transition-all text-sm ${
                      savingsTab === 'savings'
                        ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-xl scale-105"
                        : theme === "dark"
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Копилка
                  </button>
                  <button
                    onClick={() => {
                      setSavingsTab('debts')
                      vibrateSelect()
                    }}
                    className={`flex-1 py-3 rounded-full font-bold transition-all text-sm ${
                      savingsTab === 'debts'
                        ? "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-xl scale-105"
                        : theme === "dark"
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Долги
                  </button>
                </div>
              </div>

              {savingsTab === 'savings' && (
                <div
                  className={`rounded-2xl p-4 text-white shadow-2xl ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
                      : "bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Копилка (USD)</h3>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-blue-100"}`}>
                        {goalName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setShowSecondGoalModal(true)
                          vibrate()
                        }}
                        className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all touch-none"
                        title="Добавить вторую цель"
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center py-6">
                    <div className="text-4xl mb-4">🐖</div>
                    <p className="text-2xl font-bold mb-2">
                      {formatCurrency(savings, "USD", { symbol: "$" })}
                    </p>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-blue-100"}`}>
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
              )}

              {savingsTab === 'debts' && (
                <div
                  className={`rounded-2xl p-4 border backdrop-blur-lg shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-900/70 border-gray-700/70"
                      : "bg-white/96 border-slate-200/80"
                  }`}
                >
                  <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                    Долги
                  </h3>
                  
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💸</div>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Пока нет долгов
                    </p>
                    <button
                      onClick={() => setShowAddDebtModal(true)}
                      className={`mt-4 px-4 py-2 rounded-xl font-medium transition-all text-sm touch-none ${
                        theme === "dark"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      Добавить долг
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === "settings" && (
          <SettingsTab
            theme={theme}
            currentWallet={currentWallet}
            wallets={wallets}
            currentWalletId={currentWalletId}
            setCurrentWalletId={setCurrentWalletId}
            handleWalletAdd={handleWalletAdd}
            handleWalletUpdate={handleWalletUpdate}
            handleWalletDelete={handleWalletDelete}
            balance={balance}
            income={income}
            expenses={expenses}
            savings={savings}
            formatCurrency={(value) => formatCurrency(value, currency, currentCurrency)}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            tg={tg}
          />
        )}
      </div>
      
      {/* Навигация - современный дизайн */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
        style={{
          paddingBottom: Math.max(safeAreaInset.bottom, 16),
          paddingLeft: safeAreaInset.left || 16,
          paddingRight: safeAreaInset.right || 16,
        }}
      >
        <div className="flex items-center justify-center">
          <div
            className={`w-full max-w-md nav-modern flex items-center justify-around pointer-events-auto px-6 py-4 ${
              theme === "dark" 
                ? "bg-gray-800/90 border-gray-700/50" 
                : "bg-white/95 border-gray-200/60"
            }`}
            style={{
              boxShadow: theme === 'dark' 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <NavButton
              active={activeTab === "overview"}
              onClick={() => {
                setActiveTab("overview")
                vibrate()
              }}
              icon={<Wallet className="h-5 w-5" />}
              theme={theme}
            />
            <NavButton
              active={activeTab === "history"}
              onClick={() => {
                setActiveTab("history")
                vibrate()
              }}
              icon={<History className="h-5 w-5" />}
              theme={theme}
            />
            <button
              onClick={() => {
                setShowAddModal(true)
                setShowNumKeyboard(false)
                vibrate()
              }}
              className={`p-3 rounded-full btn-gradient shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95`}
              style={{
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
            <NavButton
              active={activeTab === "savings"}
              onClick={() => {
                setActiveTab("savings")
                vibrate()
              }}
              icon={<PiggyBank className="h-5 w-5" />}
              theme={theme}
            />
            <NavButton
              active={activeTab === "settings"}
              onClick={() => {
                setActiveTab("settings")
                vibrate()
              }}
              icon={<Settings className="h-5 w-5" />}
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
        transactionType={transactionType}
        setTransactionType={setTransactionType}
        amount={amount}
        setAmount={setAmount}
        description={description}
        setDescription={setDescription}
        category={category}
        setCategory={setCategory}
        showNumKeyboard={showNumKeyboard}
        setShowNumKeyboard={setShowNumKeyboard}
        setIsKeyboardOpen={setIsKeyboardOpen}
        vibrateSelect={vibrateSelect}
        currentCurrency={currentCurrency}
        selectedSavingsGoal={selectedSavingsGoal}
        setSelectedSavingsGoal={setSelectedSavingsGoal}
        goalName={goalName}
        secondGoalName={secondGoalName}
        secondGoalAmount={secondGoalAmount}
        handleSheetTouchStart={handleSheetTouchStart}
        handleSheetTouchMove={handleSheetTouchMove}
        createSheetTouchEndHandler={createSheetTouchEndHandler}
        sheetDragOffset={sheetDragOffset}
        isSheetDragging={isSheetDragging}
        blurAll={blurAll}
        categoriesList={categoriesList}
        categoriesMeta={categoriesMeta}
        conversionRate={conversionRate}
        formatCurrency={formatCurrency}
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
