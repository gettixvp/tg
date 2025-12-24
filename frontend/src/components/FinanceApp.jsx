"use client"

import { useEffect, useState, useRef, memo, useMemo } from "react"
import "./RecentOperationsContainer.css"
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
  ChevronRight,
  Sparkles,
  Send,
  RefreshCw,
  PieChart,
  BarChart2,
  TrendingUpIcon,
  Download,
  UserPlus,
  Users,
  Shield,
} from "lucide-react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from "chart.js"
import { Pie, Bar, Line } from "react-chartjs-2"

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

const SavingsSettingsModalContent = ({
  theme,
  API_BASE,
  user,
  selectedSavingsGoal,
  setSelectedSavingsGoal,
  goalName,
  setGoalName,
  goalSavings,
  setGoalSavings,
  setGoalInput,
  savings,
  setSavings,
  initialSavingsAmount,
  setInitialSavingsAmount,
  secondGoalName,
  setSecondGoalName,
  secondGoalAmount,
  setSecondGoalAmount,
  secondGoalSavings,
  setSecondGoalSavings,
  secondGoalInitialAmount,
  setSecondGoalInitialAmount,
  setSecondGoalInput,
  thirdGoalName,
  setThirdGoalName,
  thirdGoalAmount,
  setThirdGoalAmount,
  thirdGoalSavings,
  setThirdGoalSavings,
  thirdGoalInitialAmount,
  setThirdGoalInitialAmount,
  setThirdGoalInput,
  balance,
  income,
  expenses,
  saveToServer,
  vibrateSuccess,
  vibrateError,
  onClose,
  formatCurrency,
}) => {
  const isSecondAvailable = Boolean(secondGoalName && secondGoalAmount > 0)
  const isThirdAvailable = Boolean(thirdGoalName && thirdGoalAmount > 0)
  const isSecond = selectedSavingsGoal === 'second' && isSecondAvailable
  const isThird = selectedSavingsGoal === 'third' && isThirdAvailable

  const currentTitle = isSecond ? secondGoalName : isThird ? thirdGoalName : goalName
  const currentTarget = isSecond ? secondGoalAmount : isThird ? thirdGoalAmount : goalSavings
  const currentSaved = isSecond ? secondGoalSavings : isThird ? thirdGoalSavings : savings
  const currentInitial = isSecond ? secondGoalInitialAmount : isThird ? thirdGoalInitialAmount : initialSavingsAmount
  const currentPct = Math.round((currentSaved / (currentTarget > 0 ? currentTarget : 1)) * 100)
  const safePct = Math.max(0, Math.min(100, Number.isFinite(currentPct) ? currentPct : 0))

  const [nameInput, setNameInput] = useState(String(currentTitle || ''))
  const [targetInput, setTargetInput] = useState(String(Number(currentTarget || 0)))
  const [initialInput, setInitialInput] = useState(String(Number(currentInitial || 0)))

  useEffect(() => {
    setNameInput(String(currentTitle || ''))
    setTargetInput(String(Number(currentTarget || 0)))
    setInitialInput(String(Number(currentInitial || 0)))
  }, [
    selectedSavingsGoal,
    secondGoalName,
    secondGoalAmount,
    thirdGoalName,
    thirdGoalAmount,
    goalName,
    goalSavings,
    initialSavingsAmount,
    secondGoalInitialAmount,
    thirdGoalInitialAmount,
  ])

  const resetProgress = async () => {
    const goalNameToReset = isSecond ? secondGoalName : isThird ? thirdGoalName : goalName
    if (!confirm(`Вы уверены, что хотите сбросить прогресс копилки "${goalNameToReset}"?\n\nЭто обнулит накопленную сумму, но сохранит название и цель.`)) {
      return
    }

    if (!isSecond && !isThird) {
      const newSavings = 0
      const newInitialAmount = 0
      setSavings(newSavings)
      setInitialSavingsAmount(newInitialAmount)
      if (user && user.email) {
        try {
          await fetch(`${API_BASE}/api/user/${user.email}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              balance,
              income,
              expenses,
              savings: newSavings,
              goalSavings,
            }),
          })
          await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              goalName,
              initialSavingsAmount: newInitialAmount,
              secondGoalName,
              secondGoalAmount,
              secondGoalSavings,
              secondGoalInitialAmount,
              thirdGoalName,
              thirdGoalAmount,
              thirdGoalSavings,
              thirdGoalInitialAmount,
            }),
          })
          vibrateSuccess && vibrateSuccess()
        } catch (e) {
          console.warn('Failed to reset main goal', e)
          vibrateError && vibrateError()
        }
      }
    } else if (isSecond) {
      const newSecondSavings = 0
      const newSecondInitialAmount = 0
      setSecondGoalSavings(newSecondSavings)
      setSecondGoalInitialAmount(newSecondInitialAmount)
      if (user && user.email) {
        try {
          await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              goalName,
              initialSavingsAmount,
              secondGoalName,
              secondGoalAmount,
              secondGoalSavings: newSecondSavings,
              secondGoalInitialAmount: newSecondInitialAmount,
              thirdGoalName,
              thirdGoalAmount,
              thirdGoalSavings,
              thirdGoalInitialAmount,
            }),
          })
          vibrateSuccess && vibrateSuccess()
        } catch (e) {
          console.warn('Failed to reset second goal', e)
          vibrateError && vibrateError()
        }
      }
    } else {
      const newThirdSavings = 0
      const newThirdInitialAmount = 0
      setThirdGoalSavings(newThirdSavings)
      setThirdGoalInitialAmount(newThirdInitialAmount)
      if (user && user.email) {
        try {
          await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              goalName,
              initialSavingsAmount,
              secondGoalName,
              secondGoalAmount,
              secondGoalSavings,
              secondGoalInitialAmount,
              thirdGoalName,
              thirdGoalAmount,
              thirdGoalSavings: newThirdSavings,
              thirdGoalInitialAmount: newThirdInitialAmount,
            }),
          })
          vibrateSuccess && vibrateSuccess()
        } catch (e) {
          console.warn('Failed to reset third goal', e)
          vibrateError && vibrateError()
        }
      }
    }
  }

  const deleteSecondGoal = async () => {
    if (!secondGoalName) return
    if (!confirm(`Вы уверены, что хотите удалить копилку "${secondGoalName}"?`)) return
    if (user && user.email) {
      try {
        await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goalName,
            initialSavingsAmount,
            secondGoalName: '',
            secondGoalAmount: 0,
            secondGoalSavings: 0,
            secondGoalInitialAmount: 0,
            thirdGoalName,
            thirdGoalAmount,
            thirdGoalSavings,
            thirdGoalInitialAmount,
          }),
        })
        await fetch(`${API_BASE}/api/user/${user.email}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            balance,
            income,
            expenses,
            savings,
            goalSavings,
          }),
        })
      } catch (e) {
        console.warn('Failed to delete second goal', e)
        alert('Ошибка при удалении копилки')
        return
      }
    }

    setSecondGoalName('')
    setSecondGoalAmount(0)
    setSecondGoalSavings(0)
    setSecondGoalInitialAmount(0)
    setSecondGoalInput('0')
    setSelectedSavingsGoal('main')
    onClose && onClose()
  }

  const deleteThirdGoal = async () => {
    if (!thirdGoalName) return
    if (!confirm(`Вы уверены, что хотите удалить копилку "${thirdGoalName}"?`)) return
    if (user && user.email) {
      try {
        await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goalName,
            initialSavingsAmount,
            secondGoalName,
            secondGoalAmount,
            secondGoalSavings,
            secondGoalInitialAmount,
            thirdGoalName: '',
            thirdGoalAmount: 0,
            thirdGoalSavings: 0,
            thirdGoalInitialAmount: 0,
          }),
        })
        await fetch(`${API_BASE}/api/user/${user.email}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            balance,
            income,
            expenses,
            savings,
            goalSavings,
          }),
        })
      } catch (e) {
        console.warn('Failed to delete third goal', e)
        alert('Ошибка при удалении копилки')
        return
      }
    }

    setThirdGoalName('')
    setThirdGoalAmount(0)
    setThirdGoalSavings(0)
    setThirdGoalInitialAmount(0)
    setThirdGoalInput('0')
    setSelectedSavingsGoal('main')
    onClose && onClose()
  }

  const saveSettings = async () => {
    const nm = String(nameInput || '').trim()
    const targetVal = Number.parseFloat(String(targetInput || '').trim())
    const initialVal = Number.parseFloat(String(initialInput || '').trim())

    if (!nm) {
      alert('Введите название')
      return
    }
    if (!Number.isFinite(targetVal) || targetVal <= 0) {
      alert('Введите корректную цель')
      return
    }
    if (!Number.isFinite(initialVal) || initialVal < 0) {
      alert('Введите корректную начальную сумму')
      return
    }

    if (!isSecond && !isThird) {
      const prevInitial = Number(initialSavingsAmount || 0)
      const diffInitial = initialVal - prevInitial

      setGoalName(nm)
      setGoalSavings(targetVal)
      setGoalInput(String(targetVal))

      setInitialSavingsAmount(initialVal)
      const newSavings = (savings || 0) + diffInitial
      setSavings(newSavings)

      await saveToServer(balance, income, expenses, newSavings)
    } else if (isSecond) {
      const prevInitial = Number(secondGoalInitialAmount || 0)
      const diffInitial = initialVal - prevInitial

      setSecondGoalName(nm)
      setSecondGoalAmount(targetVal)
      setSecondGoalInitialAmount(initialVal)
      const newSecondSaved = (secondGoalSavings || 0) + diffInitial
      setSecondGoalSavings(newSecondSaved)

      if (user && user.email) {
        try {
          await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              goalName,
              initialSavingsAmount,
              secondGoalName: nm,
              secondGoalAmount: targetVal,
              secondGoalSavings: newSecondSaved,
              secondGoalInitialAmount: initialVal,
              thirdGoalName,
              thirdGoalAmount,
              thirdGoalSavings,
              thirdGoalInitialAmount,
            }),
          })
        } catch (e) {
          console.warn('Failed to save savings settings', e)
        }
      }
    } else {
      const prevInitial = Number(thirdGoalInitialAmount || 0)
      const diffInitial = initialVal - prevInitial

      setThirdGoalName(nm)
      setThirdGoalAmount(targetVal)
      setThirdGoalInitialAmount(initialVal)
      const newThirdSaved = (thirdGoalSavings || 0) + diffInitial
      setThirdGoalSavings(newThirdSaved)

      if (user && user.email) {
        try {
          await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              goalName,
              initialSavingsAmount,
              secondGoalName,
              secondGoalAmount,
              secondGoalSavings,
              secondGoalInitialAmount,
              thirdGoalName: nm,
              thirdGoalAmount: targetVal,
              thirdGoalSavings: newThirdSaved,
              thirdGoalInitialAmount: initialVal,
            }),
          })
        } catch (e) {
          console.warn('Failed to save savings settings', e)
        }
      }
    }

    onClose && onClose()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
          Настройки копилки
        </h3>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetProgress}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all touch-none active:scale-95 ${
              theme === 'dark'
                ? 'bg-gray-800/70 text-gray-100 hover:bg-gray-700/70'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
            aria-label="Сброс"
            title="Сброс"
          >
            Сброс
          </button>

          {isSecond && secondGoalName && (
            <button
              type="button"
              onClick={deleteSecondGoal}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all touch-none active:scale-95 ${
                theme === 'dark' ? 'bg-red-600/20 hover:bg-red-600/30' : 'bg-red-50 hover:bg-red-100'
              }`}
              aria-label="Удалить копилку"
              title="Удалить копилку"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          )}

          {isThird && thirdGoalName && (
            <button
              type="button"
              onClick={deleteThirdGoal}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all touch-none active:scale-95 ${
                theme === 'dark' ? 'bg-red-600/20 hover:bg-red-600/30' : 'bg-red-50 hover:bg-red-100'
              }`}
              aria-label="Удалить копилку"
              title="Удалить копилку"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      </div>

      {(isSecondAvailable || isThirdAvailable) && (
        <div className={`mb-4 p-1.5 rounded-full ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-200/80'} backdrop-blur-sm`}>
          {(() => {
            const items = [
              { key: 'main', label: 'Основная' },
              { key: 'second', label: 'Вторая' },
            ]
            if (isThirdAvailable) items.push({ key: 'third', label: 'Третья' })
            const idx = Math.max(0, items.findIndex((i) => i.key === selectedSavingsGoal))
            const w = `${100 / items.length}%`

            return (
              <div className="flex gap-1 relative overflow-hidden rounded-full">
                <div
                  className="absolute rounded-full"
                  style={{
                    top: 6,
                    bottom: 6,
                    left: 6,
                    width: `calc(${w} - 12px)`,
                    transform: `translateX(${idx * 100}%)`,
                    transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
                    backgroundColor: '#000000',
                  }}
                />
                {items.map((it) => (
                  <button
                    key={it.key}
                    type="button"
                    onClick={() => setSelectedSavingsGoal(it.key)}
                    className="flex-1 py-2.5 rounded-full font-bold transition-all text-sm relative touch-none flex items-center justify-center text-center"
                    style={{
                      color: selectedSavingsGoal === it.key ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#6B7280'),
                    }}
                  >
                    {it.label}
                  </button>
                ))}
              </div>
            )
          })()}
        </div>
      )}

      <div
        className={`rounded-[40px] p-4 mb-4 relative overflow-hidden border ${
          theme === 'dark' ? 'bg-gray-900/40 border-white/10' : 'bg-white border-gray-200'
        }`}
        style={{
          backgroundImage: isSecond
            ? theme === 'dark'
              ? 'linear-gradient(135deg, rgba(168,85,247,0.22), rgba(236,72,153,0.10))'
              : 'linear-gradient(135deg, rgba(168,85,247,0.18), rgba(236,72,153,0.08))'
            : isThird
              ? theme === 'dark'
                ? 'linear-gradient(135deg, rgba(34,197,94,0.20), rgba(16,185,129,0.10))'
                : 'linear-gradient(135deg, rgba(34,197,94,0.16), rgba(16,185,129,0.08))'
              : theme === 'dark'
                ? 'linear-gradient(135deg, rgba(59,130,246,0.22), rgba(99,102,241,0.10))'
                : 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.08))',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className={`text-[17px] leading-snug font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}
              style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
            >
              {currentTitle || 'Копилка'}
            </div>
            <div
              className={`text-xs mt-1 tabular-nums ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              {formatCurrency(currentSaved, 'USD')} из {formatCurrency(currentTarget, 'USD')}
            </div>
          </div>
          <div
            className={`px-3 py-1.5 rounded-2xl font-bold tabular-nums ${
              theme === 'dark' ? 'bg-black/25 text-gray-100 border border-white/10' : 'bg-white/80 text-gray-900 border border-black/5'
            }`}
            style={{ whiteSpace: 'nowrap' }}
          >
            {safePct}%
          </div>
        </div>

        <div className={`mt-3 h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-black/20' : 'bg-black/10'}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isSecond
                ? theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600'
                : isThird
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                    : 'bg-gradient-to-r from-emerald-600 to-cyan-600'
                  : theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600'
            }`}
            style={{ width: `${safePct}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className={`block font-medium mb-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Название
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className={`w-full p-3 border rounded-[40px] transition-all text-sm ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
            placeholder="Например: Отпуск"
          />
        </div>

        <div>
          <label className={`block font-medium mb-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Цель (USD)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value.replace(/[^0-9.]/g, ''))}
            className={`w-full p-3 border rounded-[40px] transition-all text-sm ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
            placeholder="Например: 50000"
          />
        </div>

        <div>
          <label className={`block font-medium mb-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Начальная сумма (USD)
          </label>
          <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Сумма, которая уже есть вне общего бюджета
          </p>
          <input
            type="text"
            inputMode="decimal"
            value={initialInput}
            onChange={(e) => setInitialInput(e.target.value.replace(/[^0-9.]/g, ''))}
            className={`w-full p-3 border rounded-[40px] transition-all text-sm ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            }`}
            placeholder="Например: 1000"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={saveSettings}
          className={`w-full py-3 rounded-[40px] font-medium transition-all text-sm touch-none active:scale-95 ${
            isSecond
              ? theme === 'dark'
                ? 'bg-purple-700 hover:bg-purple-600 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
              : theme === 'dark'
                ? 'bg-blue-700 hover:bg-blue-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Сохранить
        </button>
      </div>
    </div>
  )
}

const WalletMemberRow = ({ member, theme, isSelf, onOpen }) => {
  const statusLabel = member.status === 'blocked' ? 'Заблокирован' : 'Активен'
  const roleLabel = member.role === 'owner' ? 'Владелец' : null

  const handleOpen = (e) => {
    try {
      e?.preventDefault?.()
      e?.stopPropagation?.()
    } catch (err) {
      // ignore
    }
    onOpen && onOpen(member)
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      onPointerUp={handleOpen}
      onTouchEnd={handleOpen}
      className={`w-full p-3 rounded-[40px] border text-left transition-all active:scale-[0.99] ${
        theme === "dark" ? "bg-gray-800/40 border-gray-700/40" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt="Avatar"
            className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <User className={`w-5 h-5 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold truncate ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
            {member.telegram_name || `TG ${member.member_telegram_id}`}
          </p>
          <div className="flex items-center gap-2">
            <p className={`text-xs truncate ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {statusLabel}
            </p>
            {roleLabel && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${theme === 'dark' ? 'border-purple-600/40 text-purple-300 bg-purple-900/20' : 'border-purple-200 text-purple-700 bg-purple-50'}`}>
                {roleLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
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

function CommentRow({ comment, theme, tgUserId, onDelete }) {
  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef(0)

  const handleTouchStart = (e) => {
    if (String(comment.telegram_id) !== String(tgUserId)) return
    startX.current = e.touches[0].clientX
    setIsSwiping(true)
  }

  const handleTouchMove = (e) => {
    if (!isSwiping || String(comment.telegram_id) !== String(tgUserId)) return
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

  return (
    <div className="relative overflow-hidden">
      {String(comment.telegram_id) === String(tgUserId) && (
        <div
          onClick={() => {
            if (swipeX === -80) {
              onDelete()
              setSwipeX(0)
            }
          }}
          className={`absolute inset-y-0 right-0 w-20 flex items-center justify-center cursor-pointer rounded-r-2xl ${
            theme === "dark" ? "bg-red-600" : "bg-red-500"
          }`}
        >
          <Trash2 className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping ? "none" : "transform 0.3s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`p-3 rounded-2xl relative z-10 ${
          String(comment.telegram_id) === String(tgUserId)
            ? theme === "dark"
              ? "bg-blue-600 text-white ml-8"
              : "bg-blue-500 text-white ml-8"
            : theme === "dark"
              ? "bg-gray-700 text-gray-100 mr-8"
              : "bg-gray-200 text-gray-900 mr-8"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-xs font-medium opacity-80 mb-1">{comment.author}</p>
            <p className="text-sm">{comment.text}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const TxRow = memo(function TxRow({ tx, categoriesMeta, formatCurrency, formatDate, theme, onDelete, showCreator, onToggleLike, onOpenDetails, tgPhotoUrl, tgUserId, walletMembers }) {
  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [lastTap, setLastTap] = useState(0)
  const startX = useRef(0)
  const startY = useRef(0)
  const isHorizontalSwipe = useRef(false)
  const didMove = useRef(false)

  const handleTouchStart = (e) => {
    const now = Date.now()
    const timeSinceLastTap = now - lastTap
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Двойной тап - ставим лайк
      e.preventDefault()
      onToggleLike && onToggleLike(tx.id)
      setLastTap(0)
      return
    }
    
    setLastTap(now)
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isHorizontalSwipe.current = false
    didMove.current = false
    setIsSwiping(true)
  }

  const handleClick = () => {
    if (swipeX === 0) {
      onOpenDetails && onOpenDetails(tx)
    }
  }

  const handleTouchMove = (e) => {
    if (!isSwiping) return
    
    const diffX = e.touches[0].clientX - startX.current
    const diffY = e.touches[0].clientY - startY.current
    
    // Определяем направление свайпа только один раз
    if (!isHorizontalSwipe.current && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
      isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY)
    }

    if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
      didMove.current = true
    }
    
    // Если свайп вертикальный - не обрабатываем
    if (!isHorizontalSwipe.current) {
      return
    }
    
    // Блокируем вертикальную прокрутку при горизонтальном свайпе
    e.preventDefault()
    
    if (diffX < 0) {
      setSwipeX(Math.max(diffX, -80))
    } else if (swipeX < 0) {
      setSwipeX(Math.min(0, swipeX + diffX / 2))
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)

    // Если это был обычный тап (не горизонтальный свайп и палец почти не двигался)
    // то открываем детали здесь, т.к. после preventDefault в touchmove onClick может не срабатывать.
    if (!isHorizontalSwipe.current && !didMove.current && swipeX === 0) {
      onOpenDetails && onOpenDetails(tx)
      isHorizontalSwipe.current = false
      return
    }

    isHorizontalSwipe.current = false
    if (swipeX < -40) {
      setSwipeX(-80)
    } else {
      setSwipeX(0)
    }
  }

  const categoryInfo = categoriesMeta[tx.category] || categoriesMeta["Другое"]
  const showDeleteAction = swipeX < 0

  const getMemberPhotoUrl = (telegramId) => {
    if (telegramId == null) return null
    if (Array.isArray(walletMembers)) {
      const found = walletMembers.find(
        (m) => String(m?.telegram_id ?? m?.member_telegram_id) === String(telegramId),
      )
      if (found?.telegram_photo_url || found?.photo_url) return found.telegram_photo_url || found.photo_url
    }
    if (tgUserId && String(telegramId) === String(tgUserId) && tgPhotoUrl) {
      return tgPhotoUrl
    }
    return null
  }

  const creatorTelegramId = tx.created_by_telegram_id ?? tx.telegram_id ?? tx.createdByTelegramId ?? tx.createdByTelegramID

  const creatorPhotoUrl =
    getMemberPhotoUrl(creatorTelegramId) ||
    tx.telegram_photo_url ||
    tx.created_by_telegram_photo_url ||
    tx.created_by_photo_url ||
    tx.creator_photo_url ||
    tgPhotoUrl

  const getCommentKey = (comment) => {
    const id = comment?.telegram_id ?? comment?.created_by_telegram_id ?? comment?.telegramId ?? comment?.telegramID
    if (id != null) return `tg:${String(id)}`
    const author = comment?.author
    if (author) return `author:${String(author)}`
    return null
  }

  const getCommentPhotoUrl = (comment) => {
    const id = comment?.telegram_id ?? comment?.created_by_telegram_id ?? comment?.telegramId ?? comment?.telegramID
    if (id != null && Array.isArray(walletMembers)) {
      const found = walletMembers.find(
        (m) => String(m?.telegram_id ?? m?.member_telegram_id) === String(id),
      )
      if (found?.telegram_photo_url || found?.photo_url) return found.telegram_photo_url || found.photo_url
    }
    if (id != null && tgUserId && String(id) === String(tgUserId) && tgPhotoUrl) {
      return tgPhotoUrl
    }
    return (
      comment?.telegram_photo_url ||
      comment?.photo_url ||
      comment?.author_photo_url ||
      comment?.created_by_telegram_photo_url ||
      comment?.created_by_photo_url ||
      null
    )
  }

  return (
    <div
      className="py-2"
    >
      <div className="relative overflow-hidden rounded-[40px]">
        <div
          onClick={() => {
            if (swipeX === -80) {
              onDelete(tx.id)
              setSwipeX(0)
            }
          }}
          className={`absolute inset-y-0 right-0 w-20 flex items-center justify-center cursor-pointer rounded-r-[40px] transition-opacity ${
            theme === "dark" ? "bg-red-600" : "bg-red-500"
          }`}
          style={{ opacity: showDeleteAction ? 1 : 0, pointerEvents: showDeleteAction ? 'auto' : 'none' }}
        >
          <Trash2 className="w-5 h-5 text-white" />
        </div>

        <div
          style={{
            transform: `translateX(${swipeX}px)`,
            transition: isSwiping ? "none" : "transform 0.3s ease",
          }}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative pl-5 pr-4 py-5 cursor-pointer backdrop-blur-lg ${theme === "dark" ? "bg-white/5" : "bg-white"}`}
        >
          {/* Лайк в правом верхнем углу */}
          {tx.liked && (
            <div className="absolute top-1.5 right-5 z-10">
              <Heart className="w-4 h-4 text-red-500 fill-red-500 drop-shadow-lg" />
            </div>
          )}

          <div className="flex items-start gap-3.5">
            {/* Иконка категории */}
            <div
              className={`flex items-center justify-center w-[52px] h-[52px] rounded-[22px] bg-gradient-to-br ${categoryInfo.color} shadow-md flex-shrink-0 text-2xl`}
            >
              <span>{categoryInfo.icon}</span>
            </div>

            {/* Основная информация */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1 min-w-0">
                <div className="flex-1 min-w-0">
                  {tx.description && (
                    <p className={`font-semibold text-[15px] leading-tight mb-0.5 truncate ${
                      theme === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}>
                      {tx.description}
                    </p>
                  )}
                  <p className={`text-[12px] truncate ${theme === "dark" ? "text-gray-300/70" : "text-gray-600"}`}>
                    {tx.category}
                  </p>
                </div>
                
                {/* Сумма */}
                <p
                  className={`font-bold text-[17px] whitespace-nowrap flex-shrink-0 ${
                    tx.type === "income" ? "text-emerald-500" : tx.type === "expense" ? "text-rose-500" : "text-blue-500"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </p>
              </div>

              {/* Нижняя строка: автор и время */}
              <div className="flex items-center justify-between gap-2 min-w-0">
                {showCreator && tx.created_by_name ? (
                  <div className="flex items-center gap-1 min-w-0">
                    {creatorPhotoUrl ? (
                      <img src={creatorPhotoUrl} alt="Avatar" className="w-[18px] h-[18px] rounded-full object-cover" />
                    ) : (
                      <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${theme === "dark" ? "bg-blue-700" : "bg-blue-200"}`}>
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className={`text-[12px] truncate ${theme === "dark" ? "text-gray-300/70" : "text-gray-500"}`}>
                      {tx.created_by_name}
                    </span>
                  </div>
                ) : (
                  <div />
                )}
                <span className={`text-[12px] flex-shrink-0 ${theme === "dark" ? "text-gray-300/70" : "text-gray-500"}`}>
                  {formatDate(tx.date)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Последние 6 комментариев */}
      {tx.comments && tx.comments.length > 0 && (
        <div className="mt-1.5 px-3 space-y-1">
          {tx.comments.slice(-6).map((comment, idx) => {
            const key = getCommentKey(comment)
            const isMe = key && tgUserId ? key === `tg:${String(tgUserId)}` : false
            const alignRight = isMe
            const commentPhotoUrl = getCommentPhotoUrl(comment)

            return (
              <button
                key={comment.id || idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenDetails && onOpenDetails(tx)
                }}
                className="w-full"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className={`flex items-start gap-1.5 ${alignRight ? 'justify-end' : 'justify-start'}`}>
                  {!alignRight && (
                    commentPhotoUrl ? (
                      <img
                        src={commentPhotoUrl}
                        alt={comment.author}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                      }`}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )
                  )}

                  <div className="flex-1 min-w-0" style={{ maxWidth: '85%' }}>
                    <div
                      className={`inline-block px-2.5 py-1.5 rounded-xl ${
                        theme === "dark"
                          ? alignRight
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700/80 text-gray-100'
                          : alignRight
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                      }`}
                      style={{ float: alignRight ? 'right' : 'left' }}
                    >
                      <p className={`text-[10px] font-medium mb-0.5 ${
                        alignRight
                          ? 'text-white/80'
                          : theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {comment.author}
                      </p>
                      <p className="text-xs leading-snug break-words">{comment.text}</p>
                    </div>
                  </div>

                  {alignRight && (
                    commentPhotoUrl ? (
                      <img
                        src={commentPhotoUrl}
                        alt={comment.author}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                      />
                    ) : (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                      }`}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )
                  )}
                </div>
              </button>
            )
          })}
          {tx.comments.length > 6 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenDetails && onOpenDetails(tx)
              }}
              className={`text-[10px] font-medium ${
                theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
              }`}
            >
              Прочитать все ({tx.comments.length})
            </button>
          )}
        </div>
      )}
    </div>
  )
})

// Компонент контейнера бюджетов в стиле pricing
const BudgetsContainer = ({ children, theme, onSetup }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setMousePosition({ x, y })
    
    // Устанавливаем CSS переменные для свечения
    containerRef.current.style.setProperty('--mouse-x', `${x}%`)
    containerRef.current.style.setProperty('--mouse-y', `${y}%`)
  }

  return (
    <div 
      ref={containerRef}
      className={`budgets-container ${theme}`}
    >
      <div className="container-header">
        <h3
          className={`container-title ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
          style={{ minWidth: 0 }}
        >
          Бюджеты
        </h3>
        <button
          onClick={onSetup}
          className="show-all-button"
        >
          Настроить
        </button>
      </div>
      
      <div className="container-content">
        {children}
      </div>
      
      {/* Эффект свечения */}
      <div className="glow-overlay" />
    </div>
  )
}

// Компонент контейнера последних операций в стиле pricing
const RecentOperationsContainer = ({ children, theme, onShowAll }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setMousePosition({ x, y })
    
    // Устанавливаем CSS переменные для свечения
    containerRef.current.style.setProperty('--mouse-x', `${x}%`)
    containerRef.current.style.setProperty('--mouse-y', `${y}%`)
  }

  return (
    <div 
      ref={containerRef}
      className={`recent-operations-container ${theme}`}
      onMouseMove={handleMouseMove}
    >
      <div className="container-header">
        <h3
          className={`container-title ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
          style={{ minWidth: 0 }}
        >
          Последние операции
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onShowAll && onShowAll()
          }}
          className="show-all-button"
        >
          Все →
        </button>
      </div>
      
      <div className="container-content">
        {children}
      </div>
      
      {/* Эффект свечения */}
      <div className="glow-overlay" />
    </div>
  )
}

// Компонент контейнера копилок в стиле pricing
const SavingsContainer = ({ children, theme, onShowAll, title, progress, icon, color, className = '' }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setMousePosition({ x, y })
    
    // Устанавливаем CSS переменные для свечения
    containerRef.current.style.setProperty('--mouse-x', `${x}%`)
    containerRef.current.style.setProperty('--mouse-y', `${y}%`)
  }

  // Определяем цвета в зависимости от параметра color
  const colorClasses = {
    blue: {
      iconBg: theme === "dark" ? "bg-blue-900/40" : "bg-blue-100",
      iconText: theme === "dark" ? "text-blue-400" : "text-blue-600",
      progressStroke: theme === "dark" ? "#3b82f6" : "#2563eb",
      gradient: theme === "dark" ? "linear-gradient(135deg, rgba(59,130,246,0.22), rgba(99,102,241,0.10))" : "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.08))",
      titleText: theme === "dark" ? "text-gray-100" : "text-gray-900",
      percentText: theme === "dark" ? "text-gray-100" : "text-gray-900",
      border: theme === "dark" ? "rgba(59,130,246,0.20)" : "rgba(59,130,246,0.28)",
    },
    purple: {
      iconBg: theme === "dark" ? "bg-purple-900/40" : "bg-purple-100",
      iconText: theme === "dark" ? "text-purple-400" : "text-purple-600",
      progressStroke: theme === "dark" ? "#a855f7" : "#7c3aed",
      gradient: theme === "dark" ? "linear-gradient(135deg, rgba(168,85,247,0.22), rgba(236,72,153,0.10))" : "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(236,72,153,0.08))",
      titleText: theme === "dark" ? "text-gray-100" : "text-gray-900",
      percentText: theme === "dark" ? "text-gray-100" : "text-gray-900",
      border: theme === "dark" ? "rgba(168,85,247,0.20)" : "rgba(168,85,247,0.28)",
    },
    green: {
      iconBg: theme === "dark" ? "bg-green-900/40" : "bg-green-100",
      iconText: theme === "dark" ? "text-green-400" : "text-green-600",
      progressStroke: theme === "dark" ? "#22c55e" : "#16a34a",
      gradient: theme === "dark" ? "linear-gradient(135deg, rgba(34,197,94,0.20), rgba(16,185,129,0.10))" : "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(16,185,129,0.08))",
      titleText: theme === "dark" ? "text-gray-100" : "text-gray-900",
      percentText: theme === "dark" ? "text-gray-100" : "text-gray-900",
      border: theme === "dark" ? "rgba(34,197,94,0.20)" : "rgba(34,197,94,0.26)",
    },
    orange: {
      iconBg: theme === "dark" ? "bg-orange-900/40" : "bg-orange-100",
      iconText: theme === "dark" ? "text-orange-400" : "text-orange-600",
      progressStroke: theme === "dark" ? "#f97316" : "#ea580c",
      gradient: theme === "dark" ? "linear-gradient(135deg, rgba(249,115,22,0.20), rgba(245,158,11,0.10))" : "linear-gradient(135deg, rgba(249,115,22,0.16), rgba(245,158,11,0.08))",
      titleText: theme === "dark" ? "text-gray-100" : "text-gray-900",
      percentText: theme === "dark" ? "text-gray-100" : "text-gray-900",
      border: theme === "dark" ? "rgba(249,115,22,0.20)" : "rgba(249,115,22,0.26)",
    }
  }
  
  const currentColor = colorClasses[color] || colorClasses.blue

  const clampedProgress = Math.max(0, Math.min(Number(progress) || 0, 100))
  const ringSize = 42
  const ringStrokeWidth = 4
  const ringRadius = (ringSize - ringStrokeWidth) / 2
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringDashOffset = ringCircumference * (1 - clampedProgress / 100)
  const ringTrackStroke = theme === "dark" ? "#374151" : "#e5e7eb"

  return (
    <div 
      ref={containerRef}
      className={`savings-container ${theme} ${className}`}
      onMouseMove={handleMouseMove}
      onClick={(e) => {
        e.preventDefault()
        onShowAll && onShowAll()
      }}
      style={{
        backgroundImage: currentColor.gradient,
        borderColor: currentColor.border,
      }}
    >
      <div className="container-header">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`p-1.5 rounded-lg ${currentColor.iconBg}`}>
            {icon}
          </div>
          <h3
            className={`flex-1 min-w-0 truncate text-sm font-normal ${currentColor.titleText}`}
          >
            {title}
          </h3>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onShowAll && onShowAll()
          }}
          className="show-all-button"
          title="Открыть"
        >
          <div className="relative" style={{ width: ringSize, height: ringSize }}>
            <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`} className="block">
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                fill="none"
                stroke={ringTrackStroke}
                strokeWidth={ringStrokeWidth}
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={ringRadius}
                fill="none"
                stroke={currentColor.progressStroke}
                strokeWidth={ringStrokeWidth}
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringDashOffset}
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                style={{ transition: 'stroke-dashoffset 500ms ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[11px] font-semibold ${currentColor.percentText}`}>
                {Math.round(clampedProgress)}%
              </span>
            </div>
          </div>
        </button>
      </div>
      
      {children ? (
        <div className="container-content">
          {children}
        </div>
      ) : null}
      
      {/* Эффект свечения */}
      <div className="glow-overlay" />
    </div>
  )
}

const BottomSheetModal = ({ open, onClose, children, theme, zIndex = 50, position = 'bottom', topOffset = 0 }) => {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [keyboardInset, setKeyboardInset] = useState(0)
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0)
  const startY = useRef(0)
  const startX = useRef(0)
  const isVerticalSwipe = useRef(false)
  const sheetRef = useRef(null)
  const scrollTouchStartY = useRef(0)

  const hapticImpact = () => {}

  useEffect(() => {
    if (!open) {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 560)
      return () => clearTimeout(t)
    }

    setMounted(true)
    setDragY(0)
    const t = setTimeout(() => setVisible(true), 0)

    // Reset inner scroll on open to prevent "auto-scroll to bottom" glitches
    const r1 = setTimeout(() => {
      const scrollEl = sheetRef.current?.querySelector?.('[data-bsm-scroll]')
      if (scrollEl) scrollEl.scrollTop = 0
    }, 0)
    const r2 = setTimeout(() => {
      const scrollEl = sheetRef.current?.querySelector?.('[data-bsm-scroll]')
      if (scrollEl) scrollEl.scrollTop = 0
    }, 80)
    return () => {
      clearTimeout(t)
      clearTimeout(r1)
      clearTimeout(r2)
    }
  }, [open])

  useEffect(() => {
    if (!mounted) return

    const vv = window.visualViewport
    const handleResize = () => {
      try {
        setWindowHeight(window.innerHeight)
        if (!vv) {
          setKeyboardInset(0)
          return
        }
        const viewportHeight = vv.height
        const windowH = window.innerHeight
        const inset = Math.max(0, Math.round(windowH - viewportHeight - (vv.offsetTop || 0)))
        setKeyboardInset(inset)
      } catch (e) {
        setKeyboardInset(0)
      }
    }

    handleResize()

    if (vv && vv.addEventListener) {
      vv.addEventListener('resize', handleResize)
      vv.addEventListener('scroll', handleResize)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (vv && vv.removeEventListener) {
        vv.removeEventListener('resize', handleResize)
        vv.removeEventListener('scroll', handleResize)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    // Lock background scroll and prevent layout shift
    const body = document.body
    const html = document.documentElement
    const prevOverflow = body.style.overflow
    const prevPaddingRight = body.style.paddingRight
    const prevPosition = body.style.position
    const prevTop = body.style.top
    const prevWidth = body.style.width
    const prevLeft = body.style.left
    const prevRight = body.style.right
    const prevHtmlOverscroll = html.style.overscrollBehavior
    const prevBodyOverscrollY = body.style.overscrollBehaviorY
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    const scrollY = window.scrollY || window.pageYOffset || 0

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    html.style.overscrollBehavior = 'none'
    body.style.overscrollBehaviorY = 'none'
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    const preventBackgroundTouchMove = (e) => {
      try {
        const t = e.target
        if (t && sheetRef.current && sheetRef.current.contains(t)) return
        e.preventDefault()
      } catch (err) {
        e.preventDefault()
      }
    }

    window.addEventListener('touchmove', preventBackgroundTouchMove, { passive: false })

    return () => {
      const restoredTop = body.style.top
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPaddingRight
      body.style.position = prevPosition
      body.style.top = prevTop
      body.style.width = prevWidth
      body.style.left = prevLeft
      body.style.right = prevRight
      html.style.overscrollBehavior = prevHtmlOverscroll
      body.style.overscrollBehaviorY = prevBodyOverscrollY
      window.removeEventListener('touchmove', preventBackgroundTouchMove)
      const y = Number.parseInt((restoredTop || '0').replace('-', ''), 10)
      if (Number.isFinite(y) && y > 0) {
        window.scrollTo(0, y)
      }
    }
  }, [mounted])

  const requestClose = () => {
    onClose && onClose()
  }

  const onTouchStart = (e) => {
    if (!sheetRef.current) return
    setIsDragging(true)
    startY.current = e.touches[0].clientY
    startX.current = e.touches[0].clientX
    isVerticalSwipe.current = false
  }

  const onTouchMove = (e) => {
    if (!isDragging) return
    const current = e.touches[0].clientY
    const diff = current - startY.current
    const currentX = e.touches[0].clientX
    const diffX = currentX - startX.current

    // If user starts pulling down, prevent iOS rubber-band early even before direction lock
    if (diff > 2 && Math.abs(diff) > Math.abs(diffX)) {
      try {
        e.preventDefault()
      } catch (err) {}
    }

    // Determine direction once
    if (!isVerticalSwipe.current && (Math.abs(diff) > 10 || Math.abs(diffX) > 10)) {
      isVerticalSwipe.current = Math.abs(diff) > Math.abs(diffX)
    }

    // If gesture isn't vertical, don't hijack it
    if (!isVerticalSwipe.current) return

    const findScrollableAncestor = (node) => {
      try {
        const root = sheetRef.current
        let el = node
        while (el && el !== root && el.nodeType === 1) {
          const style = window.getComputedStyle ? window.getComputedStyle(el) : null
          const overflowY = style?.overflowY
          const isScrollableY = overflowY === 'auto' || overflowY === 'scroll'
          if (isScrollableY && el.scrollHeight > el.clientHeight + 1) {
            return el
          }
          el = el.parentElement
        }
      } catch (err) {
        return null
      }
      return null
    }

    // If inner content is scrollable and not at top, don't start pull-to-close
    // (prevents conflict with normal scrolling)
    const scrollEl = findScrollableAncestor(e.target)
    if (scrollEl && scrollEl.scrollTop > 0) {
      return
    }

    // Only handle downward drag
    // Prevent iOS background "rubber-band" while we are at the top and user drags down
    if (diff > 0) {
      e.preventDefault()
      // Add a small threshold to avoid accidental drags on simple taps
      if (diff > 12) {
        setDragY(diff)
      }
    }
  }

  const onTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    isVerticalSwipe.current = false
    if (dragY > 110) {
      requestClose()
      return
    }
    setDragY(0)
  }

  if (!mounted) return null

  const isTop = position === 'top'
  const translate = visible ? `translateY(${dragY}px)` : 'translateY(100%)'
  const transition = isDragging ? 'none' : 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), bottom 520ms cubic-bezier(0.22, 1, 0.36, 1)'

  const safeTopOffset = Math.max(0, Number(topOffset) || 0)
  const overlayTop = safeTopOffset
  const overlayHeight = Math.max(0, windowHeight - safeTopOffset)

  const overlayStyle = {
    zIndex,
    top: overlayTop,
    height: overlayHeight,
  }

  return (
    <div
      className={`fixed left-0 right-0 bg-black/50 backdrop-blur-sm flex justify-center ${isTop ? 'items-start' : 'items-end'}`}
      style={{
        ...overlayStyle,
        overscrollBehavior: 'none',
        touchAction: 'auto',
        opacity: visible ? 1 : 0,
        transition: 'opacity 520ms cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault()
          requestClose()
        }
      }}
      onTouchMove={(e) => {
        // Prevent background scrolling when user drags on backdrop
        if (e.target === e.currentTarget) {
          e.preventDefault()
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault()
          requestClose()
        }
      }}
    >
      <div
        onWheel={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        ref={sheetRef}
        className={`w-full max-w-none shadow-2xl overflow-hidden flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}
        style={{
          transform: translate,
          transition,
          bottom: isTop ? 0 : keyboardInset,
          maxHeight: Math.max(0, overlayHeight - 12),
          marginTop: isTop ? 12 : 0,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          borderBottomLeftRadius: isTop ? 24 : 0,
          borderBottomRightRadius: isTop ? 24 : 0,
          willChange: 'transform, bottom',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
        }}
        onTouchStart={(e) => { e.stopPropagation(); onTouchStart(e) }}
        onTouchMove={(e) => {
          onTouchMove(e)
        }}
        onTouchEnd={onTouchEnd}
      >
        <div className="pt-2 pb-1 flex justify-center">
          <div className={`h-1.5 w-10 rounded-full ${theme === "dark" ? "bg-gray-600" : "bg-gray-300"}`} />
        </div>
        <div
          data-bsm-scroll
          className="p-4 overflow-y-auto flex-1"
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y", overscrollBehavior: 'contain' }}
          onTouchStart={(e) => {
            try {
              scrollTouchStartY.current = e.touches[0].clientY
            } catch (err) {
              scrollTouchStartY.current = 0
            }
          }}
          onTouchMove={(e) => {
            // Prevent iOS scroll chaining/rubber-band: when at top and pulling down, or at bottom and pushing up.
            try {
              const el = e.currentTarget
              const y = e.touches[0].clientY
              const dy = y - (scrollTouchStartY.current || y)
              const atTop = el.scrollTop <= 0
              const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
              if ((atTop && dy > 0) || (atBottom && dy < 0)) {
                e.preventDefault()
              }
            } catch (err) {}
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

const LinkedUserRow = ({ linkedUser, currentTelegramId, theme, vibrate, removeLinkedUser }) => {
  const isCurrentUser = String(linkedUser.telegram_id) === String(currentTelegramId)

  return (
    <div className="relative mb-1.5 overflow-hidden rounded-[40px]">
      <div
        className={`relative flex items-center gap-3 p-3 rounded-[40px] border transition-all duration-300 ${
          theme === "dark" ? "bg-gray-800 border-gray-700/50" : "bg-white border-gray-200/50"
        }`}
      >
        {linkedUser.telegram_photo_url ? (
          <img
            src={linkedUser.telegram_photo_url}
            alt="Avatar"
            className="w-10 h-10 rounded-full flex-shrink-0 object-cover border border-white/20"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              theme === "dark" ? "bg-blue-700" : "bg-blue-100"
            }`}
          >
            <User className={`w-5 h-5 ${theme === "dark" ? "text-blue-300" : "text-blue-600"}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
            {linkedUser.telegram_name || "Пользователь"}
          </p>
          {isCurrentUser && <p className={`text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>Вы</p>}
        </div>
      </div>
    </div>
  )
}

export default function FinanceApp({ apiUrl = API_BASE }) {
  const API_URL = apiUrl
  const mainContentRef = useRef(null)

  const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp

  const ACTIVE_WALLET_KEY = 'active_wallet_email_v1'

  const inviteInFlightRef = useRef(false)
  const inviteDoneRef = useRef(false)

  // UseState hooks should be at the top level of the component
  const [user, setUser] = useState(null)
  const [currentUserEmail, setCurrentUserEmail] = useState(null)
  const [activeWalletEmail, setActiveWalletEmail] = useState(null)
  const [walletMembers, setWalletMembers] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [theme, setTheme] = useState(() => (tg && tg.colorScheme) || "light")
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
  const [linkingLoading, setLinkingLoading] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  const [selectedWalletMember, setSelectedWalletMember] = useState(null)
  const [showWalletMemberModal, setShowWalletMemberModal] = useState(false)
  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false)
  const [blockedWalletMembers, setBlockedWalletMembers] = useState([])
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
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalInput, setGoalInput] = useState("50000")
  const [goalName, setGoalName] = useState("Моя цель")
  const [showSavingsSettingsModal, setShowSavingsSettingsModal] = useState(false)
  const [initialSavingsAmount, setInitialSavingsAmount] = useState(0)
  const [initialSavingsInput, setInitialSavingsInput] = useState("0")
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [showBalanceWidgetSettingsModal, setShowBalanceWidgetSettingsModal] = useState(false)
  const [balanceWidgetTitle, setBalanceWidgetTitle] = useState('Общий баланс')
  const [balanceWidgetEmoji, setBalanceWidgetEmoji] = useState('💳')
  const [balanceWidgetGradient, setBalanceWidgetGradient] = useState('default')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenEnabled, setFullscreenEnabled] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(3.2)

  const [linkedUsers, setLinkedUsers] = useState([])
  const [showLinkedUsers, setShowLinkedUsers] = useState(false)
  const [showLinkedUsersDropdown, setShowLinkedUsersDropdown] = useState(false)
  const [showWalletMembersDropdown, setShowWalletMembersDropdown] = useState(false)
  const [likedTransactions, setLikedTransactions] = useState(new Set())
  const [transactionComments, setTransactionComments] = useState({})
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)

  const getLikerKey = () => {
    if (tgUserId) return `tg:${String(tgUserId)}`
    if (currentUserEmail) return `email:${String(currentUserEmail)}`
    if (user?.email) return `email:${String(user.email)}`
    return null
  }

  const loadLikesForWallet = async (walletEmail) => {
    if (!walletEmail) return
    const likerKey = getLikerKey()
    if (!likerKey) return

    try {
      const resp = await fetch(`${API_URL}/api/likes?wallet_email=${encodeURIComponent(String(walletEmail))}`)
      if (!resp.ok) return
      const data = await resp.json().catch(() => null)
      const likesByTx = data?.likesByTx || {}

      const likedSet = new Set()
      for (const [txId, likers] of Object.entries(likesByTx)) {
        if (Array.isArray(likers) && likers.includes(likerKey)) {
          likedSet.add(String(txId))
        }
      }
      setLikedTransactions(likedSet)
    } catch (e) {
      console.warn('Failed to load likes', e)
    }
  }
  const [detailsCommentText, setDetailsCommentText] = useState('')
  
  const [secondGoalName, setSecondGoalName] = useState('')
  const [secondGoalAmount, setSecondGoalAmount] = useState(0)
  const [secondGoalSavings, setSecondGoalSavings] = useState(0)
  const [secondGoalInitialAmount, setSecondGoalInitialAmount] = useState(0)
  const [showSecondGoalModal, setShowSecondGoalModal] = useState(false)
  const [secondGoalInput, setSecondGoalInput] = useState('0')
  const [thirdGoalName, setThirdGoalName] = useState('')
  const [thirdGoalAmount, setThirdGoalAmount] = useState(0)
  const [thirdGoalSavings, setThirdGoalSavings] = useState(0)
  const [thirdGoalInitialAmount, setThirdGoalInitialAmount] = useState(0)
  const [showThirdGoalModal, setShowThirdGoalModal] = useState(false)
  const [thirdGoalInput, setThirdGoalInput] = useState('0')
  const [selectedSavingsGoal, setSelectedSavingsGoal] = useState('main') // 'main' или 'second'
  
  // Бюджеты и лимиты
  const [budgets, setBudgets] = useState({}) // { category: { limit: 500, period: 'month' } }
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState('')
  const [showBudgetPreviewModal, setShowBudgetPreviewModal] = useState(false)
  const [budgetPreviewCategory, setBudgetPreviewCategory] = useState('')
  const [budgetLimitInput, setBudgetLimitInput] = useState('')
  const [budgetPeriod, setBudgetPeriod] = useState('month') // 'week', 'month', 'year'
  const [showBudgetKeyboard, setShowBudgetKeyboard] = useState(false)
  const [budgetPeriodMode, setBudgetPeriodMode] = useState('relative') // 'relative' | 'custom'
  const [budgetStartDay, setBudgetStartDay] = useState(1) // 1..28
  const [budgetCustomStart, setBudgetCustomStart] = useState('') // YYYY-MM-DD
  const [budgetCustomEnd, setBudgetCustomEnd] = useState('') // YYYY-MM-DD
  
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

  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      content: 'Привет! Я ИИ-анализатор. Напиши вопрос или нажми «Проанализировать», и я дам советы по бюджету.'
    }
  ])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const aiInputRef = useRef(null)

  const normalizeDecimalInput = (raw) => {
    const s = String(raw ?? '')
    const only = s.replace(/[^0-9.,]/g, '')
    const normalized = only.replace(/,/g, '.')

    const firstDot = normalized.indexOf('.')
    if (firstDot === -1) return normalized

    const before = normalized.slice(0, firstDot + 1)
    const after = normalized.slice(firstDot + 1).replace(/\./g, '')
    return before + after
  }

  const sendAiMessage = async (text) => {
    if (!user || !user.email) {
      alert('Сначала войдите в аккаунт (email)')
      return
    }

    const trimmed = String(text || '').trim()
    if (!trimmed) return

    setAiMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setAiInput('')
    setAiLoading(true)

    try {
      const resp = await fetch(`${API_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email: user.email, message: trimmed, currency }),
      })

      const json = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        throw new Error(json.error || 'Ошибка AI')
      }

      setAiMessages((prev) => [...prev, { role: 'assistant', content: json.content || '' }])
      vibrateSuccess()
    } catch (e) {
      console.error('AI error:', e)
      vibrateError()
      alert(e.message || 'Ошибка AI')
    } finally {
      setAiLoading(false)
    }
  }

  const haptic = tg && tg.HapticFeedback
  const vibrate = () => haptic && haptic.impactOccurred && haptic.impactOccurred("light")
  const vibrateSuccess = () => haptic && haptic.notificationOccurred && haptic.notificationOccurred("success")
  const vibrateError = () => haptic && haptic.notificationOccurred && haptic.notificationOccurred("error")
  const vibrateSelect = () => haptic && haptic.selectionChanged && haptic.selectionChanged()

  const tgUser = tg && tg.initDataUnsafe && tg.initDataUnsafe.user
  const tgUserId = tgUser && tgUser.id
  const displayName = (tgUser && tgUser.first_name) || "Пользователь"
  const tgPhotoUrl = tgUser && tgUser.photo_url

  const isSharedWalletView = Boolean(activeWalletEmail && currentUserEmail && activeWalletEmail !== currentUserEmail)
  const ownerWalletEmail = isSharedWalletView ? activeWalletEmail : (currentUserEmail || activeWalletEmail)
  const isWalletOwner = Boolean(ownerWalletEmail && !isSharedWalletView)
  const isTelegramNativeUser = Boolean(currentUserEmail && String(currentUserEmail).startsWith('tg_') && String(currentUserEmail).endsWith('@telegram.user'))

  const openWalletMemberModal = (member) => {
    setSelectedWalletMember(member)
    setShowWalletMemberModal(true)
    vibrateSelect()
  }

  const formatDateTime = (v) => {
    if (!v) return ''
    try {
      const d = new Date(v)
      if (Number.isNaN(d.getTime())) return String(v)
      return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return String(v)
    }
  }

  const loadWalletMembers = async (ownerEmail) => {
    if (!ownerEmail) return
    try {
      const resp = await fetch(`${API_URL}/api/wallet/${encodeURIComponent(ownerEmail)}/members`)
      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        console.warn('[WalletMembers] Failed:', resp.status, ownerEmail, text)
        return
      }
      const data = await resp.json().catch(() => null)
      const raw = data?.members || []
      const normalized = Array.isArray(raw)
        ? raw.map((m) => {
            const telegramId = m?.telegram_id ?? m?.member_telegram_id ?? null
            const photoUrl = m?.telegram_photo_url ?? m?.photo_url ?? null
            return {
              ...m,
              telegram_id: telegramId,
              telegram_photo_url: photoUrl,
            }
          })
        : []
      setWalletMembers(normalized)
    } catch (e) {
      console.warn('Failed to load wallet members', e)
    }
  }

  const loadBlockedWalletMembers = async (ownerEmail) => {
    if (!ownerEmail) {
      setBlockedWalletMembers([])
      return
    }
    try {
      const resp = await fetch(`${API_URL}/api/wallet/${encodeURIComponent(ownerEmail)}/blocked`)
      if (!resp.ok) {
        const text = await resp.text().catch(() => '')
        console.warn('[BlockedMembers] Failed:', resp.status, ownerEmail, text)
        setBlockedWalletMembers([])
        return
      }
      const data = await resp.json().catch(() => null)
      setBlockedWalletMembers(data?.members || [])
    } catch (e) {
      console.warn('Failed to load blocked wallet members', e)
      setBlockedWalletMembers([])
    }
  }

  const updateMemberStatus = async (ownerEmail, telegramId, status) => {
    if (!ownerEmail || !telegramId) return
    try {
      const resp = await fetch(
        `${API_URL}/api/wallet/${encodeURIComponent(ownerEmail)}/members/${encodeURIComponent(String(telegramId))}/status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        },
      )
      if (resp.ok) {
        await loadWalletMembers(ownerEmail)
        vibrateSuccess()
      } else {
        vibrateError()
      }
    } catch (e) {
      console.warn('Failed to update member status', e)
      vibrateError()
    }
  }

  const deleteMember = async (ownerEmail, telegramId) => {
    if (!ownerEmail || !telegramId) return
    try {
      const resp = await fetch(
        `${API_URL}/api/wallet/${encodeURIComponent(ownerEmail)}/members/${encodeURIComponent(String(telegramId))}`,
        { method: 'DELETE' },
      )
      if (resp.ok) {
        await loadWalletMembers(ownerEmail)
        vibrateSuccess()
      } else {
        vibrateError()
      }
    } catch (e) {
      console.warn('Failed to delete member', e)
      vibrateError()
    }
  }

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
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed) {
          if (parsed.currency) setCurrency(parsed.currency)
          if (parsed.theme) setTheme(parsed.theme)
          if (parsed.goalSavings) {
            setGoalSavings(parsed.goalSavings)
            setGoalInput(String(parsed.goalSavings))
          }
          if (parsed.balanceVisible !== undefined) setBalanceVisible(parsed.balanceVisible)
          if (parsed.fullscreenEnabled !== undefined) setFullscreenEnabled(parsed.fullscreenEnabled)
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
      // Telegram-only: email session is ignored
      if (session) {
        // keep storage for possible legacy users, but do not auto-login by email
      }

      if (tgUserId) {
        autoAuthTelegram(tgUserId)
      } else {
        setIsLoading(false)
      }
    } catch (e) {
      console.warn("Failed to parse settings", e)
      setIsLoading(false)
    }
  }, [tgUserId])

  useEffect(() => {
    const ensureTelegramAccount = async () => {
      if (!tgUserId) return
      try {
        const resp = await fetch(`${API_URL}/api/telegram/ensure`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegram_id: tgUserId, telegram_name: displayName, photo_url: tgPhotoUrl || null }),
        })
        if (!resp.ok) return
        const data = await resp.json().catch(() => null)
        const serverActiveWallet = data?.telegramAccount?.active_wallet_email || null
        if (serverActiveWallet) {
          try {
            localStorage.setItem(ACTIVE_WALLET_KEY, String(serverActiveWallet))
          } catch (e) {
            // ignore
          }
          // Apply on top of whatever we loaded
          await loadWalletView(String(serverActiveWallet))
        } else {
          // If server cleared active wallet (e.g. owner removed you), ensure client also exits shared mode
          try {
            const stored = localStorage.getItem(ACTIVE_WALLET_KEY)
            if (stored) {
              localStorage.removeItem(ACTIVE_WALLET_KEY)
            }
          } catch (e) {
            // ignore
          }

          if (activeWalletEmail) {
            setActiveWalletEmail(null)
          }

          if (currentUserEmail) {
            // Reload own wallet view
            await loadWalletView(String(currentUserEmail))
          }
        }
      } catch (e) {
        console.warn('Failed to ensure telegram account', e)
      }
    }

    ensureTelegramAccount()
  }, [tgUserId, displayName, tgPhotoUrl])

  useEffect(() => {
    if (isSharedWalletView && !activeWalletEmail) return
    if (!ownerWalletEmail) return
    loadWalletMembers(ownerWalletEmail)

    if (isWalletOwner) {
      const interval = setInterval(() => {
        loadWalletMembers(ownerWalletEmail)
      }, 15000)

      return () => clearInterval(interval)
    }
  }, [ownerWalletEmail, isWalletOwner])

  const leaveSharedWallet = async () => {
    if (!tgUserId) return
    try {
      await fetch(`${API_URL}/api/wallet/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: tgUserId }),
      })
    } catch (e) {
      // ignore
    }

    try {
      localStorage.removeItem(ACTIVE_WALLET_KEY)
    } catch (e) {
      // ignore
    }
    setActiveWalletEmail(null)
    // Reload own data if authenticated
    if (currentUserEmail) {
      try {
        const userResp = await fetch(`${API_URL}/api/user/${encodeURIComponent(currentUserEmail)}`)
        const u = userResp.ok ? await userResp.json().catch(() => null) : null
        const txResp = await fetch(`${API_URL}/api/transactions?user_email=${encodeURIComponent(currentUserEmail)}`)
        const txs = txResp.ok ? await txResp.json().catch(() => []) : []
        if (u) {
          await applyUser(u, Array.isArray(txs) ? txs : [], true)
        }
      } catch (e) {
        // ignore
      }
    }
  }

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
    if (theme === 'dark') {
      document.body.style.background = '#0b1220'
      document.body.style.backgroundColor = '#0b1220'
    } else {
      // В светлой теме фон задается через CSS (градиент), не перетираем его inline-стилем
      document.body.style.background = ''
      document.body.style.backgroundColor = ''
    }
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
        if (!tgUserId) return
        // Wait until Telegram auto-login filled our own wallet identity
        if (!currentUserEmail) return
        if (inviteDoneRef.current || inviteInFlightRef.current) return

        const readStartParam = () => {
          try {
            const params = new URLSearchParams(window.location.search)
            const candidates = [
              params.get('tgWebAppStartParam'),
              params.get('start_param'),
              params.get('startapp'),
              params.get('start'),
              params.get('ref'),
            ]
            for (const c of candidates) {
              if (c && String(c).trim()) return String(c).trim()
            }
          } catch (e) {
            // ignore
          }
          return ''
        }

        const urlStart = readStartParam()
        const tgStart = (tg && tg.initDataUnsafe && (tg.initDataUnsafe.start_param || '').trim()) || ''
        const startParam = tgStart || urlStart

        console.log('[InviteLink] tgUserId=', tgUserId, 'startParam=', startParam, 'urlStart=', urlStart, 'tgStart=', tgStart)

        if (startParam) {
          
          console.log('Start param received:', startParam)
          
          let referrerEmail = null
          let referrerTelegramId = null
          
          // Парсим параметр в зависимости от формата
          if (startParam && startParam.startsWith('inv_')) {
            const token = startParam.replace('inv_', '').trim()
            if (!token) return

            if (inviteDoneRef.current || inviteInFlightRef.current) return
            inviteInFlightRef.current = true
            setLinkingLoading(true)
            try {
              const resp = await fetch(`${API_URL}/api/invite/consume`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, currentTelegramId: tgUserId, currentEmail: currentUserEmail || null, currentUserName: displayName }),
              })
              const json = await resp.json().catch(() => ({}))
              if (!resp.ok) {
                alert(json.error || 'Приглашение недействительно')
                vibrateError()
                return
              }
              const walletEmail = json.walletEmail
              if (walletEmail) {
                try {
                  localStorage.setItem(ACTIVE_WALLET_KEY, String(walletEmail))
                } catch (e) {
                  // ignore
                }
                setActiveWalletEmail(String(walletEmail))
                await loadWalletView(String(walletEmail))
                inviteDoneRef.current = true
                vibrateSuccess()
              }
            } finally {
              setLinkingLoading(false)
              inviteInFlightRef.current = false
            }
            return
          }

          if (startParam && startParam.startsWith('tg_') && tgUserId) {
            // Legacy format: tg_123456789
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
          console.log('Current User Email:', currentUserEmail || 'none')
          
          // Проверяем, что пользователь не приглашает сам себя
          if (referrerTelegramId === String(tgUserId)) {
            console.log('Cannot link to yourself')
            return
          }
          
          // Проверяем, не связаны ли уже
          const linkKey = `linked_tg_${String(tgUserId)}_${String(referrerTelegramId)}`
          const alreadyLinked = sessionStorage.getItem(linkKey)
          if (alreadyLinked) {
            console.log('Already linked to this user')
            return
          }
          
          try {
            inviteInFlightRef.current = true
            // Отправляем запрос на связывание аккаунтов
            const response = await fetch(`${API_URL}/api/link`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                currentTelegramId: tgUserId,
                currentEmail: currentUserEmail || null,
                currentUserName: displayName,
                referrerTelegramId: referrerTelegramId,
                referrerEmail: referrerEmail || null,
                referrerName: tgUser?.first_name || 'Пользователь'
              })
            })

            if (response.status === 403) {
              inviteDoneRef.current = true
              const err = await response.json().catch(() => ({}))
              alert(err.error || 'Вас заблокировали в этом кошельке')
              vibrateError()
              return
            }

            if (response.ok) {
              const data = await response.json().catch(() => ({}))
              const walletEmail = data.walletEmail
              if (walletEmail) {
                try {
                  localStorage.setItem(ACTIVE_WALLET_KEY, String(walletEmail))
                } catch (e) {
                  // ignore
                }

                // Switch UI immediately to the owner's wallet
                setActiveWalletEmail(String(walletEmail))
              }
              vibrateSuccess()
              if (walletEmail) {
                setLinkingLoading(true)
                let ok = false
                // Даем backend время зафиксировать active_wallet_email и создать/обновить записи
                for (let attempt = 0; attempt < 8; attempt += 1) {
                  ok = await loadWalletView(walletEmail)
                  if (ok) break
                  await new Promise((r) => setTimeout(r, 600))
                }
                setLinkingLoading(false)

                if (!ok) {
                  try {
                    localStorage.removeItem(ACTIVE_WALLET_KEY)
                  } catch (e) {
                    // ignore
                  }
                  alert(
                    `Подключение создано, но кошелек владельца не удалось загрузить.\n\n` +
                      `walletEmail: ${walletEmail}\n` +
                      `API_URL: ${API_URL}\n\n` +
                      `Проверь, что backend перезапущен и что API_URL указывает на тот же сервер, где был /api/link.`,
                  )
                  return
                }

                // Mark as handled only after successful wallet load
                sessionStorage.setItem(linkKey, 'true')
                inviteDoneRef.current = true
              }
            } else {
              const error = await response.json()
              console.error('Link error:', error)
              alert(`Ошибка подключения: ${error.error || 'Попробуйте позже'}`)
            }
          } catch (e) {
            console.error('Failed to link accounts:', e)
            alert('Не удалось подключиться к кошельку. Проверьте интернет-соединение.')
          } finally {
            inviteInFlightRef.current = false
          }
        }
      } catch (e) {
        console.error('Referral link handling error:', e)
      }
    }
    
    handleReferralLink()
  }, [tgUserId, tg, currentUserEmail])

  useEffect(() => {
    const keepAlive = async () => {
      try {
        // Пингуем backend чтобы не засыпал
        await fetch(`${API_URL}/api/health`).catch(() => {})
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
      const resp = await fetch(`${API_URL}/api/linked-users/${email}`)
      if (resp.ok) {
        const data = await resp.json()
        setLinkedUsers(data.linkedUsers || [])
        setShowLinkedUsers((data.linkedUsers || []).length > 1)
      }
    } catch (e) {
      console.warn("Failed to load linked users", e)
    }
  }

  const loadWalletView = async (walletEmail) => {
    if (!walletEmail) return
    try {
      const userResp = await fetch(`${API_URL}/api/user/${encodeURIComponent(walletEmail)}`)
      if (!userResp.ok) return false
      const walletJson = await userResp.json().catch(() => null)
      if (!walletJson) return false

      const walletUser = walletJson.user ? walletJson.user : walletJson

      let walletTxs = []
      if (Array.isArray(walletJson.transactions)) {
        walletTxs = walletJson.transactions
      } else {
        const txResp = await fetch(`${API_URL}/api/transactions?user_email=${encodeURIComponent(walletEmail)}`)
        walletTxs = txResp.ok ? await txResp.json().catch(() => []) : []
      }

      setActiveWalletEmail(walletEmail)
      setUser(walletUser)
      setBalance(Number(walletUser.balance || 0))
      setIncome(Number(walletUser.income || 0))
      setExpenses(Number(walletUser.expenses || 0))
      setSavings(Number(walletUser.savings_usd || 0))
      setGoalSavings(Number(walletUser.goal_savings || 50000))
      setGoalInput(String(Number(walletUser.goal_savings || 50000)))

      if (walletUser.goal_name) setGoalName(walletUser.goal_name)
      if (walletUser.initial_savings_amount !== undefined) setInitialSavingsAmount(Number(walletUser.initial_savings_amount || 0))
      if (walletUser.second_goal_name) setSecondGoalName(walletUser.second_goal_name)
      if (walletUser.second_goal_amount !== undefined) setSecondGoalAmount(Number(walletUser.second_goal_amount || 0))
      if (walletUser.second_goal_savings !== undefined) setSecondGoalSavings(Number(walletUser.second_goal_savings || 0))
      if (walletUser.second_goal_initial_amount !== undefined) setSecondGoalInitialAmount(Number(walletUser.second_goal_initial_amount || 0))
      if (walletUser.third_goal_name) setThirdGoalName(walletUser.third_goal_name)
      if (walletUser.third_goal_amount !== undefined) setThirdGoalAmount(Number(walletUser.third_goal_amount || 0))
      if (walletUser.third_goal_savings !== undefined) setThirdGoalSavings(Number(walletUser.third_goal_savings || 0))
      if (walletUser.third_goal_initial_amount !== undefined) setThirdGoalInitialAmount(Number(walletUser.third_goal_initial_amount || 0))

      if (walletUser.budgets) {
        try {
          const parsedBudgets = typeof walletUser.budgets === 'string' ? JSON.parse(walletUser.budgets) : walletUser.budgets
          setBudgets(parsedBudgets || {})
        } catch (e) {
          setBudgets({})
        }
      } else {
        setBudgets({})
      }

      setTransactions(Array.isArray(walletTxs) ? walletTxs : [])
      await loadLikesForWallet(walletEmail)
      await loadLinkedUsers(walletEmail)
      await loadDebts(walletEmail)
      return true
    } catch (e) {
      console.warn('Failed to load wallet view', e)
      return false
    }
  }

  const removeLinkedUser = async (telegramId) => {
    if (!user || !user.email) return

    try {
      const resp = await fetch(`${API_URL}/api/linked-users/${user.email}/${telegramId}`, {
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
    setCurrentUserEmail(u?.email || null)
    setUser(u)
    // Telegram-first login is also an authenticated state (no email required)
    setIsAuthenticated(Boolean(u))
    setBalance(Number(u.balance || 0))
    setIncome(Number(u.income || 0))
    setExpenses(Number(u.expenses || 0))
    setSavings(Number(u.savings_usd || 0)) // Ensure savings is treated as USD
    setGoalSavings(Number(u.goal_savings || 50000)) // Set goal savings from user data
    setGoalInput(String(Number(u.goal_savings || 50000)))
    setTransactions(txs || [])
    await loadLikesForWallet(u?.email || null)
    setIsLoading(false) // Завершена основная загрузка
    
    // Загрузка данных копилки
    if (u.goal_name) setGoalName(u.goal_name)
    if (u.initial_savings_amount !== undefined) setInitialSavingsAmount(Number(u.initial_savings_amount || 0))
    if (u.second_goal_name) setSecondGoalName(u.second_goal_name)
    if (u.second_goal_amount !== undefined) setSecondGoalAmount(Number(u.second_goal_amount || 0))
    if (u.second_goal_savings !== undefined) setSecondGoalSavings(Number(u.second_goal_savings || 0))
    if (u.second_goal_initial_amount !== undefined) setSecondGoalInitialAmount(Number(u.second_goal_initial_amount || 0))
    if (u.third_goal_name) setThirdGoalName(u.third_goal_name)
    if (u.third_goal_amount !== undefined) setThirdGoalAmount(Number(u.third_goal_amount || 0))
    if (u.third_goal_savings !== undefined) setThirdGoalSavings(Number(u.third_goal_savings || 0))
    if (u.third_goal_initial_amount !== undefined) setThirdGoalInitialAmount(Number(u.third_goal_initial_amount || 0))

    if (u.balance_widget_title) setBalanceWidgetTitle(String(u.balance_widget_title))
    if (u.balance_widget_emoji) setBalanceWidgetEmoji(String(u.balance_widget_emoji))
    if (u.balance_widget_gradient) setBalanceWidgetGradient(String(u.balance_widget_gradient))
    
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

    // Restore wallet view if previously linked
    try {
      const stored = localStorage.getItem(ACTIVE_WALLET_KEY)
      const walletEmail = stored ? String(stored) : null
      if (walletEmail && walletEmail !== u.email) {
        await loadWalletView(walletEmail)
      } else {
        setActiveWalletEmail(null)
      }
    } catch (e) {
      // ignore
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
      const resp = await fetch(`${API_URL}/api/telegram/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: telegramId,
          telegram_name: displayName,
          photo_url: tgPhotoUrl || null,
        }),
      })

      if (!resp.ok) throw new Error("auth failed")
      const json = await resp.json()

      const serverActiveWallet = json?.telegramAccount?.active_wallet_email || null
      if (serverActiveWallet) {
        try {
          localStorage.setItem(ACTIVE_WALLET_KEY, String(serverActiveWallet))
        } catch (e) {
          // ignore
        }
      }

      await applyUser(json.user, json.transactions || [], false)

      if (serverActiveWallet) {
        await loadWalletView(String(serverActiveWallet))
      }
    } catch (e) {
      console.warn("autoAuthTelegram failed", e)
      setIsLoading(false) // Завершить загрузку даже при ошибке
    }
  }

  async function autoAuth(email, token) {
    try {
      const decodedPassword = atob(token)
      const payload = {
        email,
        password: decodedPassword, // Decode password from base64
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
          token,
        }),
      )

      if (rememberMe) {
        // Сохраняем данные для автовхода
        localStorage.setItem("savedCredentials", JSON.stringify({ email, password: token }))
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
        
        // Сохранение настроек копилки (включая вторую и третью цели)
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
            thirdGoalName,
            thirdGoalAmount,
            thirdGoalSavings,
            thirdGoalInitialAmount,
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
    const n = Number(normalizeDecimalInput(amount))
    if (!isFinite(n) || n <= 0) {
      vibrateError()
      alert("Введите корректную сумму")
      return
    }

    if (transactionType !== 'savings' && !String(category || '').trim()) {
      setCategory('Другое')
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
      } else if (selectedSavingsGoal === 'third') {
        setThirdGoalSavings(thirdGoalSavings + convertedUSD)
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
      if (tx.savings_goal === 'third') {
        const newThirdGoalSavings = thirdGoalSavings - txConvertedUSD
        setThirdGoalSavings(newThirdGoalSavings)
        console.log("[v0] Deleted third savings. New third goal savings:", newThirdGoalSavings)
      } else if (tx.savings_goal === 'second') {
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

      const botUsername = 'kvpoiskby_bot'

      // Приглашение через direct link к Main Mini App
      // https://core.telegram.org/bots/webapps
      // payload попадет в initDataUnsafe.start_param и tgWebAppStartParam
      const createInviteAndShare = async () => {
        const ownerEmail = ownerWalletEmail
        if (!ownerEmail) {
          alert('Не удалось определить владельца кошелька')
          return
        }

        const resp = await fetch(`${API_URL}/api/invite/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ owner_email: ownerEmail, created_by_telegram_id: tgUserId }),
        })
        const json = await resp.json().catch(() => ({}))
        if (!resp.ok) {
          alert(json.error || 'Не удалось создать приглашение')
          return
        }
        const token = json.token
        if (!token) {
          alert('Не удалось создать приглашение')
          return
        }
        const inviteUrl = `https://t.me/${botUsername}?startapp=${encodeURIComponent(`inv_${token}`)}`

        // Текст приглашения
        const inviteText = `🎉 Присоединяйся к моему кошельку!\n\n` +
          `Нажми на ссылку, чтобы подключиться к моему аккаунту. ` +
          `Ссылка одноразовая и подходит только для одного входа.`

        console.log('Invite URL:', inviteUrl)
        console.log('Token:', token)

        if (tg && tg.openTelegramLink) {
          const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(inviteText)}`
          tg.openTelegramLink(shareUrl)
        } else if (navigator.share) {
          navigator.share({
            title: 'Приглашение в кошелек',
            text: inviteText,
            url: inviteUrl,
          }).catch(() => {})
        } else {
          const fullText = `${inviteText}\n\n${inviteUrl}`
          navigator.clipboard.writeText(fullText).then(() => {
            alert('Ссылка-приглашение скопирована в буфер обмена!\n\nОтправьте её другу в Telegram.')
            vibrateSuccess()
          }).catch(() => {
            alert(`Скопируйте эту ссылку и отправьте другу:\n\n${inviteUrl}`)
          })
        }

        vibrateSuccess()
      }

      createInviteAndShare()
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

  const deleteBudget = async (category) => {
    if (!category) return
    const next = { ...budgets }
    delete next[category]
    setBudgets(next)
    await saveBudgetToServer(next)
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
        if (tx.savings_goal !== 'second' && tx.savings_goal !== 'third') {
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
      let endDate = null

      // Если задан точный период — используем его
      if (budget.customStart && budget.customEnd) {
        const s = new Date(budget.customStart)
        const e = new Date(budget.customEnd)
        if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
          startDate = s
          endDate = e
        }
      }

      // Если нет точного периода — считаем относительный
      if (!endDate) {
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
        if (tx.type !== 'expense') return false
        if (tx.category !== category) return false
        const txDate = new Date(tx.date || tx.created_at)
        if (Number.isNaN(txDate.getTime())) return false
        if (txDate < startDate) return false
        if (endDate && txDate > endDate) return false
        return true
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

  const secondGoalProgress = Math.min(
    (secondGoalSavings || 0) / (secondGoalAmount > 0 ? secondGoalAmount : 1),
    1,
  )
  const secondGoalPct = Math.round(secondGoalProgress * 100)

  const thirdGoalProgress = Math.min(
    (thirdGoalSavings || 0) / (thirdGoalAmount > 0 ? thirdGoalAmount : 1),
    1,
  )
  const thirdGoalPct = Math.round(thirdGoalProgress * 100)

  const toggleLike = (txId) => {
    const txKey = String(txId)
    vibrate()
    setLikedTransactions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(txKey)) {
        newSet.delete(txKey)
      } else {
        newSet.add(txKey)
      }
      return newSet
    })

    ;(async () => {
      try {
        const walletEmail = ownerWalletEmail || activeWalletEmail || currentUserEmail || user?.email
        const likerKey = getLikerKey()
        if (!walletEmail || !likerKey) return
        const resp = await fetch(`${API_URL}/api/likes/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_email: walletEmail,
            transaction_id: txId,
            liker_key: likerKey,
          }),
        })

        if (!resp.ok) {
          const text = await resp.text().catch(() => '')
          console.warn('Failed to persist like', resp.status, text)
          return
        }

        const data = await resp.json().catch(() => null)
        if (data && typeof data.liked === 'boolean') {
          setLikedTransactions((prev) => {
            const next = new Set(prev)
            if (data.liked) next.add(txKey)
            else next.delete(txKey)
            return next
          })
        }
      } catch (e) {
        console.warn('Failed to persist like', e)
      }
    })()
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
          theme === "dark" ? "bg-gray-900" : "bg-white"
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
      className={`fixed inset-0 flex flex-col overflow-hidden`}
      style={{
        paddingTop: isFullscreen ? (safeAreaInset.top || 0) : 0,
        paddingLeft: safeAreaInset.left || 0,
        paddingRight: safeAreaInset.right || 0,
      }}
    >
      {linkingLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className={`rounded-2xl px-5 py-4 shadow-xl ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin"></div>
              <div className="text-sm font-medium">Подключаю кошелёк…</div>
            </div>
            <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Это может занять пару секунд.
            </div>
          </div>
        </div>
      )}
      <main
        ref={mainContentRef}
        className="flex-1 overflow-y-scroll overflow-x-hidden"
        style={{
          paddingLeft: contentSafeAreaInset.left || 0,
          paddingRight: contentSafeAreaInset.right || 0,
          paddingBottom: Math.max(contentSafeAreaInset.bottom + 80, 96),
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "auto",
          touchAction: "pan-y",
          overflowY: "scroll",
          height: "100%",
        }}
      >
        <div
          className="px-3 pb-4"
          style={{
            minHeight: "calc(100% + 1px)",
            touchAction: "pan-y",
          }}
        >
          {activeTab === "overview" && (
            <div className="space-y-3" style={{ paddingTop: isFullscreen ? '48px' : '16px' }}>
              {(() => {
                const gradients = {
                  default: theme === 'dark'
                    ? 'linear-gradient(180deg, rgba(17,24,39,1), rgba(17,24,39,1))'
                    : 'linear-gradient(180deg, rgba(249,250,251,1), rgba(249,250,251,1))',
                  ocean: 'linear-gradient(135deg, rgba(59,130,246,1), rgba(34,211,238,1))',
                  sunset: 'linear-gradient(135deg, rgba(249,115,22,1), rgba(236,72,153,1))',
                  violet: 'linear-gradient(135deg, rgba(168,85,247,1), rgba(99,102,241,1))',
                  emerald: 'linear-gradient(135deg, rgba(16,185,129,1), rgba(34,197,94,1))',
                  graphite: 'linear-gradient(135deg, rgba(17,24,39,1), rgba(75,85,99,1))',
                }

                const widgetBg = gradients[balanceWidgetGradient] || gradients.default

                const saveBalanceWidgetToServer = async (next) => {
                  try {
                    if (!user || !user.email) return
                    await fetch(`${API_BASE}/api/user/${user.email}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        balanceWidgetTitle: next.title,
                        balanceWidgetEmoji: next.emoji,
                        balanceWidgetGradient: next.gradient,
                      }),
                    })
                  } catch (e) {
                    console.warn('Failed to save balance widget settings', e)
                  }
                }

                const emojiPresets = ['💳', '💰', '🏦', '🧾', '📈', '💎', '🪙', '📊', '🧠', '⭐']

                return (
                  <>
                    <div
                      className={`styled-container ${theme}`}
                      style={{
                        backgroundImage: widgetBg,
                      }}
                    >
                      <div
                        className="container-header"
                        style={{
                          backdropFilter: 'none',
                          WebkitBackdropFilter: 'none',
                          background: 'transparent',
                          borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)',
                        }}
                      >
                        <h3
                          className={`container-title ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                          style={{ minWidth: 0 }}
                        >
                          {balanceWidgetTitle || 'Общий баланс'}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setShowAiModal(true)
                              vibrateSelect()
                            }}
                            className="show-all-button"
                            title="ИИ-анализ"
                          >
                            <span className="flex items-center gap-1">
                              <span className="text-[10px] font-bold">ИИ</span>
                              <Sparkles className="w-4 h-4" />
                            </span>
                          </button>
                          <button
                            onClick={() => setBalanceVisible(!balanceVisible)}
                            className="show-all-button"
                            title={balanceVisible ? "Скрыть" : "Показать"}
                          >
                            {balanceVisible ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowBalanceWidgetSettingsModal(true)
                              vibrateSelect()
                            }}
                            className="show-all-button"
                            title="Настройки"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="container-content">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className={`p-2 rounded-xl ${theme === "dark" ? "bg-black/20" : "bg-white/35"}`}
                            style={{ border: theme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.06)' }}
                          >
                            <span className="text-[18px] leading-none">{balanceWidgetEmoji || '💳'}</span>
                          </div>
                          <p className={`text-2xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                            {balanceVisible ? formatCurrency(balance) : "••••••"}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className={`rounded-[40px] p-2.5 text-center ${theme === "dark" ? "bg-black/15" : "bg-white/28"}`}
                            style={{ border: theme === 'dark' ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.06)' }}
                          >
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                              <TrendingUp className={`w-3 h-3 ${theme === "dark" ? "text-emerald-100" : "text-emerald-800"}`} />
                              <span className={`text-xs ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>Доходы</span>
                            </div>
                            <p className={`text-base font-bold ${theme === "dark" ? "text-emerald-50" : "text-emerald-900"}`}>
                              {balanceVisible ? formatCurrency(income) : "••••••"}
                            </p>
                          </div>

                          <div className={`rounded-[40px] p-2.5 text-center ${theme === "dark" ? "bg-black/15" : "bg-white/28"}`}
                            style={{ border: theme === 'dark' ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.06)' }}
                          >
                            <div className="flex items-center justify-center gap-1 mb-0.5">
                              <TrendingDown className={`w-3 h-3 ${theme === "dark" ? "text-rose-100" : "text-rose-800"}`} />
                              <span className={`text-xs ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>Расходы</span>
                            </div>
                            <p className={`text-base font-bold ${theme === "dark" ? "text-rose-50" : "text-rose-900"}`}>
                              {balanceVisible ? formatCurrency(expenses) : "••••••"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="glow-overlay" />
                    </div>

                    {showBalanceWidgetSettingsModal && (
                      <BottomSheetModal
                        open={showBalanceWidgetSettingsModal}
                        onClose={() => setShowBalanceWidgetSettingsModal(false)}
                        theme={theme}
                        zIndex={80}
                      >
                        <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                          Настройки общего баланса
                        </h3>

                        <div
                          className={`p-4 rounded-[40px] border mb-4 overflow-hidden ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
                          style={{ backgroundImage: widgetBg }}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}
                              style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                            >
                              {balanceWidgetTitle || 'Общий баланс'}
                            </div>
                            <div className={`px-3 py-1.5 rounded-2xl font-bold ${theme === 'dark' ? 'bg-black/20 text-gray-100 border border-white/10' : 'bg-white/35 text-gray-900 border border-black/10'}`}>
                              {balanceWidgetEmoji || '💳'}
                            </div>
                          </div>
                          <div className="mt-2 text-lg font-bold tabular-nums" style={{ color: theme === 'dark' ? '#F9FAFB' : '#111827' }}>
                            {balanceVisible ? formatCurrency(balance) : '••••••'}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Название
                          </label>
                          <input
                            type="text"
                            value={balanceWidgetTitle}
                            onChange={(e) => setBalanceWidgetTitle(e.target.value)}
                            className={`w-full p-3 border rounded-[40px] transition-all text-sm ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500'
                                : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            }`}
                            placeholder="Общий баланс"
                          />
                        </div>

                        <div className="mb-4">
                          <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Emoji
                          </label>
                          <div className="grid grid-cols-5 gap-2">
                            {emojiPresets.map((em) => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => setBalanceWidgetEmoji(em)}
                                className={`rounded-[18px] h-12 flex items-center justify-center transition-all touch-none active:scale-95 border ${
                                  balanceWidgetEmoji === em
                                    ? theme === 'dark'
                                      ? 'bg-black/25 border-white/20'
                                      : 'bg-black/10 border-black/20'
                                    : theme === 'dark'
                                      ? 'bg-gray-800/50 border-white/10'
                                      : 'bg-white border-black/10'
                                }`}
                              >
                                <span className="text-[20px] leading-none">{em}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className={`block text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Градиент
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.keys(gradients).map((key) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setBalanceWidgetGradient(key)}
                                className={`rounded-[28px] p-3 border transition-all touch-none active:scale-95 ${
                                  balanceWidgetGradient === key
                                    ? theme === 'dark'
                                      ? 'border-white/25'
                                      : 'border-black/25'
                                    : theme === 'dark'
                                      ? 'border-white/10'
                                      : 'border-black/10'
                                }`}
                                style={{ backgroundImage: gradients[key] }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{key}</span>
                                  {balanceWidgetGradient === key ? (
                                    <span className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>✓</span>
                                  ) : null}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            await saveBalanceWidgetToServer({
                              title: balanceWidgetTitle,
                              emoji: balanceWidgetEmoji,
                              gradient: balanceWidgetGradient,
                            })
                            setShowBalanceWidgetSettingsModal(false)
                            vibrateSuccess()
                          }}
                          className={`w-full py-3 rounded-[40px] font-medium transition-all text-sm touch-none active:scale-95 ${
                            theme === 'dark'
                              ? 'bg-blue-700 hover:bg-blue-600 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          Сохранить
                        </button>
                      </BottomSheetModal>
                    )}
                  </>
                )
              })()}

              <div
                className={
                  (secondGoalName && secondGoalAmount > 0) || (thirdGoalName && thirdGoalAmount > 0)
                    ? "grid grid-cols-2 gap-3"
                    : "grid grid-cols-1 gap-3"
                }
              >
                {/* Основная копилка */}
                <SavingsContainer
                  theme={theme}
                  onShowAll={() => {
                    setActiveTab("savings")
                    vibrate()
                  }}
                  title={goalName || "Копилка"}
                  progress={Math.round(savingsPct) || 0}
                  icon={<PiggyBank className="w-4 h-4" />}
                  color="blue"
                >
                  {null}
                </SavingsContainer>
                
                {/* Вторая копилка (если есть) */}
                {secondGoalName && secondGoalAmount > 0 && (
                  <SavingsContainer
                    theme={theme}
                    onShowAll={() => {
                      setActiveTab("savings")
                      vibrate()
                    }}
                    title={secondGoalName}
                    progress={Math.round(secondGoalPct) || 0}
                    icon={<PiggyBank className="w-4 h-4" />}
                    color="purple"
                  >
                    {null}
                  </SavingsContainer>
                )}

                {/* Третья копилка (если есть) */}
                {thirdGoalName && thirdGoalAmount > 0 && (
                  <SavingsContainer
                    theme={theme}
                    onShowAll={() => {
                      setActiveTab("savings")
                      vibrate()
                    }}
                    title={thirdGoalName}
                    progress={Math.round(thirdGoalPct) || 0}
                    icon={<PiggyBank className="w-4 h-4" />}
                    color="green"
                    className={secondGoalName && secondGoalAmount > 0 ? 'col-span-2' : ''}
                  >
                    {null}
                  </SavingsContainer>
                )}
              </div>

              {/* Бюджеты и лимиты */}
              {Object.keys(budgets).length > 0 && (
                <BudgetsContainer 
                  theme={theme}
                  onSetup={() => {
                    blurAll()
                    setShowBudgetModal(true)
                    setSelectedBudgetCategory('')
                    setBudgetLimitInput('')
                    vibrate()
                  }}
                >
                  <div className="space-y-3">
                    {Object.entries(budgets).map(([category, budget]) => {
                      const status = budgetStatuses[category]
                      if (!status) return null
                      
                      const meta = categoriesMeta[category] || {}
                      const hexToRgba = (hex, alpha) => {
                        const h = String(hex || '').replace('#', '')
                        if (h.length !== 6) return `rgba(100,116,139,${alpha})`
                        const r = parseInt(h.slice(0, 2), 16)
                        const g = parseInt(h.slice(2, 4), 16)
                        const b = parseInt(h.slice(4, 6), 16)
                        if ([r, g, b].some((v) => Number.isNaN(v))) return `rgba(100,116,139,${alpha})`
                        return `rgba(${r},${g},${b},${alpha})`
                      }
                      const periodText = budget.period === 'week' ? 'неделю' : budget.period === 'month' ? 'месяц' : 'год'
                      
                      return (
                        <div
                          key={category}
                          className={`budget-item ${
                            status.isOverBudget
                              ? 'over-budget'
                              : status.isNearLimit
                              ? 'near-limit'
                              : 'normal'
                          } cursor-pointer active:scale-[0.99]`}
                          role="button"
                          tabIndex={0}
                          style={{
                            backgroundImage:
                              theme === 'dark'
                                ? `linear-gradient(135deg, ${hexToRgba(meta.chartColor, 0.22)}, rgba(17,24,39,0.30))`
                                : `linear-gradient(135deg, ${hexToRgba(meta.chartColor, 0.16)}, rgba(255,255,255,0.88))`,
                            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)',
                          }}
                          onClick={() => {
                            blurAll()
                            setBudgetPreviewCategory(category)
                            setShowBudgetPreviewModal(true)
                            vibrate()
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              blurAll()
                              setBudgetPreviewCategory(category)
                              setShowBudgetPreviewModal(true)
                              vibrate()
                            }
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{meta.icon || '💰'}</span>
                              <div>
                                <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                                  {category}
                                </p>
                                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                  На {periodText}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${
                                status.isOverBudget
                                  ? "text-red-600"
                                  : status.isNearLimit
                                  ? "text-orange-600"
                                  : theme === "dark" ? "text-gray-200" : "text-gray-900"
                              }`}>
                                {formatCurrency(status.spent)} / {formatCurrency(status.limit)}
                              </p>
                              <p className={`text-xs ${
                                status.remaining < 0
                                  ? "text-red-600"
                                  : theme === "dark" ? "text-gray-400" : "text-gray-600"
                              }`}>
                                {status.remaining < 0 ? 'Превышение' : 'Осталось'}: {formatCurrency(Math.abs(status.remaining))}
                              </p>
                            </div>
                          </div>
                          
                          {/* Прогресс-бар */}
                          <div className={`w-full h-2 rounded-full overflow-hidden ${
                            theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                          }`}>
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                status.isOverBudget
                                  ? "bg-gradient-to-r from-red-500 to-red-600"
                                  : status.isNearLimit
                                  ? "bg-gradient-to-r from-orange-400 to-orange-500"
                                  : "bg-gradient-to-r from-green-400 to-green-500"
                              }`}
                              style={{ width: `${Math.min(status.percentage, 100)}%` }}
                            />
                          </div>
                          
                          {/* Процент */}
                          <div className="flex justify-between items-center mt-1">
                            <p className={`text-xs font-medium ${
                              status.isOverBudget
                                ? "text-red-600"
                                : status.isNearLimit
                                ? "text-orange-600"
                                : theme === "dark" ? "text-green-400" : "text-green-600"
                            }`}>
                              {Math.round(status.percentage)}%
                            </p>
                            {status.isOverBudget && (
                              <span className="text-xs text-red-600 font-medium">⚠️ Превышен лимит</span>
                            )}
                            {status.isNearLimit && !status.isOverBudget && (
                              <span className="text-xs text-orange-600 font-medium">⚡ Близко к лимиту</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </BudgetsContainer>
              )}

              {showBudgetPreviewModal && (
                <BottomSheetModal
                  key={`budget-preview-${budgetPreviewCategory || 'none'}`}
                  open={showBudgetPreviewModal}
                  onClose={() => {
                    setShowBudgetPreviewModal(false)
                    setBudgetPreviewCategory('')
                  }}
                  theme={theme}
                  zIndex={56}
                >
                  {(() => {
                    const category = budgetPreviewCategory
                    const budget = budgets[category]
                    const status = budgetStatuses[category]
                    const meta = categoriesMeta[category] || {}

                    const hexToRgba = (hex, alpha) => {
                      const h = String(hex || '').replace('#', '')
                      if (h.length !== 6) return `rgba(100,116,139,${alpha})`
                      const r = parseInt(h.slice(0, 2), 16)
                      const g = parseInt(h.slice(2, 4), 16)
                      const b = parseInt(h.slice(4, 6), 16)
                      if ([r, g, b].some((v) => Number.isNaN(v))) return `rgba(100,116,139,${alpha})`
                      return `rgba(${r},${g},${b},${alpha})`
                    }

                    const startDate = budget?.createdAt ? new Date(budget.createdAt) : null
                    const ops = transactions
                      .filter((tx) => {
                        if (tx.type !== 'expense') return false
                        if (tx.category !== category) return false
                        const txDate = new Date(tx.date || tx.created_at)
                        if (startDate && txDate < startDate) return false
                        return true
                      })
                      .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))

                    return (
                      <div style={{ height: '75vh' }} className="flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                            {category || 'Бюджет'}
                          </h3>

                          <button
                            onClick={async () => {
                              if (!category) return
                              const ok = window.confirm('Удалить этот бюджет?')
                              if (!ok) return
                              await deleteBudget(category)
                              setShowBudgetPreviewModal(false)
                              setBudgetPreviewCategory('')
                              vibrateSuccess()
                            }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                              theme === 'dark' ? 'bg-red-600/20 hover:bg-red-600/30' : 'bg-red-50 hover:bg-red-100'
                            }`}
                            aria-label="Удалить бюджет"
                            title="Удалить бюджет"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>

                        <div
                          className={`p-4 rounded-[40px] border mb-3 overflow-hidden ${
                            theme === 'dark' ? 'bg-gray-900/40 border-white/10' : 'bg-white border-gray-200'
                          }`}
                          style={{
                            backgroundImage: theme === 'dark'
                              ? `linear-gradient(135deg, ${hexToRgba(meta.chartColor, 0.28)}, rgba(17,24,39,0.20))`
                              : `linear-gradient(135deg, ${hexToRgba(meta.chartColor, 0.22)}, rgba(255,255,255,0.85))`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Лимит</p>
                              <p className={`text-base font-bold tabular-nums ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrency(status?.limit || budget?.limit || 0)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Потрачено</p>
                              <p className={`text-base font-bold tabular-nums ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrency(status?.spent || 0)}</p>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-black/20' : 'bg-black/10'}`}>
                              <div
                                className={`h-full transition-all duration-500 rounded-full ${
                                  (status?.isOverBudget)
                                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                                    : (status?.isNearLimit)
                                      ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                                      : 'bg-gradient-to-r from-green-400 to-green-500'
                                }`}
                                style={{ width: `${Math.min(status?.percentage || 0, 100)}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Осталось</p>
                              <p className={`text-xs font-semibold tabular-nums ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrency(Math.abs(status?.remaining || 0))}</p>
                            </div>
                          </div>
                        </div>

                        <div
                          className="flex-1 overflow-y-auto overflow-x-hidden"
                          style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}
                          onTouchMove={(e) => {
                            // If there's nothing to scroll, prevent iOS rubber-band which can move the background
                            try {
                              const el = e.currentTarget
                              const canScroll = el && el.scrollHeight > el.clientHeight + 1
                              if (!canScroll) {
                                e.preventDefault()
                              }
                            } catch (err) {}
                          }}
                        >
                          {ops.length === 0 ? (
                            <div className="text-center py-8">
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Пока нет операций по этому бюджету</p>
                            </div>
                          ) : (
                            <div className={`${theme === "dark" ? "divide-white/10" : "divide-gray-200"} divide-y`}>
                              {ops.map((tx) => (
                                <TxRow
                                  tx={{ ...tx, liked: likedTransactions.has(String(tx.id)), comments: transactionComments[tx.id] || [] }}
                                  key={tx.id}
                                  categoriesMeta={categoriesMeta}
                                  formatCurrency={formatCurrency}
                                  formatDate={formatDate}
                                  theme={theme}
                                  onDelete={deleteTransaction}
                                  showCreator={(walletMembers?.length || 0) > 1}
                                  onToggleLike={toggleLike}
                                  onOpenDetails={openTransactionDetails}
                                  tgUserId={tgUserId}
                                  walletMembers={walletMembers}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </BottomSheetModal>
              )}

              {/* Последние операции в стиле pricing cards */}
              <RecentOperationsContainer 
                theme={theme}
                onShowAll={() => setActiveTab("history")}
              >
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
                  <div className={`${theme === "dark" ? "divide-white/10" : "divide-gray-200"} divide-y`}>
                    {transactions.slice(0, 10).map((tx) => (
                      <TxRow
                        tx={{ ...tx, liked: likedTransactions.has(String(tx.id)), comments: transactionComments[tx.id] || [] }}
                        key={tx.id}
                        categoriesMeta={categoriesMeta}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        theme={theme}
                        onDelete={deleteTransaction}
                        showCreator={(walletMembers?.length || 0) > 1}
                        onToggleLike={toggleLike}
                        onOpenDetails={openTransactionDetails}
                        tgUserId={tgUserId}
                        walletMembers={walletMembers}
                      />
                    ))}
                  </div>
                )}
              </RecentOperationsContainer>
            </div>
          )}

          {activeTab === "history" && (
            <div style={{ paddingTop: isFullscreen ? '48px' : '16px' }}>
              <div
                className={`styled-container ${theme}`}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                  e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
                }}
              >
                <div className="container-header">
                  <h3
                    className={`container-title ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                    style={{ minWidth: 0 }}
                  >
                    История операций
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={exportToPDF}
                      className="show-all-button"
                      title="Экспорт в PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowChart(true)
                        setChartType("expense")
                      }}
                      className="show-all-button"
                      title="Показать диаграмму"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="container-content">
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
                  <div className={`${theme === "dark" ? "divide-white/10" : "divide-gray-200"} divide-y`}>
                    {transactions.map((tx) => (
                      <TxRow
                        tx={{ ...tx, liked: likedTransactions.has(tx.id), comments: transactionComments[tx.id] || [] }}
                        key={tx.id}
                        categoriesMeta={categoriesMeta}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        theme={theme}
                        onDelete={deleteTransaction}
                        showCreator={(walletMembers?.length || 0) > 1}
                        onToggleLike={toggleLike}
                        onOpenDetails={openTransactionDetails}
                        tgUserId={tgUserId}
                        walletMembers={walletMembers}
                      />
                    ))}
                  </div>
                )}
                </div>
                
                {/* Эффект свечения */}
                <div className="glow-overlay" />
              </div>
            </div>
          )}

          {activeTab === "ai" && null}

          {activeTab === "savings" && (
            <div className="space-y-4" style={{ paddingTop: isFullscreen ? '48px' : '16px' }}>
              {/* Верхние вкладки: Копилка / Долги */}
              <div className={`mx-4 p-1.5 rounded-full ${
                theme === "dark" ? "bg-gray-800/80" : "bg-gray-200/80"
              } backdrop-blur-sm`}>
                <div className="flex gap-1 relative overflow-hidden">
                  <div
                    className="absolute top-1.5 bottom-1.5 rounded-full"
                    style={{
                      width: '50%',
                      transform: `translateX(${savingsTab === 'debts' ? 100 : 0}%)`,
                      transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
                      backgroundImage:
                        savingsTab === 'debts'
                          ? 'linear-gradient(90deg, rgba(249,115,22,1), rgba(239,68,68,1), rgba(236,72,153,1))'
                          : 'linear-gradient(90deg, rgba(59,130,246,1), rgba(168,85,247,1), rgba(236,72,153,1))',
                    }}
                  />
                  <button
                    onClick={() => {
                      setSavingsTab('savings')
                      vibrateSelect()
                    }}
                    className="flex-1 py-3 rounded-full font-bold transition-all text-sm relative touch-none flex items-center justify-center text-center"
                    style={{ color: savingsTab === 'savings' ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#6B7280') }}
                  >
                    Копилка
                  </button>
                  <button
                    onClick={() => {
                      setSavingsTab('debts')
                      vibrateSelect()
                    }}
                    className="flex-1 py-3 rounded-full font-bold transition-all text-sm relative touch-none flex items-center justify-center text-center"
                    style={{ color: savingsTab === 'debts' ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#6B7280') }}
                  >
                    Долги
                  </button>
                </div>
              </div>

              {savingsTab === 'savings' && (
                <>
              <div
                className={`styled-container ${theme}`}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                  e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
                }}
              >
                <div className="container-header">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`p-1.5 rounded-lg ${theme === "dark" ? "bg-blue-900/40" : "bg-blue-100"}`}>
                      <PiggyBank className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                    </div>
                    <div>
                      <h3
                        className={`container-title ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                        style={{ paddingLeft: 0 }}
                      >
                        Копилка (USD)
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        if (!secondGoalName || secondGoalAmount <= 0) {
                          setShowSecondGoalModal(true)
                        } else if (!thirdGoalName || thirdGoalAmount <= 0) {
                          setShowThirdGoalModal(true)
                        } else {
                          alert('Можно добавить максимум 3 копилки')
                        }
                        vibrate()
                      }}
                      className="show-all-button"
                      title={!secondGoalName || secondGoalAmount <= 0 ? 'Добавить вторую цель' : !thirdGoalName || thirdGoalAmount <= 0 ? 'Добавить третью цель' : 'Максимум 3 копилки'}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowSavingsSettingsModal(true)
                        vibrate()
                      }}
                      className="show-all-button"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="container-content">

                  {/* Прогресс основной копилки */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        Цель копилки
                      </span>
                      <span className={`text-sm font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                        {savingsPct}%
                      </span>
                    </div>
                    <div className={`text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      {goalName}
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          theme === "dark" ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gradient-to-r from-blue-600 to-cyan-600"
                        }`}
                        style={{ width: `${Math.min(savingsPct, 100)}%` }}
                      />
                    </div>
                    <div className={`flex items-center justify-between mt-2 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      <span>{formatCurrency(savings, "USD")}</span>
                      <span>{formatCurrency(goalSavings, "USD")}</span>
                    </div>
                  </div>

                  {/* Вторая цель */}
                  {secondGoalName && secondGoalAmount > 0 && (
                    <div className={`mb-3 pt-3 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                          {secondGoalName}
                        </span>
                        <span className={`text-sm font-bold ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`}>
                          {Math.round((secondGoalSavings / secondGoalAmount) * 100)}%
                        </span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            theme === "dark" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-purple-600 to-pink-600"
                          }`}
                          style={{ width: `${Math.min((secondGoalSavings / secondGoalAmount) * 100, 100)}%` }}
                        />
                      </div>
                      <div className={`flex items-center justify-between mt-2 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        <span>{formatCurrency(secondGoalSavings, "USD")}</span>
                        <span>{formatCurrency(secondGoalAmount, "USD")}</span>
                      </div>
                    </div>
                  )}

                  {/* Третья цель */}
                  {thirdGoalName && thirdGoalAmount > 0 && (
                    <div className={`mb-3 pt-3 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                          {thirdGoalName}
                        </span>
                        <span className={`text-sm font-bold ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                          {Math.round((thirdGoalSavings / thirdGoalAmount) * 100)}%
                        </span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            theme === "dark" ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-gradient-to-r from-emerald-600 to-cyan-600"
                          }`}
                          style={{ width: `${Math.min((thirdGoalSavings / thirdGoalAmount) * 100, 100)}%` }}
                        />
                      </div>
                      <div className={`flex items-center justify-between mt-2 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        <span>{formatCurrency(thirdGoalSavings, "USD")}</span>
                        <span>{formatCurrency(thirdGoalAmount, "USD")}</span>
                      </div>
                    </div>
                  )}

                  {/* Кнопки действий */}
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => {
                        setTransactionType("savings")
                        setShowAddModal(true)
                        vibrate()
                      }}
                      className={`w-full max-w-[360px] flex items-center justify-center gap-2 px-5 py-3 rounded-[40px] font-semibold transition-all text-sm touch-none active:scale-95 ${
                        theme === "dark"
                          ? "bg-black text-white"
                          : "bg-black text-white"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Пополнить
                    </button>
                  </div>
                </div>
                
                {/* Эффект свечения */}
                <div className="glow-overlay" />
              </div>

              <div
                className={`styled-container ${theme}`}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                  e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
                }}
              >
                <div className="container-header">
                  <h3
                    className={`container-title ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                    style={{ minWidth: 0 }}
                  >
                    История пополнений
                  </h3>
                </div>
                
                <div className="container-content">
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
                          tx={{ ...tx, liked: likedTransactions.has(tx.id), comments: transactionComments[tx.id] || [] }}
                          key={tx.id}
                          categoriesMeta={categoriesMeta}
                          formatCurrency={formatCurrency}
                          formatDate={formatDate}
                          theme={theme}
                          onDelete={deleteTransaction}
                          showCreator={(walletMembers?.length || 0) > 1}
                          onToggleLike={toggleLike}
                          onOpenDetails={openTransactionDetails}
                          tgUserId={tgUserId}
                          walletMembers={walletMembers}
                        />
                      ))}
                  </div>
                )}
                </div>
                
                {/* Эффект свечения */}
                <div className="glow-overlay" />
              </div>
              </>
              )}

              {savingsTab === 'debts' && (
                <div
                  className={`styled-container ${theme}`}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = ((e.clientX - rect.left) / rect.width) * 100
                    const y = ((e.clientY - rect.top) / rect.height) * 100
                    e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                    e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
                  }}
                >
                  <div className="container-header">
                    <h3
                      className={`container-title ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                      style={{ minWidth: 0 }}
                    >
                      Долги
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setShowAddDebtModal(true)
                          vibrate()
                        }}
                        className="show-all-button"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="container-content">
                  {debts.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">💰</div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                        Нет долгов
                      </h3>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        Нажмите "+" чтобы добавить долг
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {debts.map((debt) => (
                        <div
                          key={debt.id}
                          className={`rounded-[40px] p-4 border ${
                            debt.type === 'owe'
                              ? theme === "dark"
                                ? "bg-red-900/20 border-red-700/30"
                                : "bg-red-50 border-red-200"
                              : theme === "dark"
                                ? "bg-green-900/20 border-green-700/30"
                                : "bg-green-50 border-green-200"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">
                                {debt.type === 'owe' ? '📤' : '📥'}
                              </span>
                              <div className="min-w-0">
                                <h4 className={`font-bold truncate ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                                  {debt.person}
                                </h4>
                                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                  {debt.type === 'owe' ? 'Я должен' : 'Мне должны'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${
                                debt.type === 'owe'
                                  ? theme === "dark" ? "text-red-400" : "text-red-600"
                                  : theme === "dark" ? "text-green-400" : "text-green-600"
                              }`}>
                                {formatCurrency(debt.amount)}
                              </p>
                            </div>
                          </div>
                          {debt.description && (
                            <p className={`text-sm break-words ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                              {debt.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => repayDebt(debt)}
                              className={`flex-1 py-2 rounded-[40px] text-xs font-medium transition-all ${
                                theme === "dark"
                                  ? "bg-green-700 hover:bg-green-600 text-white"
                                  : "bg-green-500 hover:bg-green-600 text-white"
                              }`}
                            >
                              Погашено
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Удалить этот долг?')) {
                                  deleteDebt(debt.id)
                                }
                              }}
                              className={`px-4 py-2 rounded-[40px] text-xs font-medium transition-all ${
                                theme === "dark"
                                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                              }`}
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                  
                  {/* Эффект свечения */}
                  <div className="glow-overlay" />
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4" style={{ paddingTop: isFullscreen ? '48px' : '16px' }}>
              {/* Приветствие с аватаркой - только для незалогиненных */}
              {!isAuthenticated && (
                <div
                  className={`styled-container ${theme}`}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = ((e.clientX - rect.left) / rect.width) * 100
                    const y = ((e.clientY - rect.top) / rect.height) * 100
                    e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                    e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
                  }}
                >
                  <div className="container-header">
                    <h3
                      className={`container-title ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                      style={{ minWidth: 0 }}
                    >
                      Приветствие
                    </h3>
                  </div>
                  
                  <div className="container-content">
                    <div className="flex items-center gap-3">
                      {tgPhotoUrl ? (
                        <img
                          src={tgPhotoUrl}
                          alt="Avatar"
                          className="w-14 h-14 rounded-full flex-shrink-0 object-cover ring-2 ring-white/20"
                        />
                      ) : (
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                            theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        >
                          <User className={`w-7 h-7 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
                        </div>
                      )}

                      <div>
                        <h2 className={`text-xl font-bold mb-0.5 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          Привет, {displayName}! 👋
                        </h2>
                        <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Добро пожаловать в ваш финансовый помощник
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Эффект свечения */}
                  <div className="glow-overlay" />
                </div>
              )}

              <div
                className={`styled-container ${theme}`}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                  e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
                }}
              >
                <div className="container-header">
                  <div className="flex items-center justify-between w-full gap-2">
                    <h3
                      className={`container-title ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                      style={{ minWidth: 0 }}
                    >
                      Аккаунт
                    </h3>
                    {!isSharedWalletView && (
                      <button
                        onClick={inviteUser}
                        className={`h-8 px-2.5 rounded-[40px] flex items-center justify-center gap-1.5 transition-all touch-none active:scale-95 mr-1.5 ${
                          theme === "dark"
                            ? "bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white"
                            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        }`}
                        title="Пригласить пользователя"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="text-[11px] font-semibold">пригласить</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="container-content">
                  {linkedUsers.length > 1 && (
                    <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      Семейный аккаунт
                    </p>
                  )}

                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div
                        className={`flex items-center gap-3 p-3 rounded-[40px] border ${
                          theme === "dark" ? "bg-green-900/30 border-green-700/30" : "bg-green-50 border-green-200"
                        }`}
                      >
                        {tgPhotoUrl ? (
                          <img
                            src={tgPhotoUrl}
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
                            {displayName || (user && user.first_name) || 'Пользователь'}
                          </p>
                          <p className={`text-xs truncate ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {currentUserEmail || (user && user.email) || ''}
                          </p>
                        </div>
                      </div>

                      {!isSharedWalletView && linkedUsers.length > 1 && (
                        <div className="mb-3">
                          <button
                            onClick={() => {
                              setShowLinkedUsersDropdown(!showLinkedUsersDropdown)
                              vibrate()
                            }}
                            className={`w-full flex items-center justify-between gap-2 min-w-0 p-3 rounded-[40px] border transition-all ${
                              theme === "dark" 
                                ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700" 
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <span className={`text-sm font-medium truncate ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                              Пользователи ({linkedUsers.length})
                            </span>
                            {showLinkedUsersDropdown ? (
                              <ChevronUp className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                            ) : (
                              <ChevronDown className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                            )}
                          </button>
                          
                          {showLinkedUsersDropdown && (
                            <div className="space-y-2 mt-2">
                              {linkedUsers
                                .filter((u) => String(u.telegram_id) !== String(tgUserId))
                                .map((linkedUser) => (
                                  <LinkedUserRow
                                    key={linkedUser.telegram_id}
                                    linkedUser={linkedUser}
                                    currentTelegramId={tgUserId}
                                    theme={theme}
                                    vibrate={vibrate}
                                    removeLinkedUser={removeLinkedUser}
                                  />
                                ))}
                            </div>
                          )}
                        </div>
                      )}

                      {walletMembers.filter((m) => String(m.member_telegram_id) !== String(tgUserId)).length > 0 && (
                        <div className="mb-3">
                          <button
                            onClick={() => {
                              setShowWalletMembersDropdown(!showWalletMembersDropdown)
                              vibrate()
                            }}
                            className={`w-full flex items-center justify-between gap-2 min-w-0 p-3 rounded-[40px] border transition-all ${
                              theme === "dark"
                                ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <span className={`text-sm font-medium truncate ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                              Участники кошелька ({walletMembers.filter((m) => String(m.member_telegram_id) !== String(tgUserId)).length})
                            </span>
                            {showWalletMembersDropdown ? (
                              <ChevronUp className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                            ) : (
                              <ChevronDown className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                            )}
                          </button>

                          {showWalletMembersDropdown && (
                            <div className="space-y-2 mt-2">
                              {walletMembers
                                .filter((m) => String(m.member_telegram_id) !== String(tgUserId))
                                .map((m) => (
                                  <WalletMemberRow
                                    key={`${m.owner_email}-${m.member_telegram_id}`}
                                    member={m}
                                    theme={theme}
                                    isSelf={false}
                                    onOpen={openWalletMemberModal}
                                  />
                                ))}
                            </div>
                          )}
                        </div>
                      )}

                      {isSharedWalletView && (
                        <button
                          onClick={leaveSharedWallet}
                          className={`w-full py-3 rounded-[40px] font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm touch-none active:scale-95 ${
                            theme === "dark"
                              ? "bg-amber-700 hover:bg-amber-600 text-white"
                              : "bg-amber-500 hover:bg-amber-600 text-white"
                          }`}
                        >
                          <LogOut className="w-4 h-4" />
                          Выйти из семейного аккаунта
                        </button>
                      )}
                      
                      {!isTelegramNativeUser && (
                        <button
                          onClick={handleLogout}
                          className={`w-full py-3 rounded-[40px] font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm touch-none active:scale-95 ${
                            theme === "dark"
                              ? "bg-rose-700 hover:bg-rose-600 text-white"
                              : "bg-rose-500 hover:bg-rose-600 text-white"
                          }`}
                        >
                          <LogOut className="w-4 h-4" />
                          Выйти
                        </button>
                      )}
                    </div>
                ) : (
                    <div className="space-y-3">
                      <div
                        className={`p-3 rounded-[40px] border ${
                          theme === "dark" ? "bg-blue-900/30 border-blue-700/30" : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                          Войдите в учетную запись через email, чтобы синхронизировать данные на всех устройствах.
                        </p>
                      </div>
                      
                      {/* Описание совместного кошелька */}
                      <div className={`p-3 rounded-[40px] border ${
                        theme === "dark" ? "bg-purple-900/20 border-purple-700/30" : "bg-purple-50 border-purple-200"
                      }`}>
                        <div className="flex items-start gap-2">
                          <Users className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
                          <div>
                            <p className={`text-xs font-medium mb-1 ${theme === "dark" ? "text-purple-300" : "text-purple-700"}`}>
                              Совместный кошелек
                            </p>
                            <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                              Пригласите друзей или членов семьи для совместного управления бюджетом. 
                              Они автоматически подключатся к вашему аккаунту через Telegram и смогут видеть общие расходы и доходы.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Кнопка приглашения перенесена в шапку блока "Аккаунт" */}
                      
                      <button
                        onClick={() => {
                          setShowAuthModal(true)
                          setAuthMode("login")
                        }}
                        className={`w-full py-3 rounded-[40px] font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm touch-none active:scale-95 ${
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
              </div>

              <div
                className={`styled-container ${theme}`}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                  e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
                }}
              >
                <div className="container-header">
                  <h3
                    className={`container-title ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                    style={{ minWidth: 0 }}
                  >
                    Настройки
                  </h3>
                </div>
                
                <div className="container-content">

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
                        style={{ touchAction: 'manipulation' }}
                        className={`w-full p-3 border rounded-[40px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
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
                        style={{ touchAction: 'manipulation' }}
                        className={`w-full p-3 border rounded-[40px] transition-all text-left text-sm active:scale-95 ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
                            : "bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        {theme === "dark" ? "🌙 Тёмная" : "☀️ Светлая"}
                      </button>
                    </div>

                    {tg && (tg.requestFullscreen || tg.exitFullscreen) && (
                      <div>
                        <label
                          className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Полноэкранный режим
                        </label>
                        <button
                          onClick={toggleFullscreen}
                          style={{ touchAction: 'manipulation' }}
                          className={`w-full p-3 border rounded-[40px] transition-all text-left text-sm active:scale-95 flex items-center gap-2 ${
                            theme === "dark"
                              ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
                              : "bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100"
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
                  </div>
                </div>
              </div>

              {/* Бюджеты */}
              <div
                className={`styled-container ${theme}`}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                  e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
                }}
              >
                <div className="container-header">
                  <h3
                    className={`container-title ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                    style={{ minWidth: 0 }}
                  >
                    Бюджеты и лимиты
                  </h3>
                </div>
                
                <div className="container-content">
                  <button
                    onClick={() => {
                      blurAll()
                      setShowBudgetModal(true)
                      setSelectedBudgetCategory('')
                      setBudgetLimitInput('')
                      vibrate()
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-[40px] border transition-all active:scale-95 ${
                      theme === "dark"
                        ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span className={`flex items-center gap-2 min-w-0 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                      <BarChart3 className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {Object.keys(budgets).length > 0 ? 'Управление бюджетами' : 'Настроить бюджеты'}
                      </span>
                    </span>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                  </button>
                  {Object.keys(budgets).length > 0 && (
                    <p className={`text-xs mt-2 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Активных бюджетов: {Object.keys(budgets).length}
                    </p>
                  )}
                </div>
                
                {/* Эффект свечения */}
                <div className="glow-overlay" />
              </div>

              {/* Системные настройки (раскрываемое меню) */}
              <div
                className={`styled-container ${theme}`}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
                  e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
                }}
              >
                <div className="container-header">
                  <h3
                    className={`container-title ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                    style={{ minWidth: 0 }}
                  >
                    Системные настройки
                  </h3>
                </div>
                
                <div className="container-content">
                  <button
                    onClick={() => {
                      setShowSystemSettings(!showSystemSettings)
                      vibrate()
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-[40px] border transition-all ${
                      theme === "dark" 
                        ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700" 
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span className={`text-sm font-medium truncate ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                      ⚙️ Системные настройки
                    </span>
                    {showSystemSettings ? (
                      <ChevronUp className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                    ) : (
                      <ChevronDown className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                    )}
                  </button>
                  
                  {showSystemSettings && (
                    <div className="space-y-3 mt-3">
                      {/* Исправление данных */}
                      <div
                        className={`rounded-[40px] p-3 ${theme === "dark" ? "bg-gray-800/40" : "bg-gray-50"}`}
                      >
                        <h4 className={`text-sm font-bold mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                          Исправление данных
                        </h4>
                        <button
                          onClick={recalculateBalance}
                          className={`w-full py-2 rounded-[40px] font-medium transition-all shadow text-xs active:scale-95 flex items-center justify-center gap-2 ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600 text-gray-100" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                        >
                          <RefreshCw className="w-3 h-3" />
                          Пересчитать баланс
                        </button>
                        <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Пересчитывает баланс на основе всех транзакций. Используйте, если баланс некорректен.
                        </p>
                      </div>

                      {/* Опасная зона */}
                      <div className={`rounded-[40px] p-3 ${theme === "dark" ? "bg-gray-800/40" : "bg-gray-50"}`}>
                        <h4 className={`text-sm font-bold mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                          Опасная зона
                        </h4>
                        <button
                          onClick={handleResetAll}
                          className={`w-full py-2 rounded-[40px] font-medium transition-all shadow text-xs touch-none active:scale-95 ${
                            theme === "dark" ? "bg-red-700 hover:bg-red-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                        >
                          Сбросить все данные
                        </button>
                        <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Удалит все транзакции, бюджеты и настройки. Это действие необратимо!
                        </p>
                      </div>

                      {isWalletOwner && (
                        <div
                          className={`rounded-[40px] p-3 ${theme === "dark" ? "bg-gray-800/40" : "bg-gray-50"}`}
                        >
                          <h4 className={`text-sm font-bold mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                            Управление доступом
                          </h4>
                          <button
                            onClick={async () => {
                              await loadBlockedWalletMembers(ownerWalletEmail)
                              setShowBlockedUsersModal(true)
                            }}
                            className={`w-full py-2 rounded-[40px] font-medium transition-all shadow text-xs active:scale-95 flex items-center justify-center gap-2 ${
                              theme === "dark"
                                ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            }`}
                          >
                            <Shield className="w-3 h-3" />
                            Заблокированные пользователи
                          </button>
                          <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            Список пользователей, которым запрещён доступ к вашему семейному кошельку.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Эффект свечения */}
                <div className="glow-overlay" />
              </div>
            </div>
          )}
        </div>
      </main>

      {showGoalModal && (
        <BottomSheetModal
          open={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          theme={theme}
          zIndex={50}
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
                {(() => {
                  const items = [
                    { key: 'main', label: goalName || 'Основная' },
                    { key: 'second', label: secondGoalName || 'Вторая' },
                  ]
                  const idx = Math.max(0, items.findIndex((i) => i.key === selectedSavingsGoal))
                  return (
                    <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-100'} rounded-3xl p-1 flex relative overflow-hidden`}>
                      <div
                        className="absolute top-1 bottom-1 rounded-3xl"
                        style={{
                          width: '50%',
                          transform: `translateX(${idx * 100}%)`,
                          transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
                          backgroundColor: '#000000',
                        }}
                      />
                      {items.map((it) => (
                        <button
                          key={it.key}
                          onClick={() => setSelectedSavingsGoal(it.key)}
                          className="flex-1 py-3 px-3 rounded-3xl text-sm font-semibold transition-all relative touch-none"
                          style={{
                            color: selectedSavingsGoal === it.key ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#6B7280'),
                          }}
                        >
                          <span className="truncate block" style={{ overflowWrap: 'anywhere' }}>{it.label}</span>
                        </button>
                      ))}
                    </div>
                  )
                })()}
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
                Добавить
              </button>
            </div>
        </BottomSheetModal>
      )}

      {showThirdGoalModal && (
        <BottomSheetModal
          open={showThirdGoalModal}
          onClose={() => setShowThirdGoalModal(false)}
          theme={theme}
          zIndex={65}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              Третья копилка
            </h3>
          </div>

          {(() => {
            const previewName = String(thirdGoalName || '').trim() || 'Копилка'
            const previewTarget = Number.parseFloat(String(thirdGoalInput || '0').replace(/,/g, '.')) || 0
            const previewPct = Math.round((Number(thirdGoalSavings || 0) / (previewTarget > 0 ? previewTarget : 1)) * 100)
            const safePct = Math.max(0, Math.min(100, Number.isFinite(previewPct) ? previewPct : 0))

            return (
              <div
                className={`rounded-[40px] p-4 mb-4 relative overflow-hidden border ${
                  theme === 'dark' ? 'bg-gray-900/40 border-white/10' : 'bg-white border-gray-200'
                }`}
                style={{
                  backgroundImage: theme === 'dark'
                    ? 'linear-gradient(180deg, rgba(34,197,94,0.24), rgba(16,185,129,0.08))'
                    : 'linear-gradient(180deg, rgba(34,197,94,0.18), rgba(16,185,129,0.06))',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className={`text-lg font-bold truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{previewName}</div>
                    <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatCurrency(Number(thirdGoalSavings || 0), 'USD')} из {formatCurrency(previewTarget, 'USD')}
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-2xl font-bold ${theme === 'dark' ? 'bg-white/10 text-gray-100' : 'bg-white text-gray-900'}`}>
                    {safePct}%
                  </div>
                </div>

                <div className={`mt-3 h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                        : 'bg-gradient-to-r from-emerald-600 to-cyan-600'
                    }`}
                    style={{ width: `${safePct}%` }}
                  />
                </div>
              </div>
            )
          })()}

          <div className="mb-3">
            <label className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Название
            </label>
            <input
              type="text"
              value={thirdGoalName}
              onChange={(e) => setThirdGoalName(e.target.value)}
              className={`w-full p-3 border rounded-[40px] transition-all text-sm ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-emerald-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              }`}
              placeholder="Например: Ремонт"
            />
          </div>

          <div className="mb-4">
            <label className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Сумма цели (USD)
            </label>
            <input
              type="text"
              value={thirdGoalInput}
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              onChange={(e) => setThirdGoalInput(e.target.value.replace(/^0+(?=\d)/, '') || '0')}
              className={`w-full p-3 border rounded-[40px] transition-all text-lg font-bold ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-emerald-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              }`}
            />
          </div>

          <button
            onClick={async () => {
              const n = Number.parseFloat(String(thirdGoalInput || '0').replace(/,/g, '.'))
              if (!thirdGoalName.trim() || Number.isNaN(n) || n <= 0) {
                vibrateError()
                alert('Введите название и корректную сумму')
                return
              }
              const nextName = String(thirdGoalName || '').trim()
              const nextAmount = n

              setThirdGoalName(nextName)
              setThirdGoalAmount(nextAmount)

              try {
                if (user && user.email) {
                  await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      goalName,
                      initialSavingsAmount,
                      secondGoalName,
                      secondGoalAmount,
                      secondGoalSavings,
                      secondGoalInitialAmount,
                      thirdGoalName: nextName,
                      thirdGoalAmount: nextAmount,
                      thirdGoalSavings,
                      thirdGoalInitialAmount,
                    }),
                  })
                }
              } catch (e) {
                console.warn('Failed to save third goal', e)
              }
              setShowThirdGoalModal(false)
              vibrateSuccess()
            }}
            className={`w-full py-3 rounded-[40px] font-medium transition-all text-sm touch-none active:scale-95 ${
              theme === "dark"
                ? "bg-emerald-700 hover:bg-emerald-600 text-white"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            Добавить
          </button>
        </BottomSheetModal>
      )}

      {showAiModal && (
        <BottomSheetModal
          open={showAiModal}
          onClose={() => setShowAiModal(false)}
          theme={theme}
          zIndex={80}
        >
          <div style={{ height: '75vh' }} className="flex flex-col">
            <div className="px-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-2xl border"
                style={{
                  borderColor: theme === 'dark' ? 'rgba(55,65,81,0.45)' : 'rgba(229,231,235,0.9)',
                  background: theme === 'dark' ? 'rgba(17,24,39,0.75)' : 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, rgba(168,85,247,0.85), rgba(236,72,153,0.85))',
                        filter: 'blur(10px)',
                        opacity: 0.6,
                      }}
                    />
                    <div className="relative rounded-full p-2"
                      style={{ background: 'linear-gradient(90deg, rgb(168,85,247), rgb(236,72,153))' }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                      AI Ассистент
                    </div>
                    <div className={`text-[11px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Всегда на связи
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {aiMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Sparkles className={`w-12 h-12 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-500'}`} />
                  <div className={`mt-3 text-base font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                    Привет! Я здесь, чтобы помочь
                  </div>
                  <div className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Задайте вопрос или начните разговор
                  </div>
                </div>
              ) : (
                aiMessages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'text-white rounded-3xl rounded-br-md'
                          : theme === 'dark'
                            ? 'bg-gray-800/70 text-gray-100 rounded-3xl rounded-bl-md'
                            : 'bg-gray-100 text-gray-800 rounded-3xl rounded-bl-md'
                      }`}
                      style={
                        m.role === 'user'
                          ? { background: 'linear-gradient(90deg, rgb(168,85,247), rgb(236,72,153))' }
                          : {
                              whiteSpace: 'pre-wrap',
                              overflowWrap: 'anywhere',
                              wordBreak: 'break-word',
                            }
                      }
                    >
                      <span
                        style={{
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere',
                          wordBreak: 'break-word',
                        }}
                      >
                        {m.content}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {aiLoading && (
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Анализирую…</div>
              )}
            </div>

            <div className="px-4 pb-4 pt-3"
              style={{
                background: theme === 'dark' ? 'rgba(17,24,39,0.92)' : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                borderTop: theme === 'dark' ? '1px solid rgba(55,65,81,0.4)' : '1px solid rgba(229,231,235,0.8)',
              }}
            >
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => sendAiMessage('Проанализируй мои финансы и дай рекомендации по экономии и бюджету')}
                  className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700/70 hover:bg-gray-600/70 text-gray-100'
                      : 'bg-gray-200/80 hover:bg-gray-300/80 text-gray-900'
                  }`}
                  disabled={aiLoading}
                >
                  Проанализировать
                </button>
              </div>

              <div className="flex items-end gap-2">
                <div className={`flex-1 rounded-3xl px-4 py-3 flex items-center gap-2 ${
                  theme === 'dark' ? 'bg-gray-800/70' : 'bg-gray-100/80'
                }`}>
                  <input
                    ref={aiInputRef}
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Сообщение..."
                    className={`flex-1 bg-transparent outline-none text-base ${theme === 'dark' ? 'text-gray-100 placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
                  />
                </div>
                <button
                  onClick={() => sendAiMessage(aiInput)}
                  disabled={aiLoading || !aiInput.trim()}
                  className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all touch-none active:scale-95 ${
                    aiLoading || !aiInput.trim()
                      ? theme === 'dark'
                        ? 'bg-gray-700 text-gray-500'
                        : 'bg-gray-200 text-gray-400'
                      : ''
                  }`}
                  style={
                    aiLoading || !aiInput.trim()
                      ? undefined
                      : { background: 'linear-gradient(90deg, rgb(168,85,247), rgb(236,72,153))' }
                  }
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </BottomSheetModal>
      )}

      {showBlockedUsersModal && (
        <BottomSheetModal
          open={showBlockedUsersModal}
          onClose={() => setShowBlockedUsersModal(false)}
          theme={theme}
          zIndex={70}
        >
          <div className="max-h-[78vh] overflow-auto pr-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                Заблокированные пользователи
              </h3>
            </div>

            {blockedWalletMembers.length === 0 ? (
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Нет заблокированных пользователей.
              </div>
            ) : (
              <div className="space-y-2">
                {blockedWalletMembers.map((m) => (
                  <div
                    key={`${m.owner_email}-${m.member_telegram_id}`}
                    className={`p-3 rounded-2xl border flex items-center gap-3 ${
                      theme === 'dark' ? 'bg-gray-800/40 border-gray-700/40' : 'bg-white border-gray-200'
                    }`}
                  >
                  {m.photo_url ? (
                    <img src={m.photo_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    >
                      <User className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                      {m.telegram_name || `TG ${m.member_telegram_id}`}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Заблокирован
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        if (!ownerWalletEmail) {
                          alert('Не удалось определить владельца кошелька')
                          return
                        }
                        const resp = await fetch(
                          `${API_URL}/api/wallet/${encodeURIComponent(ownerWalletEmail)}/unblock/${encodeURIComponent(
                            String(m.member_telegram_id),
                          )}`,
                          { method: 'POST' },
                        )
                        if (!resp.ok) {
                          const j = await resp.json().catch(() => ({}))
                          alert(j.error || 'Не удалось разблокировать')
                          return
                        }
                        await loadBlockedWalletMembers(ownerWalletEmail)
                        await loadWalletMembers(ownerWalletEmail)
                      } catch (e) {
                        alert('Не удалось разблокировать')
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all touch-none active:scale-95 ${
                      theme === 'dark' ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    Разблокировать
                  </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </BottomSheetModal>
      )}

      {showWalletMemberModal && selectedWalletMember && (
        <BottomSheetModal
          open={showWalletMemberModal}
          onClose={() => {
            setShowWalletMemberModal(false)
            setSelectedWalletMember(null)
          }}
          theme={theme}
          zIndex={70}
        >
          <div className="flex items-center gap-3 mb-4">
            {selectedWalletMember.photo_url ? (
              <img
                src={selectedWalletMember.photo_url}
                alt="Avatar"
                className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                <User className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
            )}

            <div className="min-w-0">
              <div className={`text-base font-bold truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                {selectedWalletMember.telegram_name || `TG ${selectedWalletMember.member_telegram_id}`}
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedWalletMember.status === 'blocked' ? 'Заблокирован' : 'Активен'}
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/40' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Последний заход</div>
              <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                {formatDateTime(selectedWalletMember.last_seen_at) || '—'}
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/40' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>IP</div>
              <div className={`text-sm font-medium break-all ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                {selectedWalletMember.last_ip || '—'}
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/40' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Устройство</div>
              <div className={`text-xs break-words ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                {selectedWalletMember.last_user_agent || '—'}
              </div>
            </div>
          </div>

          {isWalletOwner && String(selectedWalletMember.member_telegram_id) !== String(tgUserId) && (
            <div className="flex gap-2">
              {selectedWalletMember.status !== 'blocked' ? (
                <button
                  onClick={async () => {
                    await updateMemberStatus(ownerWalletEmail, selectedWalletMember.member_telegram_id, 'blocked')
                    setShowWalletMemberModal(false)
                    setSelectedWalletMember(null)
                  }}
                  className={`flex-1 py-3 rounded-[40px] font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm touch-none active:scale-95 ${
                    theme === 'dark' ? 'bg-amber-700 hover:bg-amber-600 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  Заблокировать
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await updateMemberStatus(ownerWalletEmail, selectedWalletMember.member_telegram_id, 'active')
                    setShowWalletMemberModal(false)
                    setSelectedWalletMember(null)
                  }}
                  className={`flex-1 py-3 rounded-[40px] font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm touch-none active:scale-95 ${
                    theme === 'dark' ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  Разблокировать
                </button>
              )}

              <button
                onClick={async () => {
                  if (!confirm('Удалить пользователя из кошелька?')) return
                  await deleteMember(ownerWalletEmail, selectedWalletMember.member_telegram_id)
                  setShowWalletMemberModal(false)
                  setSelectedWalletMember(null)
                }}
                className={`flex-1 py-3 rounded-[40px] font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm touch-none active:scale-95 ${
                  theme === 'dark' ? 'bg-rose-700 hover:bg-rose-600 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                Удалить из аккаунта
              </button>
            </div>
          )}
        </BottomSheetModal>
      )}

      {showSavingsSettingsModal && (
        <BottomSheetModal
          open={showSavingsSettingsModal}
          onClose={() => setShowSavingsSettingsModal(false)}
          theme={theme}
          zIndex={60}
        >
          <SavingsSettingsModalContent
            theme={theme}
            API_BASE={API_BASE}
            user={user}
            selectedSavingsGoal={selectedSavingsGoal}
            setSelectedSavingsGoal={setSelectedSavingsGoal}
            goalName={goalName}
            setGoalName={setGoalName}
            goalSavings={goalSavings}
            setGoalSavings={setGoalSavings}
            setGoalInput={setGoalInput}
            savings={savings}
            setSavings={setSavings}
            initialSavingsAmount={initialSavingsAmount}
            setInitialSavingsAmount={setInitialSavingsAmount}
            secondGoalName={secondGoalName}
            setSecondGoalName={setSecondGoalName}
            secondGoalAmount={secondGoalAmount}
            setSecondGoalAmount={setSecondGoalAmount}
            secondGoalSavings={secondGoalSavings}
            setSecondGoalSavings={setSecondGoalSavings}
            secondGoalInitialAmount={secondGoalInitialAmount}
            setSecondGoalInitialAmount={setSecondGoalInitialAmount}
            setSecondGoalInput={setSecondGoalInput}
            thirdGoalName={thirdGoalName}
            setThirdGoalName={setThirdGoalName}
            thirdGoalAmount={thirdGoalAmount}
            setThirdGoalAmount={setThirdGoalAmount}
            thirdGoalSavings={thirdGoalSavings}
            setThirdGoalSavings={setThirdGoalSavings}
            thirdGoalInitialAmount={thirdGoalInitialAmount}
            setThirdGoalInitialAmount={setThirdGoalInitialAmount}
            setThirdGoalInput={setThirdGoalInput}
            balance={balance}
            income={income}
            expenses={expenses}
            saveToServer={saveToServer}
            vibrateSuccess={vibrateSuccess}
            vibrateError={vibrateError}
            onClose={() => setShowSavingsSettingsModal(false)}
            formatCurrency={formatCurrency}
          />
        </BottomSheetModal>
      )}

      {showChart && (
        <BottomSheetModal
          open={showChart}
          onClose={() => setShowChart(false)}
          theme={theme}
          zIndex={50}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              {chartType === 'income' ? 'Диаграмма доходов' : 'Диаграмма расходов'}
            </h3>
          </div>

          <div className="mb-4">
            <div className={`p-1.5 rounded-full ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-200/80'} backdrop-blur-sm`}> 
              <div className="flex gap-1">
                <button
                  onClick={() => setChartType('expense')}
                  className={`flex-1 py-2.5 rounded-full font-bold transition-all text-sm touch-none active:scale-95 ${
                    chartType === 'expense'
                      ? 'bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white shadow-xl'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Расходы
                </button>
                <button
                  onClick={() => setChartType('income')}
                  className={`flex-1 py-2.5 rounded-full font-bold transition-all text-sm touch-none active:scale-95 ${
                    chartType === 'income'
                      ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-xl'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Доходы
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setChartView('pie')}
                className={`flex-1 py-2 rounded-xl font-semibold transition-all text-sm touch-none active:scale-95 ${
                  chartView === 'pie'
                    ? theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                    : theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="inline-flex items-center justify-center gap-1">
                  <PieChart className="w-4 h-4" />
                  Pie
                </span>
              </button>
              <button
                onClick={() => setChartView('bar')}
                className={`flex-1 py-2 rounded-xl font-semibold transition-all text-sm touch-none active:scale-95 ${
                  chartView === 'bar'
                    ? theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                    : theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="inline-flex items-center justify-center gap-1">
                  <BarChart2 className="w-4 h-4" />
                  Bar
                </span>
              </button>
              <button
                onClick={() => setChartView('line')}
                className={`flex-1 py-2 rounded-xl font-semibold transition-all text-sm touch-none active:scale-95 ${
                  chartView === 'line'
                    ? theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white'
                    : theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="inline-flex items-center justify-center gap-1">
                  <TrendingUpIcon className="w-4 h-4" />
                  Line
                </span>
              </button>
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
        </BottomSheetModal>
      )}

      {showAuthModal && (
        <BottomSheetModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          theme={theme}
          zIndex={50}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              {authMode === "login" ? "Вход" : "Регистрация"}
            </h3>
          </div>
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
        </BottomSheetModal>
      )}

      {/* Модальное окно смены пароля */}
      {showChangePasswordModal && (
        <BottomSheetModal
          open={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          theme={theme}
          zIndex={50}
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
        </BottomSheetModal>
      )}

      {showTransactionDetails && selectedTransaction && (
        <BottomSheetModal
          open={showTransactionDetails}
          onClose={() => setShowTransactionDetails(false)}
          theme={theme}
          zIndex={55}
        >
          {(() => {
            const tx = selectedTransaction
            const categoryInfo = categoriesMeta[tx.category] || categoriesMeta['Другое']
            const isLiked = likedTransactions.has(String(tx.id))
            const comments = transactionComments[tx.id] || []
            const txColor =
              tx.type === 'income' ? '#34C759' : tx.type === 'expense' ? '#FF3B30' : '#007AFF'

            const getDetailsCommentKey = (comment) => {
              const id = comment?.telegram_id ?? comment?.created_by_telegram_id ?? comment?.telegramId ?? comment?.telegramID
              if (id != null) return `tg:${String(id)}`
              const author = comment?.author
              if (author) return `author:${String(author)}`
              return null
            }

            const getDetailsCommentPhotoUrl = (comment) => {
              const id = comment?.telegram_id ?? comment?.created_by_telegram_id ?? comment?.telegramId ?? comment?.telegramID
              if (id != null && Array.isArray(walletMembers)) {
                const found = walletMembers.find((m) => String(m?.telegram_id) === String(id))
                if (found?.telegram_photo_url) return found.telegram_photo_url
              }
              if (id != null && tgUserId && String(id) === String(tgUserId) && tgPhotoUrl) {
                return tgPhotoUrl
              }
              return (
                comment?.telegram_photo_url ||
                comment?.photo_url ||
                comment?.author_photo_url ||
                comment?.created_by_telegram_photo_url ||
                comment?.created_by_photo_url ||
                null
              )
            }

            const handleClose = () => {
              setShowTransactionDetails(false)
              setDetailsCommentText('')
              try {
                blurAll()
              } catch (e) {}
            }

            return (
              <div className="flex flex-col overflow-hidden" style={{ height: '75vh' }}>
                <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="px-1">
                    <div className={`px-3 py-3 flex items-center justify-between border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                      <h1 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-2xl font-bold`} style={{ letterSpacing: '-0.5px' }}>
                        Детали операции
                      </h1>

                    <button
                      type="button"
                      onClick={() => {
                        deleteTransaction(tx.id)
                        handleClose()
                      }}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all touch-none active:scale-95 ${
                        theme === 'dark' ? 'bg-red-900/30 hover:bg-red-900/40' : 'bg-red-50 hover:bg-red-100'
                      }`}
                      title="Удалить операцию"
                    >
                      <Trash2 className={theme === 'dark' ? 'w-5 h-5 text-red-400' : 'w-5 h-5 text-red-600'} />
                    </button>
                    </div>
                  </div>

                  <div className="px-1 py-4">
                    <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-50'} rounded-3xl p-4 relative`}>
                    {isLiked && (
                      <div className="absolute top-3 right-3">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ background: `linear-gradient(135deg, ${txColor}dd, ${txColor})` }}
                      >
                        {categoryInfo.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-lg font-bold truncate`}>
                          {tx.description || tx.category || 'Операция'}
                        </p>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm truncate`}>
                          {tx.category || 'Другое'}
                        </p>
                        {(walletMembers?.length || 0) > 1 && tx.created_by_name ? (
                          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs truncate`}>
                            {tx.created_by_name}
                          </p>
                        ) : null}
                      </div>

                      <button
                        onClick={() => toggleLike(tx.id)}
                        className={`p-2 rounded-full transition-colors active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                      >
                        <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                      </button>
                    </div>

                    <div className="mt-3">
                      <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-black/20' : 'bg-black/10'}`}>
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            (tx.type === 'income')
                              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                              : (tx.type === 'expense')
                                ? 'bg-gradient-to-r from-rose-500 to-red-600'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Сумма</p>
                        <p className={`text-xs font-semibold tabular-nums ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrency(tx.amount)}</p>
                      </div>
                    </div>
                    </div>
                  </div>

                  <div className="px-1 pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div className="px-3 flex items-center justify-between mb-3">
                      <h2 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-lg font-bold`}>Комментарии</h2>
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{comments.length}</span>
                    </div>

                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">💬</div>
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Пока нет комментариев</p>
                      <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-xs mt-1`}>Будьте первым!</p>
                    </div>
                  ) : (
                    <div className="px-3 space-y-3">
                      {comments.map((c, idx) => {
                        const key = getDetailsCommentKey(c)
                        const isMe = key && tgUserId ? key === `tg:${String(tgUserId)}` : false
                        const alignRight = isMe
                        const photoUrl = getDetailsCommentPhotoUrl(c)

                        return (
                          <div key={c.id || idx}>
                            <div className={`flex items-start gap-1.5 ${alignRight ? 'justify-end' : 'justify-start'}`}>
                              {!alignRight && (
                                photoUrl ? (
                                  <img
                                    src={photoUrl}
                                    alt={c.author}
                                    className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5"
                                  />
                                ) : (
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                    theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                                  }`}>
                                    <User className="w-3.5 h-3.5 text-white" />
                                  </div>
                                )
                              )}

                              <div className="flex-1 min-w-0" style={{ maxWidth: '85%' }}>
                                <div
                                  className={`inline-block px-2.5 py-1.5 rounded-xl ${
                                    theme === "dark"
                                      ? alignRight
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700/80 text-gray-100'
                                      : alignRight
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                  }`}
                                  style={{ float: alignRight ? 'right' : 'left' }}
                                >
                                  <p className={`text-[10px] font-medium mb-0.5 ${
                                    alignRight
                                      ? 'text-white/80'
                                      : theme === "dark" ? "text-gray-400" : "text-gray-600"
                                  }`}>
                                    {c.author}
                                  </p>
                                  <p className="text-xs leading-snug break-words">{c.text}</p>
                                </div>
                              </div>

                              {alignRight && (
                                photoUrl ? (
                                  <img
                                    src={photoUrl}
                                    alt={c.author}
                                    className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5"
                                  />
                                ) : (
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                    theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                                  }`}>
                                    <User className="w-3.5 h-3.5 text-white" />
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  </div>
                </div>

                <div className={`px-1 py-3 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`} style={{ position: 'sticky', bottom: 0 }}>
                  <div className="px-3 flex items-end gap-2">
                    <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-50'} flex-1 rounded-3xl px-4 py-3 flex items-center`}>
                      <input
                        type="text"
                        value={detailsCommentText}
                        onChange={(e) => setDetailsCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && detailsCommentText.trim()) {
                            handleSendDetailsComment()
                          }
                        }}
                        placeholder="Добавить комментарий..."
                        className={`flex-1 bg-transparent outline-none text-base ${theme === 'dark' ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                      />
                    </div>

                    <button
                      onClick={handleSendDetailsComment}
                      disabled={!detailsCommentText.trim()}
                      className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95"
                      style={{
                        backgroundColor: detailsCommentText.trim() ? '#007AFF' : '#E5E5EA',
                        opacity: detailsCommentText.trim() ? 1 : 0.6,
                      }}
                    >
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {null}
                </div>
              </div>
            )
          })()}
        </BottomSheetModal>
      )}

      {showAddDebtModal && (
        <BottomSheetModal
          open={showAddDebtModal}
          onClose={() => setShowAddDebtModal(false)}
          theme={theme}
          zIndex={55}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              Добавить долг
            </h3>
          </div>

          <div className="mb-3">
            <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-50'} rounded-3xl p-1 flex relative overflow-hidden`}>
              <div
                className="absolute top-1 bottom-1 rounded-3xl"
                style={{
                  width: '50%',
                  transform: `translateX(${debtType === 'owed' ? 100 : 0}%)`,
                  transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
                  backgroundColor: '#000000',
                }}
              />
              <button
                onClick={() => setDebtType('owe')}
                className="flex-1 py-3 rounded-3xl font-semibold text-sm transition-all relative touch-none"
                style={{ color: debtType === 'owe' ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#8E8E93') }}
              >
                Я должен
              </button>
              <button
                onClick={() => setDebtType('owed')}
                className="flex-1 py-3 rounded-3xl font-semibold text-sm transition-all relative touch-none"
                style={{ color: debtType === 'owed' ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#8E8E93') }}
              >
                Мне должны
              </button>
            </div>
          </div>

          <div className="mb-3">
            <input
              type="text"
              value={debtPerson}
              onChange={(e) => setDebtPerson(e.target.value)}
              placeholder="Кто?"
              className={`w-full p-3 border rounded-xl transition-all text-sm ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              }`}
            />
          </div>

          <div className="mb-3">
            <input
              type="number"
              value={debtAmount}
              onChange={(e) => setDebtAmount(e.target.value)}
              placeholder="Сумма"
              className={`w-full p-3 border rounded-xl transition-all text-sm ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              }`}
            />
          </div>

          <div className="mb-4">
            <textarea
              value={debtDescription}
              onChange={(e) => setDebtDescription(e.target.value)}
              placeholder="Описание (необязательно)"
              className={`w-full p-3 border rounded-xl transition-all text-sm min-h-[88px] ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              }`}
            />
          </div>

          <button
            onClick={addDebt}
            className={`w-full py-3 rounded-[40px] font-medium transition-all text-sm touch-none active:scale-95 ${
              theme === "dark"
                ? "bg-blue-700 hover:bg-blue-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Добавить
          </button>
        </BottomSheetModal>
      )}

      {showBudgetModal && (
        <BottomSheetModal
          key={`budget-${selectedBudgetCategory || 'list'}`}
          open={showBudgetModal}
          onClose={() => {
            setShowBudgetModal(false)
            setSelectedBudgetCategory('')
            setBudgetLimitInput('')
            setShowBudgetKeyboard(false)
            setBudgetPeriodMode('relative')
            setBudgetStartDay(1)
            setBudgetCustomStart('')
            setBudgetCustomEnd('')
          }}
          theme={theme}
          zIndex={55}
        >
          <div style={{ height: '70vh' }} className="flex flex-col overflow-x-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                {selectedBudgetCategory ? 'Редактирование бюджета' : 'Бюджеты'}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
            {!selectedBudgetCategory ? (
              <div className="space-y-2">
              {Object.keys(categoriesMeta)
                .filter((c) => c !== 'Все')
                .map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedBudgetCategory(category)
                      setBudgetLimitInput(String(budgets[category]?.limit || ''))
                      setBudgetPeriod(budgets[category]?.period || 'month')
                      const hasCustom = Boolean(budgets[category]?.customStart && budgets[category]?.customEnd)
                      setBudgetPeriodMode(hasCustom ? 'custom' : 'relative')
                      setBudgetStartDay(Number(budgets[category]?.startDay || 1))
                      setBudgetCustomStart(String(budgets[category]?.customStart || ''))
                      setBudgetCustomEnd(String(budgets[category]?.customEnd || ''))
                      setShowBudgetKeyboard(false)
                    }}
                    className={`w-full text-left rounded-[40px] p-3 border transition-all ${theme === "dark" ? "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                          {category}
                        </p>
                        <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {budgets[category]?.limit ? `Лимит: ${formatCurrency(budgets[category].limit)}` : 'Лимит не задан'}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div>
              {(() => {
                const meta = categoriesMeta[selectedBudgetCategory] || {}
                const status = budgetStatuses[selectedBudgetCategory]
                const budget = budgets[selectedBudgetCategory]

                const hexToRgba = (hex, alpha) => {
                  const h = String(hex || '').replace('#', '')
                  if (h.length !== 6) return `rgba(100,116,139,${alpha})`
                  const r = parseInt(h.slice(0, 2), 16)
                  const g = parseInt(h.slice(2, 4), 16)
                  const b = parseInt(h.slice(4, 6), 16)
                  if ([r, g, b].some((v) => Number.isNaN(v))) return `rgba(100,116,139,${alpha})`
                  return `rgba(${r},${g},${b},${alpha})`
                }

                if (!status && !budget) return null

                return (
                  <div
                    className={`p-4 rounded-[40px] border mb-4 overflow-hidden ${
                      theme === 'dark' ? 'bg-gray-900/40 border-white/10' : 'bg-white border-gray-200'
                    }`}
                    style={{
                      backgroundImage: theme === 'dark'
                        ? `linear-gradient(180deg, ${hexToRgba(meta.chartColor, 0.26)}, rgba(17,24,39,0.18))`
                        : `linear-gradient(180deg, ${hexToRgba(meta.chartColor, 0.18)}, rgba(255,255,255,0.88))`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Лимит</p>
                        <p className={`text-base font-bold tabular-nums ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrency(status?.limit || budget?.limit || 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Потрачено</p>
                        <p className={`text-base font-bold tabular-nums ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrency(status?.spent || 0)}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-black/20' : 'bg-black/10'}`}>
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            (status?.isOverBudget)
                              ? 'bg-gradient-to-r from-red-500 to-red-600'
                              : (status?.isNearLimit)
                                ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                                : 'bg-gradient-to-r from-green-400 to-green-500'
                          }`}
                          style={{ width: `${Math.min(status?.percentage || 0, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Осталось</p>
                        <p className={`text-xs font-semibold tabular-nums ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{formatCurrency(Math.abs(status?.remaining || 0))}</p>
                      </div>
                    </div>
                  </div>
                )
              })()}

              <p className={`text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                Категория: {selectedBudgetCategory}
              </p>

              <div className="mb-3">
                <label className={`block text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Лимит
                </label>
                <input
                  type="text"
                  value={budgetLimitInput}
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  onChange={(e) => setBudgetLimitInput(normalizeDecimalInput(e.target.value))}
                  placeholder="0"
                  className={`w-full p-3 border rounded-[40px] transition-all text-sm ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
              </div>

              <div className="mb-4">
                <label className={`block text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Период
                </label>

                <div className="mb-3">
                  <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-50'} rounded-3xl p-1 flex relative overflow-hidden`}>
                    <div
                      className="absolute top-1 bottom-1 rounded-3xl"
                      style={{
                        width: '50%',
                        transform: `translateX(${budgetPeriodMode === 'custom' ? 100 : 0}%)`,
                        transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
                        backgroundColor: '#000000',
                      }}
                    />
                    <button
                      onClick={() => setBudgetPeriodMode('relative')}
                      className="flex-1 py-3 rounded-3xl font-semibold text-sm transition-all relative touch-none"
                      style={{ color: budgetPeriodMode === 'relative' ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#8E8E93') }}
                    >
                      Обычный
                    </button>
                    <button
                      onClick={() => {
                        setBudgetPeriodMode('custom')
                        if (!budgetCustomStart || !budgetCustomEnd) {
                          const today = new Date()
                          const iso = today.toISOString().slice(0, 10)
                          setBudgetCustomStart((p) => p || iso)
                          setBudgetCustomEnd((p) => p || iso)
                        }
                      }}
                      className="flex-1 py-3 rounded-3xl font-semibold text-sm transition-all relative touch-none"
                      style={{ color: budgetPeriodMode === 'custom' ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#8E8E93') }}
                    >
                      Точный
                    </button>
                  </div>
                </div>

                <div className="mb-1">
                  <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-50'} rounded-3xl p-1 flex relative overflow-hidden`}>
                    <div
                      className="absolute top-1 bottom-1 rounded-3xl"
                      style={{
                        width: '33.3333%',
                        transform: `translateX(${budgetPeriod === 'month' ? 100 : budgetPeriod === 'year' ? 200 : 0}%)`,
                        transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
                        backgroundColor: '#000000',
                      }}
                    />
                    <button
                      onClick={() => setBudgetPeriod('week')}
                      className="flex-1 py-3 rounded-3xl font-semibold text-sm transition-all relative touch-none"
                      style={{ color: budgetPeriod === 'week' ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#8E8E93') }}
                    >
                      Неделя
                    </button>
                    <button
                      onClick={() => setBudgetPeriod('month')}
                      className="flex-1 py-3 rounded-3xl font-semibold text-sm transition-all relative touch-none"
                      style={{ color: budgetPeriod === 'month' ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#8E8E93') }}
                    >
                      Месяц
                    </button>
                    <button
                      onClick={() => setBudgetPeriod('year')}
                      className="flex-1 py-3 rounded-3xl font-semibold text-sm transition-all relative touch-none"
                      style={{ color: budgetPeriod === 'year' ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#8E8E93') }}
                    >
                      Год
                    </button>
                  </div>
                </div>
              </div>

              {budgetPeriodMode === 'relative' && budgetPeriod === 'month' && (
                <div className="mb-4">
                  <label className={`block text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    День начала периода
                  </label>
                  <div className={`${theme === 'dark' ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-[40px] p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>С {budgetStartDay}-го числа</span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>1–28</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={28}
                      value={budgetStartDay}
                      onChange={(e) => setBudgetStartDay(Number(e.target.value || 1))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {budgetPeriodMode === 'custom' && (
                <div className="mb-4">
                  <label className={`block text-xs mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Точный период
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={budgetCustomStart}
                      onChange={(e) => setBudgetCustomStart(e.target.value)}
                      className={`w-full p-3 border rounded-[40px] transition-all text-sm ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                          : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                    />
                    <input
                      type="date"
                      value={budgetCustomEnd}
                      onChange={(e) => setBudgetCustomEnd(e.target.value)}
                      className={`w-full p-3 border rounded-[40px] transition-all text-sm ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-blue-500"
                          : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                    />
                  </div>
                  <div className={`mt-2 text-[11px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Выбери дату начала и конца периода
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const limit = Number(budgetLimitInput)
                    if (!selectedBudgetCategory || !limit || limit <= 0) {
                      vibrateError()
                      alert('Введите корректный лимит')
                      return
                    }

                    if (budgetPeriodMode === 'custom') {
                      if (!budgetCustomStart || !budgetCustomEnd) {
                        vibrateError()
                        alert('Выберите даты периода')
                        return
                      }
                      const s = new Date(budgetCustomStart)
                      const e = new Date(budgetCustomEnd)
                      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || s > e) {
                        vibrateError()
                        alert('Некорректный период')
                        return
                      }
                    }

                    const newBudgets = {
                      ...budgets,
                      [selectedBudgetCategory]: {
                        limit,
                        period: budgetPeriod,
                        startDay: budgetPeriodMode === 'relative' && budgetPeriod === 'month' ? Number(budgetStartDay || 1) : undefined,
                        customStart: budgetPeriodMode === 'custom' ? budgetCustomStart : undefined,
                        customEnd: budgetPeriodMode === 'custom' ? budgetCustomEnd : undefined,
                        createdAt: budgets[selectedBudgetCategory]?.createdAt || new Date().toISOString(),
                      },
                    }

                    setBudgets(newBudgets)
                    await saveBudgetToServer(newBudgets)
                    setSelectedBudgetCategory('')
                    setBudgetLimitInput('')
                    setShowBudgetModal(false)
                    vibrateSuccess()
                  }}
                  className={`w-full py-3 rounded-[40px] font-medium transition-all text-sm touch-none active:scale-95 ${
                    theme === "dark"
                      ? "bg-blue-700 hover:bg-blue-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  Добавить
                </button>
              </div>
              </div>
            )}
            </div>
          </div>
        </BottomSheetModal>
      )}

      {showAddModal && (
        <BottomSheetModal
          open={showAddModal}
          onClose={() => {
            setShowAddModal(false)
          }}
          theme={theme}
          zIndex={70}
        >
          {(() => {
            const typeMeta = {
              income: { label: 'Доходы', color: '#34C759', emoji: '💰' },
              expense: { label: 'Расходы', color: '#FF3B30', emoji: '💸' },
              savings: { label: 'Копилка', color: '#007AFF', emoji: '🏦' },
            }
            const currentType = typeMeta[transactionType] || typeMeta.expense
            const canSubmit = Boolean(String(amount || '').trim())
            const txTabs = ['income', 'expense', 'savings']
            const txIndex = Math.max(0, txTabs.indexOf(transactionType))

            return (
              <div className="px-1">
                <div className="flex items-center justify-between pt-1 pb-3">
                  <div className="flex items-center gap-2">
                    {tgPhotoUrl ? (
                      <img src={tgPhotoUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-blue-700" : "bg-blue-200"}`}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <h1 className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} text-2xl font-bold`} style={{ letterSpacing: '-0.5px' }}>
                      Новая операция
                    </h1>
                  </div>
                </div>

                <div className="mb-4">
                  <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-50'} rounded-3xl p-1 flex relative overflow-hidden`}>
                    <div
                      className="absolute top-1 bottom-1 rounded-3xl"
                      style={{
                        width: '33.3333%',
                        transform: `translateX(${txIndex * 100}%)`,
                        transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
                        backgroundColor: '#000000',
                      }}
                    />
                    {txTabs.map((t) => {
                      const isActive = transactionType === t
                      const meta = typeMeta[t]
                      return (
                        <button
                          key={t}
                          onClick={() => setTransactionType(t)}
                          className="flex-1 py-3 rounded-3xl font-semibold text-sm transition-all relative touch-none flex items-center justify-center text-center"
                          style={{
                            color: isActive ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#8E8E93'),
                            border: '1px solid transparent',
                          }}
                        >
                          {meta.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mb-3">
                  <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-50'} rounded-3xl px-6 py-5`}>
                    <input
                      type="text"
                      value={amount}
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      onChange={(e) => setAmount(normalizeDecimalInput(e.target.value))}
                      onFocus={() => {
                        requestAnimationFrame(() => {
                          try {
                            window.visualViewport && window.visualViewport.height
                          } catch (e) {}
                        })
                      }}
                      placeholder="Сумма"
                      className={`w-full text-base outline-none bg-transparent ${
                        theme === 'dark' ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                      }`}
                      style={{
                        color: currentType.color,
                        caretColor: currentType.color,
                      }}
                    />
                  </div>
                </div>

                {transactionType !== 'savings' ? (
                  <div className="mb-4">
                    <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-50'} rounded-3xl overflow-hidden`}>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`w-full px-6 py-5 text-base font-medium outline-none bg-transparent appearance-none ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238E8E93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 24px center',
                          paddingRight: '48px',
                        }}
                      >
                        <option value="">Категория</option>
                        {Object.keys(categoriesMeta)
                          .filter((c) => c !== 'Все')
                          .map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  (secondGoalName && secondGoalAmount > 0) && (
                    <div className="mb-4">
                      {(() => {
                        const items = [
                          { key: 'main', label: goalName || 'Основная' },
                          { key: 'second', label: secondGoalName || 'Вторая' },
                        ]
                        if (thirdGoalName && thirdGoalAmount > 0) items.push({ key: 'third', label: thirdGoalName || 'Третья' })
                        const idx = Math.max(0, items.findIndex((i) => i.key === selectedSavingsGoal))
                        const w = `${100 / items.length}%`

                        return (
                          <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-50'} rounded-3xl p-1 flex relative overflow-hidden`}>
                            <div
                              className="absolute top-1 bottom-1 rounded-3xl"
                              style={{
                                width: w,
                                transform: `translateX(${idx * 100}%)`,
                                transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
                                backgroundColor: '#000000',
                              }}
                            />
                            {items.map((it) => (
                              <button
                                key={it.key}
                                onClick={() => setSelectedSavingsGoal(it.key)}
                                className="flex-1 py-3 px-4 rounded-3xl text-sm font-semibold transition-all relative touch-none flex items-center justify-center text-center"
                                style={{
                                  color: selectedSavingsGoal === it.key ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#8E8E93'),
                                }}
                              >
                                <span className="truncate block" style={{ overflowWrap: 'anywhere' }}>{it.label}</span>
                              </button>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  )
                )}

                <div className="mb-6">
                  <div className={`${theme === 'dark' ? 'bg-gray-800/60' : 'bg-gray-50'} rounded-3xl px-6 py-5`}>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Описание"
                      className={`w-full text-base outline-none bg-transparent ${
                        theme === 'dark' ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                </div>

                <div
                  style={{ position: 'sticky', bottom: 0 }}
                  className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} pt-2 pb-1`}
                >
                  <button
                    onClick={addTransaction}
                    disabled={!canSubmit}
                    className="w-full py-5 rounded-full font-semibold text-base transition-all active:scale-95 touch-none"
                    style={{
                      backgroundColor: canSubmit ? currentType.color : '#E5E5EA',
                      color: canSubmit ? 'white' : '#8E8E93',
                      opacity: canSubmit ? 1 : 0.6,
                    }}
                  >
                    Добавить
                  </button>
                </div>
              </div>
            )
          })()}
        </BottomSheetModal>
      )}

      {showSecondGoalModal && (
        <BottomSheetModal
          open={showSecondGoalModal}
          onClose={() => setShowSecondGoalModal(false)}
          theme={theme}
          zIndex={65}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              Вторая копилка
            </h3>
          </div>

          {(() => {
            const previewName = String(secondGoalName || '').trim() || 'Копилка'
            const previewTarget = Number.parseFloat(String(secondGoalInput || '0').replace(/,/g, '.')) || 0
            const previewPct = Math.round((Number(secondGoalSavings || 0) / (previewTarget > 0 ? previewTarget : 1)) * 100)
            const safePct = Math.max(0, Math.min(100, Number.isFinite(previewPct) ? previewPct : 0))

            return (
              <div
                className={`rounded-[40px] p-4 mb-4 relative overflow-hidden border ${
                  theme === 'dark' ? 'bg-gray-900/40 border-white/10' : 'bg-white border-gray-200'
                }`}
                style={{
                  backgroundImage: theme === 'dark'
                    ? 'linear-gradient(180deg, rgba(168,85,247,0.24), rgba(236,72,153,0.10))'
                    : 'linear-gradient(180deg, rgba(168,85,247,0.18), rgba(236,72,153,0.08))',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div
                      className={`text-[17px] leading-snug font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}
                      style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                    >
                      {previewName}
                    </div>
                    <div
                      className={`text-xs mt-1 tabular-nums ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {formatCurrency(Number(secondGoalSavings || 0), 'USD')} из {formatCurrency(previewTarget, 'USD')}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-2xl font-bold tabular-nums ${
                      theme === 'dark' ? 'bg-black/25 text-gray-100 border border-white/10' : 'bg-white/80 text-gray-900 border border-black/5'
                    }`}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {safePct}%
                  </div>
                </div>

                <div className={`mt-3 h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-black/20' : 'bg-black/10'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600'
                    }`}
                    style={{ width: `${safePct}%` }}
                  />
                </div>
              </div>
            )
          })()}

          <div className="mb-3">
            <label className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Название
            </label>
            <input
              type="text"
              value={secondGoalName}
              onChange={(e) => setSecondGoalName(e.target.value)}
              className={`w-full p-3 border rounded-[40px] transition-all text-sm ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-purple-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              }`}
              placeholder="Например: Путешествие"
            />
          </div>

          <div className="mb-4">
            <label className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Сумма цели (USD)
            </label>
            <input
              type="text"
              value={secondGoalInput}
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              onChange={(e) => setSecondGoalInput(e.target.value.replace(/^0+(?=\d)/, '') || '0')}
              className={`w-full p-3 border rounded-[40px] transition-all text-lg font-bold ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-purple-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              }`}
            />
          </div>

          <button
            onClick={async () => {
              const n = Number.parseFloat(String(secondGoalInput || '0').replace(/,/g, '.'))
              if (!secondGoalName.trim() || Number.isNaN(n) || n <= 0) {
                vibrateError()
                alert('Введите название и корректную сумму')
                return
              }
              const nextName = String(secondGoalName || '').trim()
              const nextAmount = n

              setSecondGoalName(nextName)
              setSecondGoalAmount(nextAmount)

              try {
                if (user && user.email) {
                  await fetch(`${API_BASE}/api/user/${user.email}/savings-settings`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      goalName,
                      initialSavingsAmount,
                      secondGoalName: nextName,
                      secondGoalAmount: nextAmount,
                      secondGoalSavings,
                      secondGoalInitialAmount,
                      thirdGoalName,
                      thirdGoalAmount,
                      thirdGoalSavings,
                      thirdGoalInitialAmount,
                    }),
                  })
                }
              } catch (e) {
                console.warn('Failed to save second goal', e)
              }
              setShowSecondGoalModal(false)
              vibrateSuccess()
            }}
            className={`w-full py-3 rounded-[40px] font-medium transition-all text-sm touch-none active:scale-95 ${
              theme === "dark"
                ? "bg-purple-700 hover:bg-purple-600 text-white"
                : "bg-purple-500 hover:bg-purple-600 text-white"
            }`}
          >
            Сохранить
          </button>
        </BottomSheetModal>
      )}

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
            className={`w-full max-w-md rounded-full p-1.5 shadow-2xl flex items-center justify-around pointer-events-auto px-0 flex-row gap-px py-3.5 backdrop-blur-md ${
              theme === "dark" ? "bg-gray-900/70" : "bg-white/70"
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
              icon={<History className="h-5 w-5" />}
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
          overscroll-behavior-y: auto;
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
