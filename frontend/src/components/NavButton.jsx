function NavButton({ active, onClick, icon, theme }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-full transition-all transform active:scale-95 touch-none nav-item ${
        active
          ? theme === "dark"
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
            : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
          : theme === "dark"
            ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
            : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
      }`}
      style={{
        boxShadow: active 
          ? '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
          : 'none'
      }}
    >
      {icon}
    </button>
  )
}

export default NavButton
