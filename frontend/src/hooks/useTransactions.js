import { useState, useMemo } from 'react'
import { generateId } from '../utils'

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([])
  const [likedTransactions, setLikedTransactions] = useState(new Set())
  const [transactionComments, setTransactionComments] = useState({})

  // Фильтрация транзакций по кошельку
  const getFilteredTransactions = (currentWalletId) => {
    return useMemo(() => {
      if (currentWalletId === 'main') {
        // Основной кошелек показывает все транзакции
        return transactions
      } else {
        // Другие кошельки показывают только свои транзакции
        return transactions.filter(tx => tx.walletId === currentWalletId)
      }
    }, [transactions, currentWalletId])
  }

  // Добавление новой транзакции
  const addTransaction = (transactionData) => {
    const newTransaction = {
      id: generateId(),
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      ...transactionData
    }

    setTransactions(prev => [newTransaction, ...prev])
    return newTransaction
  }

  // Удаление транзакции
  const deleteTransaction = (transactionId) => {
    setTransactions(prev => prev.filter(tx => tx.id !== transactionId))
    
    // Удаляем связанные лайки и комментарии
    setLikedTransactions(prev => {
      const newSet = new Set(prev)
      newSet.delete(transactionId)
      return newSet
    })
    
    setTransactionComments(prev => {
      const newComments = { ...prev }
      delete newComments[transactionId]
      return newComments
    })
  }

  // Обновление транзакции
  const updateTransaction = (transactionId, updates) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === transactionId 
        ? { ...tx, ...updates, updatedAt: new Date().toISOString() }
        : tx
    ))
  }

  // Переключение лайка транзакции
  const toggleTransactionLike = (transactionId) => {
    setLikedTransactions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId)
      } else {
        newSet.add(transactionId)
      }
      return newSet
    })
  }

  // Добавление комментария к транзакции
  const addTransactionComment = (transactionId, comment) => {
    const newComment = {
      id: generateId(),
      ...comment,
      date: new Date().toISOString()
    }

    setTransactionComments(prev => ({
      ...prev,
      [transactionId]: [...(prev[transactionId] || []), newComment]
    }))

    return newComment
  }

  // Удаление комментария
  const deleteTransactionComment = (transactionId, commentId) => {
    setTransactionComments(prev => ({
      ...prev,
      [transactionId]: (prev[transactionId] || []).filter(c => c.id !== commentId)
    }))
  }

  // Получение статистики по транзакциям
  const getTransactionStats = (walletId = null) => {
    const filteredTransactions = walletId 
      ? getFilteredTransactions(walletId)
      : transactions

    return {
      total: filteredTransactions.length,
      income: filteredTransactions.filter(tx => tx.type === 'income').length,
      expenses: filteredTransactions.filter(tx => tx.type === 'expense').length,
      savings: filteredTransactions.filter(tx => tx.type === 'savings').length,
      totalAmount: filteredTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
      incomeAmount: filteredTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
      expensesAmount: filteredTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0),
      savingsAmount: filteredTransactions
        .filter(tx => tx.type === 'savings')
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
    }
  }

  // Получение транзакций за период
  const getTransactionsByPeriod = (startDate, endDate, walletId = null) => {
    const filteredTransactions = walletId 
      ? getFilteredTransactions(walletId)
      : transactions

    return filteredTransactions.filter(tx => {
      const txDate = new Date(tx.date || tx.created_at)
      return txDate >= startDate && txDate <= endDate
    })
  }

  // Получение транзакций по категории
  const getTransactionsByCategory = (category, walletId = null) => {
    const filteredTransactions = walletId 
      ? getFilteredTransactions(walletId)
      : transactions

    return filteredTransactions.filter(tx => tx.category === category)
  }

  // Получение последних транзакций
  const getRecentTransactions = (limit = 10, walletId = null) => {
    const filteredTransactions = walletId 
      ? getFilteredTransactions(walletId)
      : transactions

    return filteredTransactions
      .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))
      .slice(0, limit)
  }

  // Поиск транзакций
  const searchTransactions = (query, walletId = null) => {
    const filteredTransactions = walletId 
      ? getFilteredTransactions(walletId)
      : transactions

    const searchQuery = query.toLowerCase()
    
    return filteredTransactions.filter(tx => 
      (tx.description && tx.description.toLowerCase().includes(searchQuery)) ||
      (tx.category && tx.category.toLowerCase().includes(searchQuery)) ||
      (tx.amount && tx.amount.toString().includes(searchQuery))
    )
  }

  // Получение данных для графиков
  const getChartData = (type, walletId = null) => {
    const filteredTransactions = walletId 
      ? getFilteredTransactions(walletId)
      : transactions

    const typeTransactions = filteredTransactions.filter(tx => tx.type === type)
    const categoryTotals = {}

    typeTransactions.forEach(tx => {
      const category = tx.category || 'Другое'
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(tx.amount || 0)
    })

    return {
      labels: Object.keys(categoryTotals),
      data: Object.values(categoryTotals),
      total: Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
    }
  }

  // Расчет баланса
  const calculateBalance = (walletId = null) => {
    const stats = getTransactionStats(walletId)
    return stats.incomeAmount - stats.expensesAmount - stats.savingsAmount
  }

  // Очистка всех транзакций
  const clearAllTransactions = () => {
    setTransactions([])
    setLikedTransactions(new Set())
    setTransactionComments({})
  }

  return {
    // Состояние
    transactions,
    likedTransactions,
    transactionComments,
    
    // Действия
    setTransactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    toggleTransactionLike,
    addTransactionComment,
    deleteTransactionComment,
    clearAllTransactions,
    
    // Получение данных
    getFilteredTransactions,
    getTransactionStats,
    getTransactionsByPeriod,
    getTransactionsByCategory,
    getRecentTransactions,
    searchTransactions,
    getChartData,
    calculateBalance
  }
}
