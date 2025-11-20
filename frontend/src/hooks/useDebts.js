/**
 * useDebts - Custom hook for debt management
 */

import { useState, useCallback } from "react"
import { DEBT_TYPES } from "../utils/constants"

export const useDebts = (initialDebts = []) => {
  const [debts, setDebts] = useState(initialDebts)
  const [showAddDebtModal, setShowAddDebtModal] = useState(false)
  const [debtForm, setDebtForm] = useState({
    person: "",
    amount: "",
    description: "",
    type: DEBT_TYPES.OWE,
  })

  // Add debt
  const addDebt = useCallback((debtData) => {
    const newDebt = {
      id: Date.now(),
      ...debtData,
      createdAt: new Date().toISOString(),
    }
    setDebts((prev) => [newDebt, ...prev])
    return newDebt
  }, [])

  // Delete debt
  const deleteDebt = useCallback((debtId) => {
    setDebts((prev) => prev.filter((d) => d.id !== debtId))
  }, [])

  // Update debt
  const updateDebt = useCallback((debtId, updates) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === debtId ? { ...d, ...updates } : d))
    )
  }, [])

  // Mark debt as paid
  const markDebtAsPaid = useCallback((debtId) => {
    updateDebt(debtId, { isPaid: true, paidAt: new Date().toISOString() })
  }, [updateDebt])

  // Get debt by ID
  const getDebtById = useCallback(
    (debtId) => {
      return debts.find((d) => d.id === debtId)
    },
    [debts]
  )

  // Get debts by type
  const getDebtsByType = useCallback(
    (type) => {
      return debts.filter((d) => d.type === type && !d.isPaid)
    },
    [debts]
  )

  // Get debts owed to me
  const getDebtsMeOwe = useCallback(() => {
    return getDebtsByType(DEBT_TYPES.OWE)
  }, [getDebtsByType])

  // Get debts owed to me
  const getDebtsOwedToMe = useCallback(() => {
    return getDebtsByType(DEBT_TYPES.OWED)
  }, [getDebtsByType])

  // Get total debt amount
  const getTotalDebtAmount = useCallback(
    (type = null) => {
      let targetDebts = debts.filter((d) => !d.isPaid)
      if (type) {
        targetDebts = targetDebts.filter((d) => d.type === type)
      }
      return targetDebts.reduce((sum, d) => sum + Number(d.amount || 0), 0)
    },
    [debts]
  )

  // Get debt summary
  const getDebtSummary = useCallback(() => {
    return {
      totalDebts: debts.length,
      unpaidDebts: debts.filter((d) => !d.isPaid).length,
      paidDebts: debts.filter((d) => d.isPaid).length,
      totalAmount: getTotalDebtAmount(),
      iOwe: getTotalDebtAmount(DEBT_TYPES.OWE),
      owedToMe: getTotalDebtAmount(DEBT_TYPES.OWED),
    }
  }, [debts, getTotalDebtAmount])

  // Open add debt modal
  const openAddDebtModal = useCallback(() => {
    setShowAddDebtModal(true)
  }, [])

  // Close add debt modal
  const closeAddDebtModal = useCallback(() => {
    setShowAddDebtModal(false)
    resetDebtForm()
  }, [])

  // Update debt form field
  const updateDebtForm = useCallback((field, value) => {
    setDebtForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  // Reset debt form
  const resetDebtForm = useCallback(() => {
    setDebtForm({
      person: "",
      amount: "",
      description: "",
      type: DEBT_TYPES.OWE,
    })
  }, [])

  return {
    debts,
    setDebts,
    showAddDebtModal,
    setShowAddDebtModal,
    debtForm,
    setDebtForm,

    // Methods
    addDebt,
    deleteDebt,
    updateDebt,
    markDebtAsPaid,
    getDebtById,
    getDebtsByType,
    getDebtsMeOwe,
    getDebtsOwedToMe,
    getTotalDebtAmount,
    getDebtSummary,
    openAddDebtModal,
    closeAddDebtModal,
    updateDebtForm,
    resetDebtForm,
  }
}
