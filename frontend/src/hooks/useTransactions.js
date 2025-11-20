/**
 * useTransactions - Custom hook for transaction management
 */

import { useState, useCallback } from "react"
import {
  sortTransactionsByDate,
  filterTransactionsByType,
  filterTransactionsByCategory,
  filterTransactionsByDateRange,
} from "../utils/calculations"

export const useTransactions = (initialTransactions = []) => {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [likedTransactions, setLikedTransactions] = useState(new Set())
  const [transactionComments, setTransactionComments] = useState({})
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [detailsCommentText, setDetailsCommentText] = useState("")

  // Add transaction
  const addTransaction = useCallback(
    (newTx) => {
      setTransactions((prev) => [newTx, ...prev])
    },
    []
  )

  // Delete transaction
  const deleteTransaction = useCallback((txId) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId))
  }, [])

  // Toggle like on transaction
  const toggleLike = useCallback((txId) => {
    setLikedTransactions((prev) => {
      const newSet = new Set(prev)
      newSet.has(txId) ? newSet.delete(txId) : newSet.add(txId)
      return newSet
    })
  }, [])

  // Open transaction details
  const openTransactionDetails = useCallback((tx) => {
    setSelectedTransaction(tx)
    setShowTransactionDetails(true)
    setDetailsCommentText("")
  }, [])

  // Close transaction details
  const closeTransactionDetails = useCallback(() => {
    setShowTransactionDetails(false)
    setSelectedTransaction(null)
    setDetailsCommentText("")
  }, [])

  // Add comment to transaction
  const addComment = useCallback((txId, comment) => {
    setTransactionComments((prev) => ({
      ...prev,
      [txId]: [...(prev[txId] || []), comment],
    }))
  }, [])

  // Delete comment from transaction
  const deleteComment = useCallback((txId, commentIndex) => {
    setTransactionComments((prev) => ({
      ...prev,
      [txId]: prev[txId].filter((_, i) => i !== commentIndex),
    }))
  }, [])

  // Filter transactions
  const getFilteredTransactions = useCallback(
    (type = null, category = null, startDate = null, endDate = null) => {
      let filtered = [...transactions]

      if (type) {
        filtered = filterTransactionsByType(filtered, type)
      }

      if (category) {
        filtered = filterTransactionsByCategory(filtered, category)
      }

      if (startDate && endDate) {
        filtered = filterTransactionsByDateRange(filtered, startDate, endDate)
      }

      return sortTransactionsByDate(filtered, "desc")
    },
    [transactions]
  )

  // Get transaction by ID
  const getTransactionById = useCallback(
    (txId) => {
      return transactions.find((t) => t.id === txId)
    },
    [transactions]
  )

  // Get transactions by type
  const getTransactionsByType = useCallback(
    (type) => {
      return filterTransactionsByType(transactions, type)
    },
    [transactions]
  )

  // Get transactions by category
  const getTransactionsByCategory = useCallback(
    (category) => {
      return filterTransactionsByCategory(transactions, category)
    },
    [transactions]
  )

  return {
    transactions,
    setTransactions,
    likedTransactions,
    transactionComments,
    selectedTransaction,
    showTransactionDetails,
    detailsCommentText,
    setDetailsCommentText,
    
    // Methods
    addTransaction,
    deleteTransaction,
    toggleLike,
    openTransactionDetails,
    closeTransactionDetails,
    addComment,
    deleteComment,
    getFilteredTransactions,
    getTransactionById,
    getTransactionsByType,
    getTransactionsByCategory,
  }
}
