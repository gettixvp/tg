// server.js
require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const pool = require("./db")

const app = express()
app.use(express.json())
app.use(cors())

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// --- ПИНГ ДЛЯ RENDER (чтобы не засыпал) ---
app.get("/ping", (req, res) => {
  res.send("pong");
});

// --- Регистрация / Вход ---
app.post("/api/auth", async (req, res) => {
  const { email, password, first_name, telegram_id, telegram_name } = req.body

  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    if (existing.rowCount === 0) {
      // Регистрация
      const password_hash = password ? await bcrypt.hash(password, 10) : null
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, balance, income, expenses, savings_usd, goal_savings)
         VALUES ($1, $2, $3, 0, 0, 0, 0, 50000) RETURNING *`,
        [email, password_hash, first_name || email.split("@")[0]],
      )
      const user = userResult.rows[0]

      if (telegram_id && telegram_name) {
        await pool.query(
          `INSERT INTO linked_telegram_users (user_email, telegram_id, telegram_name)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_email, telegram_id) DO UPDATE SET telegram_name = $3`,
          [email, telegram_id, telegram_name],
        )
      }

      return res.json({ user: convertUser(user), transactions: [] })
    }

    // Вход
    const user = existing.rows[0]
    if (user.password_hash && password) {
      const ok = await bcrypt.compare(password, user.password_hash)
      if (!ok) return res.status(401).json({ error: "Неверный пароль" })
    }

    if (telegram_id && telegram_name) {
      await pool.query(
        `INSERT INTO linked_telegram_users (user_email, telegram_id, telegram_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_email, telegram_id) DO UPDATE SET telegram_name = $3`,
        [email, telegram_id, telegram_name],
      )
    }

    const tx = await pool.query("SELECT * FROM transactions WHERE user_email = $1 ORDER BY date DESC", [email])

    res.json({ user: convertUser(user), transactions: tx.rows })
  } catch (e) {
    console.error("Auth error:", e)
    res.status(500).json({ error: "Ошибка сервера: " + e.message })
  }
})

// --- Обновить пользователя ---
app.put("/api/user/:email", async (req, res) => {
  const { email } = req.params
  const { balance, income, expenses, savings, goalSavings } = req.body

  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    await pool.query(
      `UPDATE users
       SET balance=$1, income=$2, expenses=$3, savings_usd=$4, goal_savings=$5
       WHERE email=$6`,
      [balance || 0, income || 0, expenses || 0, savings || 0, goalSavings || 50000, email],
    )
    res.json({ success: true })
  } catch (e) {
    console.error("User update error:", e)
    res.status(500).json({ error: "Не удалось сохранить: " + e.message })
  }
})

// --- Сброс данных ---
app.post("/api/user/:email/reset", async (req, res) => {
  const { email } = req.params
  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    await pool.query("DELETE FROM transactions WHERE user_email = $1", [email])
    await pool.query(`UPDATE users SET balance=0, income=0, expenses=0, savings_usd=0 WHERE email=$1`, [email])
    res.json({ success: true })
  } catch (e) {
    console.error("Reset error:", e)
    res.status(500).json({ error: "Не удалось сбросить: " + e.message })
  }
})

// --- Новая транзакция ---
app.post("/api/transactions", async (req, res) => {
  const {
    user_id,
    type,
    amount,
    description,
    category,
    converted_amount_usd,
    created_by_telegram_id,
    created_by_name,
  } = req.body

  const user_email = user_id

  if (!user_email) {
    return res.status(400).json({ error: "Email пользователя обязателен" })
  }

  try {
    const r = await pool.query(
      `INSERT INTO transactions (user_email, type, amount, converted_amount_usd, description, category, created_by_telegram_id, created_by_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        user_email,
        type,
        amount || 0,
        converted_amount_usd,
        description,
        category,
        created_by_telegram_id,
        created_by_name,
      ],
    )
    res.json(r.rows[0])
  } catch (e) {
    console.error("TX insert error:", e)
    res.status(500).json({ error: "Ошибка добавления: " + e.message })
  }
})

// --- Удалить транзакцию ---
app.delete("/api/transactions/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10)
  if (isNaN(id)) return res.status(400).json({ error: "Неверный ID" })

  try {
    const result = await pool.query("DELETE FROM transactions WHERE id = $1 RETURNING *", [id])
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Транзакция не найдена" })
    }
    res.json({ success: true })
  } catch (e) {
    console.error("TX delete error:", e)
    res.status(500).json({ error: "Ошибка удаления: " + e.message })
  }
})

// --- Получить транзакции ---
app.get("/api/transactions", async (req, res) => {
  const { user_email } = req.query
  if (!user_email) return res.status(400).json({ error: "Email обязателен" })

  try {
    const r = await pool.query("SELECT * FROM transactions WHERE user_email = $1 ORDER BY date DESC", [user_email])
    res.json(r.rows)
  } catch (e) {
    console.error("TX get error:", e)
    res.status(500).json({ error: "Ошибка получения: " + e.message })
  }
})

// --- Получить связанных пользователей ---
app.get("/api/linked-users/:email", async (req, res) => {
  const { email } = req.params

  if (!email) {
    return res.status(400).json({ error: "Email обязателен" })
  }

  try {
    const result = await pool.query(
      "SELECT telegram_id, telegram_name, linked_at FROM linked_telegram_users WHERE user_email = $1 ORDER BY linked_at",
      [email],
    )
    res.json({ linkedUsers: result.rows })
  } catch (e) {
    console.error("Linked users error:", e)
    res.status(500).json({ error: "Ошибка получения пользователей: " + e.message })
  }
})

// --- Удалить связанный пользователя ---
app.delete("/api/linked-users/:email/:telegram_id", async (req, res) => {
  const { email, telegram_id } = req.params

  if (!email || !telegram_id) {
    return res.status(400).json({ error: "Email и Telegram ID обязательны" })
  }

  try {
    const result = await pool.query(
      "DELETE FROM linked_telegram_users WHERE user_email = $1 AND telegram_id = $2 RETURNING *",
      [email, telegram_id],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Связанный пользователь не найден" })
    }

    res.json({ success: true, deletedUser: result.rows[0] })
  } catch (e) {
    console.error("Delete linked user error:", e)
    res.status(500).json({ error: "Ошибка удаления пользователя: " + e.message })
  }
})

// --- Helper ---
function convertUser(u) {
  return {
    email: u.email,
    first_name: u.first_name,
    balance: Number(u.balance || 0),
    income: Number(u.income || 0),
    expenses: Number(u.expenses || 0),
    savings_usd: Number(u.savings_usd || 0),
    goal_savings: Number(u.goal_savings || 50000),
  }
}

const PORT = process.env.PORT || 10000
app.listen(PORT, () => console.log(`Сервер на порту ${PORT}`))