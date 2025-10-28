import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, History, Settings, Moon, Sun } from 'lucide-react';

const FinanceApp = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState('light');
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [savings, setSavings] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    // Инициализация Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Получаем данные пользователя
      const initDataUnsafe = tg.initDataUnsafe;
      if (initDataUnsafe.user) {
        setUser(initDataUnsafe.user);
        loadUserData(initDataUnsafe.user.id);
      }

      // Определяем тему
      setTheme(tg.colorScheme || 'light');
    } else {
      // Для тестирования без Telegram
      setUser({ id: 'demo', first_name: 'Demo', last_name: 'User' });
      loadUserData('demo');
    }
  }, []);

  const loadUserData = async (userId) => {
    try {
      const balanceData = await window.storage.get(`balance_${userId}`);
      const incomeData = await window.storage.get(`income_${userId}`);
      const expensesData = await window.storage.get(`expenses_${userId}`);
      const savingsData = await window.storage.get(`savings_${userId}`);
      const transactionsData = await window.storage.get(`transactions_${userId}`);

      if (balanceData) setBalance(JSON.parse(balanceData.value));
      if (incomeData) setIncome(JSON.parse(incomeData.value));
      if (expensesData) setExpenses(JSON.parse(expensesData.value));
      if (savingsData) setSavings(JSON.parse(savingsData.value));
      if (transactionsData) setTransactions(JSON.parse(transactionsData.value));
    } catch (error) {
      console.log('Загружаем новый профиль');
    }
  };

  const saveUserData = async (userId) => {
    try {
      await window.storage.set(`balance_${userId}`, JSON.stringify(balance));
      await window.storage.set(`income_${userId}`, JSON.stringify(income));
      await window.storage.set(`expenses_${userId}`, JSON.stringify(expenses));
      await window.storage.set(`savings_${userId}`, JSON.stringify(savings));
      await window.storage.set(`transactions_${userId}`, JSON.stringify(transactions));
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  useEffect(() => {
    if (user) {
      saveUserData(user.id);
    }
  }, [balance, income, expenses, savings, transactions]);

  const addTransaction = () => {
    if (!amount || !description) return;

    const newTransaction = {
      id: Date.now(),
      type: transactionType,
      amount: parseFloat(amount),
      description,
      category: category || 'Другое',
      date: new Date().toISOString()
    };

    setTransactions([newTransaction, ...transactions]);

    if (transactionType === 'income') {
      setIncome(income + parseFloat(amount));
      setBalance(balance + parseFloat(amount));
    } else if (transactionType === 'expense') {
      setExpenses(expenses + parseFloat(amount));
      setBalance(balance - parseFloat(amount));
    } else if (transactionType === 'savings') {
      setSavings(savings + parseFloat(amount));
      setBalance(balance - parseFloat(amount));
    }

    setAmount('');
    setDescription('');
    setCategory('');
    setShowAddModal(false);
  };

  const categories = {
    expense: ['Еда', 'Транспорт', 'Развлечения', 'Счета', 'Покупки', 'Здоровье', 'Другое'],
    income: ['Зарплата', 'Фриланс', 'Подарки', 'Инвестиции', 'Другое'],
    savings: ['Отпуск', 'Накопления', 'Экстренный фонд', 'Цель', 'Другое']
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Вчера, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
  };

  const bgColor = theme === 'dark' ? 'bg-black' : 'bg-gray-50';
  const cardBg = theme === 'dark' ? 'bg-zinc-900' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-zinc-800' : 'border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-100';

  if (!user) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={textPrimary}>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} pb-20`}>
      {/* Header */}
      <div className={`${cardBg} ${textPrimary} p-6 rounded-b-3xl shadow-sm`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Привет, {user.first_name}! 👋</h1>
            <p className={`text-sm ${textSecondary}`}>Управляй своими финансами</p>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-3 rounded-full ${inputBg}`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Balance Card */}
        <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'} rounded-2xl p-6 text-white`}>
          <p className="text-sm opacity-90 mb-1">Общий баланс</p>
          <h2 className="text-4xl font-bold mb-4">{formatCurrency(balance)}</h2>
          <div className="flex justify-between">
            <div>
              <p className="text-xs opacity-80">Доходы</p>
              <p className="font-semibold">{formatCurrency(income)}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Расходы</p>
              <p className="font-semibold">{formatCurrency(expenses)}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Накоплено</p>
              <p className="font-semibold">{formatCurrency(savings)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <TrendingUp size={16} className="text-green-600" />
                  </div>
                </div>
                <p className={`text-xs ${textSecondary}`}>Доход</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(income)}</p>
              </div>

              <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <TrendingDown size={16} className="text-red-600" />
                  </div>
                </div>
                <p className={`text-xs ${textSecondary}`}>Расход</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(expenses)}</p>
              </div>

              <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <PiggyBank size={16} className="text-blue-600" />
                  </div>
                </div>
                <p className={`text-xs ${textSecondary}`}>Копилка</p>
                <p className={`text-lg font-bold ${textPrimary}`}>{formatCurrency(savings)}</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
              <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Последние операции</h3>
              {transactions.length === 0 ? (
                <p className={`text-center py-8 ${textSecondary}`}>Пока нет операций</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'income' ? 'bg-green-100' :
                          transaction.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp size={18} className="text-green-600" />
                          ) : transaction.type === 'expense' ? (
                            <TrendingDown size={18} className="text-red-600" />
                          ) : (
                            <PiggyBank size={18} className="text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{transaction.description}</p>
                          <p className={`text-xs ${textSecondary}`}>
                            {transaction.category} • {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <p className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-600' :
                        transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>История операций</h3>
            {transactions.length === 0 ? (
              <p className={`text-center py-8 ${textSecondary}`}>Пока нет операций</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className={`flex items-center justify-between pb-3 ${borderColor} border-b last:border-0`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'income' ? 'bg-green-100' :
                        transaction.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp size={18} className="text-green-600" />
                        ) : transaction.type === 'expense' ? (
                          <TrendingDown size={18} className="text-red-600" />
                        ) : (
                          <PiggyBank size={18} className="text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{transaction.description}</p>
                        <p className={`text-xs ${textSecondary}`}>
                          {transaction.category} • {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' :
                      transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'savings' && (
          <div className={`${cardBg} rounded-xl p-4 ${borderColor} border`}>
            <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Копилка</h3>
            <div className="mb-6">
              <div className={`bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-6 text-white`}>
                <p className="text-sm opacity-90 mb-1">Общая сумма накоплений</p>
                <h2 className="text-4xl font-bold">{formatCurrency(savings)}</h2>
              </div>
            </div>
            <div className="space-y-3">
              {transactions.filter(t => t.type === 'savings').length === 0 ? (
                <p className={`text-center py-8 ${textSecondary}`}>Начните копить на свою цель!</p>
              ) : (
                transactions.filter(t => t.type === 'savings').map((transaction) => (
                  <div key={transaction.id} className={`flex items-center justify-between pb-3 ${borderColor} border-b last:border-0`}>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <PiggyBank size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className={`font-medium ${textPrimary}`}>{transaction.description}</p>
                        <p className={`text-xs ${textSecondary}`}>
                          {transaction.category} • {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-blue-600">
                      +{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className={`${cardBg} rounded-t-3xl w-full max-w-md p-6 animate-slide-up`}>
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Новая операция</h3>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTransactionType('expense')}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  transactionType === 'expense'
                    ? 'bg-red-500 text-white'
                    : `${inputBg} ${textSecondary}`
                }`}
              >
                Расход
              </button>
              <button
                onClick={() => setTransactionType('income')}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  transactionType === 'income'
                    ? 'bg-green-500 text-white'
                    : `${inputBg} ${textSecondary}`
                }`}
              >
                Доход
              </button>
              <button
                onClick={() => setTransactionType('savings')}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  transactionType === 'savings'
                    ? 'bg-blue-500 text-white'
                    : `${inputBg} ${textSecondary}`
                }`}
              >
                Копилка
              </button>
            </div>

            <input
              type="number"
              placeholder="Сумма"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary} text-lg font-bold`}
            />

            <input
              type="text"
              placeholder="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-4 rounded-xl mb-3 ${inputBg} ${textPrimary}`}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full p-4 rounded-xl mb-4 ${inputBg} ${textPrimary}`}
            >
              <option value="">Выберите категорию</option>
              {categories[transactionType].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className={`flex-1 py-4 rounded-xl ${inputBg} ${textPrimary} font-medium`}
              >
                Отмена
              </button>
              <button
                onClick={addTransaction}
                className={`flex-1 py-4 rounded-xl ${
                  transactionType === 'income' ? 'bg-green-500' :
                  transactionType === 'expense' ? 'bg-red-500' : 'bg-blue-500'
                } text-white font-medium`}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 ${cardBg} ${borderColor} border-t`}>
        <div className="flex justify-around items-center p-4 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center ${activeTab === 'overview' ? 'text-blue-500' : textSecondary}`}
          >
            <Wallet size={24} />
            <span className="text-xs mt-1">Обзор</span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center ${activeTab === 'history' ? 'text-blue-500' : textSecondary}`}
          >
            <History size={24} />
            <span className="text-xs mt-1">История</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center -mt-6"
          >
            <div className="bg-blue-500 text-white p-4 rounded-full shadow-lg">
              <Plus size={28} />
            </div>
          </button>

          <button
            onClick={() => setActiveTab('savings')}
            className={`flex flex-col items-center ${activeTab === 'savings' ? 'text-blue-500' : textSecondary}`}
          >
            <PiggyBank size={24} />
            <span className="text-xs mt-1">Копилка</span>
          </button>

          <button
            className={`flex flex-col items-center ${textSecondary}`}
          >
            <Settings size={24} />
            <span className="text-xs mt-1">Настройки</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceApp;