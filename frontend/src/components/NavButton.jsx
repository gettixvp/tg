function NavButton({ active, onClick, icon, theme }) {
  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-full transition-all transform active:scale-95 touch-none ${
        active
          ? theme === "dark"
            ? "bg-gray-700/80 text-blue-400 backdrop-blur-md"
            : "bg-white/50 text-blue-600 backdrop-blur-sm shadow-md"
          : theme === "dark"
            ? "text-gray-400 hover:text-gray-300"
            : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {icon}
    </button>
  )
}

export default NavButton
