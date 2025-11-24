import React from 'react'

function NavButton({ active, onClick, icon, theme }) {
  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-full transition-all transform active:scale-95 touch-none ${
        active
          ? "glass-button-matte text-blue-600 dark:text-blue-400 hover:scale-110"
          : theme === "dark"
            ? "text-gray-400 hover:text-gray-300 glass-button-matte hover:bg-white/25"
            : "text-gray-600 hover:text-gray-900 glass-button-matte hover:bg-white/40"
      }`}
    >
      {icon}
    </button>
  )
}

export default NavButton
