import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { categoriesList } from '../../constants'

const AddTransactionModal = ({ 
  show, 
  onClose, 
  onAddTransaction, 
  theme, 
  wallets, 
  selectedWalletId,
  onWalletChange 
}) => {
  const [transactionType, setTransactionType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categoriesList.expense[0])
  const [showKeyboard, setShowKeyboard] = useState(false)

  if (!show) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!amount || Number(amount) <= 0) {
      alert('Введите корректную сумму')
      return
    }

    onAddTransaction({
      type: transactionType,
      amount: Number(amount),
      description: description.trim(),
      category,
      walletId: selectedWalletId
    })

    // Сброс формы
    setAmount('')
    setDescription('')
    setCategory(categoriesList.expense[0])
    setTransactionType('expense')
    setShowKeyboard(false)
    onClose()
  }

  const handleAmountClick = () => {
    setShowKeyboard(true)
  }

  const renderNumberKeyboard = () => {
    if (!showKeyboard) return null

    const buttons = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['C', '0', '.']
    ]

    return (
      <div className={`fixed inset-0 bg-black/50 flex items-end justify-center z-50 ${
        theme === 'dark' ? 'bg-black/70' : 'bg-black/50'
      }`}>
        <div className={`w-full max-w-md rounded-t-3xl p-4 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Введите сумму
            </h3>
            <button
              onClick={() => setShowKeyboard(false)}
              className={`p-2 rounded-full ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
          
          <div className={`text-3xl font-bold mb-4 text-center ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {amount || '0'}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {buttons.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => {
                      if (btn === 'C') {
                        setAmount('')
                      } else if (btn === '.') {
                        if (amount && !amount.includes('.')) {
                          setAmount(amount + btn)
                        }
                      } else {
                        setAmount(amount + btn)
                      }
                    }}
                    className={`py-4 rounded-xl font-semibold text-lg transition-all ${
                      btn === 'C'
                        ? theme === 'dark' 
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-red-500 text-white hover:bg-red-600'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={() => setShowKeyboard(false)}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              theme === 'dark'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Готово
          </button>
        </div>
      </div>
    )
  }

  const currentCategories = categoriesList[transactionType] || []

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
        <div className={`w-full max-w-md rounded-3xl p-6 max-h-[90vh] overflow-y-auto ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Добавить операцию
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Выбор типа операции */}
            <div className="flex gap-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-700">
              <button
                type="button"
                onClick={() => setTransactionType('expense')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  transactionType === 'expense'
                    ? 'bg-red-500 text-white'
                    : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Расход
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('income')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  transactionType === 'income'
                    ? 'bg-green-500 text-white'
                    : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Доход
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('savings')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  transactionType === 'savings'
                    ? 'bg-blue-500 text-white'
                    : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                Копилка
              </button>
            </div>

            {/* Выбор кошелька */}
            {wallets.length > 1 && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Кошелек
                </label>
                <div className="flex gap-2">
                  {wallets.map(wallet => (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => onWalletChange(wallet.id)}
                      className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
                        selectedWalletId === wallet.id
                          ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                          : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="mr-1">{wallet.icon}</span>
                      {wallet.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ввод суммы */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Сумма
              </label>
              <button
                type="button"
                onClick={handleAmountClick}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-gray-50 text-gray-900 border-gray-300'
                } border`}
              >
                {amount || '0'} ₽
              </button>
            </div>

            {/* Описание */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Описание (необязательно)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Введите описание"
                className={`w-full p-3 rounded-xl transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                    : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-500'
                } border`}
              />
            </div>

            {/* Выбор категории */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Категория
              </label>
              <div className="grid grid-cols-2 gap-2">
                {currentCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      category === cat
                        ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                        : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Отмена
              </button>
              <button
                type="submit"
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>
          </form>
        </div>
      </div>

      {renderNumberKeyboard()}
    </>
  )
}

export default AddTransactionModal
