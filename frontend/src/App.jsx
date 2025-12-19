import FinanceApp from "./components/FinanceApp"

import React from "react"

const API_URL = import.meta.env.VITE_API_URL || "/api"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error("App crashed", error, info)
  }

  render() {
    if (this.state.error) {
      const msg = this.state.error?.stack || this.state.error?.message || String(this.state.error)
      return (
        <div style={{ padding: 16, fontFamily: "ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto" }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Ошибка рендера</div>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "#111827",
              color: "#f3f4f6",
              padding: 12,
              borderRadius: 12,
              overflow: "auto",
              maxHeight: "60vh",
            }}
          >
            {msg}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <FinanceApp apiUrl={API_URL} />
    </ErrorBoundary>
  )
}
