import React, { useState } from 'react'
import { X, Settings, Trash2, Plus, Check } from 'lucide-react'
import { walletIcons, walletColors } from '../../constants'

const WalletSettingsModal = ({ 
  show, 
  onClose, 
  wallets, 
  currentWalletId,
  onWalletUpdate,
  onWalletDelete,
  onWalletAdd,
  theme 
}) => {
  const [editingWallet, setEditingWallet] = useState(null)
  const [walletName, setWalletName] = useState('')
  const [walletIcon, setWalletIcon] = useState('')
  const [walletColor, setWalletColor] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const startEdit = (wallet) => {
    setEditingWallet(wallet)
    setWalletName(wallet.name)
    setWalletIcon(wallet.icon)
    setWalletColor(wallet.color)
    setShowAddForm(false)
  }

  const startAdd = () => {
    setEditingWallet(null)
    setWalletName('Новый кошелек')
    setWalletIcon(walletIcons[0])
    setWalletColor(walletColors[0].value)
    setShowAddForm(true)
  }

  const saveWallet = () => {
    if (!walletName.trim()) {
      alert('Введите название кошелька')
      return
    }

    const walletData = {
      name: walletName.trim(),
      icon: walletIcon,
      color: walletColor
    }

    if (editingWallet) {
      onWalletUpdate(editingWallet.id, walletData)
    } else {
      onWalletAdd(walletData)
    }

    resetForm()
  }

  const resetForm = () => {
    setEditingWallet(null)
    setWalletName('')
    setWalletIcon('')
    setWalletColor('')
    setShowAddForm(false)
  }

  const handleDelete = (wallet) => {
    if (wallet.isMain) {
      alert('Нельзя удалить основной кошелек')
      return
    }

    if (confirm(`Удалить кошелек "${wallet.name}"? Все операции в этом кошельке будут удалены.`)) {
      onWalletDelete(wallet.id)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className={`w-full max-w-md rounded-3xl p-6 max-h-[90vh] overflow-y-auto ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Управление кошельками
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

        {/* Список кошельков */}
        <div className="space-y-3 mb-6">
          {wallets.map(wallet => (
            <div
              key={wallet.id}
              className={`p-4 rounded-xl border transition-all ${
                currentWalletId === wallet.id
                  ? theme === 'dark' 
                    ? 'bg-blue-900/30 border-blue-600/50'
                    : 'bg-blue-50 border-blue-200'
                  : theme === 'dark'
                    ? 'bg-gray-700/50 border-gray-600/50'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: wallet.color + '20', color: wallet.color }}
                  >
                    {wallet.icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {wallet.name}
                    </h3>
                    {wallet.isMain && (
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Основной кошелек
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!wallet.isMain && (
                    <>
                      <button
                        onClick={() => startEdit(wallet)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <Settings className={`w-4 h-4 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`} />
                      </button>
                      <button
                        onClick={() => handleDelete(wallet)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' ? 'bg-red-600/20 hover:bg-red-600/30' : 'bg-red-100 hover:bg-red-200'
                        }`}
                      >
                        <Trash2 className={`w-4 h-4 ${
                          theme === 'dark' ? 'text-red-400' : 'text-red-600'
                        }`} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Кнопка добавления */}
        {wallets.length < 4 && (
          <button
            onClick={startAdd}
            className={`w-full p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'
            }`}
          >
            <Plus className="w-5 h-5" />
            Добавить кошелек
          </button>
        )}

        {/* Форма редактирования/добавления */}
        {(showAddForm || editingWallet) && (
          <div className={`mt-6 p-4 rounded-xl border ${
            theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {editingWallet ? 'Редактировать кошелек' : 'Новый кошелек'}
            </h3>

            <div className="space-y-4">
              {/* Название */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Название
                </label>
                <input
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="Введите название"
                  className={`w-full p-3 rounded-xl transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-600 text-white border-gray-500 placeholder-gray-400'
                      : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'
                  } border`}
                />
              </div>

              {/* Иконка */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Иконка
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {walletIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setWalletIcon(icon)}
                      className={`p-3 rounded-xl text-2xl transition-all ${
                        walletIcon === icon
                          ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                          : theme === 'dark' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Цвет */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Цвет
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {walletColors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setWalletColor(color.value)}
                      className={`p-3 rounded-xl transition-all ${
                        walletColor === color.value
                          ? 'ring-2 ring-offset-2 ring-blue-500'
                          : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      {walletColor === color.value && (
                        <Check className="w-4 h-4 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetForm}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Отмена
                </button>
                <button
                  onClick={saveWallet}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {editingWallet ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletSettingsModal
