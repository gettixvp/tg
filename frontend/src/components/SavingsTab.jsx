import React from "react"
import { Plus, Settings, PiggyBank } from "lucide-react"
import TxRow from "./TxRow"

export default function SavingsTab({
  theme,
  isFullscreen,
  savingsTab,
  setSavingsTab,
  vibrateSelect,
  vibrate,
  goalName,
  savingsPct,
  savings,
  goalSavings,
  secondGoalName,
  secondGoalAmount,
  secondGoalSavings,
  formatCurrency,
  formatDate,
  setShowGoalModal,
  setTransactionType,
  setShowAddModal,
  setShowNumKeyboard,
  transactions,
  likedTransactions,
  transactionComments,
  categoriesMeta,
  deleteTransaction,
  showLinkedUsers,
  toggleLike,
  openTransactionDetails,
  setShowSecondGoalModal,
  setShowSavingsSettingsModal,
  debts,
  setShowAddDebtModal,
  repayDebt,
  deleteDebt,
}) {
  return (
    <div className="space-y-4" style={{ paddingTop: isFullscreen ? "48px" : "16px" }}>
      {/* Верхние вкладки: Копилка / Долги */}
      <div
        className={`mx-4 p-1.5 rounded-full ${
          theme === "dark" ? "bg-gray-800/80" : "bg-gray-200/80"
        } backdrop-blur-sm`}
      >
        <div className="flex gap-1">
          <button
            onClick={() => {
              setSavingsTab("savings")
              vibrateSelect()
            }}
            className={`flex-1 py-3 rounded-full font-bold transition-all text-sm ${
              savingsTab === "savings"
                ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-xl scale-105"
                : theme === "dark"
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Копилка
          </button>
          <button
            onClick={() => {
              setSavingsTab("debts")
              vibrateSelect()
            }}
            className={`flex-1 py-3 rounded-full font-bold transition-all text-sm ${
              savingsTab === "debts"
                ? "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-xl scale-105"
                : theme === "dark"
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Долги
          </button>
        </div>
      </div>

      {savingsTab === "savings" && (
        <>
          <div
            className={`rounded-2xl p-4 text-white shadow-2xl ${
              theme === "dark"
                ? "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
                : "bg-gradient-to-br from-blue-500 to-purple-600"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Копилка (USD)</h3>
                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-blue-100"}`}>
                  {goalName}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowSecondGoalModal(true)
                    vibrate()
                  }}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all touch-none"
                  title="Добавить вторую цель"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => {
                    setShowSavingsSettingsModal(true)
                    vibrate()
                  }}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all touch-none"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>
                <div className="p-2 rounded-xl bg-white/20">
                  <PiggyBank className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-blue-100"}`}>
                  Прогресс
                </span>
                <span className="text-white font-bold">{savingsPct}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${savingsPct}%` }}
                />
              </div>
              <div
                className={`flex items-center justify-between mt-2 text-xs ${
                  theme === "dark" ? "text-gray-300" : "text-blue-100"
                }`}
              >
                <span>{formatCurrency(savings, "USD")}</span>
                <span>{formatCurrency(goalSavings, "USD")}</span>
              </div>

              {/* Вторая цель */}
              {secondGoalName && secondGoalAmount > 0 && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-blue-100"}`}>
                      {secondGoalName}
                    </span>
                    <span className="text-white font-bold">
                      {Math.round((secondGoalSavings / secondGoalAmount) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${Math.min((secondGoalSavings / secondGoalAmount) * 100, 100)}%` }}
                    />
                  </div>
                  <div
                    className={`flex items-center justify-between mt-2 text-xs ${
                      theme === "dark" ? "text-gray-300" : "text-blue-100"
                    }`}
                  >
                    <span>{formatCurrency(secondGoalSavings, "USD")}</span>
                    <span>{formatCurrency(secondGoalAmount, "USD")}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowGoalModal(true)
                  vibrate()
                }}
                className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all text-sm touch-none"
              >
                Изменить цель
              </button>
              <button
                onClick={() => {
                  setTransactionType("savings")
                  setShowAddModal(true)
                  setShowNumKeyboard(false)
                  vibrate()
                }}
                className={`flex items-center gap-1 px-4 py-2 rounded-xl font-medium transition-all shadow-lg text-sm touch-none ${
                  theme === "dark"
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-white text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Plus className="w-4 h-4" />
                Пополнить
              </button>
            </div>
          </div>

          <div
            className={`backdrop-blur-sm rounded-2xl p-4 border shadow-lg ${
              theme === "dark" ? "bg-gray-800/70 border-gray-700/20" : "bg-white/80 border-white/50"
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
              История пополнений
            </h3>
            {transactions.filter((t) => t.type === "savings").length === 0 ? (
              <div className="text-center py-8">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    theme === "dark" ? "bg-gray-700" : "bg-blue-100"
                  }`}
                >
                  <PiggyBank className={`w-6 h-6 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Начните копить!
                </p>
                <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  Добавьте первое пополнение
                </p>
              </div>
            ) : (
              <div>
                {transactions
                  .filter((t) => t.type === "savings")
                  .map((tx) => (
                    <TxRow
                      tx={{
                        ...tx,
                        liked: likedTransactions.has(tx.id),
                        comments: transactionComments[tx.id] || [],
                      }}
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
        </>
      )}

      {savingsTab === "debts" && (
        <div className="space-y-4">
          {/* Кнопка добавления долга */}
          <button
            onClick={() => {
              setShowAddDebtModal(true)
              vibrate()
            }}
            className={`w-full mx-4 py-3 rounded-full font-semibold transition-all text-sm flex items-center justify-center gap-2 shadow-lg ${
              theme === "dark"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
                : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
            }`}
            style={{ maxWidth: "calc(100% - 2rem)" }}
          >
            <Plus className="w-5 h-5" />
            Добавить долг
          </button>

          {/* Список долгов */}
          {debts.length === 0 ? (
            <div
              className={`rounded-2xl p-8 text-center mx-4 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="text-6xl mb-4">💰</div>
              <h3 className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                Нет долгов
              </h3>
              <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Нажмите "Добавить долг" чтобы начать учет
              </p>
            </div>
          ) : (
            <div className="space-y-3 px-4">
              {debts.map((debt) => (
                <div
                  key={debt.id}
                  className={`rounded-xl p-4 border ${
                    debt.type === "owe"
                      ? theme === "dark"
                        ? "bg-red-900/20 border-red-700/30"
                        : "bg-red-50 border-red-200"
                      : theme === "dark"
                        ? "bg-green-900/20 border-green-700/30"
                        : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{debt.type === "owe" ? "📤" : "📥"}</span>
                      <div>
                        <h4 className={`font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                          {debt.person}
                        </h4>
                        <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {debt.type === "owe" ? "Я должен" : "Мне должны"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          debt.type === "owe"
                            ? theme === "dark"
                              ? "text-red-400"
                              : "text-red-600"
                            : theme === "dark"
                              ? "text-green-400"
                              : "text-green-600"
                        }`}
                      >
                        {formatCurrency(debt.amount)}
                      </p>
                    </div>
                  </div>
                  {debt.description && (
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      {debt.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => repayDebt(debt)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        theme === "dark"
                          ? "bg-green-700 hover:bg-green-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      Погашено
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Удалить этот долг?")) {
                          deleteDebt(debt.id)
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        theme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
