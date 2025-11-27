import { useState, useEffect } from "react"
import { LS_KEY } from "../constants"

export function useSettings() {
  const [theme, setTheme] = useState("light")
  const [currency, setCurrency] = useState("BYN")
  const [goalSavings, setGoalSavings] = useState(50000)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [fullscreenEnabled, setFullscreenEnabled] = useState(true)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

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
          }
          if (data.balanceVisible !== undefined) setBalanceVisible(data.balanceVisible)
          if (data.fullscreenEnabled !== undefined) setFullscreenEnabled(data.fullscreenEnabled)
        }
      }
    } catch (e) {
      console.warn("Failed to parse settings", e)
    }
  }, [])

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

  // Apply theme immediately when changed
  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#111827' : '#ffffff'
    document.body.style.color = theme === 'dark' ? '#f3f4f6' : '#111827'
  }, [theme])

  return {
    theme,
    setTheme,
    currency,
    setCurrency,
    goalSavings,
    setGoalSavings,
    balanceVisible,
    setBalanceVisible,
    fullscreenEnabled,
    setFullscreenEnabled,
    isKeyboardOpen,
    setIsKeyboardOpen,
  }
}
