import { useState, useMemo } from 'react'
import { walletIcons, walletColors } from '../constants'

export const useWallets = () => {
  const [wallets, setWallets] = useState([
    {
      id: 'main',
      name: 'Основной',
      icon: '💼',
      color: '#3b82f6',
      isMain: true
    }
  ])
  const [currentWalletId, setCurrentWalletId] = useState('main')

  // Добавление нового кошелька
  const addWallet = (walletData) => {
    const newWallet = {
      id: `wallet_${Date.now()}`,
      name: walletData.name || 'Новый кошелек',
      icon: walletData.icon || walletIcons[0],
      color: walletData.color || walletColors[0].value,
      isMain: false
    }
    
    setWallets(prev => [...prev, newWallet])
    return newWallet
  }

  // Редактирование кошелька
  const updateWallet = (walletId, updates) => {
    setWallets(prev => prev.map(wallet => 
      wallet.id === walletId 
        ? { ...wallet, ...updates }
        : wallet
    ))
  }

  // Удаление кошелька
  const deleteWallet = (walletId) => {
    // Нельзя удалять основной кошелек
    if (walletId === 'main') {
      throw new Error('Нельзя удалить основной кошелек')
    }
    
    setWallets(prev => prev.filter(wallet => wallet.id !== walletId))
    
    // Если удаляем текущий кошелек, переключаемся на основной
    if (currentWalletId === walletId) {
      setCurrentWalletId('main')
    }
  }

  // Получение текущего кошелька
  const currentWallet = useMemo(() => {
    return wallets.find(w => w.id === currentWalletId) || wallets[0]
  }, [wallets, currentWalletId])

  // Переключение на следующий кошелек
  const switchToNextWallet = () => {
    const currentIndex = wallets.findIndex(w => w.id === currentWalletId)
    const nextIndex = (currentIndex + 1) % wallets.length
    setCurrentWalletId(wallets[nextIndex].id)
  }

  // Переключение на предыдущий кошелек
  const switchToPreviousWallet = () => {
    const currentIndex = wallets.findIndex(w => w.id === currentWalletId)
    const prevIndex = currentIndex === 0 ? wallets.length - 1 : currentIndex - 1
    setCurrentWalletId(wallets[prevIndex].id)
  }

  // Получение всех кошельков для выбора
  const getWalletOptions = () => {
    return wallets.map(wallet => ({
      value: wallet.id,
      label: `${wallet.icon} ${wallet.name}`,
      ...wallet
    }))
  }

  // Проверка, является ли кошелек основным
  const isMainWallet = (walletId) => {
    return walletId === 'main'
  }

  // Получение баланса кошелька (будет использоваться с транзакциями)
  const getWalletBalance = (walletId, transactions = []) => {
    if (walletId === 'main') {
      // Основной кошелек показывает общий баланс
      return transactions.reduce((balance, tx) => {
        if (tx.type === 'income') return balance + Number(tx.amount)
        if (tx.type === 'expense') return balance - Number(tx.amount)
        if (tx.type === 'savings') return balance - Number(tx.amount)
        return balance
      }, 0)
    } else {
      // Другие кошельки показывают только свои транзакции
      return transactions
        .filter(tx => tx.walletId === walletId)
        .reduce((balance, tx) => {
          if (tx.type === 'income') return balance + Number(tx.amount)
          if (tx.type === 'expense') return balance - Number(tx.amount)
          if (tx.type === 'savings') return balance - Number(tx.amount)
          return balance
        }, 0)
    }
  }

  // Получение статистики по кошельку
  const getWalletStats = (walletId, transactions = []) => {
    const walletTransactions = walletId === 'main' 
      ? transactions 
      : transactions.filter(tx => tx.walletId === walletId)

    const stats = {
      income: 0,
      expenses: 0,
      savings: 0,
      transactionCount: walletTransactions.length,
      lastTransaction: null
    }

    walletTransactions.forEach(tx => {
      const amount = Number(tx.amount)
      if (tx.type === 'income') {
        stats.income += amount
      } else if (tx.type === 'expense') {
        stats.expenses += amount
      } else if (tx.type === 'savings') {
        stats.savings += amount
      }

      // Находим последнюю транзакцию
      if (!stats.lastTransaction || new Date(tx.date) > new Date(stats.lastTransaction.date)) {
        stats.lastTransaction = tx
      }
    })

    stats.balance = stats.income - stats.expenses - stats.savings

    return stats
  }

  return {
    // Состояние
    wallets,
    currentWalletId,
    currentWallet,
    
    // Действия
    setWallets,
    setCurrentWalletId,
    addWallet,
    updateWallet,
    deleteWallet,
    switchToNextWallet,
    switchToPreviousWallet,
    
    // Утилиты
    getWalletOptions,
    isMainWallet,
    getWalletBalance,
    getWalletStats
  }
}
