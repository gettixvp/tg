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
import NavButton from "./NavButton"
import CommentRow from "./CommentRow"
import TxRow from "./TxRow"
import NumericKeyboard from "./NumericKeyboard"
import HistoryTab from "./HistoryTab"
import OverviewTab from "./OverviewTab"
import SavingsTab from "./SavingsTab"
import SettingsTab from "./SettingsTab"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement)

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
  Долги: {
    color: "from-red-400 to-rose-400",
    icon: "📤",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    chartColor: "#ef4444",
  },
  "Возврат долга": {
    color: "from-green-400 to-emerald-400",
    icon: "📥",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    chartColor: "#10b981",
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

export default function FinanceApp({ apiUrl = API_BASE }) {
  const API_URL = apiUrl
  const mainContentRef = useRef(null)

  // UseState hooks should be at the top level of the component
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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
  const [chartType, setChartType] = useState("expense") // Тип транзакции для диаграммы
  const [transactionType, setTransactionType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false) // Declare rememberMe here
  const [authCurrency, setAuthCurrency] = useState("BYN")
  const [showPassword, setShowPassword] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [safeAreaInset, setSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  const [contentSafeAreaInset, setContentSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalInput, setGoalInput] = useState("50000")
  const [goalName, setGoalName] = useState("Моя цель")
  const [showSavingsSettingsModal, setShowSavingsSettingsModal] = useState(false)
  const [initialSavingsAmount, setInitialSavingsAmount] = useState(0)
  const [initialSavingsInput, setInitialSavingsInput] = useState("0")
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenEnabled, setFullscreenEnabled] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [showNumKeyboard, setShowNumKeyboard] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(3.2)

  const [linkedUsers, setLinkedUsers] = useState([])
  const [showLinkedUsers, setShowLinkedUsers] = useState(false)
  const [showLinkedUsersDropdown, setShowLinkedUsersDropdown] = useState(false)
  const [likedTransactions, setLikedTransactions] = useState(new Set())
  const [transactionComments, setTransactionComments] = useState({})
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [detailsCommentText, setDetailsCommentText] = useState('')
  
  const [secondGoalName, setSecondGoalName] = useState('')
  const [secondGoalAmount, setSecondGoalAmount] = useState(0)
  const [secondGoalSavings, setSecondGoalSavings] = useState(0)
  const [secondGoalInitialAmount, setSecondGoalInitialAmount] = useState(0)
  const [showSecondGoalModal, setShowSecondGoalModal] = useState(false)
  const [secondGoalInput, setSecondGoalInput] = useState('0')
  const [selectedSavingsGoal, setSelectedSavingsGoal] = useState('main') // 'main' или 'second'
  
  // Бюджеты и лимиты
  const [budgets, setBudgets] = useState({}) // { category: { limit: 500, period: 'month' } }
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState('')
  const [budgetLimitInput, setBudgetLimitInput] = useState('')
  const [budgetPeriod, setBudgetPeriod] = useState('month') // 'week', 'month', 'year'
  const [showBudgetKeyboard, setShowBudgetKeyboard] = useState(false)
  
  // Вид диаграммы (круговая, столбчатая, линейная)
  const [chartView, setChartView] = useState('pie') // 'pie', 'bar', 'line'
  
  // Вкладка копилки (Копилка / Долги)
  const [savingsTab, setSavingsTab] = useState('savings') // 'savings', 'debts'
  
  // Система долгов
  const [debts, setDebts] = useState([]) // Список долгов
  const [showAddDebtModal, setShowAddDebtModal] = useState(false)
  const [debtType, setDebtType] = useState('owe') // 'owe' (я должен) или 'owed' (мне должны)
  
  // Раскрываемое меню системных настроек
  const [showSystemSettings, setShowSystemSettings] = useState(false)
  const [debtPerson, setDebtPerson] = useState('')
  const [debtAmount, setDebtAmount] = useState('')
  const [debtDescription, setDebtDescription] = useState('')

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
        updateSafeArea()
        updateContentSafeArea()
      }

      const handleThemeChanged = () => {
        const newTheme = tg.colorScheme || "light"
        setTheme(newTheme)
      }

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
  }, [tg, fullscreenEnabled])

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
          if (data.fullscreenEnabled !== undefined) setFullscreenEnabled(data.fullscreenEnabled)
        }
      }

      // Загружаем сохраненные данные в поля (без автовхода)
      const savedCreds = localStorage.getItem("savedCredentials")
      if (savedCreds) {
        try {
          const { email: savedEmail, password: savedPassword } = JSON.parse(savedCreds)
          if (savedEmail && savedPassword) {
            setEmail(savedEmail)
            setPassword(atob(savedPassword)) // Декодируем из base64
            setRememberMe(true)
          }
        } catch (e) {
          console.warn("Failed to load saved credentials", e)
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
        fullscreenEnabled,
      }),
    )
  }, [currency, goalSavings, theme, balanceVisible, fullscreenEnabled])

  // Немедленное применение темы при изменении
  useEffect(() => {
    // Применяем тему к body для мгновенного эффекта
    document.body.style.backgroundColor = theme === 'dark' ? '#111827' : '#ffffff'
    document.body.style.color = theme === 'dark' ? '#f3f4f6' : '#111827'
    
    // Форсируем ре-рендер через небольшую задержку
    const timer = setTimeout(() => {
      // Триггерим обновление компонента
      setActiveTab(prev => prev)
    }, 10)
    
    return () => clearTimeout(timer)
  }, [theme])

  // Обработка реферальной ссылки при запуске
  useEffect(() => {
    const handleReferralLink = async () => {
      try {
        // Проверяем, есть ли start параметр в Telegram WebApp
        if (tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param && tgUserId) {
          const startParam = tg.initDataUnsafe.start_param
          
          console.log('Start param received:', startParam)
          
          let referrerEmail = null
          let referrerTelegramId = null
          
          // Парсим параметр в зависимости от формата
          if (startParam.startsWith('email_')) {
            // Формат: email_BASE64_tg_123456789
            const parts = startParam.split('_tg_')
            if (parts.length === 2) {
              const emailPart = parts[0].replace('email_', '')
              referrerEmail = atob(emailPart)
              referrerTelegramId = parts[1]
            }
          } else if (startParam.startsWith('tg_')) {
            // Формат: tg_123456789
            referrerTelegramId = startParam.replace('tg_', '')
          }
          
          if (!referrerTelegramId) {
            console.log('Invalid referral format')
            return
          }
          
          console.log('Referral link detected!')
          console.log('Referrer Email:', referrerEmail || 'none')
          console.log('Referrer Telegram ID:', referrerTelegramId)
          console.log('Current User Telegram ID:', tgUserId)
          console.log('Current User Email:', user?.email || 'none')
          
          // Проверяем, что пользователь не приглашает сам себя
          if (referrerTelegramId === String(tgUserId)) {
            console.log('Cannot link to yourself')
            return
          }
          
          // Проверяем, не связаны ли уже
          const linkKey = referrerEmail ? `linked_email_${referrerEmail}` : `linked_tg_${referrerTelegramId}`
          const alreadyLinked = sessionStorage.getItem(linkKey)
          if (alreadyLinked) {
            console.log('Already linked to this user')
            return
          }
          
          try {
            // Отправляем запрос на связывание аккаунтов
            const response = await fetch(`${API_BASE}/api/link`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                currentTelegramId: tgUserId,
                currentEmail: user?.email || null,
                currentUserName: displayName,
                referrerTelegramId: referrerTelegramId,
                referrerEmail: referrerEmail || null,
                referrerName: tgUser?.first_name || 'Пользователь'
              })
            })
            
            if (response.ok) {
              // Сохраняем, что уже связались
              sessionStorage.setItem(linkKey, 'true')
              
              alert(`✅ Вы успешно подключились к совместному кошельку!\n\nТеперь вы можете видеть общие расходы и доходы.`)
              vibrateSuccess()
              
              // Перезагружаем данные
              window.location.reload()
            } else {
              const error = await response.json()
              console.error('Link error:', error)
              alert(`Ошибка подключения: ${error.error || 'Попробуйте позже'}`)
            }
          } catch (e) {
            console.error('Failed to link accounts:', e)
            alert('Не удалось подключиться к кошельку. Проверьте интернет-соединение.')
          }
        }
      } catch (e) {
        console.error('Referral link handling error:', e)
      }
    }
    
    handleReferralLink()
  }, [tgUserId, tg, user])

  useEffect(() => {
    const keepAlive = async () => {
      try {
        // Пингуем backend чтобы не засыпал
        await fetch(`${API_BASE}/api/health`).catch(() => {})
        console.log('[KeepAlive] Backend pinged at', new Date().toLocaleTimeString())
      } catch (e) {
        console.warn('[KeepAlive] Failed to ping backend', e)
      }
    }

    // Первый пинг сразу при загрузке
    keepAlive()
    
    // Пинг каждые 14 минут (Render засыпает через 15 минут)
    const interval = setInterval(keepAlive, 14 * 60 * 1000)

    // Пинг при возврате в приложение
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[KeepAlive] App became visible, pinging backend')
        keepAlive()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
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

  const loadLinkedUsers = async (email) => {
    if (!email) return
    try {
      const resp = await fetch(`${API_BASE}/api/linked-users/${email}`)
      if (resp.ok) {
        const data = await resp.json()
        setLinkedUsers(data.linkedUsers || [])
        setShowLinkedUsers((data.linkedUsers || []).length > 1)
      }
    } catch (e) {
      console.warn("Failed to load linked users", e)
    }
  }

  const removeLinkedUser = async (telegramId) => {
    if (!user || !user.email) return

    try {
      const resp = await fetch(`${API_BASE}/api/linked-users/${user.email}/${telegramId}`, {
        method: "DELETE",
      })

      if (resp.ok) {
        vibrateSuccess()
        await loadLinkedUsers(user.email)
      } else {
        vibrateError()
        alert("Ошибка удаления пользователя")
      }
    } catch (e) {
      console.error("Remove linked user error:", e)
      vibrateError()
      alert("Ошибка удаления пользователя")
    }
  }

  async function applyUser(u, txs = [], isEmailAuth = false) {
    setUser(u)
    setIsAuthenticated(isEmailAuth)
    setBalance(Number(u.balance || 0))
    setIncome(Number(u.income || 0))
    setExpenses(Number(u.expenses || 0))
    setSavings(Number(u.savings_usd || 0)) // Ensure savings is treated as USD
    setGoalSavings(Number(u.goal_savings || 50000)) // Set goal savings from user data
    setGoalInput(String(Number(u.goal_savings || 50000)))
    setTransactions(txs || [])
    setIsLoading(false) // Завершена основная загрузка
    
    // Загрузка данных копилки
    if (u.goal_name) setGoalName(u.goal_name)
    if (u.initial_savings_amount !== undefined) setInitialSavingsAmount(Number(u.initial_savings_amount || 0))
    if (u.second_goal_name) setSecondGoalName(u.second_goal_name)
    if (u.second_goal_amount !== undefined) setSecondGoalAmount(Number(u.second_goal_amount || 0))
    if (u.second_goal_savings !== undefined) setSecondGoalSavings(Number(u.second_goal_savings || 0))
    if (u.second_goal_initial_amount !== undefined) setSecondGoalInitialAmount(Number(u.second_goal_initial_amount || 0))
    
    // Загрузка бюджетов
    if (u.budgets) {
      try {
        const parsedBudgets = typeof u.budgets === 'string' ? JSON.parse(u.budgets) : u.budgets
        setBudgets(parsedBudgets || {})
      } catch (e) {
        console.warn('Failed to parse budgets', e)
        setBudgets({})
      }
    }

    if (isEmailAuth && u.email) {
      loadLinkedUsers(u.email)
      loadDebts(u.email)
    }

    // Отложенная загрузка комментариев (не блокирует UI)
    if (txs && txs.length > 0) {
      // Загружаем только для первых 10 транзакций (видимые на экране)
      const visibleTxs = txs.slice(0, 10)
      
      // Параллельная загрузка вместо последовательной
      Promise.all(
        visibleTxs.map(async (tx) => {
          try {
            const resp = await fetch(`${API_BASE}/api/transactions/${tx.id}/comments`)
            if (resp.ok) {
              const data = await resp.json()
              const comments = data.comments || []
              if (comments.length > 0) {
                return { id: tx.id, comments }
              }
            }
          } catch (e) {
            console.warn(`Failed to load comments for tx ${tx.id}`, e)
          }
          return null
        })
      ).then((results) => {
        const commentsMap = {}
        results.forEach((result) => {
          if (result) {
            commentsMap[result.id] = result.comments
          }
        })
        setTransactionComments(commentsMap)
      })

      // Загрузка остальных комментариев в фоне
      if (txs.length > 10) {
        setTimeout(() => {
          const remainingTxs = txs.slice(10)
          Promise.all(
            remainingTxs.map(async (tx) => {
              try {
                const resp = await fetch(`${API_BASE}/api/transactions/${tx.id}/comments`)
                if (resp.ok) {
                  const data = await resp.json()
                  const comments = data.comments || []
                  if (comments.length > 0) {
                    return { id: tx.id, comments }
                  }
                }
              } catch (e) {
                console.warn(`Failed to load comments for tx ${tx.id}`, e)
              }
              return null
            })
          ).then((results) => {
            setTransactionComments((prev) => {
              const updated = { ...prev }
              results.forEach((result) => {
                if (result) {
                  updated[result.id] = result.comments
                }
              })
              return updated
            })
          })
        }, 1000) // Задержка 1 секунда перед загрузкой остальных
      }
    }
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
          telegram_id: telegramId,
          telegram_name: displayName,
        }),
      })

      if (!resp.ok) throw new Error("auth failed")
      const json = await resp.json()
      await applyUser(json.user, json.transactions || [], false)
    } catch (e) {
      console.warn("autoAuthTelegram failed", e)
      setIsLoading(false) // Завершить загрузку даже при ошибке
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
          telegram_id: tgUserId,
          telegram_name: displayName,
        }),
      })

      if (!resp.ok) throw new Error("auth failed")
      const json = await resp.json()
      await applyUser(json.user, json.transactions || [], true)
    } catch (e) {
      console.warn("autoAuth failed", e)
      setIsLoading(false) // Завершить загрузку даже при ошибке
    }
  }

  async function saveToServer(newBalance, newIncome, newExpenses, newSavings) {
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
        
        // Сохранение настроек копилки (включая вторую цель)
        await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goalName,
            initialSavingsAmount,
            secondGoalName,
            secondGoalAmount,
            secondGoalSavings,
            secondGoalInitialAmount,
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
      // Копилка - учитываем выбранную цель
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

    if (user && user.email) {
      try {
        await fetch(`${API_URL}/api/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: user.email,
            type: newTx.type,
            amount: newTx.amount,
            description: newTx.description,
            category: newTx.category,
            converted_amount_usd: convertedUSD || null,
            created_by_telegram_id: tgUserId || null,
            created_by_name: displayName || null,
            savings_goal: newTx.savings_goal,
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

    console.log("[v0] Deleting transaction:", tx)
    console.log("[v0] Current balance (type):", typeof balance, balance)
    console.log("[v0] Transaction amount (type):", typeof tx.amount, tx.amount)

    setTransactions((p) => p.filter((t) => t.id !== txId))

    let newBalance = Number(balance)
    let newIncome = Number(income)
    let newExpenses = Number(expenses)
    let newSavings = Number(savings)
    const txAmount = Number(tx.amount)
    const txConvertedUSD = Number(tx.converted_amount_usd || 0)

    if (tx.type === "income") {
      newIncome -= txAmount
      newBalance -= txAmount
      setIncome(newIncome)
      setBalance(newBalance)
      console.log("[v0] Deleted income. New balance:", newBalance)
    } else if (tx.type === "expense") {
      newExpenses -= txAmount
      newBalance += txAmount
      setExpenses(newExpenses)
      setBalance(newBalance)
      console.log("[v0] Deleted expense. New balance:", newBalance)
    } else {
      // Копилка - проверяем какая копилка была пополнена
      if (tx.savings_goal === 'second') {
        // Вторая копилка
        const newSecondGoalSavings = secondGoalSavings - txConvertedUSD
        setSecondGoalSavings(newSecondGoalSavings)
        console.log("[v0] Deleted second savings. New second goal savings:", newSecondGoalSavings)
      } else {
        // Основная копилка
        newSavings -= txConvertedUSD
        setSavings(newSavings)
        console.log("[v0] Deleted main savings. New savings:", newSavings)
      }
      newBalance += txAmount
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

  // Функции для работы с бюджетами
  const getCategorySpending = (category, period = 'month') => {
    const now = new Date()
    let startDate = new Date()
    
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    } else if (period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1)
    }
    
    const categoryTransactions = transactions.filter(tx => 
      tx.type === 'expense' && 
      tx.category === category &&
      new Date(tx.date || tx.created_at) >= startDate
    )
    
    return categoryTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
  }

  const getBudgetStatus = (category) => {
    const budget = budgets[category]
    if (!budget) return null
    
    const spent = getCategorySpending(category, budget.period)
    const limit = Number(budget.limit)
    const percentage = limit > 0 ? (spent / limit) * 100 : 0
    const remaining = limit - spent
    
    return {
      spent,
      limit,
      percentage: Math.min(percentage, 100),
      remaining,
      isOverBudget: spent > limit,
      isNearLimit: percentage >= 80 && percentage < 100
    }
  }

  // Функции для работы с долгами
  const loadDebts = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/api/user/${email}/debts`)
      const data = await res.json()
      if (data.debts) {
        setDebts(data.debts)
      }
    } catch (e) {
      console.error('Failed to load debts', e)
    }
  }

  const addDebt = async () => {
    const amount = Number(debtAmount)
    if (!debtPerson.trim() || !amount || amount <= 0) {
      vibrateError()
      alert('Заполните все обязательные поля')
      return
    }

    if (!user || !user.email) {
      vibrateError()
      alert('Необходимо войти в систему')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/user/${user.email}/debts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: debtType,
          person: debtPerson,
          amount: amount,
          description: debtDescription
        })
      })

      const data = await res.json()
      if (data.debt) {
        setDebts([data.debt, ...debts])
        setShowAddDebtModal(false)
        setDebtPerson('')
        setDebtAmount('')
        setDebtDescription('')
        vibrateSuccess()
      }
    } catch (e) {
      console.error('Failed to add debt', e)
      vibrateError()
      alert('Ошибка при добавлении долга')
    }
  }

  const deleteDebt = async (debtId) => {
    if (!user || !user.email) return

    try {
      await fetch(`${API_BASE}/api/user/${user.email}/debts/${debtId}`, {
        method: 'DELETE'
      })
      setDebts(debts.filter(d => d.id !== debtId))
      vibrateSuccess()
    } catch (e) {
      console.error('Failed to delete debt', e)
      vibrateError()
    }
  }

  const repayDebt = async (debt) => {
    if (!user || !user.email) return

    // Спрашиваем, хочет ли пользователь внести деньги в бюджет
    const shouldAddToBudget = window.confirm(
      `Долг погашен!\n\nВнести ${formatCurrency(debt.amount)} в общий бюджет?\n\n` +
      `ДА - деньги будут добавлены как ${debt.type === 'owe' ? 'расход' : 'доход'}\n` +
      `НЕТ - долг просто удалится`
    )

    if (shouldAddToBudget) {
      // Создаем транзакцию
      const transactionData = {
        amount: debt.amount,
        type: debt.type === 'owe' ? 'expense' : 'income', // Если я должен - расход, если мне должны - доход
        category: debt.type === 'owe' ? 'Долги' : 'Возврат долга',
        description: `Погашение долга: ${debt.person}${debt.description ? ' - ' + debt.description : ''}`,
        date: new Date().toISOString(),
        user_email: user.email,
        currency: currency
      }

      try {
        // Добавляем транзакцию
        const txRes = await fetch(`${API_BASE}/api/user/${user.email}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData)
        })

        const txData = await txRes.json()
        
        if (txData.transaction) {
          // Обновляем баланс
          const newBalance = debt.type === 'owe' 
            ? balance - debt.amount  // Я должен - уменьшаем баланс
            : balance + debt.amount  // Мне должны - увеличиваем баланс

          const newIncome = debt.type === 'owed' ? income + debt.amount : income
          const newExpenses = debt.type === 'owe' ? expenses + debt.amount : expenses

          setBalance(newBalance)
          setIncome(newIncome)
          setExpenses(newExpenses)
          setTransactions([txData.transaction, ...transactions])

          // Сохраняем на сервер
          await fetch(`${API_BASE}/api/user/${user.email}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              balance: newBalance,
              income: newIncome,
              expenses: newExpenses,
              savings: savings,
              goalSavings: goalSavings
            })
          })
        }
      } catch (e) {
        console.error('Failed to add transaction', e)
        vibrateError()
        alert('Ошибка при добавлении транзакции')
        return
      }
    }

    // Удаляем долг в любом случае
    await deleteDebt(debt.id)
  }

  // Функция транслитерации для PDF
  const transliterate = (text) => {
    const map = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
      'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
      'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts',
      'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
    }
    return text.split('').map(char => map[char] || char).join('')
  }

  const exportToPDF = async () => {
    try {
      vibrateSelect()
      
      // Динамический импорт jsPDF
      const { jsPDF } = await import('jspdf')
      
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      let yPos = 20
      
      // Заголовок
      doc.setFontSize(20)
      doc.setTextColor(59, 130, 246) // Синий цвет
      doc.text('Transaction History', pageWidth / 2, yPos, { align: 'center' })
      
      yPos += 10
      
      // Информация о пользователе
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      const userName = transliterate(user?.first_name || user?.email || 'Guest')
      doc.text(`User: ${userName}`, 20, yPos)
      yPos += 5
      doc.text(`Export Date: ${new Date().toLocaleDateString('en-US')}`, 20, yPos)
      
      yPos += 15
      
      // Сводка
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Summary:', 20, yPos)
      yPos += 8
      
      doc.setFontSize(10)
      doc.setTextColor(34, 197, 94) // Зеленый
      doc.text(`Income: ${formatCurrency(income)}`, 20, yPos)
      yPos += 6
      
      doc.setTextColor(239, 68, 68) // Красный
      doc.text(`Expenses: ${formatCurrency(expenses)}`, 20, yPos)
      yPos += 6
      
      doc.setTextColor(59, 130, 246) // Синий
      doc.text(`Balance: ${formatCurrency(balance)}`, 20, yPos)
      
      yPos += 15
      
      // Заголовок таблицы транзакций
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('Transactions:', 20, yPos)
      yPos += 10
      
      // Заголовки колонок
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text('Date', 20, yPos)
      doc.text('Category', 50, yPos)
      doc.text('Description', 90, yPos)
      doc.text('Amount', 160, yPos)
      
      yPos += 5
      doc.setLineWidth(0.5)
      doc.setDrawColor(200, 200, 200)
      doc.line(20, yPos, pageWidth - 20, yPos)
      
      yPos += 5
      
      // Транзакции
      const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(b.date || b.created_at) - new Date(a.date || a.created_at)
      )
      
      for (const tx of sortedTransactions) {
        if (yPos > pageHeight - 30) {
          doc.addPage()
          yPos = 20
        }
        
        const date = new Date(tx.date || tx.created_at).toLocaleDateString('en-US')
        const category = transliterate(tx.category || 'Other')
        const description = transliterate((tx.description || '').substring(0, 30))
        const amount = formatCurrency(tx.amount)
        
        doc.setFontSize(8)
        doc.setTextColor(0, 0, 0)
        doc.text(date, 20, yPos)
        doc.text(category, 50, yPos)
        doc.text(description, 90, yPos)
        
        // Цвет суммы в зависимости от типа
        if (tx.type === 'income') {
          doc.setTextColor(34, 197, 94) // Зеленый
          doc.text(`+${amount}`, 160, yPos)
        } else if (tx.type === 'expense') {
          doc.setTextColor(239, 68, 68) // Красный
          doc.text(`-${amount}`, 160, yPos)
        } else {
          doc.setTextColor(59, 130, 246) // Синий
          doc.text(amount, 160, yPos)
        }
        
        yPos += 6
      }
      
      // Футер
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
      }
      
      // Сохранение PDF с диалогом "Сохранить как"
      const fileName = `Transaction_History_${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}.pdf`
      
      // Создаем Blob из PDF
      const pdfBlob = doc.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      
      // Создаем временную ссылку для скачивания
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)
      
      // Запускаем скачивание (откроется диалог "Сохранить как")
      link.click()
      
      // Очищаем через несколько секунд
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(pdfUrl)
      }, 1000)
      
      vibrateSuccess()
    } catch (e) {
      console.error('Export error:', e)
      vibrateError()
      alert('Ошибка при экспорте. Попробуйте еще раз.')
    }
  }

  const inviteUser = () => {
    try {
      vibrateSelect()
      
      // Проверяем наличие Telegram ID
      if (!tgUserId) {
        alert('Не удалось получить ваш Telegram ID')
        return
      }
      
      // Формируем параметр приглашения
      // Если есть email - включаем его, если нет - только Telegram ID
      let startParam
      if (user && user.email) {
        // Пользователь с email аккаунтом приглашает
        const emailEncoded = btoa(user.email).replace(/=/g, '')
        startParam = `email_${emailEncoded}_tg_${tgUserId}`
      } else {
        // Пользователь без email приглашает
        startParam = `tg_${tgUserId}`
      }
      
      const botUsername = 'kvpoiskby_bot'
      
      // Формируем ссылку для открытия бота с параметром start
      const inviteUrl = `https://t.me/${botUsername}?start=${startParam}`
      
      // Текст приглашения
      const inviteText = `🎉 Присоединяйся к моему кошельку!\n\n` +
        `Я использую этот финансовый трекер для управления бюджетом. ` +
        `Нажми на ссылку, чтобы автоматически подключиться к моему аккаунту и следить за общими расходами!`
      
      console.log('Invite URL:', inviteUrl)
      console.log('Start param:', startParam)
      console.log('Inviter Telegram ID:', tgUserId)
      console.log('Inviter Email:', user?.email || 'none')
      
      // Проверяем, работаем ли в Telegram WebApp
      if (tg && tg.openTelegramLink) {
        // Используем Telegram WebApp API для открытия диалога выбора контакта
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(inviteText)}`
        tg.openTelegramLink(shareUrl)
      } else if (navigator.share) {
        // Fallback: используем Web Share API
        navigator.share({
          title: 'Приглашение в кошелек',
          text: inviteText,
          url: inviteUrl
        }).catch(err => {
          console.log('Share cancelled', err)
        })
      } else {
        // Fallback: копируем в буфер обмена
        const fullText = `${inviteText}\n\n${inviteUrl}`
        navigator.clipboard.writeText(fullText).then(() => {
          alert('Ссылка-приглашение скопирована в буфер обмена!\n\nОтправьте её другу в Telegram.')
          vibrateSuccess()
        }).catch(() => {
          alert(`Скопируйте эту ссылку и отправьте другу:\n\n${inviteUrl}`)
        })
      }
      
      vibrateSuccess()
    } catch (e) {
      console.error('Invite error:', e)
      vibrateError()
      alert('Ошибка при создании приглашения')
    }
  }

  const saveBudgetToServer = async (newBudgets) => {
    if (user && user.email) {
      try {
        await fetch(`${API_BASE}/api/user/${user.email}/budgets`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ budgets: newBudgets }),
        })
      } catch (e) {
        console.warn("Failed to save budgets", e)
      }
    }
  }

  // Функция пересчета баланса на основе транзакций
  const recalculateBalance = async () => {
    if (!window.confirm('Пересчитать баланс на основе всех транзакций? Это исправит любые ошибки в балансе.')) return
    
    console.log('[RECALCULATE] Начинаем пересчет...')
    console.log('[RECALCULATE] Текущий баланс:', balance)
    console.log('[RECALCULATE] Текущие доходы:', income)
    console.log('[RECALCULATE] Текущие расходы:', expenses)
    console.log('[RECALCULATE] Текущая копилка:', savings)
    console.log('[RECALCULATE] Всего транзакций:', transactions.length)
    
    // Пересчитываем на основе транзакций
    let newIncome = 0
    let newExpenses = 0
    let newSavingsUSD = 0
    let savingsInRUB = 0
    
    transactions.forEach(tx => {
      const amount = Number(tx.amount || 0)
      const convertedUSD = Number(tx.converted_amount_usd || 0)
      
      console.log('[RECALCULATE] Транзакция:', {
        type: tx.type,
        category: tx.category,
        amount,
        convertedUSD,
        savings_goal: tx.savings_goal
      })
      
      if (tx.type === 'income') {
        newIncome += amount
      } else if (tx.type === 'expense') {
        newExpenses += amount
      } else if (tx.type === 'savings') {
        savingsInRUB += amount
        if (tx.savings_goal !== 'second') {
          newSavingsUSD += convertedUSD
        }
      }
    })
    
    // Баланс = доходы - расходы - копилка (в рублях)
    const newBalance = newIncome - newExpenses - savingsInRUB
    
    console.log('[RECALCULATE] Пересчитанные значения:')
    console.log('[RECALCULATE] Новый баланс:', newBalance)
    console.log('[RECALCULATE] Новые доходы:', newIncome)
    console.log('[RECALCULATE] Новые расходы:', newExpenses)
    console.log('[RECALCULATE] Новая копилка USD:', newSavingsUSD)
    console.log('[RECALCULATE] Копилка в RUB:', savingsInRUB)
    
    // Обновляем состояния
    setBalance(newBalance)
    setIncome(newIncome)
    setExpenses(newExpenses)
    setSavings(newSavingsUSD)
    
    // Сохраняем на сервер
    if (user && user.email) {
      try {
        await fetch(`${API_BASE}/api/user/${user.email}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            balance: newBalance,
            income: newIncome,
            expenses: newExpenses,
            savings: newSavingsUSD,
            goalSavings,
          }),
        })
        
        vibrateSuccess()
        alert(`Баланс пересчитан!\n\nБаланс: ${newBalance} ₽\nДоходы: ${newIncome} ₽\nРасходы: ${newExpenses} ₽\nКопилка: ${newSavingsUSD} USD`)
      } catch (e) {
        console.error('[RECALCULATE] Ошибка сохранения:', e)
        vibrateError()
        alert('Ошибка сохранения на сервер')
      }
    }
  }

  // Кэшируем статусы бюджетов для автоматического обновления при изменении транзакций
  const budgetStatuses = useMemo(() => {
    console.log('[BUDGET DEBUG] Пересчет бюджетов...')
    console.log('[BUDGET DEBUG] Всего транзакций:', transactions.length)
    console.log('[BUDGET DEBUG] Бюджеты:', budgets)
    
    const statuses = {}
    Object.keys(budgets).forEach(category => {
      const budget = budgets[category]
      if (!budget) return
      
      // Рассчитываем расходы за период
      const now = new Date()
      let startDate = new Date()
      
      if (budget.period === 'week') {
        startDate.setDate(now.getDate() - 7)
      } else if (budget.period === 'month') {
        // Если задан день начала месяца
        if (budget.startDay) {
          const currentDay = now.getDate()
          const startDay = budget.startDay
          
          if (currentDay >= startDay) {
            // Текущий период начался в этом месяце
            startDate = new Date(now.getFullYear(), now.getMonth(), startDay)
          } else {
            // Текущий период начался в прошлом месяце
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, startDay)
          }
        } else {
          startDate.setMonth(now.getMonth() - 1)
        }
      } else if (budget.period === 'year') {
        startDate.setFullYear(now.getFullYear() - 1)
      }
      
      // ВАЖНО: Если есть дата создания бюджета, используем её как минимальную дату
      const budgetCreatedAt = budget.createdAt ? new Date(budget.createdAt) : null
      if (budgetCreatedAt && budgetCreatedAt > startDate) {
        startDate = budgetCreatedAt
      }
      
      console.log(`[BUDGET DEBUG] Категория: ${category}, Период: ${budget.period}`)
      console.log(`[BUDGET DEBUG] Дата создания бюджета:`, budgetCreatedAt)
      console.log(`[BUDGET DEBUG] Дата начала периода:`, startDate)
      
      const categoryTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date || tx.created_at)
        const isExpense = tx.type === 'expense'
        const isCategory = tx.category === category
        const isInPeriod = txDate >= startDate
        const isAfterBudgetCreated = budgetCreatedAt ? txDate >= budgetCreatedAt : true
        
        console.log(`[BUDGET DEBUG] Транзакция:`, {
          category: tx.category,
          type: tx.type,
          amount: tx.amount,
          date: tx.date || tx.created_at,
          isExpense,
          isCategory,
          isInPeriod,
          isAfterBudgetCreated
        })
        
        return isExpense && isCategory && isInPeriod && isAfterBudgetCreated
      })
      
      console.log(`[BUDGET DEBUG] Найдено транзакций для ${category}:`, categoryTransactions.length)
      
      const spent = categoryTransactions.reduce((sum, tx) => {
        const amount = Number(tx.amount || 0)
        console.log(`[BUDGET DEBUG] Добавляем к сумме: ${amount}`)
        return sum + amount
      }, 0)
      
      const limit = Number(budget.limit)
      const percentage = limit > 0 ? (spent / limit) * 100 : 0
      const remaining = limit - spent
      
      console.log(`[BUDGET DEBUG] Итого для ${category}:`, {
        spent,
        limit,
        percentage,
        remaining
      })
      
      statuses[category] = {
        spent,
        limit,
        percentage: Math.min(percentage, 100),
        remaining,
        isOverBudget: spent > limit,
        isNearLimit: percentage >= 80 && percentage < 100
      }
    })
    
    console.log('[BUDGET DEBUG] Финальные статусы:', statuses)
    return statuses
  }, [budgets, transactions])

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
        telegram_id: tgUserId,
        telegram_name: displayName,
        mode: authMode, // Добавляем режим (login или register)
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
      await applyUser(json.user, json.transactions || [], true)
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          email,
          token: btoa(password),
        }),
      )

      if (rememberMe) {
        // Сохраняем данные для автовхода
        localStorage.setItem("savedCredentials", JSON.stringify({ email, password: btoa(password) }))
      } else {
        localStorage.removeItem("savedCredentials")
      }

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

  const handleChangePassword = async () => {
    blurAll()
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      vibrateError()
      alert("Заполните все поля")
      return
    }

    if (newPassword !== confirmPassword) {
      vibrateError()
      alert("Новые пароли не совпадают")
      return
    }

    if (newPassword.length < 6) {
      vibrateError()
      alert("Пароль должен быть не менее 6 символов")
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/user/${user.email}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Ошибка сервера" }))
        alert(err.error || "Ошибка смены пароля")
        vibrateError()
        return
      }

      // Обновляем сохраненные данные
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          email: user.email,
          token: btoa(newPassword),
        }),
      )

      const savedCreds = localStorage.getItem("savedCredentials")
      if (savedCreds) {
        localStorage.setItem("savedCredentials", JSON.stringify({ 
          email: user.email, 
          password: btoa(newPassword) 
        }))
      }

      setShowChangePasswordModal(false)
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      alert("✅ Пароль успешно изменен!")
      vibrateSuccess()
    } catch (e) {
      console.error("Change password error:", e)
      alert("Ошибка смены пароля")
      vibrateError()
    }
  }

  const handleForgotPassword = () => {
    vibrateSelect()
    alert("🔜 Функция восстановления пароля будет доступна в следующем обновлении.\n\nПожалуйста, обратитесь к администратору или создайте новый аккаунт.")
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

  const toggleLike = (txId) => {
    vibrate()
    setLikedTransactions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(txId)) {
        newSet.delete(txId)
      } else {
        newSet.add(txId)
      }
      return newSet
    })
  }

  const openTransactionDetails = async (tx) => {
    setSelectedTransaction(tx)
    setShowTransactionDetails(true)
    vibrate()
    
    // Загрузка комментариев с сервера только если их еще нет в кэше
    if (user && user.email && !transactionComments[tx.id]) {
      try {
        const resp = await fetch(`${API_URL}/api/transactions/${tx.id}/comments`)
        if (resp.ok) {
          const data = await resp.json()
          setTransactionComments((prev) => ({
            ...prev,
            [tx.id]: data.comments || [],
          }))
        }
      } catch (e) {
        console.warn('Failed to load comments', e)
      }
    }
  }

  const addComment = async (txId, commentText) => {
    vibrate()
    const newComment = {
      id: Date.now(),
      author: displayName,
      text: commentText,
      date: new Date().toISOString(),
      telegram_id: tgUserId,
    }

    setTransactionComments((prev) => ({
      ...prev,
      [txId]: [...(prev[txId] || []), newComment],
    }))

    // Сохранение комментария на сервер
    if (user && user.email) {
      try {
        await fetch(`${API_URL}/api/transactions/${txId}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_email: user.email,
            comment: newComment,
          }),
        })
      } catch (e) {
        console.warn('Failed to save comment', e)
      }
    }
  }

  const deleteComment = async (txId, commentId) => {
    vibrate()
    setTransactionComments((prev) => ({
      ...prev,
      [txId]: (prev[txId] || []).filter(c => c.id !== commentId),
    }))

    // Удаление комментария с сервера
    if (user && user.email) {
      try {
        await fetch(`${API_URL}/api/transactions/${txId}/comment/${commentId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_email: user.email,
          }),
        })
      } catch (e) {
        console.warn('Failed to delete comment', e)
      }
    }
  }

  const handleSendDetailsComment = () => {
    if (detailsCommentText.trim() && selectedTransaction) {
      const commentTextToSend = detailsCommentText.trim()
      addComment(selectedTransaction.id, commentTextToSend)
      setDetailsCommentText('')
    }
  }

  const getChartData = (type) => {
    const filtered = transactions.filter((t) => t.type === type)
    const categoryTotals = {}

    filtered.forEach((tx) => {
      const cat = tx.category || "Другое"
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(tx.amount)
    })

    const labels = Object.keys(categoryTotals)
    const data = Object.values(categoryTotals)
    const colors = labels.map((cat) => categoriesMeta[cat]?.chartColor || "#64748b")

    return {
      labels: labels.map((label, i) => `${categoriesMeta[label]?.icon || ''} ${label}`),
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: theme === "dark" ? "#1f2937" : "#ffffff",
          hoverBorderWidth: 4,
          hoverBorderColor: theme === "dark" ? "#374151" : "#f3f4f6",
        },
      ],
    }
  }

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
          {activeTab === "overview" && (
            <OverviewTab
              theme={theme}
              goalName={goalName}
              secondGoalName={secondGoalName}
              secondGoalAmount={secondGoalAmount}
              savingsProgress={savingsProgress}
              savingsPct={savingsPct}
              secondGoalSavings={secondGoalSavings}
              budgets={budgets}
              budgetStatuses={budgetStatuses}
              categoriesMeta={categoriesMeta}
              formatCurrency={formatCurrency}
              setActiveTab={setActiveTab}
              setShowBudgetModal={setShowBudgetModal}
              setSelectedBudgetCategory={setSelectedBudgetCategory}
              setBudgetLimitInput={setBudgetLimitInput}
              vibrate={vibrate}
              transactions={transactions}
              likedTransactions={likedTransactions}
              transactionComments={transactionComments}
              deleteTransaction={deleteTransaction}
              showLinkedUsers={showLinkedUsers}
              toggleLike={toggleLike}
              openTransactionDetails={openTransactionDetails}
            />
          )}

          {activeTab === "history" && (
            <HistoryTab
              theme={theme}
              isFullscreen={isFullscreen}
              transactions={transactions}
              exportToPDF={exportToPDF}
              setShowChart={setShowChart}
              setChartType={setChartType}
              likedTransactions={likedTransactions}
              transactionComments={transactionComments}
              categoriesMeta={categoriesMeta}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              deleteTransaction={deleteTransaction}
              showLinkedUsers={showLinkedUsers}
              toggleLike={toggleLike}
              openTransactionDetails={openTransactionDetails}
            />
          )}

          {activeTab === "savings" && (
            <SavingsTab
              theme={theme}
              isFullscreen={isFullscreen}
              savingsTab={savingsTab}
              setSavingsTab={setSavingsTab}
              vibrateSelect={vibrateSelect}
              vibrate={vibrate}
              goalName={goalName}
              savingsPct={savingsPct}
              savings={savings}
              goalSavings={goalSavings}
              secondGoalName={secondGoalName}
              secondGoalAmount={secondGoalAmount}
              secondGoalSavings={secondGoalSavings}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              setShowGoalModal={setShowGoalModal}
              setTransactionType={setTransactionType}
              setShowAddModal={setShowAddModal}
              setShowNumKeyboard={setShowNumKeyboard}
              transactions={transactions}
              likedTransactions={likedTransactions}
              transactionComments={transactionComments}
              categoriesMeta={categoriesMeta}
              deleteTransaction={deleteTransaction}
              showLinkedUsers={showLinkedUsers}
              toggleLike={toggleLike}
              openTransactionDetails={openTransactionDetails}
              setShowSecondGoalModal={setShowSecondGoalModal}
              setShowSavingsSettingsModal={setShowSavingsSettingsModal}
              debts={debts}
              setShowAddDebtModal={setShowAddDebtModal}
              repayDebt={repayDebt}
              deleteDebt={deleteDebt}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab
              theme={theme}
              isFullscreen={isFullscreen}
              isAuthenticated={isAuthenticated}
              tgPhotoUrl={tgPhotoUrl}
              displayName={displayName}
              linkedUsers={linkedUsers}
              tgUserId={tgUserId}
              user={user}
              showLinkedUsersDropdown={showLinkedUsersDropdown}
              setShowLinkedUsersDropdown={setShowLinkedUsersDropdown}
              vibrate={vibrate}
              removeLinkedUser={removeLinkedUser}
              inviteUser={inviteUser}
              handleLogout={handleLogout}
              setShowAuthModal={setShowAuthModal}
              setAuthMode={setAuthMode}
              currency={currency}
              setCurrency={setCurrency}
              currencies={currencies}
              setTheme={setTheme}
              tg={tg}
              toggleFullscreen={toggleFullscreen}
              budgets={budgets}
              setShowBudgetModal={setShowBudgetModal}
              setSelectedBudgetCategory={setSelectedBudgetCategory}
              setBudgetLimitInput={setBudgetLimitInput}
              showSystemSettings={showSystemSettings}
              setShowSystemSettings={setShowSystemSettings}
              setShowChangePasswordModal={setShowChangePasswordModal}
              vibrateSelect={vibrateSelect}
              recalculateBalance={recalculateBalance}
              handleResetAll={handleResetAll}
            />
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
            {secondGoalName && secondGoalAmount > 0 && (
              <div className="mb-3">
                <label
                  className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  Выберите копилку
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSavingsGoal('main')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all touch-none ${
                      selectedSavingsGoal === 'main'
                        ? theme === "dark"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {goalName}
                  </button>
                  <button
                    onClick={() => setSelectedSavingsGoal('second')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all touch-none ${
                      selectedSavingsGoal === 'second'
                        ? theme === "dark"
                          ? "bg-purple-600 text-white"
                          : "bg-purple-500 text-white"
                        : theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {secondGoalName}
                  </button>
                </div>
              </div>
            )}
            <div className="mb-3">
              <label
                className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Название цели
              </label>
              <input
                type="text"
                value={selectedSavingsGoal === 'main' ? goalName : secondGoalName}
                onChange={(e) => {
                  if (selectedSavingsGoal === 'main') {
                    setGoalName(e.target.value)
                  } else {
                    setSecondGoalName(e.target.value)
                  }
                }}
                className={`w-full p-3 border rounded-xl transition-all text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="На что копите?"
              />
            </div>
            <div className="mb-4">
              <label
                className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Сумма цели
              </label>
              <input
                type="number"
                value={selectedSavingsGoal === 'main' ? goalInput : secondGoalInput}
                min={0}
                onChange={(e) => {
                  const val = e.target.value.replace(/^0+(?=\d)/, '')
                  if (selectedSavingsGoal === 'main') {
                    setGoalInput(val || '0')
                  } else {
                    setSecondGoalInput(val || '0')
                  }
                }}
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
                onClick={async () => {
                  const inputVal = selectedSavingsGoal === 'main' ? goalInput : secondGoalInput
                  const n = Number.parseInt(inputVal, 10)
                  if (!Number.isNaN(n) && n >= 0) {
                    if (selectedSavingsGoal === 'main') {
                      setGoalSavings(n)
                    } else {
                      setSecondGoalAmount(n)
                    }
                  }
                  // Сохраняем на сервер
                  await saveToServer(balance, income, expenses, savings)
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

      {showSavingsSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <div className="p-4">
            <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              Настройки копилки
            </h3>
            {secondGoalName && secondGoalAmount > 0 && (
              <div className="mb-3">
                <label
                  className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  Выберите копилку
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSavingsGoal('main')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all touch-none ${
                      selectedSavingsGoal === 'main'
                        ? theme === "dark"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {goalName}
                  </button>
                  <button
                    onClick={() => setSelectedSavingsGoal('second')}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all touch-none ${
                      selectedSavingsGoal === 'second'
                        ? theme === "dark"
                          ? "bg-purple-600 text-white"
                          : "bg-purple-500 text-white"
                        : theme === "dark"
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {secondGoalName}
                  </button>
                </div>
              </div>
            )}
            <div className="mb-4">
              <label
                className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Начальная сумма (USD)
              </label>
              <p className={`text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Укажите сумму, которая уже есть вне общего бюджета
              </p>
              <input
                type="text"
                inputMode="none"
                value={selectedSavingsGoal === 'main' ? (initialSavingsInput || initialSavingsAmount.toString()) : (initialSavingsInput || secondGoalInitialAmount.toString())}
                readOnly
                onClick={() => {
                  // Устанавливаем текущее значение в поле при открытии клавиатуры
                  if (selectedSavingsGoal === 'main') {
                    setInitialSavingsInput(initialSavingsAmount.toString())
                  } else {
                    setInitialSavingsInput(secondGoalInitialAmount.toString())
                  }
                  setShowNumKeyboard(true)
                }}
                className={`w-full p-3 border rounded-xl transition-all text-lg font-bold cursor-pointer ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="Например: 1000"
              />
            </div>
            
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowSavingsSettingsModal(false)}
                className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Отмена
              </button>
              <button
                onClick={async () => {
                  const inputVal = initialSavingsInput.trim()
                  if (!inputVal) {
                    alert('Введите сумму')
                    return
                  }
                  
                  const n = Number.parseFloat(inputVal)
                  if (Number.isNaN(n) || n < 0) {
                    alert('Введите корректную сумму')
                    return
                  }
                  
                  let newSavings = savings
                  
                  if (selectedSavingsGoal === 'main') {
                    // Для основной цели
                    const diff = n - initialSavingsAmount
                    setInitialSavingsAmount(n)
                    newSavings = savings + diff
                    setSavings(newSavings)
                    // Сохранение на сервер
                    await saveToServer(balance, income, expenses, newSavings)
                  } else {
                    // Для второй цели - устанавливаем начальную сумму и обновляем прогресс
                    const diff = n - secondGoalInitialAmount
                    setSecondGoalInitialAmount(n)
                    const newSecondGoalSavings = secondGoalSavings + diff
                    setSecondGoalSavings(newSecondGoalSavings)
                    
                    // Сохраняем напрямую с новыми значениями
                    if (user && user.email) {
                      try {
                        await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            goalName,
                            initialSavingsAmount,
                            secondGoalName,
                            secondGoalAmount,
                            secondGoalSavings: newSecondGoalSavings,
                            secondGoalInitialAmount: n,
                          }),
                        })
                      } catch (e) {
                        console.warn("Failed to save to server", e)
                      }
                    }
                  }
                  
                  setInitialSavingsInput('')
                  setShowSavingsSettingsModal(false)
                }}
                className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                  selectedSavingsGoal === 'main'
                    ? theme === "dark"
                      ? "bg-blue-700 hover:bg-blue-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                    : theme === "dark"
                      ? "bg-purple-700 hover:bg-purple-600 text-white"
                      : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
              >
                Сохранить
              </button>
            </div>

            {/* Кнопка сброса прогресса */}
            <div className="mt-3">
              <button
                onClick={async () => {
                  const goalNameToReset = selectedSavingsGoal === 'main' ? goalName : secondGoalName
                  if (confirm(`Вы уверены, что хотите сбросить прогресс копилки "${goalNameToReset}"?\n\nЭто обнулит накопленную сумму, но сохранит название и цель.`)) {
                    if (selectedSavingsGoal === 'main') {
                      // Сброс основной копилки
                      const newSavings = 0
                      const newInitialAmount = 0
                      setSavings(newSavings)
                      setInitialSavingsAmount(newInitialAmount)
                      
                      // Сохраняем на сервер
                      if (user && user.email) {
                        try {
                          await fetch(`${API_BASE}/api/user/${user.email}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              balance,
                              income,
                              expenses,
                              savings: newSavings,
                              goalSavings,
                            }),
                          })
                          
                          await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              goalName,
                              initialSavingsAmount: newInitialAmount,
                              secondGoalName,
                              secondGoalAmount,
                              secondGoalSavings,
                              secondGoalInitialAmount,
                            }),
                          })
                          
                          vibrateSuccess()
                          alert('Прогресс копилки сброшен!')
                        } catch (e) {
                          console.warn("Failed to reset main goal", e)
                          alert("Ошибка при сбросе прогресса")
                          vibrateError()
                        }
                      }
                    } else {
                      // Сброс второй копилки
                      const newSecondSavings = 0
                      const newSecondInitialAmount = 0
                      setSecondGoalSavings(newSecondSavings)
                      setSecondGoalInitialAmount(newSecondInitialAmount)
                      
                      // Сохраняем на сервер
                      if (user && user.email) {
                        try {
                          await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              goalName,
                              initialSavingsAmount,
                              secondGoalName,
                              secondGoalAmount,
                              secondGoalSavings: newSecondSavings,
                              secondGoalInitialAmount: newSecondInitialAmount,
                            }),
                          })
                          
                          vibrateSuccess()
                          alert('Прогресс копилки сброшен!')
                        } catch (e) {
                          console.warn("Failed to reset second goal", e)
                          alert("Ошибка при сбросе прогресса")
                          vibrateError()
                        }
                      }
                    }
                    
                    setShowSavingsSettingsModal(false)
                  }
                }}
                className={`w-full py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                  theme === "dark"
                    ? "bg-orange-700 hover:bg-orange-600 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                🔄 Сбросить прогресс
              </button>
            </div>

            {/* Кнопка удаления копилки */}
            {selectedSavingsGoal === 'second' && secondGoalName && (
              <div className="mt-3">
                <button
                  onClick={async () => {
                    if (confirm(`Вы уверены, что хотите удалить копилку "${secondGoalName}"?`)) {
                      // Сохраняем на сервер напрямую с пустыми значениями
                      if (user && user.email) {
                        try {
                          // Обновляем настройки копилки
                          await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              goalName,
                              initialSavingsAmount,
                              secondGoalName: '',
                              secondGoalAmount: 0,
                              secondGoalSavings: 0,
                              secondGoalInitialAmount: 0,
                            }),
                          })
                          
                          // Обновляем основные данные пользователя
                          await fetch(`${API_BASE}/api/user/${user.email}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              balance,
                              income,
                              expenses,
                              savings,
                              goalSavings,
                            }),
                          })
                        } catch (e) {
                          console.warn("Failed to delete second goal", e)
                          alert("Ошибка при удалении копилки")
                        }
                      }
                      
                      // Очищаем данные второй копилки в UI
                      setSecondGoalName('')
                      setSecondGoalAmount(0)
                      setSecondGoalSavings(0)
                      setSecondGoalInitialAmount(0)
                      setSecondGoalInput('0')
                      setSelectedSavingsGoal('main')
                      setShowSavingsSettingsModal(false)
                    }
                  }}
                  className={`w-full py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                    theme === "dark"
                      ? "bg-red-700 hover:bg-red-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  Удалить копилку
                </button>
              </div>
            )}
          </div>

            {showNumKeyboard && (
              <NumericKeyboard
                onNumberPress={(num) => {
                  if (initialSavingsInput.includes(".") && num === ".") return
                  setInitialSavingsInput((prev) => prev + num)
                }}
                onBackspace={() => setInitialSavingsInput((prev) => prev.slice(0, -1))}
                onDone={() => setShowNumKeyboard(false)}
                theme={theme}
              />
            )}
          </div>
        </div>
      )}

      {showSecondGoalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-4 shadow-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
          >
            <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              Вторая цель накопления
            </h3>
            <div className="mb-4">
              <label
                className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Название цели
              </label>
              <input
                type="text"
                value={secondGoalName}
                onChange={(e) => setSecondGoalName(e.target.value)}
                className={`w-full p-3 border rounded-xl transition-all text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="Например: Отпуск"
              />
            </div>
            <div className="mb-4">
              <label
                className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Целевая сумма (USD)
              </label>
              <input
                type="number"
                value={secondGoalInput}
                min={0}
                onChange={(e) => {
                  const val = e.target.value.replace(/^0+(?=\d)/, '')
                  setSecondGoalInput(val || '0')
                }}
                className={`w-full p-3 border rounded-xl transition-all text-lg font-bold ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
                placeholder="0"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSecondGoalModal(false)}
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
                  const n = Number.parseInt(secondGoalInput, 10)
                  if (!Number.isNaN(n) && n > 0 && secondGoalName.trim()) {
                    setSecondGoalAmount(n)
                    vibrateSuccess()
                  }
                  setShowSecondGoalModal(false)
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
            <div className="mb-4">
              <h3 className={`text-lg font-bold text-center mb-3 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                Диаграмма расходов
              </h3>
              
              {/* Кнопки переключения типа транзакции */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => {
                    setChartType('income')
                    vibrateSelect()
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    chartType === 'income'
                      ? theme === "dark" ? "bg-green-600 text-white" : "bg-green-500 text-white"
                      : theme === "dark" ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Доходы
                </button>
                <button
                  onClick={() => {
                    setChartType('expense')
                    vibrateSelect()
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    chartType === 'expense'
                      ? theme === "dark" ? "bg-red-600 text-white" : "bg-red-500 text-white"
                      : theme === "dark" ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Расходы
                </button>
                <button
                  onClick={() => {
                    setChartType('savings')
                    vibrateSelect()
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    chartType === 'savings'
                      ? theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                      : theme === "dark" ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Копилка
                </button>
              </div>
              
              {/* Кнопки переключения вида диаграммы */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Вид:
                </span>
              <div className="flex items-center gap-2">
                {/* Кнопки переключения вида диаграммы */}
                <button
                  onClick={() => {
                    setChartView('pie')
                    vibrate()
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    chartView === 'pie'
                      ? theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                      : theme === "dark" ? "bg-gray-700 text-gray-400 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <PieChart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setChartView('bar')
                    vibrate()
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    chartView === 'bar'
                      ? theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                      : theme === "dark" ? "bg-gray-700 text-gray-400 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setChartView('line')
                    vibrate()
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    chartView === 'line'
                      ? theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                      : theme === "dark" ? "bg-gray-700 text-gray-400 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <TrendingUpIcon className="w-4 h-4" />
                </button>
                <button onClick={() => setShowChart(false)} className="touch-none">
                  <X className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
                </button>
              </div>
              </div>
            </div>
            {transactions.filter((t) => t.type === chartType).length > 0 ? (
              <div className="w-full aspect-square">
                {chartView === 'pie' && (
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
                            font: { size: 13, weight: '500' },
                            usePointStyle: true,
                            pointStyle: 'circle',
                          },
                        },
                        tooltip: {
                          backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                          titleColor: theme === "dark" ? "#f3f4f6" : "#111827",
                          bodyColor: theme === "dark" ? "#e5e7eb" : "#374151",
                          borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                          borderWidth: 1,
                          padding: 12,
                          displayColors: true,
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                          }
                        },
                      },
                    }}
                  />
                )}
                {chartView === 'bar' && (
                  <Bar
                    data={getChartData(chartType)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                          titleColor: theme === "dark" ? "#f3f4f6" : "#111827",
                          bodyColor: theme === "dark" ? "#e5e7eb" : "#374151",
                          borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                          borderWidth: 1,
                          padding: 12,
                          callbacks: {
                            label: function(context) {
                              return `${context.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                          }
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            color: theme === "dark" ? "#e5e7eb" : "#1f2937",
                          },
                          grid: {
                            color: theme === "dark" ? "#374151" : "#e5e7eb",
                          }
                        },
                        x: {
                          ticks: {
                            color: theme === "dark" ? "#e5e7eb" : "#1f2937",
                          },
                          grid: {
                            display: false,
                          }
                        }
                      }
                    }}
                  />
                )}
                {chartView === 'line' && (
                  <Line
                    data={getChartData(chartType)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                          titleColor: theme === "dark" ? "#f3f4f6" : "#111827",
                          bodyColor: theme === "dark" ? "#e5e7eb" : "#374151",
                          borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                          borderWidth: 1,
                          padding: 12,
                          callbacks: {
                            label: function(context) {
                              return `${context.label}: ${formatCurrency(context.parsed.y)}`;
                            }
                          }
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            color: theme === "dark" ? "#e5e7eb" : "#1f2937",
                          },
                          grid: {
                            color: theme === "dark" ? "#374151" : "#e5e7eb",
                          }
                        },
                        x: {
                          ticks: {
                            color: theme === "dark" ? "#e5e7eb" : "#1f2937",
                          },
                          grid: {
                            display: false,
                          }
                        }
                      }
                    }}
                  />
                )}
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

      {showTransactionDetails && selectedTransaction && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={() => setShowTransactionDetails(false)}
        >
          {/* Header вне модального окна */}
          <div className="fixed top-4 left-0 right-0 flex justify-center z-10 px-4">
            <div className="flex items-center justify-between w-full max-w-md">
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-white"}`}>
                Детали операции
              </h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowTransactionDetails(false)
                }} 
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all touch-none"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          <div
            className={`w-full max-w-md rounded-t-2xl shadow-2xl ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
            style={{ 
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto flex-1 p-4" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}>

            {/* Иконка категории по центру */}
            <div className="flex justify-center mb-6">
              <div
                className={`flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${
                  (categoriesMeta[selectedTransaction.category] || categoriesMeta["Другое"]).color
                } shadow-2xl`}
              >
                <span className="text-4xl">
                  {(categoriesMeta[selectedTransaction.category] || categoriesMeta["Другое"]).icon}
                </span>
              </div>
            </div>

            {/* Информация о транзакции */}
            <div className="space-y-4 mb-6">
              <div className="text-center">
                <p
                  className={`text-3xl font-bold mb-2 ${
                    selectedTransaction.type === "income"
                      ? "text-emerald-500"
                      : selectedTransaction.type === "expense"
                        ? "text-rose-500"
                        : "text-blue-500"
                  }`}
                >
                  {selectedTransaction.type === "income" ? "+" : "-"}
                  {formatCurrency(selectedTransaction.amount)}
                </p>
                <p className={`text-lg font-semibold mb-1 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  {selectedTransaction.description || "Без описания"}
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {selectedTransaction.category}
                </p>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-xl ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
              }`}>
                <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Дата</span>
                <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                  {formatDate(selectedTransaction.date)}
                </span>
              </div>

              {showLinkedUsers && selectedTransaction.created_by_name && (
                <div className={`flex items-center justify-between p-3 rounded-xl ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                }`}>
                  <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Автор</span>
                  <div className="flex items-center gap-2">
                    {selectedTransaction.telegram_photo_url ? (
                      <img
                        src={selectedTransaction.telegram_photo_url}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        theme === "dark" ? "bg-blue-700" : "bg-blue-200"
                      }`}>
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                      {selectedTransaction.created_by_name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Комментарии */}
            <div className="mb-4">
              <h4 className={`text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Комментарии
              </h4>
              
              {transactionComments[selectedTransaction.id] && transactionComments[selectedTransaction.id].length > 0 ? (
                <div className="space-y-2 mb-3 overflow-visible">
                  {transactionComments[selectedTransaction.id].map((comment) => (
                    <CommentRow
                      key={comment.id}
                      comment={comment}
                      theme={theme}
                      tgUserId={tgUserId}
                      onDelete={() => deleteComment(selectedTransaction.id, comment.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className={`text-sm text-center py-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  Пока нет комментариев
                </p>
              )}

              {/* Поле ввода комментария */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={detailsCommentText}
                  onChange={(e) => setDetailsCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendDetailsComment()}
                  placeholder="Написать комментарий..."
                  className={`flex-1 p-2 rounded-xl border text-sm ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
                <button
                  onClick={handleSendDetailsComment}
                  className={`p-3 rounded-xl transition-all ${
                    detailsCommentText.trim()
                      ? theme === "dark"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                      : theme === "dark"
                        ? "bg-gray-700 text-gray-500"
                        : "bg-gray-200 text-gray-400"
                  }`}
                  disabled={!detailsCommentText.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Кнопка закрытия внизу */}
            <div className="p-4 border-t" style={{ borderColor: theme === "dark" ? "#374151" : "#e5e7eb" }}>
              <button
                onClick={() => setShowTransactionDetails(false)}
                className={`w-full py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Закрыть
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно списка бюджетов */}
      {showBudgetModal && !selectedBudgetCategory && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50"
          style={{ touchAction: "none" }}
        >
          <div
            className={`w-full max-w-md rounded-t-2xl shadow-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
            style={{ maxHeight: "85vh", display: "flex", flexDirection: "column" }}
          >
            {/* Контент - прокручиваемый */}
            <div 
              className="p-4 overflow-y-auto flex-1"
              style={{ 
                WebkitOverflowScrolling: "touch", 
                touchAction: "pan-y"
              }}
            >
              <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                Управление бюджетами
              </h3>
              {/* Список существующих бюджетов */}
              <div className="space-y-3">
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Установите лимиты расходов для категорий
                </p>
                
                {Object.keys(categoriesMeta).map((category) => {
                  const budget = budgets[category]
                  const meta = categoriesMeta[category]
                  
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedBudgetCategory(category)
                        setBudgetLimitInput(budget ? String(budget.limit) : '')
                        setBudgetPeriod(budget ? budget.period : 'month')
                        setShowBudgetKeyboard(false)
                        vibrate()
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-colors ${
                        budget
                          ? theme === "dark"
                            ? "bg-blue-900/20 border-blue-700/30"
                            : "bg-blue-50 border-blue-200"
                          : theme === "dark"
                            ? "bg-gray-700 border-gray-600 hover:bg-gray-650"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{meta.icon}</span>
                          <div>
                            <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                              {category}
                            </p>
                            {budget && (
                              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                {formatCurrency(budget.limit)} / {budget.period === 'week' ? 'неделю' : budget.period === 'month' ? 'месяц' : 'год'}
                              </p>
                            )}
                          </div>
                        </div>
                        {budget ? (
                          <span className={`text-xs font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                            Изменить
                          </span>
                        ) : (
                          <span className={`text-xs font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Добавить
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Футер - фиксированный */}
            <div className="px-4 py-3 border-t flex-shrink-0" style={{ borderColor: theme === "dark" ? "#374151" : "#e5e7eb" }}>
              <button
                onClick={() => {
                  setShowBudgetModal(false)
                  vibrate()
                }}
                className={`w-full py-2.5 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования бюджета */}
      {showBudgetModal && selectedBudgetCategory && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50"
          style={{ touchAction: "none" }}
        >
          <div
            className={`w-full max-w-md rounded-t-2xl shadow-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
            style={{ maxHeight: "85vh", display: "flex", flexDirection: "column" }}
          >
            <div
              className="p-4 overflow-y-auto flex-1"
              style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{categoriesMeta[selectedBudgetCategory]?.icon}</span>
                <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  {selectedBudgetCategory}
                </h3>
              </div>

              <div className="mb-4">
                <label
                  className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  Лимит расходов (USD)
                </label>
                <div
                  onClick={() => {
                    setShowBudgetKeyboard(true)
                    vibrate()
                  }}
                  className={`w-full p-4 border rounded-xl text-center text-3xl font-bold cursor-pointer transition-all ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-650"
                      : "bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100"
                  }`}
                  style={{ minHeight: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {budgetLimitInput || "0"}
                </div>
              </div>

              <div className="mb-4">
                <label
                  className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  Период
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'week', label: 'Неделя' },
                    { value: 'month', label: 'Месяц' },
                    { value: 'year', label: 'Год' }
                  ].map((period) => (
                    <button
                      key={period.value}
                      onClick={() => {
                        setBudgetPeriod(period.value)
                        vibrateSelect()
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all touch-none active:scale-95 ${
                        budgetPeriod === period.value
                          ? theme === "dark"
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : theme === "dark"
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              {budgetPeriod === 'month' && (
                <div className="mb-4">
                  <label
                    className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    День начала месяца (для автообнуления)
                  </label>
                  <select
                    value={budgets[selectedBudgetCategory]?.startDay || 1}
                    onChange={(e) => {
                      const newBudgets = {
                        ...budgets,
                        [selectedBudgetCategory]: {
                          ...budgets[selectedBudgetCategory],
                          startDay: Number(e.target.value)
                        }
                      }
                      setBudgets(newBudgets)
                      vibrateSelect()
                    }}
                    className={`w-full p-3 border rounded-xl text-sm font-medium ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-100"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>
                        {day} число каждого месяца
                      </option>
                    ))}
                  </select>
                  <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Бюджет будет автоматически обнуляться в этот день каждого месяца
                  </p>
                </div>
              )}
            </div>

            {/* Кастомная клавиатура */}
            {showBudgetKeyboard && (
            <NumericKeyboard
              onNumberPress={(num) => {
                setBudgetLimitInput((prev) => {
                  const current = prev || "0"
                  if (current === "0") return num
                  if (current.length >= 10) return current
                  return current + num
                })
                vibrateSelect()
              }}
              onBackspace={() => {
                setBudgetLimitInput((prev) => {
                  if (!prev || prev.length === 1) return "0"
                  return prev.slice(0, -1)
                })
                vibrate()
              }}
              onDone={() => {
                setShowBudgetKeyboard(false)
                vibrate()
              }}
              theme={theme}
            />
            )}

            {/* Кнопки внизу */}
            <div className="p-4 border-t flex gap-2" style={{ borderColor: theme === "dark" ? "#374151" : "#e5e7eb" }}>
              <button
                onClick={() => {
                  setSelectedBudgetCategory('')
                  setBudgetLimitInput('')
                  vibrate()
                }}
                className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Отмена
              </button>
              
              {budgets[selectedBudgetCategory] && (
                <>
                <button
                  onClick={async () => {
                    if (!window.confirm('Очистить прогресс бюджета? Счетчик начнется заново с текущего момента.')) return
                    
                    // Сбрасываем дату создания бюджета на текущий момент
                    const newBudgets = {
                      ...budgets,
                      [selectedBudgetCategory]: {
                        ...budgets[selectedBudgetCategory],
                        createdAt: new Date().toISOString()
                      }
                    }
                    setBudgets(newBudgets)
                    
                    // Сохраняем на сервер
                    await saveBudgetToServer(newBudgets)
                    
                    vibrateSuccess()
                    alert('Прогресс очищен! Бюджет начнет отслеживать транзакции с этого момента.')
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                    theme === "dark"
                      ? "bg-orange-700 hover:bg-orange-600 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  Очистить
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm('Удалить этот бюджет?')) return
                    
                    // Удаляем только бюджет, транзакции остаются в истории
                    const newBudgets = { ...budgets }
                    delete newBudgets[selectedBudgetCategory]
                    setBudgets(newBudgets)
                    
                    // Сохраняем на сервер
                    await saveBudgetToServer(newBudgets)
                    
                    setSelectedBudgetCategory('')
                    setBudgetLimitInput('')
                    setShowBudgetKeyboard(false)
                    vibrateSuccess()
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                    theme === "dark"
                      ? "bg-red-700 hover:bg-red-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  Удалить
                </button>
                </>
              )}
              
              <button
                onClick={async () => {
                  const limit = Number(budgetLimitInput)
                  if (!limit || limit <= 0) {
                    vibrateError()
                    alert('Введите корректную сумму')
                    return
                  }
                  
                  const newBudgets = {
                    ...budgets,
                    [selectedBudgetCategory]: {
                      limit,
                      period: budgetPeriod,
                      createdAt: budgets[selectedBudgetCategory]?.createdAt || new Date().toISOString(),
                      startDay: budgets[selectedBudgetCategory]?.startDay || 1
                    }
                  }
                  
                  setBudgets(newBudgets)
                  await saveBudgetToServer(newBudgets)
                  setSelectedBudgetCategory('')
                  setBudgetLimitInput('')
                  vibrateSuccess()
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

      {/* Модальное окно добавления долга */}
      {showAddDebtModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={() => {
            setShowAddDebtModal(false)
            setDebtPerson('')
            setDebtAmount('')
            setDebtDescription('')
          }}
        >
          <div
            className={`w-full max-w-md rounded-t-2xl shadow-2xl ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
            style={{ 
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Контент - прокручиваемый */}
            <div 
              className="p-6 overflow-y-auto flex-1"
              style={{ 
                WebkitOverflowScrolling: "touch", 
                touchAction: "pan-y"
              }}
            >
              <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                Добавить долг
              </h3>

            {/* Тип долга */}
            <div className="mb-4">
              <label className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Тип долга
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDebtType('owe')
                    vibrateSelect()
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm ${
                    debtType === 'owe'
                      ? theme === "dark"
                        ? "bg-red-600 text-white"
                        : "bg-red-500 text-white"
                      : theme === "dark"
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  📤 Я должен
                </button>
                <button
                  onClick={() => {
                    setDebtType('owed')
                    vibrateSelect()
                  }}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm ${
                    debtType === 'owed'
                      ? theme === "dark"
                        ? "bg-green-600 text-white"
                        : "bg-green-500 text-white"
                      : theme === "dark"
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  📥 Мне должны
                </button>
              </div>
            </div>

            {/* Кто должен */}
            <div className="mb-4">
              <label className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {debtType === 'owe' ? 'Кому я должен' : 'Кто мне должен'}
              </label>
              <input
                type="text"
                value={debtPerson}
                onChange={(e) => setDebtPerson(e.target.value)}
                placeholder="Имя человека"
                className={`w-full p-3 border rounded-xl ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>

            {/* Сумма */}
            <div className="mb-4">
              <label className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Сумма (USD)
              </label>
              <input
                type="number"
                value={debtAmount}
                onChange={(e) => setDebtAmount(e.target.value)}
                placeholder="0"
                className={`w-full p-3 border rounded-xl text-lg font-bold ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>

            {/* Описание */}
            <div className="mb-4">
              <label className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Описание (необязательно)
              </label>
              <textarea
                value={debtDescription}
                onChange={(e) => setDebtDescription(e.target.value)}
                placeholder="За что долг..."
                rows={3}
                className={`w-full p-3 border rounded-xl resize-none ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>

            {/* Кнопки */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddDebtModal(false)
                  setDebtPerson('')
                  setDebtAmount('')
                  setDebtDescription('')
                  vibrate()
                }}
                className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Отмена
              </button>
              <button
                onClick={addDebt}
                className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm ${
                  theme === "dark"
                    ? "bg-blue-700 hover:bg-blue-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Добавить
              </button>
            </div>
            </div>
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
            style={{ maxHeight: "85vh", display: "flex", flexDirection: "column" }}
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

              {transactionType === "savings" && secondGoalName && secondGoalAmount > 0 && (
                <div className="mb-3">
                  <label
                    className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Выберите копилку
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSavingsGoal('main')}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all touch-none ${
                        selectedSavingsGoal === 'main'
                          ? theme === "dark"
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                          : theme === "dark"
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {goalName}
                    </button>
                    <button
                      onClick={() => setSelectedSavingsGoal('second')}
                      className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all touch-none ${
                        selectedSavingsGoal === 'second'
                          ? theme === "dark"
                            ? "bg-purple-600 text-white"
                            : "bg-purple-500 text-white"
                          : theme === "dark"
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {secondGoalName}
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-3">
                {transactionType === "savings" && (
                  <p className={`text-xs mb-2 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                    💡 Введите сумму в {currentCurrency.symbol} - будет конвертировано в USD (курс: 1{" "}
                    {currentCurrency.code} ≈ {exchangeRate.toFixed(2)} USD)
                  </p>
                )}
                <input
                  type="text"
                  inputMode="none"
                  placeholder="Сумма"
                  value={amount}
                  onTouchStart={(e) => {
                    // Открываем цифровую клавиатуру максимально рано, предотвращаем системный фокус
                    e.preventDefault()
                    setShowNumKeyboard(true)
                    setIsKeyboardOpen(true)
                  }}
                  onClick={() => {
                    setShowNumKeyboard(true)
                    setIsKeyboardOpen(true)
                    // Убираем фокус с других полей
                    document.activeElement?.blur()
                  }}
                  onFocus={() => {
                    setShowNumKeyboard(true)
                    setIsKeyboardOpen(true)
                    // Убираем фокус сразу, чтобы не показывалась системная клавиатура
                    setTimeout(() => document.activeElement?.blur(), 0)
                  }}
                  readOnly
                  className={`w-full p-3 border rounded-xl mb-3 transition-all text-sm cursor-pointer ${
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
                onTouchStart={() => {
                  // Устанавливаем флаг заранее, до фокуса, чтобы интерфейс сразу подстроился
                  setIsKeyboardOpen(true)
                }}
                onFocus={() => {
                  setShowNumKeyboard(false)
                  setIsKeyboardOpen(true)
                }}
                onBlur={() => setIsKeyboardOpen(false)}
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
                onTouchStart={() => {
                  // Аналогично описанию — выставляем флаг заранее
                  setIsKeyboardOpen(true)
                }}
                onFocus={() => {
                  setShowNumKeyboard(false)
                  setIsKeyboardOpen(true)
                }}
                onBlur={() => setIsKeyboardOpen(false)}
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
                    setIsKeyboardOpen(false)
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
                  onClick={() => {
                    setShowNumKeyboard(false)
                    setIsKeyboardOpen(false)
                    addTransaction()
                  }}
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
                onDone={() => {
                  setShowNumKeyboard(false)
                  setIsKeyboardOpen(false)
                }}
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
            
            <div className="relative mb-3">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 pr-12 border rounded-xl transition-all text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors touch-none active:scale-95 ${
                  theme === "dark" 
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {authMode === "login" && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className={`text-xs mb-3 hover:underline transition-colors touch-none active:scale-95 text-left ${
                  theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                }`}
              >
                Забыли пароль?
              </button>
            )}

            <label
              className={`flex items-center gap-2 mb-3 cursor-pointer ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Запомнить меня</span>
            </label>

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

      {/* Модальное окно смены пароля */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-sm rounded-2xl p-4 shadow-2xl max-h-[90vh] overflow-y-auto ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              Смена пароля
            </h3>

            {/* Старый пароль */}
            <div className="relative mb-3">
              <input
                type={showOldPassword ? "text" : "password"}
                placeholder="Старый пароль"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={`w-full p-3 pr-12 border rounded-xl transition-all text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors touch-none active:scale-95 ${
                  theme === "dark" 
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Новый пароль */}
            <div className="relative mb-3">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Новый пароль (минимум 6 символов)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full p-3 pr-12 border rounded-xl transition-all text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors touch-none active:scale-95 ${
                  theme === "dark" 
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Подтверждение пароля */}
            <div className="relative mb-4">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Подтвердите новый пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full p-3 pr-12 border rounded-xl transition-all text-sm ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors touch-none active:scale-95 ${
                  theme === "dark" 
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-600" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowChangePasswordModal(false)
                  setOldPassword("")
                  setNewPassword("")
                  setConfirmPassword("")
                  setShowOldPassword(false)
                  setShowNewPassword(false)
                  setShowConfirmPassword(false)
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
                onClick={handleChangePassword}
                className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                  theme === "dark"
                    ? "bg-blue-700 hover:bg-blue-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Сменить пароль
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
                  setShowNumKeyboard(false)
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
                icon={<PiggyBank className="h-4 w-[4px28]" />}
                theme={theme}
              />
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
        
        /* Скрыть полосы прокрутки везде */
        *::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }
        
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
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
