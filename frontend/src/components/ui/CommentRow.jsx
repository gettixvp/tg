import { useState, useRef } from "react"
import { Trash2, User } from "lucide-react"

export function CommentRow({ comment, theme, tgUserId, onDelete }) {
  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef(0)

  const handleTouchStart = (e) => {
    if (String(comment.telegram_id) !== String(tgUserId)) return
    startX.current = e.touches[0].clientX
    setIsSwiping(true)
  }

  const handleTouchMove = (e) => {
    if (!isSwiping || String(comment.telegram_id) !== String(tgUserId)) return
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

  return (
    <div className="relative overflow-hidden">
      {String(comment.telegram_id) === String(tgUserId) && (
        <div
          onClick={() => {
            if (swipeX === -80) {
              onDelete()
              setSwipeX(0)
            }
          }}
          className={`absolute inset-y-0 right-0 w-20 flex items-center justify-center cursor-pointer rounded-r-2xl ${
            theme === "dark" ? "bg-red-600" : "bg-red-500"
          }`}
        >
          <Trash2 className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping ? "none" : "transform 0.3s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`p-3 rounded-2xl relative z-10 ${
          String(comment.telegram_id) === String(tgUserId)
            ? theme === "dark"
              ? "bg-blue-600 text-white ml-8"
              : "bg-blue-500 text-white ml-8"
            : theme === "dark"
              ? "bg-gray-700 text-gray-100 mr-8"
              : "bg-gray-200 text-gray-900 mr-8"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-xs font-medium opacity-80 mb-1">{comment.author}</p>
            <p className="text-sm">{comment.text}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
