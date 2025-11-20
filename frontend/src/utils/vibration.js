/**
 * Haptic Feedback utilities for Telegram WebApp
 */

export const initHaptic = () => {
  if (typeof window === "undefined") return null
  
  const tg = window.Telegram?.WebApp
  return tg?.HapticFeedback || null
}

export const createVibrationFunctions = () => {
  const haptic = initHaptic()
  
  return {
    vibrate: () => {
      if (haptic?.impactOccurred) {
        haptic.impactOccurred("light")
      }
    },
    
    vibrateSelect: () => {
      if (haptic?.selectionChanged) {
        haptic.selectionChanged()
      }
    },
    
    vibrateSuccess: () => {
      if (haptic?.notificationOccurred) {
        haptic.notificationOccurred("success")
      }
    },
    
    vibrateError: () => {
      if (haptic?.notificationOccurred) {
        haptic.notificationOccurred("error")
      }
    },
    
    vibrateWarning: () => {
      if (haptic?.notificationOccurred) {
        haptic.notificationOccurred("warning")
      }
    },
  }
}

// Singleton instance
let vibrationInstance = null

export const getVibration = () => {
  if (!vibrationInstance) {
    vibrationInstance = createVibrationFunctions()
  }
  return vibrationInstance
}
