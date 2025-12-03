"use client"

import { useEffect, useState } from "react"
import FinanceApp from "../src/components/FinanceApp"

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://walletback-aghp.onrender.com/api"

export default function Page() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Wait for Telegram WebApp to be ready
    if (typeof window !== "undefined") {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready()
        window.Telegram.WebApp.expand()
      }
      setIsReady(true)
    }
  }, [])

  if (!isReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return <FinanceApp apiUrl={API_URL} />
}
