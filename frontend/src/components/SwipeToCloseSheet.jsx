import React from 'react'

const SwipeToCloseSheet = ({ isOpen, onClose, children, theme = "dark" }) => {
  if (!isOpen) return null

  return (
    <div 
      className={`fixed inset-0 backdrop-blur-md flex items-end justify-center z-50 ${
        theme === "dark" ? "bg-black/30" : "bg-white/20"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-t-3xl shadow-2xl border backdrop-blur-2xl transform transition-transform duration-250 ease-out sheet-animate ${
          theme === "dark"
            ? "bg-gray-900/80 border-gray-700/70"
            : "bg-white/95 border-white/80 shadow-[0_18px_45px_rgba(15,23,42,0.22)]"
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          let startY = e.touches[0].clientY
          const onTouchEnd = (endE) => {
            if (endE.changedTouches[0].clientY - startY > 100) {
              onClose()
            }
            document.removeEventListener('touchend', onTouchEnd)
          }
          document.addEventListener('touchend', onTouchEnd)
        }}
      >
        <div className="w-10 h-1.5 bg-gray-400/70 rounded-full mx-auto mt-2 mb-3 opacity-80" />
        {children}
      </div>
    </div>
  )
}

export default SwipeToCloseSheet
