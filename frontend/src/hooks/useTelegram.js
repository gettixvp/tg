import { useEffect, useState } from "react"
import { API_BASE, LS_KEY, SESSION_KEY } from "../constants"
import { vibrate, vibrateSuccess, vibrateError } from "../utils"

export function useTelegram() {
  const [tg, setTg] = useState(null)
  const [haptic, setHaptic] = useState(null)
  const [tgUser, setTgUser] = useState(null)
  const [tgUserId, setTgUserId] = useState(null)
  const [displayName, setDisplayName] = useState("Пользователь")
  const [tgPhotoUrl, setTgPhotoUrl] = useState(null)
  const [safeAreaInset, setSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  const [contentSafeAreaInset, setContentSafeAreaInset] = useState({ top: 0, bottom: 0, left: 0, right: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const telegramWebApp = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp
    
    if (telegramWebApp) {
      setTg(telegramWebApp)
      setHaptic(telegramWebApp.HapticFeedback)
      
      const user = telegramWebApp.initDataUnsafe && telegramWebApp.initDataUnsafe.user
      if (user) {
        setTgUser(user)
        setTgUserId(user.id)
        setDisplayName(user.first_name || "Пользователь")
        setTgPhotoUrl(user.photo_url)
      }

      telegramWebApp.ready && telegramWebApp.ready()
      if (telegramWebApp.expand) telegramWebApp.expand()

      if (telegramWebApp.disableVerticalSwipes) {
        telegramWebApp.disableVerticalSwipes()
      }

      const updateSafeArea = () => {
        setSafeAreaInset({
          top: (telegramWebApp.safeAreaInset && telegramWebApp.safeAreaInset.top) || 0,
          bottom: (telegramWebApp.safeAreaInset && telegramWebApp.safeAreaInset.bottom) || 0,
          left: (telegramWebApp.safeAreaInset && telegramWebApp.safeAreaInset.left) || 0,
          right: (telegramWebApp.safeAreaInset && telegramWebApp.safeAreaInset.right) || 0,
        })
      }

      const updateContentSafeArea = () => {
        setContentSafeAreaInset({
          top: (telegramWebApp.contentSafeAreaInset && telegramWebApp.contentSafeAreaInset.top) || 0,
          bottom: (telegramWebApp.contentSafeAreaInset && telegramWebApp.contentSafeAreaInset.bottom) || 0,
          left: (telegramWebApp.contentSafeAreaInset && telegramWebApp.contentSafeAreaInset.left) || 0,
          right: (telegramWebApp.contentSafeAreaInset && telegramWebApp.contentSafeAreaInset.right) || 0,
        })
      }

      const handleFullscreenChanged = () => {
        setIsFullscreen(telegramWebApp.isFullscreen || false)
        updateSafeArea()
        updateContentSafeArea()
      }

      const handleThemeChanged = () => {
        // Theme change handled in main component
      }

      const handleViewportChanged = () => {
        if (telegramWebApp.isExpanded === false && telegramWebApp.expand) {
          telegramWebApp.expand()
        }
        updateContentSafeArea()
      }

      updateSafeArea()
      updateContentSafeArea()
      handleFullscreenChanged()

      if (telegramWebApp.onEvent) {
        telegramWebApp.onEvent("safeAreaChanged", updateSafeArea)
        telegramWebApp.onEvent("contentSafeAreaChanged", updateContentSafeArea)
        telegramWebApp.onEvent("fullscreenChanged", handleFullscreenChanged)
        telegramWebApp.onEvent("themeChanged", handleThemeChanged)
        telegramWebApp.onEvent("viewportChanged", handleViewportChanged)
      }

      setIsReady(true)

      return () => {
        if (telegramWebApp.offEvent) {
          telegramWebApp.offEvent("safeAreaChanged", updateSafeArea)
          telegramWebApp.offEvent("contentSafeAreaChanged", updateContentSafeArea)
          telegramWebApp.offEvent("fullscreenChanged", handleFullscreenChanged)
          telegramWebApp.offEvent("themeChanged", handleThemeChanged)
          telegramWebApp.offEvent("viewportChanged", handleViewportChanged)
        }
      }
    } else {
      setIsReady(true)
    }
  }, [])

  return {
    tg,
    haptic,
    tgUser,
    tgUserId,
    displayName,
    tgPhotoUrl,
    safeAreaInset,
    contentSafeAreaInset,
    isFullscreen,
    isReady,
    vibrate: () => vibrate(haptic),
    vibrateSuccess: () => vibrateSuccess(haptic),
    vibrateError: () => vibrateError(haptic),
  }
}
