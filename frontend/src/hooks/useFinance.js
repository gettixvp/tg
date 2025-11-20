/**
 * useFinance - Custom hook for main financial data
 */

import { useState, useCallback, useMemo } from "react"
import { calculateTotals } from "../utils/calculations"
import { DEFAULT_GOAL_AMOUNT, DEFAULT_EXCHANGE_RATE } from "../utils/constants"

export const useFinance = () => {
  const [balance, setBalance] = useState(0)
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [savings, setSavings] = useState(0)
  const [currency, setCurrency] = useState("BYN")
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE)
  const [balanceVisible, setBalanceVisible] = useState(true)
  
  // Goal data
  const [goalName, setGoalName] = useState("Отпуск")
  const [goalAmount, setGoalAmount] = useState(DEFAULT_GOAL_AMOUNT)
  const [initialGoalAmount, setInitialGoalAmount] = useState(DEFAULT_GOAL_AMOUNT)
  
  // Second goal data
  const [secondGoalName, setSecondGoalName] = useState("")
  const [secondGoalAmount, setSecondGoalAmount] = useState(0)
  const [secondGoalSavings, setSecondGoalSavings] = useState(0)
  const [secondGoalInitialAmount, setSecondGoalInitialAmount] = useState(0)
  const [showSecondGoalModal, setShowSecondGoalModal] = useState(false)
  const [secondGoalInput, setSecondGoalInput] = useState("0")
  const [selectedSavingsGoal, setSelectedSavingsGoal] = useState("main")

  // Update balance from transactions
  const updateFromTransactions = useCallback((transactions) => {
    const totals = calculateTotals(transactions)
    setIncome(totals.income)
    setExpenses(totals.expenses)
    setSavings(totals.savings)
    // Balance is calculated as income - expenses
    setBalance(totals.balance)
  }, [])

  // Add income
  const addIncome = useCallback((amount) => {
    setIncome((prev) => prev + amount)
    setBalance((prev) => prev + amount)
  }, [])

  // Add expense
  const addExpense = useCallback((amount) => {
    setExpenses((prev) => prev + amount)
    setBalance((prev) => prev - amount)
  }, [])

  // Add savings
  const addSavings = useCallback((amount, goalType = "main") => {
    setSavings((prev) => prev + amount)
    if (goalType === "main") {
      setBalance((prev) => prev - amount)
    }
  }, [])

  // Update goal
  const updateGoal = useCallback((name, amount) => {
    setGoalName(name)
    setGoalAmount(Number(amount))
    setInitialGoalAmount(Number(amount))
  }, [])

  // Update second goal
  const updateSecondGoal = useCallback((name, amount) => {
    setSecondGoalName(name)
    setSecondGoalAmount(Number(amount))
    setSecondGoalInitialAmount(Number(amount))
  }, [])

  // Get progress percentage for main goal
  const getGoalProgress = useMemo(() => {
    return () => {
      if (goalAmount <= 0) return 0
      return Math.min((savings / goalAmount) * 100, 100)
    }
  }, [savings, goalAmount])

  // Get progress percentage for second goal
  const getSecondGoalProgress = useMemo(() => {
    return () => {
      if (secondGoalAmount <= 0) return 0
      return Math.min((secondGoalSavings / secondGoalAmount) * 100, 100)
    }
  }, [secondGoalSavings, secondGoalAmount])

  // Get goal remaining amount
  const getGoalRemaining = useCallback(() => {
    return Math.max(goalAmount - savings, 0)
  }, [goalAmount, savings])

  // Get second goal remaining amount
  const getSecondGoalRemaining = useCallback(() => {
    return Math.max(secondGoalAmount - secondGoalSavings, 0)
  }, [secondGoalAmount, secondGoalSavings])

  // Update exchange rate
  const updateExchangeRate = useCallback((rate) => {
    setExchangeRate(Number(rate))
  }, [])

  // Toggle balance visibility
  const toggleBalanceVisibility = useCallback(() => {
    setBalanceVisible((prev) => !prev)
  }, [])

  // Get visible balance (returns masked or actual)
  const getVisibleBalance = useCallback(() => {
    return balanceVisible ? balance : null
  }, [balance, balanceVisible])

  return {
    // State
    balance,
    setBalance,
    income,
    setIncome,
    expenses,
    setExpenses,
    savings,
    setSavings,
    currency,
    setCurrency,
    exchangeRate,
    setExchangeRate,
    balanceVisible,
    setBalanceVisible,
    
    // Goal data
    goalName,
    setGoalName,
    goalAmount,
    setGoalAmount,
    initialGoalAmount,
    setInitialGoalAmount,
    
    // Second goal data
    secondGoalName,
    setSecondGoalName,
    secondGoalAmount,
    setSecondGoalAmount,
    secondGoalSavings,
    setSecondGoalSavings,
    secondGoalInitialAmount,
    setSecondGoalInitialAmount,
    showSecondGoalModal,
    setShowSecondGoalModal,
    secondGoalInput,
    setSecondGoalInput,
    selectedSavingsGoal,
    setSelectedSavingsGoal,

    // Methods
    updateFromTransactions,
    addIncome,
    addExpense,
    addSavings,
    updateGoal,
    updateSecondGoal,
    getGoalProgress,
    getSecondGoalProgress,
    getGoalRemaining,
    getSecondGoalRemaining,
    updateExchangeRate,
    toggleBalanceVisibility,
    getVisibleBalance,
  }
}
