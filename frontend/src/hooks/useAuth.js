import { useState, useEffect } from "react"
import { API_BASE, SESSION_KEY } from "../constants"

export function useAuth(tgUserId, displayName, setIsLoading) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const autoAuthTelegram = async (telegramId) => {
    try {
      const tgEmail = `tg_${telegramId}@telegram.user`
      const resp = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tgEmail,
          password: `tg_${telegramId}`,
          first_name: displayName,
          telegram_id: telegramId,
          telegram_name: displayName,
        }),
      })

      if (!resp.ok) throw new Error("auth failed")
      const json = await resp.json()
      return { user: json.user, transactions: json.transactions || [], isEmailAuth: false }
    } catch (e) {
      console.warn("autoAuthTelegram failed", e)
      setIsLoading(false)
      return null
    }
  }

  const autoAuth = async (email, token) => {
    try {
      const resp = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: atob(token), // Decode password from base64
          first_name: displayName,
          telegram_id: tgUserId,
          telegram_name: displayName,
        }),
      })

      if (!resp.ok) throw new Error("auth failed")
      const json = await resp.json()
      return { user: json.user, transactions: json.transactions || [], isEmailAuth: true }
    } catch (e) {
      console.warn("autoAuth failed", e)
      setIsLoading(false)
      return null
    }
  }

  const login = async (email, password, firstName) => {
    try {
      const resp = await fetch(`${API_BASE}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName || displayName,
          telegram_id: tgUserId,
          telegram_name: displayName,
        }),
      })

      if (!resp.ok) throw new Error("login failed")
      const json = await resp.json()
      
      // Save session
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        email,
        token: btoa(password), // Encode password to base64
      }))
      
      return { user: json.user, transactions: json.transactions || [], isEmailAuth: true }
    } catch (e) {
      console.error("Login failed", e)
      throw e
    }
  }

  const register = async (email, password, firstName, currency) => {
    try {
      const resp = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName || displayName,
          telegram_id: tgUserId,
          telegram_name: displayName,
          currency,
        }),
      })

      if (!resp.ok) throw new Error("registration failed")
      const json = await resp.json()
      
      // Save session
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        email,
        token: btoa(password), // Encode password to base64
      }))
      
      return { user: json.user, transactions: json.transactions || [], isEmailAuth: true }
    } catch (e) {
      console.error("Registration failed", e)
      throw e
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem(SESSION_KEY)
  }

  // Auto-auth on mount
  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY)
    if (session) {
      const sessionData = JSON.parse(session)
      if (sessionData?.email && sessionData?.token) {
        autoAuth(sessionData.email, sessionData.token).then(result => {
          if (result) {
            setUser(result.user)
            setIsAuthenticated(result.isEmailAuth)
          }
          setIsLoading(false)
        }).catch(() => {
          setIsLoading(false)
        })
      } else {
        setIsLoading(false)
      }
    } else if (tgUserId) {
      autoAuthTelegram(tgUserId).then(result => {
        if (result) {
          setUser(result.user)
          setIsAuthenticated(result.isEmailAuth)
        }
        setIsLoading(false)
      }).catch(() => {
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [tgUserId])

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    autoAuthTelegram,
    autoAuth,
  }
}
