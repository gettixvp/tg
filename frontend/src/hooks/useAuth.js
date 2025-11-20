/**
 * useAuth - Custom hook for authentication
 */

import { useState, useCallback, useEffect } from "react"
import { financeStorage } from "../utils/storage"

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authMode, setAuthMode] = useState("login") // "login" or "register"
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  // Auth form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Change password state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Get Telegram user data
  const getTelegramUser = useCallback(() => {
    if (typeof window === "undefined") return null
    const tg = window.Telegram?.WebApp
    return tg?.initDataUnsafe?.user || null
  }, [])

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is stored
        const storedUser = financeStorage.getUser()
        if (storedUser) {
          setUser(storedUser)
          setIsAuthenticated(true)
        }

        // Check Telegram user
        const tgUser = getTelegramUser()
        if (tgUser && !storedUser) {
          // Auto-auth with Telegram
          const userData = {
            id: tgUser.id,
            email: `telegram_${tgUser.id}@app.local`,
            firstName: tgUser.first_name,
            lastName: tgUser.last_name,
            photoUrl: tgUser.photo_url,
            isTelegram: true,
          }
          setUser(userData)
          setIsAuthenticated(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [getTelegramUser])

  // Login
  const login = useCallback(async (emailVal, passwordVal) => {
    try {
      setIsLoading(true)
      // TODO: Make actual API call
      const userData = {
        email: emailVal,
        // ... other user data from API
      }
      financeStorage.saveUser(userData)
      setUser(userData)
      setIsAuthenticated(true)
      setShowAuthModal(false)
      setEmail("")
      setPassword("")
      return { success: true }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Register
  const register = useCallback(async (emailVal, passwordVal) => {
    try {
      setIsLoading(true)
      // TODO: Make actual API call
      const userData = {
        email: emailVal,
        // ... other user data from API
      }
      financeStorage.saveUser(userData)
      setUser(userData)
      setIsAuthenticated(true)
      setShowAuthModal(false)
      setEmail("")
      setPassword("")
      return { success: true }
    } catch (error) {
      console.error("Registration failed:", error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout
  const logout = useCallback(() => {
    financeStorage.clearUser()
    setUser(null)
    setIsAuthenticated(false)
    setEmail("")
    setPassword("")
    setShowAuthModal(false)
  }, [])

  // Change password
  const changePassword = useCallback(async (oldPwd, newPwd) => {
    try {
      setIsLoading(true)
      // TODO: Make actual API call
      setShowChangePasswordModal(false)
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      return { success: true }
    } catch (error) {
      console.error("Change password failed:", error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Reset auth form
  const resetAuthForm = useCallback(() => {
    setEmail("")
    setPassword("")
    setShowPassword(false)
  }, [])

  // Close auth modal
  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false)
    resetAuthForm()
  }, [resetAuthForm])

  // Switch auth mode
  const switchAuthMode = useCallback((mode) => {
    setAuthMode(mode)
    resetAuthForm()
  }, [resetAuthForm])

  return {
    // State
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setIsLoading,
    authMode,
    setAuthMode,
    showAuthModal,
    setShowAuthModal,
    
    // Auth form
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    showPassword,
    setShowPassword,
    
    // Change password
    showChangePasswordModal,
    setShowChangePasswordModal,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,

    // Methods
    getTelegramUser,
    login,
    register,
    logout,
    changePassword,
    resetAuthForm,
    closeAuthModal,
    switchAuthMode,
  }
}
