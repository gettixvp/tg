import React from "react"
import { History, PiggyBank } from "lucide-react"
import TxRow from "./TxRow"

export default function OverviewTab({
  theme,
  goalName,
  secondGoalName,
  secondGoalAmount,
  savingsProgress,
  savingsPct,
  secondGoalSavings,
  budgets,
  budgetStatuses,
  categoriesMeta,
  formatCurrency,
  setActiveTab,
  setShowBudgetModal,
  setSelectedBudgetCategory,
  setBudgetLimitInput,
  vibrate,
  transactions,
  likedTransactions,
  transactionComments,
  deleteTransaction,
  showLinkedUsers,
  toggleLike,
  openTransactionDetails,
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* Основная копилка */}
        <div
          onClick={() => {
            setActiveTab("savings")
            vibrate()
          }}
          className={`rounded-xl p-3 border flex-1 cursor-pointer transition-all touch-none active:scale-95 ${
            theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <div className={`p-1.5 rounded-lg ${theme === "dark" ? "bg-blue-900/40" : "bg-blue-100"}`}>
                <PiggyBank className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <div>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{goalName || "Копилка"}</p>
              </div>
            </div>
            {/* Маленькая круговая диаграмма */}
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke={theme === "dark" ? "#3b82f6" : "#6366f1"}
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - savingsProgress)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-bold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {savingsPct || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Вторая копилка (если есть) */}
        {secondGoalName && secondGoalAmount > 0 && (
          <div
            onClick={() => {
              setActiveTab("savings")
              vibrate()
            }}
            className={`rounded-xl p-3 border flex-1 cursor-pointer transition-all touch-none active:scale-95 ${
              theme === "dark" ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <div className={`p-1.5 rounded-lg ${theme === "dark" ? "bg-purple-900/40" : "bg-purple-100"}`}>
                  <PiggyBank className={`w-4 h-4 ${theme === "dark" ? "text-purple-400" : "text-purple-600"}`} />
                </div>
                <div>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>{secondGoalName}</p>
                </div>
              </div>
              {/* Маленькая круговая диаграмма для второй цели */}
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
                    strokeWidth="5"
                    fill="none"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke={theme === "dark" ? "#a855f7" : "#9333ea"}
                    strokeWidth="5"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - (secondGoalSavings / secondGoalAmount))}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {Math.round((secondGoalSavings / secondGoalAmount) * 100) || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Бюджеты и лимиты */}
      {Object.keys(budgets).length > 0 && (
        <div
          className={`rounded-2xl p-4 border ${
            theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              Бюджеты
            </h3>
            <button
              onClick={() => {
                setShowBudgetModal(true)
                setSelectedBudgetCategory("")
                setBudgetLimitInput("")
                vibrate()
              }}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors touch-none"
            >
              Настроить
            </button>
          </div>
          <div className="space-y-3">
            {Object.entries(budgets).map(([category, budget]) => {
              const status = budgetStatuses[category]
              if (!status) return null
              
              const meta = categoriesMeta[category] || {}
              const periodText = budget.period === 'week' ? 'неделю' : budget.period === 'month' ? 'месяц' : 'год'
              
              return (
                <div
                  key={category}
                  className={`p-3 rounded-xl border transition-all ${
                    status.isOverBudget
                      ? theme === "dark" ? "bg-red-900/20 border-red-700/30" : "bg-red-50 border-red-200"
                      : status.isNearLimit
                      ? theme === "dark" ? "bg-orange-900/20 border-orange-700/30" : "bg-orange-50 border-orange-200"
                      : theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
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
                          На {periodText}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        status.isOverBudget
                          ? "text-red-600"
                          : status.isNearLimit
                          ? "text-orange-600"
                          : theme === "dark" ? "text-gray-200" : "text-gray-900"
                      }`}>
                        {formatCurrency(status.spent)} / {formatCurrency(status.limit)}
                      </p>
                      <p className={`text-xs ${
                        status.remaining < 0
                          ? "text-red-600"
                          : theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {status.remaining < 0 ? 'Превышение' : 'Осталось'}: {formatCurrency(Math.abs(status.remaining))}
                      </p>
                    </div>
                  </div>
                  
                  {/* Прогресс-бар */}
                  <div className={`w-full h-2 rounded-full overflow-hidden ${
                    theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                  }`}>
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        status.isOverBudget
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : status.isNearLimit
                          ? "bg-gradient-to-r from-orange-400 to-orange-500"
                          : "bg-gradient-to-r from-green-400 to-green-500"
                      }`}
                      style={{ width: `${Math.min(status.percentage, 100)}%` }}
                    />
                  </div>
                  
                  {/* Процент */}
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-xs font-medium ${
                      status.isOverBudget
                        ? "text-red-600"
                        : status.isNearLimit
                        ? "text-orange-600"
                        : theme === "dark" ? "text-green-400" : "text-green-600"
                    }`}>
                      {Math.round(status.percentage)}%
                    </p>
                    {status.isOverBudget && (
                      <span className="text-xs text-red-600 font-medium">⚠️ Превышен лимит</span>
                    )}
                    {status.isNearLimit && !status.isOverBudget && (
                      <span className="text-xs text-orange-600 font-medium">⚡ Близко к лимиту</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div
        className={`rounded-2xl p-4 border ${
          theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
            Последние операции
          </h3>
          <button
            onClick={() => setActiveTab("history")}
            className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors touch-none"
          >
            Все →
          </button>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <History className={`w-6 h-6 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
            </div>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Пока нет операций
            </p>
            <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
              Добавьте первую транзакцию
            </p>
          </div>
        ) : (
          <div>
            {transactions.slice(0, 4).map((tx) => (
              <TxRow
                tx={{ ...tx, liked: likedTransactions.has(tx.id), comments: transactionComments[tx.id] || [] }}
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
  )
}
