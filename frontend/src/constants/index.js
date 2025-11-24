// API и хранилище
export const API_BASE = "https://walletback-aghp.onrender.com"
export const LS_KEY = "finance_settings_v3"
export const SESSION_KEY = "finance_session_v2"

// Категории операций
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

// Списки категорий по типам
export const categoriesList = {
  expense: ["Еда", "Транспорт", "Развлечения", "Счета", "Покупки", "Здоровье", "Другое"],
  income: ["Зарплата", "Фриланс", "Подарки", "Инвестиции", "Другое"],
  savings: ["Отпуск", "Накопления", "Экстренный фонд", "Цель", "Другое"],
}

// Валюты
export const currencies = [
  { code: "RUB", symbol: "₽", name: "Российский рубль" },
  { code: "BYN", symbol: "Br", name: "Белорусский рубль" },
  { code: "USD", symbol: "$", name: "Доллар США" },
  { code: "EUR", symbol: "€", name: "Евро" },
]

// Иконки кошельков по умолчанию
export const walletIcons = ["💼", "💳", "💰", "🏦", "💵", "🪙", "💎", "🏧", "💸", "🤑"]

// Цвета кошельков
export const walletColors = [
  { name: "Синий", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Зеленый", value: "#10b981", class: "bg-green-500" },
  { name: "Красный", value: "#ef4444", class: "bg-red-500" },
  { name: "Фиолетовый", value: "#a855f7", class: "bg-purple-500" },
  { name: "Оранжевый", value: "#f97316", class: "bg-orange-500" },
  { name: "Розовый", value: "#ec4899", class: "bg-pink-500" },
  { name: "Бирюзовый", value: "#14b8a6", class: "bg-teal-500" },
  { name: "Желтый", value: "#eab308", class: "bg-yellow-500" },
]
