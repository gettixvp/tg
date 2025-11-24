import React, { useState, useEffect, useMemo, useRef, memo } from 'react'
import { 
  Home, 
  History, 
  Settings, 
  Plus, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  Trash2, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  LogOut, 
  LogIn, 
  User, 
  X, 
  Maximize2, 
  Minimize2, 
  CreditCard, 
  BarChart3, 
  Heart, 
  ChevronUp, 
  MessageCircle, 
  Send, 
  RefreshCw, 
  PieChart, 
  BarChart2, 
  Download, 
  UserPlus, 
  Users 
} from 'lucide-react'

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
import OverviewTab from './tabs/OverviewTab'
import HistoryTab from './tabs/HistoryTab'
import SettingsTab from './tabs/SettingsTab'

// Регистрация Chart.js элементов (если используется)
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from 'chart.js'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
)

function FinanceApp() {
  // Основные состояния
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
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false)
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
            setShowAddTransactionModal={setShowAddTransactionModal}
            setActiveTab={setActiveTab}
            categoriesMeta={categoriesMeta}
            formatDate={formatDate}
            deleteTransaction={handleDeleteTransaction}
            showLinkedUsers={showLinkedUsers}
            toggleLike={toggleLike}
            openTransactionDetails={openTransactionDetails}
            budgets={budgets}
            showBudgetModal={showBudgetModal}
            setShowBudgetModal={setShowBudgetModal}
            setSelectedBudgetCategory={setSelectedBudgetCategory}
            isFullscreen={isFullscreen}
          />
        )}
        
        {activeTab === "history" && (
          <HistoryTab
            theme={theme}
            currentWallet={currentWallet}
            currentWalletId={currentWalletId}
            wallets={wallets}
            selectedTransactionWallet={selectedTransactionWallet}
            setSelectedTransactionWallet={setSelectedTransactionWallet}
            filteredTransactions={filteredTransactions}
            categoriesMeta={categoriesMeta}
            formatCurrency={(value) => formatCurrency(value, currency, currentCurrency)}
            formatDate={formatDate}
            deleteTransaction={handleDeleteTransaction}
            showLinkedUsers={showLinkedUsers}
            toggleLike={toggleLike}
            openTransactionDetails={openTransactionDetails}
            exportToPDF={exportToPDF}
            setShowChart={setShowChart}
            setChartType={setChartType}
            isFullscreen={isFullscreen}
          />
        )}
        
        {activeTab === "settings" && (
          <SettingsTab
            theme={theme}
            setTheme={setTheme}
            currency={currency}
            setCurrency={setCurrency}
            currencies={currencies}
            user={user}
            handleLogout={() => {/* Логика выхода */}}
            setShowWalletSettings={setShowWalletSettings}
            setShowBudgetModal={setShowBudgetModal}
            setSelectedBudgetCategory={setSelectedBudgetCategory}
            setShowAddDebtModal={setShowAddDebtModal}
            setShowSystemSettings={setShowSystemSettings}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
            isFullscreenEnabled={fullscreenEnabled}
            setFullscreenEnabled={setFullscreenEnabled}
            balanceVisible={balanceVisible}
            setBalanceVisible={setBalanceVisible}
            balance={balance}
            income={income}
            expenses={expenses}
            savings={savings}
            formatCurrency={(value) => formatCurrency(value, currency, currentCurrency)}
            debts={debts}
            savingsTab={savingsTab}
            setSavingsTab={setSavingsTab}
            secondGoalName={secondGoalName}
            secondGoalAmount={secondGoalAmount}
            secondGoalSavings={secondGoalSavings}
            setShowSecondGoalModal={setShowSecondGoalModal}
            goalSavings={goalSavings}
            setIsAuthenticated={setIsAuthenticated}
            setUser={setUser}
            setBalance={setBalance}
            setIncome={setIncome}
            setExpenses={setExpenses}
            setSavings={setSavings}
            setTransactions={setTransactions}
          />
        )}
      </div>
      
      {/* Навигация */}
      <div className={`flex justify-around items-center p-4 border-t backdrop-blur-lg ${
        theme === "dark"
          ? "bg-gray-900/80 border-gray-700/60"
          : "bg-white/80 border-gray-200/60"
      }`}>
        <NavButton
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          icon={<Home className="w-5 h-5" />}
          theme={theme}
        />
        <NavButton
          active={activeTab === "history"}
          onClick={() => setActiveTab("history")}
          icon={<History className="w-5 h-5" />}
          theme={theme}
        />
        <NavButton
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          icon={<Settings className="w-5 h-5" />}
          theme={theme}
        />
      </div>
      
      {/* Модальные окна */}
      <AddTransactionModal
        show={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
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
