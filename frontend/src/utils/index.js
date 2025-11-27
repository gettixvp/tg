import { currencies } from "../constants"

export const formatCurrency = (value, currency = "BYN") => {
  const num = Number(value)
  const currentCurrency = currencies.find((c) => c.code === currency) || currencies[1]
  
  if (!isFinite(num)) return `${currency === "USD" ? "$" : currentCurrency.symbol}0`
  const symbol = currency === "USD" ? "$" : currentCurrency.symbol
  
  try {
    const formatted = new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: currency === "USD" ? 2 : 0,
    }).format(num)
    
    const sample = Intl.NumberFormat("ru-RU", { style: "currency", currency: currency }).format(0)
    const stdSym = sample.replace(/\d|\s|,|\.|0/g, "").trim()
    
    if (stdSym && symbol && stdSym !== symbol) {
      return formatted.replace(stdSym, symbol)
    }
    return formatted
  } catch {
    return `${symbol}${Math.round(num)}`
  }
}

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

export const blurAll = () => {
  if (document.activeElement && typeof document.activeElement.blur === "function") {
    document.activeElement.blur()
  }
}

export const vibrate = (haptic) => {
  if (haptic && haptic.impactOccurred) {
    haptic.impactOccurred("light")
  }
}

export const vibrateSuccess = (haptic) => {
  if (haptic && haptic.notificationOccurred) {
    haptic.notificationOccurred("success")
  }
}

export const vibrateError = (haptic) => {
  if (haptic && haptic.notificationOccurred) {
    haptic.notificationOccurred("error")
  }
}

export const vibrateSelect = (haptic) => {
  if (haptic && haptic.selectionChanged) {
    haptic.selectionChanged()
  }
}
