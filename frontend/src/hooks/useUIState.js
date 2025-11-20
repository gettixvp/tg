/**
 * useUIState - Custom hook for UI state management
 */

import { useState, useCallback } from "react"

export const useUIState = () => {
  // Main state
  const [theme, setTheme] = useState("light")
  const [activeTab, setActiveTab] = useState("overview")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenEnabled, setFullscreenEnabled] = useState(true)
  const [showNumKeyboard, setShowNumKeyboard] = useState(false)
  
  // Chart and diagrams
  const [showChart, setShowChart] = useState(false)
  const [chartType, setChartType] = useState("expense")
  const [chartView, setChartView] = useState("pie") // "pie", "bar", "line"
  
  // Transaction form
  const [showAddModal, setShowAddModal] = useState(false)
  const [transactionType, setTransactionType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  
  // Goal modals
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [initialSavingsAmount, setInitialSavingsAmount] = useState(0)
  const [initialSavingsInput, setInitialSavingsInput] = useState("0")
  
  // Settings
  const [showSystemSettings, setShowSystemSettings] = useState(false)
  
  // Savings tab
  const [savingsTab, setSavingsTab] = useState("savings") // "savings" or "debts"
  
  // Linked users
  const [linkedUsers, setLinkedUsers] = useState([])
  const [showLinkedUsers, setShowLinkedUsers] = useState(false)
  const [showLinkedUsersDropdown, setShowLinkedUsersDropdown] = useState(false)

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }, [])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  // Open tab
  const openTab = useCallback((tab) => {
    setActiveTab(tab)
  }, [])

  // Open add modal
  const openAddModal = useCallback((type = "expense") => {
    setTransactionType(type)
    setAmount("")
    setDescription("")
    setCategory("")
    setShowAddModal(true)
  }, [])

  // Close add modal
  const closeAddModal = useCallback(() => {
    setShowAddModal(false)
    setAmount("")
    setDescription("")
    setCategory("")
  }, [])

  // Toggle keyboard
  const toggleKeyboard = useCallback((show = null) => {
    setShowNumKeyboard(show !== null ? show : (prev) => !prev)
  }, [])

  // Blur all (close keyboard and modals)
  const blurAll = useCallback(() => {
    setShowNumKeyboard(false)
    // Add other blur logic as needed
  }, [])

  // Toggle linked users dropdown
  const toggleLinkedUsersDropdown = useCallback(() => {
    setShowLinkedUsersDropdown((prev) => !prev)
  }, [])

  // Close linked users dropdown
  const closeLinkedUsersDropdown = useCallback(() => {
    setShowLinkedUsersDropdown(false)
  }, [])

  // Reset transaction form
  const resetTransactionForm = useCallback(() => {
    setAmount("")
    setDescription("")
    setCategory("")
    setTransactionType("expense")
  }, [])

  return {
    // Main state
    theme,
    setTheme,
    activeTab,
    setActiveTab,
    isFullscreen,
    setIsFullscreen,
    fullscreenEnabled,
    setFullscreenEnabled,
    showNumKeyboard,
    setShowNumKeyboard,
    
    // Chart
    showChart,
    setShowChart,
    chartType,
    setChartType,
    chartView,
    setChartView,
    
    // Transaction form
    showAddModal,
    setShowAddModal,
    transactionType,
    setTransactionType,
    amount,
    setAmount,
    description,
    setDescription,
    category,
    setCategory,
    
    // Goals
    showGoalModal,
    setShowGoalModal,
    initialSavingsAmount,
    setInitialSavingsAmount,
    initialSavingsInput,
    setInitialSavingsInput,
    
    // Settings
    showSystemSettings,
    setShowSystemSettings,
    
    // Savings
    savingsTab,
    setSavingsTab,
    
    // Linked users
    linkedUsers,
    setLinkedUsers,
    showLinkedUsers,
    setShowLinkedUsers,
    showLinkedUsersDropdown,
    setShowLinkedUsersDropdown,

    // Methods
    toggleTheme,
    toggleFullscreen,
    openTab,
    openAddModal,
    closeAddModal,
    toggleKeyboard,
    blurAll,
    toggleLinkedUsersDropdown,
    closeLinkedUsersDropdown,
    resetTransactionForm,
  }
}
