import React, { useState } from 'react'
import { TrendingUp, TrendingDown, PiggyBank, X } from 'lucide-react'

const AddTransactionModal = ({
  show,
  onClose,
  onAddTransaction,
  theme,
  wallets,
  selectedWalletId,
  onWalletChange
}) => {
  const [transactionType, setTransactionType] = useState("expense")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [showNumKeyboard, setShowNumKeyboard] = useState(false)
  const [sheetDragOffset, setSheetDragOffset] = useState(0)
  const [isSheetDragging, setIsSheetDragging] = useState(false)
  const [sheetStartY, setSheetStartY] = useState(0)

  const handleSheetTouchStart = (e) => {
    setSheetStartY(e.touches[0].clientY)
    setIsSheetDragging(true)
  }

  const handleSheetTouchMove = (e) => {
    if (!isSheetDragging) return
    const diff = e.touches[0].clientY - sheetStartY
    if (diff > 0) {
      setSheetDragOffset(diff)
    }
  }

  const handleSheetTouchEnd = () => {
    setIsSheetDragging(false)
    if (sheetDragOffset > 100) {
      onClose()
    }
    setSheetDragOffset(0)
  }

  const handleNumberInput = (num) => {
    if (num === "clear") {
      setAmount("")
    } else if (num === "backspace") {
      setAmount(prev => prev.slice(0, -1))
    } else {
      setAmount(prev => prev + num)
    }
  }

  const handleAdd = () => {
    if (!amount || !category) return
    
    onAddTransaction({
      type: transactionType,
      amount: parseFloat(amount),
      description,
      category,
      walletId: selectedWalletId
    })
    
    setAmount("")
    setDescription("")
    setCategory("")
    setShowNumKeyboard(false)
    onClose()
  }

  const categories = {
    expense: ["Еда", "Транспорт", "Развлечения", "Счета", "Покупки", "Здоровье", "Другое"],
    income: ["Зарплата", "Подработка", "Инвестиции", "Подарки", "Другое"],
    savings: ["Накопления", "Резерв", "Цель", "Другое"]
  }

  if (!show) return null

  return (
    <div
      className={`fixed inset-0 flex items-end justify-center z-50 transition-opacity duration-200 ${
        theme === "dark"
          ? "bg-black"
          : "bg-white"
      }`}
      style={{ touchAction: "none" }}
      onClick={onClose}
      onTouchStart={handleSheetTouchStart}
      onTouchMove={handleSheetTouchMove}
      onTouchEnd={handleSheetTouchEnd}
    >
      <div
        className={`w-full max-w-md rounded-t-3xl shadow-2xl border transform transition-transform duration-250 ease-out ${
          theme === "dark"
            ? "bg-gray-900/80 border-gray-700/70 backdrop-blur-lg"
            : "bg-white/90 border-slate-200/80 backdrop-blur-md"
        }`}
        style={{ maxHeight: "85vh", display: "flex", flexDirection: "column", transform: `translateY(${sheetDragOffset}px)` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-gray-400/70 rounded-full mx-auto mt-2 mb-3 opacity-80" />
        <div
          className="p-4 overflow-y-auto flex-1"
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
        >
          <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
            Новая операция
          </h3>

          <div className="flex gap-2 mb-4">
            {["expense", "income", "savings"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setTransactionType(type)
                  setCategory("")
                }}
                className={`flex-1 py-2 rounded-xl font-medium transition text-sm touch-none active:scale-95 ${
                  transactionType === type
                    ? type === "income"
                      ? "bg-emerald-500 text-white"
                      : type === "expense"
                        ? "bg-rose-500 text-white"
                        : "bg-blue-500 text-white"
                    : theme === "dark"
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {type === "income" && <TrendingUp className="w-4 h-4 inline mr-1" />}
                {type === "expense" && <TrendingDown className="w-4 h-4 inline mr-1" />}
                {type === "savings" && <PiggyBank className="w-4 h-4 inline mr-1" />}
                {type === "income" ? "Доход" : type === "expense" ? "Расход" : "Копилка"}
              </button>
            ))}
          </div>

          {/* Выбор кошелька */}
          {wallets.length > 1 && (
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Кошелек
              </label>
              <select
                value={selectedWalletId}
                onChange={(e) => onWalletChange(e.target.value)}
                className={`w-full p-3 border rounded-xl transition-all ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white/15 border-white/30 text-gray-900 backdrop-blur-lg"
                }`}
              >
                {wallets.map(wallet => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.icon} {wallet.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Сумма */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Сумма
            </label>
            <input
              type="text"
              inputMode="none"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={() => setShowNumKeyboard(true)}
              className={`w-full p-3 border rounded-xl transition-all text-lg font-bold ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white/15 border-white/30 text-gray-900 backdrop-blur-lg"
              }`}
            />
          </div>

          {/* Цифровая клавиатура */}
          {showNumKeyboard && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"].map((key) => (
                <button
                  key={key}
                  onClick={() => handleNumberInput(key)}
                  className={`p-4 rounded-xl font-medium transition-all touch-none active:scale-95 ${
                    key === "backspace"
                      ? theme === "dark"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                      : theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  {key === "backspace" ? "⌫" : key}
                </button>
              ))}
            </div>
          )}

          {/* Описание */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Описание (необязательно)
            </label>
            <input
              type="text"
              placeholder="Введите описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-3 border rounded-xl transition-all ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white/15 border-white/30 text-gray-900 backdrop-blur-lg"
              }`}
            />
          </div>

          {/* Категория */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Категория
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full p-3 border rounded-xl transition-all ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white/15 border-white/30 text-gray-900 backdrop-blur-lg"
              }`}
            >
              <option value="">Выберите категорию</option>
              {categories[transactionType].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm touch-none active:scale-95 ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              Отмена
            </button>
            <button
              onClick={handleAdd}
              disabled={!amount || !category}
              className={`flex-1 py-3 rounded-xl text-white font-medium transition-all text-sm touch-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                transactionType === "income"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : transactionType === "expense"
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddTransactionModal
