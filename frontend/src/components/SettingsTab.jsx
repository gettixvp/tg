import React from "react"
import {
  User,
  Users,
  ChevronUp,
  ChevronDown,
  Settings,
  RefreshCw,
  BarChart3,
  LogOut,
  LogIn,
  Minimize2,
  Maximize2,
  UserPlus,
} from "lucide-react"
import LinkedUserRow from "./LinkedUserRow"

export default function SettingsTab({
  theme,
  isFullscreen,
  isAuthenticated,
  tgPhotoUrl,
  displayName,
  linkedUsers,
  tgUserId,
  user,
  showLinkedUsersDropdown,
  setShowLinkedUsersDropdown,
  vibrate,
  removeLinkedUser,
  inviteUser,
  handleLogout,
  setShowAuthModal,
  setAuthMode,
  currency,
  setCurrency,
  currencies,
  setTheme,
  tg,
  toggleFullscreen,
  budgets,
  setShowBudgetModal,
  setSelectedBudgetCategory,
  setBudgetLimitInput,
  showSystemSettings,
  setShowSystemSettings,
  setShowChangePasswordModal,
  vibrateSelect,
  recalculateBalance,
  handleResetAll,
}) {
  return (
    <div className="space-y-4" style={{ paddingTop: isFullscreen ? "48px" : "16px" }}>
      {/* Приветствие с аватаркой - только для незалогиненных */}
      {!isAuthenticated && (
        <div
          className={`backdrop-blur-sm rounded-2xl p-4 border shadow-lg ${
            theme === "dark" ? "bg-gray-800/70 border-gray-700/20" : "bg-white/80 border-white/50"
          }`}
        >
          <div className="flex items-center gap-3">
            {tgPhotoUrl ? (
              <img
                src={tgPhotoUrl}
                alt="Avatar"
                className="w-14 h-14 rounded-full flex-shrink-0 object-cover ring-2 ring-white/20"
              />
            ) : (
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <User className={`w-7 h-7 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`} />
              </div>
            )}
            <div>
              <h2 className={`text-xl font-bold mb-0.5 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Привет, {displayName}! 👋
              </h2>
              <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Добро пожаловать в ваш финансовый помощник
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`backdrop-blur-sm rounded-2xl p-4 border shadow-lg ${
          theme === "dark" ? "bg-gray-800/70 border-gray-700/20" : "bg-white/80 border-white/50"
        }`}
      >
        {linkedUsers.length > 1 && (
          <p className={`text-xs mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Семейный аккаунт
          </p>
        )}

        <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
          Аккаунт
        </h3>

        {isAuthenticated ? (
          <div className="space-y-3">
            <div
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                theme === "dark" ? "bg-green-900/30 border-green-700/30" : "bg-green-50 border-green-200"
              }`}
            >
              {tgPhotoUrl ? (
                <img
                  src={tgPhotoUrl}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    theme === "dark" ? "bg-green-700" : "bg-green-100"
                  }`}
                >
                  <User className={`w-5 h-5 ${theme === "dark" ? "text-green-300" : "text-green-600"}`} />
                </div>
              )}
              <div className="min-w-0">
                <p
                  className={`font-semibold text-sm truncate ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}
                >
                  {(user && user.first_name) || displayName}
                </p>
                <p className={`text-xs truncate ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {user && user.email}
                </p>
              </div>
            </div>

            {linkedUsers.length > 1 && (
              <div className="mb-3">
                <button
                  onClick={() => {
                    setShowLinkedUsersDropdown(!showLinkedUsersDropdown)
                    vibrate()
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    theme === "dark"
                      ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
                    Пользователи ({linkedUsers.length})
                  </span>
                  {showLinkedUsersDropdown ? (
                    <ChevronUp className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                  ) : (
                    <ChevronDown className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
                  )}
                </button>

                {showLinkedUsersDropdown && (
                  <div className="space-y-2 mt-2">
                    {linkedUsers.map((linkedUser) => (
                      <LinkedUserRow
                        key={linkedUser.telegram_id}
                        linkedUser={linkedUser}
                        currentTelegramId={tgUserId}
                        theme={theme}
                        vibrate={vibrate}
                        removeLinkedUser={removeLinkedUser}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Кнопка приглашения пользователя */}
            <button
              onClick={inviteUser}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm touch-none active:scale-95 ${
                theme === "dark"
                  ? "bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Пригласить пользователя
            </button>

            <button
              onClick={handleLogout}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm touch-none active:scale-95 ${
                theme === "dark"
                  ? "bg-rose-700 hover:bg-rose-600 text-white"
                  : "bg-rose-500 hover:bg-rose-600 text-white"
              }`}
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={`p-3 rounded-xl border ${
                theme === "dark" ? "bg-blue-900/30 border-blue-700/30" : "bg-blue-50 border-blue-200"
              }`}
            >
              <p className={`text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Войдите в учетную запись через email, чтобы синхронизировать данные на всех устройствах.
              </p>
            </div>

            {/* Описание совместного кошелька */}
            <div
              className={`p-3 rounded-xl border ${
                theme === "dark" ? "bg-purple-900/20 border-purple-700/30" : "bg-purple-50 border-purple-200"
              }`}
            >
              <div className="flex items-start gap-2">
                <Users
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    theme === "dark" ? "text-purple-400" : "text-purple-600"
                  }`}
                />
                <div>
                  <p
                    className={`text-xs font-medium mb-1 ${
                      theme === "dark" ? "text-purple-300" : "text-purple-700"
                    }`}
                  >
                    Совместный кошелек
                  </p>
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Пригласите друзей или членов семьи для совместного управления бюджетом. Они автоматически подключатся к
                    вашему аккаунту через Telegram и смогут видеть общие расходы и доходы.
                  </p>
                </div>
              </div>
            </div>

            {/* Кнопка приглашения (доступна без email) */}
            <button
              onClick={inviteUser}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm touch-none active:scale-95 ${
                theme === "dark"
                  ? "bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Пригласить пользователя
            </button>

            <button
              onClick={() => {
                setShowAuthModal(true)
                setAuthMode("login")
              }}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg text-sm touch-none active:scale-95 ${
                theme === "dark"
                  ? "bg-blue-700 hover:bg-blue-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Войти через Email
            </button>
          </div>
        )}
      </div>

      <div
        className={`backdrop-blur-sm rounded-2xl p-4 border shadow-lg ${
          theme === "dark" ? "bg-gray-800/70 border-gray-700/20" : "bg-white/80 border-white/50"
        }`}
      >
        <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
          Настройки
        </h3>

        <div className="space-y-3">
          <div>
            <label
              className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
            >
              Валюта
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ touchAction: "manipulation" }}
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
            >
              Тема
            </label>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{ touchAction: "manipulation" }}
              className={`w-full p-3 border rounded-xl transition-all text-left text-sm active:scale-95 ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
                  : "bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100"
              }`}
            >
              {theme === "dark" ? "🌙 Тёмная" : "☀️ Светлая"}
            </button>
          </div>

          {tg && (tg.requestFullscreen || tg.exitFullscreen) && (
            <div>
              <label
                className={`block font-medium mb-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                Полноэкранный режим
              </label>
              <button
                onClick={toggleFullscreen}
                style={{ touchAction: "manipulation" }}
                className={`w-full p-3 border rounded-xl transition-all text-left text-sm active:scale-95 flex items-center gap-2 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600"
                    : "bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100"
                }`}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Выключить</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>Включить</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Бюджеты */}
      <div
        className={`backdrop-blur-sm rounded-2xl p-4 border shadow-lg ${
          theme === "dark" ? "bg-gray-800/70 border-gray-700/20" : "bg-white/80 border-white/50"
        }`}
      >
        <h3 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
          Бюджеты и лимиты
        </h3>
        <button
          onClick={() => {
            setShowBudgetModal(true)
            setSelectedBudgetCategory("")
            setBudgetLimitInput("")
            vibrate()
          }}
          className={`w-full py-3 rounded-xl font-medium transition-all shadow-lg text-sm active:scale-95 flex items-center justify-center gap-2 ${
            theme === "dark" ? "bg-blue-700 hover:bg-blue-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          {Object.keys(budgets).length > 0 ? "Управление бюджетами" : "Настроить бюджеты"}
        </button>
        {Object.keys(budgets).length > 0 && (
          <p className={`text-xs mt-2 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Активных бюджетов: {Object.keys(budgets).length}
          </p>
        )}
      </div>

      {/* Системные настройки (раскрываемое меню) */}
      <div
        className={`backdrop-blur-sm rounded-2xl p-4 border shadow-lg ${
          theme === "dark" ? "bg-gray-800/70 border-gray-700/20" : "bg-white/80 border-white/50"
        }`}
      >
        <button
          onClick={() => {
            setShowSystemSettings(!showSystemSettings)
            vibrate()
          }}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
            theme === "dark"
              ? "bg-gray-700/50 border-gray-600 hover:bg-gray-700"
              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
          }`}
        >
          <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
            ⚙️ Системные настройки
          </span>
          {showSystemSettings ? (
            <ChevronUp className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`} />
          )}
        </button>

        {showSystemSettings && (
          <div className="space-y-3 mt-3">
            {/* Смена пароля (только для пользователей с email) */}
            {user && user.email && (
              <div
                className={`rounded-xl p-3 border ${
                  theme === "dark" ? "bg-blue-900/30 border-blue-700/30" : "bg-blue-50 border-blue-200"
                }`}
              >
                <h4
                  className={`text-sm font-bold mb-2 ${
                    theme === "dark" ? "text-blue-300" : "text-blue-900"
                  }`}
                >
                  Безопасность
                </h4>
                <button
                  onClick={() => {
                    setShowChangePasswordModal(true)
                    vibrateSelect()
                  }}
                  className={`w-full py-2 rounded-lg font-medium transition-all shadow text-xs active:scale-95 flex items-center justify-center gap-2 ${
                    theme === "dark"
                      ? "bg-blue-700 hover:bg-blue-600 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  <Settings className="w-3 h-3" />
                  Сменить пароль
                </button>
                <p className={`text-xs mt-2 ${theme === "dark" ? "text-blue-400" : "text-blue-700"}`}>
                  Измените пароль для входа в аккаунт через email.
                </p>
              </div>
            )}

            {/* Исправление данных */}
            <div
              className={`rounded-xl p-3 border ${
                theme === "dark" ? "bg-orange-900/30 border-orange-700/30" : "bg-orange-50 border-orange-200"
              }`}
            >
              <h4
                className={`text-sm font-bold mb-2 ${
                  theme === "dark" ? "text-orange-300" : "text-orange-900"
                }`}
              >
                Исправление данных
              </h4>
              <button
                onClick={recalculateBalance}
                className={`w-full py-2 rounded-lg font-medium transition-all shadow text-xs active:scale-95 flex items-center justify-center gap-2 ${
                  theme === "dark"
                    ? "bg-orange-700 hover:bg-orange-600 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                Пересчитать баланс
              </button>
              <p className={`text-xs mt-2 ${theme === "dark" ? "text-orange-400" : "text-orange-700"}`}>
                Пересчитывает баланс на основе всех транзакций. Используйте, если баланс некорректен.
              </p>
            </div>

            {/* Опасная зона */}
            <div
              className={`rounded-xl p-3 border ${
                theme === "dark" ? "bg-red-900/30 border-red-700/30" : "bg-red-50 border-red-200"
              }`}
            >
              <h4
                className={`text-sm font-bold mb-2 ${
                  theme === "dark" ? "text-red-300" : "text-red-900"
                }`}
              >
                Опасная зона
              </h4>
              <button
                onClick={handleResetAll}
                className={`w-full py-2 rounded-lg font-medium transition-all shadow text-xs touch-none active:scale-95 ${
                  theme === "dark"
                    ? "bg-red-700 hover:bg-red-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                Сбросить все данные
              </button>
              <p className={`text-xs mt-2 ${theme === "dark" ? "text-red-400" : "text-red-700"}`}>
                Удалит все транзакции, бюджеты и настройки. Это действие необратимо!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
