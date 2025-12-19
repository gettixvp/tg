import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

const showFatalError = (title, err) => {
  try {
    const rootEl = document.getElementById("root")
    if (!rootEl) return
    const msg =
      err && typeof err === "object"
        ? err.stack || err.message || String(err)
        : String(err)
    rootEl.innerHTML = `
      <div style="padding:16px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;">
        <div style="font-size:16px;font-weight:700;margin-bottom:8px;">${title}</div>
        <pre style="white-space:pre-wrap;word-break:break-word;background:#111827;color:#f3f4f6;padding:12px;border-radius:12px;overflow:auto;max-height:60vh;">${msg}</pre>
      </div>
    `
  } catch (_) {
    // ignore
  }
}

window.addEventListener("error", (e) => {
  const details = {
    message: e?.message,
    filename: e?.filename,
    lineno: e?.lineno,
    colno: e?.colno,
    error: e?.error,
  }
  const err = e?.error || new Error(`${details.message || "Unknown error"} @ ${details.filename || ""}:${details.lineno || ""}:${details.colno || ""}`)
  showFatalError("Ошибка приложения", err)
})

window.addEventListener("unhandledrejection", (e) => {
  const reason = e?.reason
  const err =
    reason instanceof Error
      ? reason
      : new Error(typeof reason === "string" ? reason : JSON.stringify(reason))
  showFatalError("Unhandled Promise Rejection", err)
})

// === Chart.js ===
import Chart from "chart.js/auto"
window.Chart = Chart

// === Ждём Telegram WebApp ===
const initApp = () => {
  const root = ReactDOM.createRoot(document.getElementById("root"))
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready()
  initApp()
} else {
  setTimeout(initApp, 1000)
}
