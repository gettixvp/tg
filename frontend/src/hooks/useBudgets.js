/**
 * useBudgets - Custom hook for budget management
 */

import { useState, useCallback, useMemo } from "react"
import { calculateCategorySpending, calculateBudgetStatus } from "../utils/calculations"

export const useBudgets = (initialBudgets = {}) => {
  const [budgets, setBudgets] = useState(initialBudgets)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState("")
  const [budgetLimitInput, setBudgetLimitInput] = useState("")
  const [budgetPeriod, setBudgetPeriod] = useState("month")
  const [showBudgetKeyboard, setShowBudgetKeyboard] = useState(false)

  // Add or update budget
  const setBudget = useCallback((category, limit, period = "month") => {
    setBudgets((prev) => ({
      ...prev,
      [category]: {
        limit: Number(limit),
        period,
        createdAt: new Date().toISOString(),
      },
    }))
  }, [])

  // Delete budget
  const deleteBudget = useCallback((category) => {
    setBudgets((prev) => {
      const newBudgets = { ...prev }
      delete newBudgets[category]
      return newBudgets
    })
  }, [])

  // Clear budget progress (reset created date)
  const clearBudgetProgress = useCallback((category) => {
    setBudgets((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        createdAt: new Date().toISOString(),
      },
    }))
  }, [])

  // Get budget status for a category
  const getBudgetStatus = useCallback(
    (category, transactions) => {
      const budget = budgets[category]
      if (!budget) return null

      const spent = calculateCategorySpending(transactions, category, budget.period)
      return calculateBudgetStatus(spent, budget.limit)
    },
    [budgets]
  )

  // Get all budget statuses (memoized for performance)
  const getAllBudgetStatuses = useMemo(() => {
    return (transactions) => {
      const statuses = {}
      Object.keys(budgets).forEach((category) => {
        const budget = budgets[category]
        const spent = calculateCategorySpending(transactions, category, budget.period)
        statuses[category] = calculateBudgetStatus(spent, budget.limit)
      })
      return statuses
    }
  }, [budgets])

  // Check if any budget is exceeded
  const hasExceededBudgets = useCallback(
    (transactions) => {
      const statuses = getAllBudgetStatuses(transactions)
      return Object.values(statuses).some((status) => status?.isOverBudget)
    },
    [getAllBudgetStatuses]
  )

  // Check if any budget is near limit
  const hasNearLimitBudgets = useCallback(
    (transactions) => {
      const statuses = getAllBudgetStatuses(transactions)
      return Object.values(statuses).some((status) => status?.isNearLimit)
    },
    [getAllBudgetStatuses]
  )

  // Open budget editor
  const openBudgetEditor = useCallback((category) => {
    setSelectedBudgetCategory(category)
    const budget = budgets[category]
    setBudgetLimitInput(budget ? String(budget.limit) : "")
    setBudgetPeriod(budget ? budget.period : "month")
    setShowBudgetKeyboard(false)
    setShowBudgetModal(true)
  }, [budgets])

  // Close budget editor
  const closeBudgetEditor = useCallback(() => {
    setShowBudgetModal(false)
    setSelectedBudgetCategory("")
    setBudgetLimitInput("")
    setBudgetPeriod("month")
  }, [])

  // Reset budget form
  const resetBudgetForm = useCallback(() => {
    setBudgetLimitInput("")
    setBudgetPeriod("month")
    setShowBudgetKeyboard(false)
  }, [])

  return {
    budgets,
    setBudgets,
    showBudgetModal,
    setShowBudgetModal,
    selectedBudgetCategory,
    setSelectedBudgetCategory,
    budgetLimitInput,
    setBudgetLimitInput,
    budgetPeriod,
    setBudgetPeriod,
    showBudgetKeyboard,
    setShowBudgetKeyboard,

    // Methods
    setBudget,
    deleteBudget,
    clearBudgetProgress,
    getBudgetStatus,
    getAllBudgetStatuses,
    hasExceededBudgets,
    hasNearLimitBudgets,
    openBudgetEditor,
    closeBudgetEditor,
    resetBudgetForm,
  }
}
