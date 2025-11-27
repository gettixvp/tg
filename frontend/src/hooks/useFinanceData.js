import { useState, useEffect } from "react"
import { API_BASE } from "../constants"

export function useFinanceData(user, isAuthenticated, setIsLoading) {
  const [balance, setBalance] = useState(0)
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [savings, setSavings] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [linkedUsers, setLinkedUsers] = useState([])
  const [likedTransactions, setLikedTransactions] = useState(new Set())
  const [transactionComments, setTransactionComments] = useState({})

  const loadLinkedUsers = async (email) => {
    if (!email) return
    try {
      const resp = await fetch(`${API_BASE}/api/linked-users/${email}`)
      if (resp.ok) {
        const data = await resp.json()
        setLinkedUsers(data.linkedUsers || [])
      }
    } catch (e) {
      console.warn("Failed to load linked users", e)
    }
  }

  const removeLinkedUser = async (telegramId) => {
    if (!user || !user.email) return

    try {
      const resp = await fetch(`${API_BASE}/api/linked-users/${user.email}/${telegramId}`, {
        method: "DELETE",
      })

      if (resp.ok) {
        await loadLinkedUsers(user.email)
        return true
      }
      return false
    } catch (e) {
      console.error("Remove linked user error:", e)
      return false
    }
  }

  const saveToServer = async (newBalance, newIncome, newExpenses, newSavings, goalSavings) => {
    if (user && user.email) {
      try {
        await fetch(`${API_BASE}/api/user/${user.email}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            balance: newBalance,
            income: newIncome,
            expenses: newExpenses,
            savings: newSavings,
            goalSavings,
          }),
        })
      } catch (e) {
        console.warn("Failed to save to server", e)
        throw e
      }
    }
  }

  const addTransaction = async (transactionData) => {
    try {
      const resp = await fetch(`${API_BASE}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      })

      if (!resp.ok) throw new Error("Failed to save transaction")
      return await resp.json()
    } catch (e) {
      console.error("Failed to add transaction", e)
      throw e
    }
  }

  const deleteTransaction = async (transactionId) => {
    try {
      const resp = await fetch(`${API_BASE}/api/transactions/${transactionId}`, {
        method: "DELETE",
      })

      if (!resp.ok) throw new Error("Failed to delete transaction")
      return true
    } catch (e) {
      console.error("Failed to delete transaction", e)
      throw e
    }
  }

  const toggleLike = async (transactionId) => {
    try {
      const resp = await fetch(`${API_BASE}/api/transactions/${transactionId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id: user?.telegram_id || null,
        }),
      })

      if (!resp.ok) throw new Error("Failed to toggle like")
      const data = await resp.json()
      
      // Update local state
      setTransactions(prev => prev.map(tx => 
        tx.id === transactionId ? { ...tx, liked: data.liked } : tx
      ))
      
      if (data.liked) {
        setLikedTransactions(prev => new Set([...prev, transactionId]))
      } else {
        setLikedTransactions(prev => {
          const newSet = new Set(prev)
          newSet.delete(transactionId)
          return newSet
        })
      }
      
      return data.liked
    } catch (e) {
      console.error("Failed to toggle like", e)
      throw e
    }
  }

  const loadTransactionComments = async (transactionId) => {
    try {
      const resp = await fetch(`${API_BASE}/api/transactions/${transactionId}/comments`)
      if (resp.ok) {
        const data = await resp.json()
        const comments = data.comments || []
        setTransactionComments(prev => ({
          ...prev,
          [transactionId]: comments
        }))
        return comments
      }
      return []
    } catch (e) {
      console.warn(`Failed to load comments for tx ${transactionId}`, e)
      return []
    }
  }

  const addComment = async (transactionId, commentText) => {
    try {
      const resp = await fetch(`${API_BASE}/api/transactions/${transactionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: commentText,
          author: user?.first_name || "Anonymous",
          telegram_id: user?.telegram_id || null,
          telegram_photo_url: user?.telegram_photo_url || null,
        }),
      })

      if (!resp.ok) throw new Error("Failed to add comment")
      const data = await resp.json()
      
      // Update local state
      setTransactionComments(prev => ({
        ...prev,
        [transactionId]: [...(prev[transactionId] || []), data.comment]
      }))
      
      return data.comment
    } catch (e) {
      console.error("Failed to add comment", e)
      throw e
    }
  }

  const deleteComment = async (transactionId, commentId) => {
    try {
      const resp = await fetch(`${API_BASE}/api/transactions/${transactionId}/comments/${commentId}`, {
        method: "DELETE",
      })

      if (!resp.ok) throw new Error("Failed to delete comment")
      
      // Update local state
      setTransactionComments(prev => ({
        ...prev,
        [transactionId]: (prev[transactionId] || []).filter(c => c.id !== commentId)
      }))
      
      return true
    } catch (e) {
      console.error("Failed to delete comment", e)
      throw e
    }
  }

  const applyUserData = (userData, txs = [], isEmailAuth = false) => {
    setBalance(Number(userData.balance || 0))
    setIncome(Number(userData.income || 0))
    setExpenses(Number(userData.expenses || 0))
    setSavings(Number(userData.savings_usd || 0))
    setTransactions(txs || [])

    if (isEmailAuth && userData.email) {
      loadLinkedUsers(userData.email)
    }

    // Load comments for visible transactions
    if (txs && txs.length > 0) {
      const visibleTxs = txs.slice(0, 10)
      
      Promise.all(
        visibleTxs.map(async (tx) => {
          try {
            await loadTransactionComments(tx.id)
          } catch (e) {
            console.warn(`Failed to load comments for tx ${tx.id}`, e)
          }
        })
      )

      // Load remaining comments in background
      if (txs.length > 10) {
        setTimeout(() => {
          const remainingTxs = txs.slice(10)
          Promise.all(
            remainingTxs.map(async (tx) => {
              try {
                await loadTransactionComments(tx.id)
              } catch (e) {
                console.warn(`Failed to load comments for tx ${tx.id}`, e)
              }
            })
          )
        }, 1000)
      }
    }
  }

  return {
    balance,
    income,
    expenses,
    savings,
    transactions,
    linkedUsers,
    likedTransactions,
    transactionComments,
    setBalance,
    setIncome,
    setExpenses,
    setSavings,
    setTransactions,
    loadLinkedUsers,
    removeLinkedUser,
    saveToServer,
    addTransaction,
    deleteTransaction,
    toggleLike,
    loadTransactionComments,
    addComment,
    deleteComment,
    applyUserData,
  }
}
