import React from "react"
import { BarChart3, Download, History } from "lucide-react"
import TxRow from "./TxRow"

export default function HistoryTab({
  theme,
  isFullscreen,
  transactions,
  exportToPDF,
  setShowChart,
  setChartType,
  likedTransactions,
  transactionComments,
  categoriesMeta,
  formatCurrency,
  formatDate,
  deleteTransaction,
  showLinkedUsers,
  toggleLike,
  openTransactionDetails,
}) {
  return (
    <div style={{ paddingTop: isFullscreen ? "48px" : "16px" }}>
      <div
        className={`backdrop-blur-sm rounded-2xl p-4 border shadow-lg ${
          theme === "dark" ? "bg-gray-800/70 border-gray-700/20" : "bg-white/80 border-white/50"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
            История операций
          </h3>
          <div className="flex items-center gap-2">
            {/* Кнопка экспорта в PDF */}
            <button
              onClick={exportToPDF}
              className={`p-2 rounded-lg transition-colors touch-none ${
                theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-green-100 hover:bg-green-200"
              }`}
              title="Экспорт в PDF"
            >
              <Download className={`w-4 h-4 ${theme === "dark" ? "text-green-400" : "text-green-600"}`} />
            </button>
            {/* Кнопка диаграммы */}
            <button
              onClick={() => {
                setShowChart(true)
                setChartType("expense")
              }}
              className={`p-2 rounded-lg transition-colors touch-none ${
                theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-blue-100 hover:bg-blue-200"
              }`}
              title="Показать диаграмму"
            >
              <BarChart3 className={`w-4 h-4 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`} />
            </button>
          </div>
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
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Нет операций</p>
          </div>
        ) : (
          <div>
            {transactions.map((tx) => (
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
