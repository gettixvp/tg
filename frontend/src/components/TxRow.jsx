import React, { useState, useRef, memo } from 'react'
import { Trash2, Heart, User } from 'lucide-react'

const TxRow = memo(function TxRow({ 
  tx, 
  categoriesMeta, 
  formatCurrency, 
  formatDate, 
  theme, 
  onDelete, 
  showCreator = false, 
  onToggleLike, 
  onOpenDetails, 
  tgPhotoUrl 
}) {
  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [lastTap, setLastTap] = useState(0)
  const startX = useRef(0)
  const startY = useRef(0)
  const isHorizontalSwipe = useRef(false)

  const handleTouchStart = (e) => {
    const now = Date.now()
    const timeSinceLastTap = now - lastTap
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Двойной тап - ставим лайк
      e.preventDefault()
      onToggleLike && onToggleLike(tx.id)
      setLastTap(0)
      return
    }
    
    setLastTap(now)
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    isHorizontalSwipe.current = false
    setIsSwiping(true)
  }

  const handleClick = () => {
    if (swipeX === 0) {
      onOpenDetails && onOpenDetails(tx)
    }
  }

  const handleTouchMove = (e) => {
    if (!isSwiping) return
    
    const diffX = e.touches[0].clientX - startX.current
    const diffY = e.touches[0].clientY - startY.current
    
    // Определяем направление свайпа только один раз
    if (!isHorizontalSwipe.current && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
      isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY)
    }
    
    // Если свайп вертикальный - не обрабатываем
    if (!isHorizontalSwipe.current) {
      return
    }
    
    // Блокируем вертикальную прокрутку при горизонтальном свайпе
    e.preventDefault()
    
    if (diffX < 0) {
      setSwipeX(Math.max(diffX, -80))
    } else if (swipeX < 0) {
      setSwipeX(Math.min(0, swipeX + diffX / 2))
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    isHorizontalSwipe.current = false
    if (swipeX < -40) {
      setSwipeX(-80)
    } else {
      setSwipeX(0)
    }
  }

  const categoryInfo = categoriesMeta[tx.category] || categoriesMeta["Другое"]

  return (
    <div className="mb-2">
      <div className="relative overflow-hidden rounded-2xl">
        {onDelete && (
          <div
            onClick={() => {
              if (swipeX === -80) {
                onDelete(tx.id)
                setSwipeX(0)
              }
            }}
            className={`absolute inset-y-0 right-0 w-20 flex items-center justify-center cursor-pointer rounded-r-xl transition-opacity ${
              swipeX < -20 ? 'opacity-100' : 'opacity-0'
            } ${
              theme === "dark" ? "bg-red-600" : "bg-rose-500"
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
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative p-3 cursor-pointer rounded-2xl border backdrop-blur-2xl transition-all hover:shadow-xl hover:scale-[1.02] ${
            theme === "dark"
              ? "glass-card-matte-dark"
              : "glass-card-matte"
          }`}
        >
          {/* Лайк в правом верхнем углу */}
          {tx.liked && (
            <div className="absolute top-1.5 right-1.5 z-10">
              <Heart className="w-4 h-4 text-red-500 fill-red-500 drop-shadow-lg" />
            </div>
          )}

          <div className="flex items-start gap-2.5">
            {/* Иконка категории */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${categoryInfo.color} shadow-md flex-shrink-0`}
            >
              <span className="text-xl">{categoryInfo.icon}</span>
            </div>

            {/* Основная информация */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <div className="flex-1 min-w-0">
                  {tx.description && (
                    <p className={`font-semibold text-sm mb-0.5 truncate ${
                      theme === "dark" ? "text-gray-100" : "text-gray-900"
                    }`}>
                      {tx.description}
                    </p>
                  )}
                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {tx.category}
                  </p>
                </div>
                
                {/* Сумма */}
                <p
                  className={`font-bold text-base whitespace-nowrap ${
                    tx.type === "income" ? "text-emerald-500" : tx.type === "expense" ? "text-rose-500" : "text-blue-500"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </p>
              </div>

              {/* Нижняя строка: автор и время */}
              <div className="flex items-center justify-between gap-2">
                {showCreator && tx.created_by_name ? (
                  <div className="flex items-center gap-1">
                    {tx.telegram_photo_url ? (
                      <img
                        src={tx.telegram_photo_url}
                        alt="Avatar"
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        theme === "dark" ? "bg-blue-700" : "bg-blue-200"
                      }`}>
                        <User className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                      {tx.created_by_name}
                    </span>
                  </div>
                ) : (
                  <div />
                )}
                
                <span className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                  {formatDate(tx.date)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Последние 2 комментария */}
      {tx.comments && tx.comments.length > 0 && (
        <div className="mt-1.5 px-3 space-y-1">
          {tx.comments.slice(-2).map((comment, idx) => (
            <div key={comment.id || idx} className="flex items-start gap-1.5">
              {/* Аватар автора комментария */}
              {comment.telegram_photo_url ? (
                <img
                  src={comment.telegram_photo_url}
                  alt={comment.author}
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0 mt-0.5"
                />
              ) : (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  theme === "dark" ? "bg-gray-600" : "bg-gray-300"
                }`}>
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
              
              {/* Текст комментария */}
              <div className="flex-1 min-w-0">
                <div
                  className={`inline-block px-2.5 py-1.5 rounded-xl ${
                    theme === "dark"
                      ? "bg-gray-700/80 text-gray-100"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className={`text-[10px] font-medium mb-0.5 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}>
                    {comment.author}
                  </p>
                  <p className="text-xs leading-snug break-words">{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
          {tx.comments.length > 2 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenDetails && onOpenDetails(tx)
              }}
              className={`text-[10px] font-medium ml-6 ${
                theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
              }`}
            >
              Ещё {tx.comments.length - 2} {tx.comments.length - 2 === 1 ? 'комментарий' : 'комментария'}
            </button>
          )}
        </div>
      )}
    </div>
  )
})

export default TxRow
