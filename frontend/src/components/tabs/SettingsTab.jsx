import React from 'react'
import { Settings, Wallet, TrendingUp, TrendingDown, PiggyBank, LogOut, User, Maximize2, Minimize2, Moon, Sun } from 'lucide-react'

const SettingsTab = ({
  theme,
  setTheme,
  currency,
  setCurrency,
  currencies,
  user,
  handleLogout,
  setShowWalletSettings,
  setShowBudgetModal,
  setSelectedBudgetCategory,
  setShowAddDebtModal,
  setShowSystemSettings,
  isFullscreen,
  toggleFullscreen,
  isFullscreenEnabled,
  setFullscreenEnabled,
  balanceVisible,
  setBalanceVisible,
  balance,
  income,
  expenses,
  savings,
  formatCurrency,
  debts,
  savingsTab,
  setSavingsTab,
  secondGoalName,
  secondGoalAmount,
  secondGoalSavings,
  setShowSecondGoalModal,
  goalSavings,
  setIsAuthenticated,
  setUser,
  setBalance,
  setIncome,
  setExpenses,
  setSavings,
  setTransactions,
  isFullscreen: isFullscreenState
}) => {
  return (
    <div style={{ paddingTop: isFullscreenState ? '48px' : '16px' }}>
      <div
        className={`backdrop-blur-lg rounded-2xl p-4 border shadow-lg mx-4 ${
          theme === "dark"
            ? "bg-gray-900/70 border-gray-700/70"
            : "bg-white/96 border-slate-200/80"
        }`}
      >
        <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
          Настройки
        </h3>
        
        {/* Настройки кошельков */}
        <div className="mb-6">
          <button
            onClick={() => setShowWalletSettings(true)}
            className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
              theme === "dark"
                ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                : "bg-gray-50/90 border-gray-200/80 hover:bg-gray-100/90"
            }`}
          >
            <div className="flex items-center gap-3">
              <Wallet className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
              <div className="text-left">
                <p className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  Управление кошельками
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Добавить, редактировать или удалить кошельки
                </p>
              </div>
            </div>
            <Settings className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
          </button>
        </div>

        {/* Бюджеты и лимиты */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowBudgetModal(true)
              setSelectedBudgetCategory('')
            }}
            className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
              theme === "dark"
                ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                : "bg-gray-50/90 border-gray-200/80 hover:bg-gray-100/90"
            }`}
          >
            <div className="flex items-center gap-3">
              <TrendingDown className={`w-5 h-5 ${theme === "dark" ? "text-orange-400" : "text-orange-600"}`} />
              <div className="text-left">
                <p className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  Бюджеты и лимиты
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Установить лимиты на категории расходов
                </p>
              </div>
            </div>
            <Settings className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
          </button>
        </div>

        {/* Копилка и долги */}
        <div className="mb-6">
          <div className={`p-4 rounded-xl border ${
            theme === "dark"
              ? "bg-gray-800/50 border-gray-700/50"
              : "bg-gray-50/90 border-gray-200/80"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <PiggyBank className={`w-5 h-5 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                <h4 className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  Копилка и долги
                </h4>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setSavingsTab('savings')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    savingsTab === 'savings'
                      ? theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                      : theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  Копилка
                </button>
                <button
                  onClick={() => setSavingsTab('debts')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    savingsTab === 'debts'
                      ? theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                      : theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  Долги
                </button>
              </div>
            </div>

            {savingsTab === 'savings' ? (
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${
                  theme === "dark" ? "bg-gray-700/50" : "bg-gray-100/50"
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      Основная копилка
                    </span>
                    <span className={`text-sm font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                      {formatCurrency(savings)}
                    </span>
                  </div>
                </div>
                
                {secondGoalName && (
                  <div className={`p-3 rounded-lg ${
                    theme === "dark" ? "bg-gray-700/50" : "bg-gray-100/50"
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        {secondGoalName}
                      </span>
                      <span className={`text-sm font-bold ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                        {formatCurrency(secondGoalSavings)} / {formatCurrency(secondGoalAmount)}
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                    }`}>
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((secondGoalSavings / secondGoalAmount) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setShowSecondGoalModal(true)}
                  className={`w-full p-2 rounded-lg text-sm font-medium transition-all ${
                    theme === "dark"
                      ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {secondGoalName ? 'Редактировать цель' : 'Добавить цель накопления'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setShowAddDebtModal(true)}
                  className={`w-full p-3 rounded-lg text-sm font-medium transition-all ${
                    theme === "dark"
                      ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Добавить долг
                </button>
                
                {debts.length === 0 ? (
                  <p className={`text-center py-4 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Нет активных долгов
                  </p>
                ) : (
                  <div className="space-y-2">
                    {debts.map(debt => (
                      <div key={debt.id} className={`p-3 rounded-lg ${
                        theme === "dark" ? "bg-gray-700/50" : "bg-gray-100/50"
                      }`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                              {debt.person}
                            </p>
                            <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                              {debt.type === 'owe' ? 'Я должен' : 'Мне должны'}
                            </p>
                          </div>
                          <span className={`text-sm font-bold ${
                            debt.type === 'owe' 
                              ? "text-red-500" 
                              : "text-green-500"
                          }`}>
                            {debt.type === 'owe' ? '-' : '+'}{formatCurrency(debt.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Тема оформления */}
        <div className="mb-6">
          <div className={`p-4 rounded-xl border ${
            theme === "dark"
              ? "bg-gray-800/50 border-gray-700/50"
              : "bg-gray-50/90 border-gray-200/80"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className={`w-5 h-5 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
                ) : (
                  <Sun className={`w-5 h-5 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`} />
                )}
                <div>
                  <p className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                    Тема оформления
                  </p>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {theme === "dark" ? "Темная" : "Светлая"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {theme === "dark" ? (
                  <Sun className={`w-4 h-4 ${theme === "dark" ? "text-yellow-400" : "text-yellow-600"}`} />
                ) : (
                  <Moon className={`w-4 h-4 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Валюта */}
        <div className="mb-6">
          <div className={`p-4 rounded-xl border ${
            theme === "dark"
              ? "bg-gray-800/50 border-gray-700/50"
              : "bg-gray-50/90 border-gray-200/80"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  Валюта
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {currencies.find(c => c.code === currency)?.name}
                </p>
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-100 border-gray-300 text-gray-900"
                }`}
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Системные настройки */}
        <div className="mb-6">
          <button
            onClick={() => setShowSystemSettings(true)}
            className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
              theme === "dark"
                ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                : "bg-gray-50/90 border-gray-200/80 hover:bg-gray-100/90"
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className={`w-5 h-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
              <div className="text-left">
                <p className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                  Системные настройки
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Экспорт, сброс данных и другие настройки
                </p>
              </div>
            </div>
            <Settings className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`} />
          </button>
        </div>

        {/* Статистика */}
        <div className={`p-4 rounded-xl border ${
          theme === "dark"
            ? "bg-gray-800/50 border-gray-700/50"
            : "bg-gray-50/90 border-gray-200/80"
        }`}>
          <h4 className={`font-medium mb-3 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
            Статистика
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Текущий баланс
              </span>
              <span className={`text-sm font-bold ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                {formatCurrency(balance)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Общие доходы
              </span>
              <span className={`text-sm font-bold text-green-500`}>
                +{formatCurrency(income)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Общие расходы
              </span>
              <span className={`text-sm font-bold text-red-500`}>
                -{formatCurrency(expenses)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Накопления
              </span>
              <span className={`text-sm font-bold text-blue-500`}>
                {formatCurrency(savings)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsTab
