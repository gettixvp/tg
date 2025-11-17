import { useRef, useState } from "react"
import { Trash2, User } from "lucide-react"

const LinkedUserRow = ({ linkedUser, currentTelegramId, theme, vibrate, removeLinkedUser }) => {
  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef(0)

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    setIsSwiping(true)
  }

  const handleTouchMove = (e) => {
    if (!isSwiping) return
    const diff = e.touches[0].clientX - startX.current
    if (diff < 0) {
      setSwipeX(Math.max(diff, -80))
    } else if (swipeX < 0) {
      setSwipeX(Math.min(0, swipeX + diff / 2))
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    if (swipeX < -40) {
      setSwipeX(-80)
    } else {
      setSwipeX(0)
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Удалить ${linkedUser.telegram_name || "пользователя"} из семейного аккаунта?`)) {
      vibrate()
      removeLinkedUser(linkedUser.telegram_id)
      setSwipeX(0)
    }
  }

  const isCurrentUser = linkedUser.telegram_id === currentTelegramId

  return (
    <div className="relative mb-1.5 overflow-hidden rounded-xl">
      <div
        onClick={handleDelete}
        className={`absolute inset-y-0 right-0 w-20 flex items-center justify-center cursor-pointer ${
          theme === "dark" ? "bg-red-600" : "bg-red-500"
        }`}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </div>

      <div
        style={{
          transform: `translateX(${swipeX}px)` ,
          transition: isSwiping ? "none" : "transform 0.3s ease",
        }}
        onTouchStart={!isCurrentUser ? handleTouchStart : undefined}
        onTouchMove={!isCurrentUser ? handleTouchMove : undefined}
        onTouchEnd={!isCurrentUser ? handleTouchEnd : undefined}
        className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
          theme === "dark" ? "bg-gray-800 border-gray-700/50" : "bg-white border-gray-200/50"
        }`}
      >
        {linkedUser.telegram_photo_url ? (
          <img
            src={linkedUser.telegram_photo_url}
            alt="Avatar"
            className="w-10 h-10 rounded-full flex-shrink-0 object-cover border border-white/20"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              theme === "dark" ? "bg-blue-700" : "bg-blue-100"
            }`}
          >
            <User className={`w-5 h-5 ${theme === "dark" ? "text-blue-300" : "text-blue-600"}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${theme === "dark" ? "text-gray-100" : "text-gray-900"}`}>
            {linkedUser.telegram_name || "Пользователь"}
          </p>
          {isCurrentUser && (
            <p className={`text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
              Вы
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LinkedUserRow
