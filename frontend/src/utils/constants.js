/**
 * Constants for Finance App
 */

export const API_BASE = "https://walletback-aghp.onrender.com"
export const API_URL = API_BASE
export const LS_KEY = "finance_settings_v3"
export const SESSION_KEY = "finance_session_v2"

// Categories metadata with icons, colors, and chart colors
export const categoriesMeta = {
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
}

// Budget periods
export const BUDGET_PERIODS = {
  week: "неделю",
  month: "месяц",
  year: "год",
}

// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
  SAVINGS: "savings",
}

// Debt types
export const DEBT_TYPES = {
  OWE: "owe",      // Я должен
  OWED: "owed",    // Мне должны
}

// Default exchange rate for USD/BYN
export const DEFAULT_EXCHANGE_RATE = 3.2

// Default goal amount
export const DEFAULT_GOAL_AMOUNT = 50000
