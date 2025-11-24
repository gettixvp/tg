import React from 'react'
import { History, ChevronDown, Download, BarChart3 } from 'lucide-react'
import TxRow from '../TxRow'

const HistoryTab = ({
  theme,
  currentWallet,
  currentWalletId,
  wallets,
  selectedTransactionWallet,
  setSelectedTransactionWallet,
  filteredTransactions,
  categoriesMeta,
  formatCurrency,
  formatDate,
  deleteTransaction,
  showLinkedUsers,
  toggleLike,
  openTransactionDetails,
  exportToPDF,
  setShowChart,
  setChartType,
  isFullscreen
}) => {
  return (
    <div style={{ paddingTop: isFullscreen ? '48px' : '16px' }}>
      <div
        className={`backdrop-blur-lg rounded-2xl p-4 border shadow-lg mx-4 ${
          theme === "dark"
            ? "bg-gray-900/70 border-gray-700/70"
            : "bg-white/96 border-slate-200/80"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
            История операций {currentWalletId !== 'main' && `(${currentWallet.name})`}
          </h3>
          <div className="flex items-center gap-2">
            {/* Кнопка выбора кошелька */}
            <button
              onClick={() => setSelectedTransactionWallet(
                wallets[(wallets.findIndex(w => w.id === selectedTransactionWallet) + 1) % wallets.length].id
              )}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg glass-button-matte transition-all`}
            >
              <span className="text-lg">{wallets.find(w => w.id === selectedTransactionWallet)?.icon}</span>
              <span className={`text-sm ${
                theme === "dark" ? "text-white" : "text-gray-700"
              }`}>
                {wallets.find(w => w.id === selectedTransactionWallet)?.name}
              </span>
              <ChevronDown className={`w-4 h-4 ${
                theme === "dark" ? "text-white" : "text-gray-700"
              }`} />
            </button>
            {/* Кнопка экспорта */}
            <button
              onClick={() => exportToPDF()}
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
              {currentWalletId !== 'main' ? `Нет операций в ${currentWallet.name}` : 'Нет операций'}
            </p>
          </div>
        ) : (
          <div>
            {filteredTransactions.map((tx) => (
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
  )
}

export default HistoryTab
