/**
 * LocalStorage utilities
 */

import { LS_KEY, SESSION_KEY } from "./constants"

export const storage = {
  // Get from localStorage with default value
  get: (key, defaultValue = null) => {
    if (typeof window === "undefined") return defaultValue
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Failed to get ${key} from localStorage`, error)
      return defaultValue
    }
  },
  
  // Set to localStorage
  set: (key, value) => {
    if (typeof window === "undefined") return
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to set ${key} to localStorage`, error)
    }
  },
  
  // Remove from localStorage
  remove: (key) => {
    if (typeof window === "undefined") return
    
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage`, error)
    }
  },
  
  // Clear all localStorage
  clear: () => {
    if (typeof window === "undefined") return
    
    try {
      localStorage.clear()
    } catch (error) {
      console.error("Failed to clear localStorage", error)
    }
  },
}

// Session storage (temporary data)
export const sessionStorage2 = {
  get: (key, defaultValue = null) => {
    if (typeof window === "undefined") return defaultValue
    
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Failed to get ${key} from sessionStorage`, error)
      return defaultValue
    }
  },
  
  set: (key, value) => {
    if (typeof window === "undefined") return
    
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to set ${key} to sessionStorage`, error)
    }
  },
  
  remove: (key) => {
    if (typeof window === "undefined") return
    
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove ${key} from sessionStorage`, error)
    }
  },
}

// Finance App specific storage
export const financeStorage = {
  // Save user settings
  saveSettings: (settings) => {
    storage.set(LS_KEY, settings)
  },
  
  getSettings: () => {
    return storage.get(LS_KEY, {
      theme: "light",
      currency: "BYN",
    })
  },
  
  // Save session data
  saveSession: (session) => {
    sessionStorage2.set(SESSION_KEY, session)
  },
  
  getSession: () => {
    return sessionStorage2.get(SESSION_KEY, null)
  },
  
  clearSession: () => {
    sessionStorage2.remove(SESSION_KEY)
  },
  
  // Save user profile
  saveUser: (user) => {
    storage.set("user", user)
  },
  
  getUser: () => {
    return storage.get("user", null)
  },
  
  clearUser: () => {
    storage.remove("user")
  },
  
  // Cache transactions
  cacheTransactions: (transactions) => {
    storage.set("transactions_cache", {
      data: transactions,
      timestamp: Date.now(),
    })
  },
  
  getCachedTransactions: () => {
    return storage.get("transactions_cache", null)
  },
  
  // Cache budgets
  cacheBudgets: (budgets) => {
    storage.set("budgets_cache", {
      data: budgets,
      timestamp: Date.now(),
    })
  },
  
  getCachedBudgets: () => {
    return storage.get("budgets_cache", null)
  },
}
