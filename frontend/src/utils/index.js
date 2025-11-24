// Функции форматирования и утилиты

// Форматирование валюты
export const formatCurrency = (value, curr, currentCurrency) => {
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

// Форматирование даты
export const formatDate = (dateString) => {
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

// Функции вибрации для Telegram WebApp
export const createVibrationFunctions = () => {
  const tg = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp
  const haptic = tg && tg.HapticFeedback
  
  return {
    vibrate: () => haptic && haptic.impactOccurred && haptic.impactOccurred("light"),
    vibrateSuccess: () => haptic && haptic.notificationOccurred && haptic.notificationOccurred("success"),
    vibrateError: () => haptic && haptic.notificationOccurred && haptic.notificationOccurred("error"),
    vibrateSelect: () => haptic && haptic.selectionChanged && haptic.selectionChanged(),
  }
}

// Утилита для снятия фокуса с активного элемента
export const blurAll = () => {
  if (document.activeElement && typeof document.activeElement.blur === "function") {
    document.activeElement.blur()
  }
}

// Транслитерация для PDF
export const transliterate = (text) => {
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

// Получение стилей для модальных окон
export const getSheetStyle = (dragOffset = 0, extraStyles = {}) => ({
  transform: `translateY(calc(max(0, ${dragOffset}px)))`,
  transition: dragOffset > 0 ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  ...extraStyles,
})

// Расчет процентов для прогресс-баров
export const calculatePercentage = (current, total) => {
  if (!total || total === 0) return 0
  return Math.min((current / total) * 100, 100)
}

// Форматирование больших чисел
export const formatLargeNumber = (num) => {
  if (num < 1000) return num.toString()
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K'
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M'
  return (num / 1000000000).toFixed(1) + 'B'
}

// Получение цвета на основе процента
export const getPercentageColor = (percentage, theme) => {
  if (percentage >= 90) return theme === "dark" ? "text-red-400" : "text-red-600"
  if (percentage >= 75) return theme === "dark" ? "text-orange-400" : "text-orange-600"
  if (percentage >= 50) return theme === "dark" ? "text-yellow-400" : "text-yellow-600"
  return theme === "dark" ? "text-green-400" : "text-green-600"
}

// Генерация уникального ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Копирование текста в буфер обмена
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

// Проверка на мобильное устройство
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Получение данных для диаграмм
export const getChartData = (transactions, type, categoriesMeta, theme) => {
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
