import React, { useState } from 'react'
import { Wallet, Plus, Edit2, Trash2, X } from 'lucide-react'

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
  const [newWalletName, setNewWalletName] = useState('')
  const [newWalletIcon, setNewWalletIcon] = useState('💰')
  const [newWalletColor, setNewWalletColor] = useState('#3b82f6')

  const walletIcons = ['💰', '💳', '🏦', '💵', '🪙', '💎', '🏪', '💸']
  const walletColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

  const handleAddWallet = () => {
    if (!newWalletName.trim()) return
    
    onWalletAdd({
      name: newWalletName.trim(),
      icon: newWalletIcon,
      color: newWalletColor
    })
    
    setNewWalletName('')
    setNewWalletIcon('💰')
    setNewWalletColor('#3b82f6')
  }

  const handleUpdateWallet = (walletId) => {
    if (!newWalletName.trim()) return
    
    onWalletUpdate(walletId, {
      name: newWalletName.trim(),
      icon: newWalletIcon,
      color: newWalletColor
    })
    
    setEditingWallet(null)
    setNewWalletName('')
    setNewWalletIcon('💰')
    setNewWalletColor('#3b82f6')
  }

  const startEditWallet = (wallet) => {
    setEditingWallet(wallet.id)
    setNewWalletName(wallet.name)
    setNewWalletIcon(wallet.icon)
    setNewWalletColor(wallet.color)
  }

  const cancelEdit = () => {
    setEditingWallet(null)
    setNewWalletName('')
    setNewWalletIcon('💰')
    setNewWalletColor('#3b82f6')
  }

  if (!show) return null

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        theme === "dark" ? "bg-black/80" : "bg-white/80"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border p-4 max-h-[80vh] overflow-y-auto ${
          theme === "dark"
            ? "bg-gray-900/90 border-gray-700/70 backdrop-blur-lg"
            : "bg-white/90 border-slate-200/80 backdrop-blur-md"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
            Управление кошельками
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Добавление нового кошелька */}
        <div className={`p-4 rounded-xl border mb-4 ${
          theme === "dark"
            ? "bg-gray-800/50 border-gray-700/50"
            : "bg-gray-50/90 border-gray-200/80"
        }`}>
          <h4 className={`font-medium mb-3 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
            Добавить кошелек
          </h4>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Название кошелька"
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
              className={`w-full p-3 border rounded-xl transition-all ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-white/15 border-white/30 text-gray-900 backdrop-blur-lg"
              }`}
            />
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Иконка
              </label>
              <div className="grid grid-cols-8 gap-2">
                {walletIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewWalletIcon(icon)}
                    className={`p-2 rounded-lg text-xl transition-all ${
                      newWalletIcon === icon
                        ? theme === "dark"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : theme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Цвет
              </label>
              <div className="grid grid-cols-8 gap-2">
                {walletColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewWalletColor(color)}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      newWalletColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <button
              onClick={handleAddWallet}
              disabled={!newWalletName.trim()}
              className={`w-full py-3 rounded-xl font-medium transition-all touch-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Добавить кошелек
            </button>
          </div>
        </div>

        {/* Список кошельков */}
        <div className="space-y-2">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className={`p-3 rounded-xl border ${
                theme === "dark"
                  ? "bg-gray-800/50 border-gray-700/50"
                  : "bg-gray-50/90 border-gray-200/80"
              }`}
            >
              {editingWallet === wallet.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Название кошелька"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    className={`w-full p-2 border rounded-lg transition-all ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-100"
                        : "bg-white/15 border-white/30 text-gray-900 backdrop-blur-lg"
                    }`}
                  />
                  
                  <div className="flex gap-2">
                    <div className="grid grid-cols-8 gap-1 flex-1">
                      {walletIcons.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setNewWalletIcon(icon)}
                          className={`p-1 rounded text-sm transition-all ${
                            newWalletIcon === icon
                              ? theme === "dark"
                                ? "bg-blue-600 text-white"
                                : "bg-blue-500 text-white"
                              : theme === "dark"
                                ? "bg-gray-700 hover:bg-gray-600"
                                : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-8 gap-1 flex-1">
                      {walletColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewWalletColor(color)}
                          className={`w-6 h-6 rounded transition-all ${
                            newWalletColor === color ? 'ring-1 ring-offset-1 ring-blue-500' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEdit}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm touch-none active:scale-95 ${
                        theme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => handleUpdateWallet(wallet.id)}
                      disabled={!newWalletName.trim()}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm touch-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        theme === "dark"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      Сохранить
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: wallet.color + '30' }}
                    >
                      {wallet.icon}
                    </div>
                    <div>
                      <p className={`font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
                        {wallet.name}
                      </p>
                      {wallet.id === 'main' && (
                        <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Основной кошелек
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {wallet.id !== 'main' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditWallet(wallet)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === "dark"
                            ? "hover:bg-gray-700 text-gray-400"
                            : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Удалить кошелек "${wallet.name}"? Все транзакции этого кошелька будут удалены.`)) {
                            onWalletDelete(wallet.id)
                          }
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === "dark"
                            ? "hover:bg-red-600 text-red-400"
                            : "hover:bg-red-100 text-red-600"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WalletSettingsModal
