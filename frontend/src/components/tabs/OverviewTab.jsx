import React from 'react'
import { Eye, EyeOff, Plus, History, BarChart3 } from 'lucide-react'
import TxRow from '../TxRow'

const OverviewTab = ({
  theme,
  balance,
  income,
  expenses,
  savings,
  balanceVisible,
  setBalanceVisible,
  formatCurrency,
  currentWallet,
  wallets,
  currentWalletId,
  setCurrentWalletId,
  filteredTransactions,
  setShowAddTransactionModal,
  setActiveTab,
  categoriesMeta,
  formatDate,
  deleteTransaction,
  showLinkedUsers,
  toggleLike,
  openTransactionDetails,
  budgets,
  showBudgetModal,
  setShowBudgetModal,
  setSelectedBudgetCategory,
  isFullscreen
}) => {
  return (
    <div style={{ paddingTop: isFullscreen ? '48px' : '16px' }}>
      {/* Заголовок с балансом */}
      <header className="relative overflow-hidden px-4 pb-4">
        {/* Градиент на заднем плане */}
        <div
          className="absolute inset-0 opacity-30 blur-3xl"
          style={{
            background:
              theme === "dark"
                ? "radial-gradient(circle at 50% 20%, #3b82f6 0%, transparent 70%)"
                : "radial-gradient(circle at 50% 20%, #6366f1 0%, transparent 70%)",
            top: "-20px",
            height: "200px",
          }}
        />

        {/* Карусель кошельков */}
        <div className="relative h-32 mb-2">
          {wallets.map((wallet, index) => {
            const isActive = wallet.id === currentWalletId
            const translateY = index - wallets.findIndex(w => w.id === currentWalletId)
            
            return (
              <div
                key={wallet.id}
                className={`absolute inset-x-0 flex items-center justify-center transition-all duration-500 cursor-pointer`}
                style={{
                  transform: `translateY(${translateY * 40}px) scale(${isActive ? 1 : 0.8})`,
                  opacity: isActive ? 1 : 0.6,
                  zIndex: isActive ? 10 : 5 - Math.abs(translateY)
                }}
                onClick={() => setCurrentWalletId(wallet.id)}
              >
                <div
                  className={`p-4 rounded-2xl backdrop-blur-lg border transition-all ${
                    isActive
                      ? "bg-white/20 border-white/30 shadow-2xl"
                      : "bg-white/10 border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: wallet.color + '30' }}
                    >
                      {wallet.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{wallet.name}</h3>
                      <p className="text-white/80 text-sm">
                        {formatCurrency(
                          filteredTransactions.reduce((sum, tx) => {
                            if (tx.type === 'income') return sum + Number(tx.amount)
                            if (tx.type === 'expense') return sum - Number(tx.amount)
                            return sum
                          }, 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Подсказка о наличии других кошельков */}
        {wallets.length > 1 && (
          <div className="flex justify-center gap-1 mb-4">
            {wallets.map((wallet, index) => (
              <div
                key={wallet.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  wallet.id === currentWalletId
                    ? "bg-white/80 w-6"
                    : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Баланс и кнопки */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-white">
                {balanceVisible ? formatCurrency(balance) : "••••••"}
              </h1>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="p-2 rounded-full glass-button-matte transition-all"
              >
                {balanceVisible ? (
                  <EyeOff className="w-5 h-5 text-white/80" />
                ) : (
                  <Eye className="w-5 h-5 text-white/80" />
                )}
              </button>
            </div>
            <div className="flex gap-4 text-white/80 text-sm">
              <div>
                <span className="text-white/60">Доходы:</span>{" "}
                <span className="text-green-400 font-medium">+{formatCurrency(income)}</span>
              </div>
              <div>
                <span className="text-white/60">Расходы:</span>{" "}
                <span className="text-red-400 font-medium">-{formatCurrency(expenses)}</span>
              </div>
              <div>
                <span className="text-white/60">Копилка:</span>{" "}
                <span className="text-blue-400 font-medium">{formatCurrency(savings)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAddTransactionModal(true)}
            className="p-3 rounded-full glass-button-matte transition-all hover:scale-110"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>
      </header>

      {/* Бюджеты и лимиты */}
      {Object.keys(budgets).length > 0 && (
        <div className="px-4 mb-4">
          <div className={`rounded-2xl p-4 border backdrop-blur-lg shadow-lg ${
            theme === "dark"
              ? "bg-gray-900/70 border-gray-700/70"
              : "bg-white/96 border-slate-200/80"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-lg font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                Бюджеты и лимиты
              </h3>
              <button
                onClick={() => {
                  setShowBudgetModal(true)
                  setSelectedBudgetCategory('')
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <Plus className={`w-4 h-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
              </button>
            </div>
            
            <div className="space-y-3">
              {Object.entries(budgets).map(([category, budget]) => {
                const categoryTransactions = filteredTransactions.filter(tx => 
                  tx.type === 'expense' && tx.category === category
                )
                const spent = categoryTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0)
                const percentage = (spent / budget.limit) * 100
                const isOverBudget = percentage > 100
                const isNearLimit = percentage > 80 && percentage <= 100
                
                const meta = categoriesMeta[category] || categoriesMeta["Другое"]
                
                return (
                  <div
                    key={category}
                    className={`p-3 rounded-xl border ${
                      isOverBudget
                        ? theme === "dark"
                          ? "bg-red-900/25 border-red-700/50"
                          : "bg-red-50/90 border-red-200/80"
                        : isNearLimit
                          ? theme === "dark"
                            ? "bg-amber-900/25 border-amber-700/50"
                            : "bg-amber-50/90 border-amber-200/80"
                          : theme === "dark"
                            ? "bg-gray-900/40 border-gray-700/60"
                            : "bg-white/96 border-slate-200/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{meta.icon || '💰'}</span>
                        <div>
                          <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                            {category}
                          </p>
                          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {budget.period === 'month' ? 'За месяц' : budget.period === 'week' ? 'За неделю' : 'За год'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          isOverBudget
                            ? "text-red-600"
                            : isNearLimit
                            ? "text-orange-600"
                            : theme === "dark" ? "text-gray-200" : "text-gray-900"
                        }`}>
                          {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                        </p>
                        <p className={`text-xs ${
                          spent > budget.limit
                            ? "text-red-600"
                            : theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {spent > budget.limit ? 'Превышение' : 'Осталось'}: {formatCurrency(Math.abs(budget.limit - spent))}
                        </p>
                      </div>
                    </div>
                    
                    {/* Прогресс-бар */}
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                    }`}>
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isOverBudget
                            ? "bg-gradient-to-r from-red-500 to-red-600"
                            : isNearLimit
                            ? "bg-gradient-to-r from-orange-400 to-orange-500"
                            : "bg-gradient-to-r from-green-400 to-green-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    
                    {/* Процент */}
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-xs font-medium ${
                        isOverBudget
                          ? "text-red-600"
                          : isNearLimit
                          ? "text-orange-600"
                          : theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}>
                        {Math.round(percentage)}%
                      </p>
                      {isOverBudget && (
                        <span className="text-xs text-red-600 font-medium">⚠️ Превышен лимит</span>
                      )}
                      {isNearLimit && !isOverBudget && (
                        <span className="text-xs text-orange-600 font-medium">⚡ Близко к лимиту</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Последние операции */}
      <div className="px-4">
        <div
          className={`rounded-2xl p-4 border backdrop-blur-lg shadow-lg ${
            theme === "dark"
              ? "bg-gray-900/70 border-gray-700/70"
              : "bg-white/96 border-slate-200/80"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              Последние операции {currentWalletId !== 'main' && `(${currentWallet.name})`}
            </h3>
            <button
              onClick={() => setActiveTab("history")}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors touch-none"
            >
              Все →
            </button>
          </div>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <History className={`w-6 h-6 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
              </div>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                {currentWalletId !== 'main' ? `Нет операций в ${currentWallet.name}` : 'Пока нет операций'}
              </p>
              <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                {currentWalletId !== 'main' ? 'Добавьте первую операцию в этот кошелек' : 'Добавьте первую транзакцию'}
              </p>
            </div>
          ) : (
            <div>
              {filteredTransactions.slice(0, 4).map((tx) => (
                <TxRow
                  tx={{ ...tx, liked: false, comments: [] }}
                  key={tx.id}
                  categoriesMeta={categoriesMeta}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  theme={theme}
                  onDelete={deleteTransaction}
                  showCreator={showLinkedUsers}
                  onToggleLike={toggleLike}
                  onOpenDetails={openTransactionDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OverviewTab
