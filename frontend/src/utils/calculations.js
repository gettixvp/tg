/**
 * Calculation and computation utilities
 */

export const calculateCategorySpending = (transactions, category, period = "month") => {
  const now = new Date()
  let startDate = new Date()
  
  if (period === "week") {
    startDate.setDate(now.getDate() - 7)
  } else if (period === "month") {
    startDate.setMonth(now.getMonth() - 1)
  } else if (period === "year") {
    startDate.setFullYear(now.getFullYear() - 1)
  }
  
  const categoryTransactions = transactions.filter(
    (tx) =>
      tx.type === "expense" &&
      tx.category === category &&
      new Date(tx.date || tx.created_at) >= startDate
  )
  
  return categoryTransactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
}

export const calculateBudgetStatus = (spent, limit) => {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0
  const remaining = limit - spent
  
  return {
    spent,
    limit,
    percentage: Math.min(percentage, 100),
    remaining: Math.max(remaining, 0),
    isOverBudget: spent > limit,
    isNearLimit: percentage >= 80 && percentage < 100,
    isWarning: percentage >= 60 && percentage < 80,
  }
}

export const calculateTotals = (transactions) => {
  let income = 0
  let expenses = 0
  let savings = 0
  
  transactions.forEach((tx) => {
    const amount = Number(tx.amount || 0)
    if (tx.type === "income") {
      income += amount
    } else if (tx.type === "expense") {
      expenses += amount
    } else if (tx.type === "savings") {
      savings += amount
    }
  })
  
  return {
    income,
    expenses,
    savings,
    balance: income - expenses,
  }
}

export const calculateCategoryTotals = (transactions, type = "expense") => {
  const totals = {}
  
  transactions
    .filter((tx) => tx.type === type)
    .forEach((tx) => {
      const category = tx.category || "Другое"
      totals[category] = (totals[category] || 0) + Number(tx.amount || 0)
    })
  
  return totals
}

export const getTransactionStats = (transactions) => {
  const stats = {
    total: transactions.length,
    byType: {
      income: 0,
      expense: 0,
      savings: 0,
    },
    byCategory: {},
    average: 0,
    max: 0,
    min: Infinity,
  }
  
  if (transactions.length === 0) {
    stats.min = 0
    return stats
  }
  
  let totalAmount = 0
  
  transactions.forEach((tx) => {
    const amount = Number(tx.amount || 0)
    
    // By type
    if (stats.byType[tx.type] !== undefined) {
      stats.byType[tx.type]++
    }
    
    // By category
    const category = tx.category || "Другое"
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1
    
    // Min/Max
    stats.max = Math.max(stats.max, amount)
    stats.min = Math.min(stats.min, amount)
    
    totalAmount += amount
  })
  
  stats.average = totalAmount / transactions.length
  
  return stats
}

export const filterTransactionsByDateRange = (transactions, startDate, endDate) => {
  return transactions.filter((tx) => {
    const txDate = new Date(tx.date || tx.created_at)
    return txDate >= startDate && txDate <= endDate
  })
}

export const filterTransactionsByCategory = (transactions, category) => {
  return transactions.filter((tx) => tx.category === category)
}

export const filterTransactionsByType = (transactions, type) => {
  return transactions.filter((tx) => tx.type === type)
}

export const sortTransactionsByDate = (transactions, order = "desc") => {
  const sorted = [...transactions]
  sorted.sort((a, b) => {
    const dateA = new Date(a.date || a.created_at)
    const dateB = new Date(b.date || b.created_at)
    return order === "desc" ? dateB - dateA : dateA - dateB
  })
  return sorted
}

export const sortTransactionsByAmount = (transactions, order = "desc") => {
  const sorted = [...transactions]
  sorted.sort((a, b) => {
    const amountA = Number(a.amount || 0)
    const amountB = Number(b.amount || 0)
    return order === "desc" ? amountB - amountA : amountA - amountB
  })
  return sorted
}
