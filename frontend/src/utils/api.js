/**
 * API utilities and request helpers
 */

import { API_BASE } from "./constants"

export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error)
    throw error
  }
}

export const apiGet = (endpoint) => {
  return apiCall(endpoint, { method: "GET" })
}

export const apiPost = (endpoint, body) => {
  return apiCall(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export const apiPut = (endpoint, body) => {
  return apiCall(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

export const apiDelete = (endpoint) => {
  return apiCall(endpoint, { method: "DELETE" })
}

// Specific API endpoints

export const fetchUserData = (email) => {
  return apiGet(`/api/user/${email}`)
}

export const fetchTransactions = (email) => {
  return apiGet(`/api/user/${email}/transactions`)
}

export const fetchDebts = (email) => {
  return apiGet(`/api/user/${email}/debts`)
}

export const fetchBudgets = (email) => {
  return apiGet(`/api/user/${email}/budgets`)
}

export const saveTransaction = (userEmail, transactionData) => {
  return apiPost("/api/transactions", {
    user_email: userEmail,
    ...transactionData,
  })
}

export const deleteTransaction = (txId) => {
  return apiDelete(`/api/transactions/${txId}`)
}

export const saveDebt = (userEmail, debtData) => {
  return apiPost(`/api/user/${userEmail}/debts`, debtData)
}

export const deleteDebt = (debtId) => {
  return apiDelete(`/api/debts/${debtId}`)
}

export const saveBudget = (userEmail, budgetData) => {
  return apiPost(`/api/user/${userEmail}/budgets`, budgetData)
}

export const deleteBudget = (userEmail, category) => {
  return apiDelete(`/api/user/${userEmail}/budgets/${category}`)
}

export const saveUserBalance = (userEmail, balanceData) => {
  return apiPut(`/api/user/${userEmail}/balance`, balanceData)
}

export const addComment = (transactionId, commentData) => {
  return apiPost(`/api/transactions/${transactionId}/comments`, commentData)
}

export const deleteComment = (commentId) => {
  return apiDelete(`/api/comments/${commentId}`)
}

export const authenticateUser = (credentials) => {
  return apiPost("/api/auth/login", credentials)
}

export const registerUser = (userData) => {
  return apiPost("/api/auth/register", userData)
}

export const changePassword = (userEmail, passwordData) => {
  return apiPut(`/api/user/${userEmail}/password`, passwordData)
}
