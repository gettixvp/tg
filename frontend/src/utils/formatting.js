/**
 * Formatting utilities
 */

export const formatCurrency = (amount, currency = "USD") => {
  const num = Number(amount || 0)
  if (isNaN(num)) return "$0.00"
  
  if (currency === "BYN") {
    return num.toFixed(2) + " Br"
  } else {
    return "$" + num.toFixed(2)
  }
}

export const formatDate = (dateStr) => {
  if (!dateStr) return ""
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ""
  
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return "Сегодня"
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Вчера"
  }
  
  // Format as DD.MM.YYYY
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  
  return `${day}.${month}.${year}`
}

export const formatDateWithTime = (dateStr) => {
  if (!dateStr) return ""
  
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ""
  
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  
  return `${day}.${month}.${year} ${hours}:${minutes}`
}

export const formatBalance = (amount, currency = "USD") => {
  const num = Number(amount || 0)
  if (isNaN(num)) return "0"
  
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  } else if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  
  return num.toFixed(0)
}

export const transliterate = (str) => {
  const map = {
    А: "A", Б: "B", В: "V", Г: "G", Д: "D", Е: "E", Ё: "Yo", Ж: "Zh",
    З: "Z", И: "I", Й: "Y", К: "K", Л: "L", М: "M", Н: "N", О: "O",
    П: "P", Р: "R", С: "S", Т: "T", У: "U", Ф: "F", Х: "H", Ц: "Ts",
    Ч: "Ch", Ш: "Sh", Щ: "Sch", Ъ: "", Ы: "Y", Ь: "", Э: "E", Ю: "Yu",
    Я: "Ya",
  }
  
  return String(str)
    .split("")
    .map((char) => map[char] || char)
    .join("")
}
