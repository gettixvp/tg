import React from "react"

export default function NumericKeyboard({ onNumberPress, onBackspace, onDone, theme }) {
  return (
    <div
      className={`grid grid-cols-3 gap-2 p-4 rounded-t-2xl w-full ${
        theme === "dark" ? "bg-gray-800 border-t border-gray-700" : "bg-gray-100 border-t border-gray-200"
      }`}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "⌫"].map((key) => (
        <button
          key={key}
          onClick={() => {
            if (key === "⌫") onBackspace()
            else onNumberPress(key.toString())
          }}
          className={`p-3 rounded-lg text-lg font-semibold transition-all touch-none active:scale-95 ${
            theme === "dark"
              ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
              : "bg-white text-gray-900 hover:bg-gray-50 shadow-sm"
          }`}
        >
          {key}
        </button>
      ))}
      <button
        onClick={onDone}
        className="col-span-3 p-3 rounded-lg text-base font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all touch-none active:scale-95"
      >
        Готово
      </button>
    </div>
  )
}
