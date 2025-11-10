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
  const { email, password, first_name, telegram_id, telegram_name, mode } = req.body

  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    // Режим входа
    if (mode === 'login') {
      if (existing.rowCount === 0) {
        return res.status(404).json({ error: "Данного аккаунта не существует. Зарегистрируйтесь." })
      }
      
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
      return res.json({ user: convertUser(user), transactions: tx.rows })
    }

    // Режим регистрации
    if (mode === 'register') {
      if (existing.rowCount > 0) {
        return res.status(409).json({ error: "Аккаунт с таким email уже существует" })
      }
      
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

    // Старая логика (для обратной совместимости)
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

// --- Добавить транзакцию ---
app.post("/api/transactions", async (req, res) => {
  const { user_email, type, amount, converted_amount_usd, description, category, created_by_telegram_id, created_by_name, savings_goal } = req.body

  if (!user_email) {
    return res.status(400).json({ error: "Email пользователя обязателен" })
  }

  try {
    const r = await pool.query(
      `INSERT INTO transactions (user_email, type, amount, converted_amount_usd, description, category, created_by_telegram_id, created_by_name, savings_goal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        user_email,
        type,
        amount || 0,
        converted_amount_usd,
        description,
        category,
        created_by_telegram_id,
        created_by_name,
        savings_goal || 'main',
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
    // Сначала удаляем все комментарии к этой транзакции
    await pool.query("DELETE FROM transaction_comments WHERE transaction_id = $1", [id])
    
    // Затем удаляем саму транзакцию
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

// --- Добавить комментарий к транзакции ---
app.post("/api/transactions/:txId/comment", async (req, res) => {
  const { txId } = req.params
  const { user_email, comment } = req.body

  if (!user_email || !comment) {
    return res.status(400).json({ error: "Email и комментарий обязательны" })
  }

  try {
    const result = await pool.query(
      `INSERT INTO transaction_comments (transaction_id, author, text, date, telegram_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [txId, comment.author, comment.text, comment.date, comment.telegram_id]
    )
    res.json({ success: true, comment: result.rows[0] })
  } catch (e) {
    console.error("Comment add error:", e)
    res.status(500).json({ error: "Ошибка добавления комментария: " + e.message })
  }
})

// --- Удалить комментарий ---
app.delete("/api/transactions/:txId/comment/:commentId", async (req, res) => {
  const { txId, commentId } = req.params
  const { user_email } = req.body

  if (!user_email) {
    return res.status(400).json({ error: "Email обязателен" })
  }

  try {
    const result = await pool.query(
      "DELETE FROM transaction_comments WHERE id = $1 AND transaction_id = $2 RETURNING *",
      [commentId, txId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Комментарий не найден" })
    }

    res.json({ success: true })
  } catch (e) {
    console.error("Comment delete error:", e)
    res.status(500).json({ error: "Ошибка удаления комментария: " + e.message })
  }
})

// --- Получить комментарии транзакции ---
app.get("/api/transactions/:txId/comments", async (req, res) => {
  const { txId } = req.params

  try {
    const result = await pool.query(
      "SELECT * FROM transaction_comments WHERE transaction_id = $1 ORDER BY date ASC",
      [txId]
    )
    res.json({ comments: result.rows })
  } catch (e) {
    console.error("Comments get error:", e)
    res.status(500).json({ error: "Ошибка получения комментариев: " + e.message })
  }
})

// --- Обновить настройки копилки ---
app.put("/api/user/:email/savings-settings", async (req, res) => {
  const { email } = req.params
  const { goalName, initialSavingsAmount, secondGoalName, secondGoalAmount, secondGoalSavings, secondGoalInitialAmount } = req.body

  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    await pool.query(
      `UPDATE users
       SET goal_name=$1, initial_savings_amount=$2, second_goal_name=$3, second_goal_amount=$4, second_goal_savings=$5, second_goal_initial_amount=$6
       WHERE email=$7`,
      [goalName, initialSavingsAmount || 0, secondGoalName, secondGoalAmount || 0, secondGoalSavings || 0, secondGoalInitialAmount || 0, email],
    )
    res.json({ success: true })
  } catch (e) {
    console.error("Savings settings update error:", e)
    res.status(500).json({ error: "Не удалось сохранить настройки: " + e.message })
  }
})

// --- Обновить бюджеты ---
app.put("/api/user/:email/budgets", async (req, res) => {
  const { email } = req.params
  const { budgets } = req.body

  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    const budgetsJson = JSON.stringify(budgets || {})
    await pool.query(
      `UPDATE users SET budgets=$1 WHERE email=$2`,
      [budgetsJson, email],
    )
    res.json({ success: true })
  } catch (e) {
    console.error("Budgets update error:", e)
    res.status(500).json({ error: "Не удалось сохранить бюджеты: " + e.message })
  }
})

// --- Пересчитать баланс пользователя на основе транзакций ---
app.post("/api/user/:email/recalculate", async (req, res) => {
  const { email } = req.params

  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    // Получаем все транзакции пользователя
    const txResult = await pool.query(
      `SELECT * FROM transactions WHERE user_email = $1 ORDER BY created_at ASC`,
      [email]
    )

    const transactions = txResult.rows

    // Пересчитываем баланс, доходы, расходы и копилку
    let income = 0
    let expenses = 0
    let savingsUSD = 0

    transactions.forEach(tx => {
      const amount = Number(tx.amount || 0)
      const convertedUSD = Number(tx.converted_amount_usd || 0)

      if (tx.type === 'income') {
        income += amount
      } else if (tx.type === 'expense') {
        expenses += amount
      } else if (tx.type === 'savings') {
        // Для копилки используем converted_amount_usd
        if (tx.savings_goal === 'second') {
          // Вторая цель - не трогаем, она отдельно
        } else {
          savingsUSD += convertedUSD
        }
      }
    })

    // Баланс = доходы - расходы - копилка (в рублях)
    const savingsInRUB = transactions
      .filter(tx => tx.type === 'savings')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
    
    const balance = income - expenses - savingsInRUB

    // Обновляем пользователя
    await pool.query(
      `UPDATE users SET balance = $1, income = $2, expenses = $3, savings_usd = $4 WHERE email = $5`,
      [balance, income, expenses, savingsUSD, email]
    )

    res.json({
      success: true,
      recalculated: {
        balance,
        income,
        expenses,
        savings_usd: savingsUSD,
        total_transactions: transactions.length
      }
    })
  } catch (e) {
    console.error("Recalculate error:", e)
    res.status(500).json({ error: "Не удалось пересчитать баланс: " + e.message })
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
    goal_name: u.goal_name || "Моя цель",
    initial_savings_amount: Number(u.initial_savings_amount || 0),
    second_goal_name: u.second_goal_name || "",
    second_goal_amount: Number(u.second_goal_amount || 0),
    second_goal_savings: Number(u.second_goal_savings || 0),
    second_goal_initial_amount: Number(u.second_goal_initial_amount || 0),
    budgets: u.budgets || {},
  }
}

// --- Получить долги пользователя ---
app.get("/api/user/:email/debts", async (req, res) => {
  const { email } = req.params
  
  try {
    const result = await pool.query(
      `SELECT * FROM debts WHERE user_email = $1 ORDER BY created_at DESC`,
      [email]
    )
    res.json({ debts: result.rows })
  } catch (e) {
    console.error("Get debts error:", e)
    res.status(500).json({ error: "Не удалось получить долги: " + e.message })
  }
})

// --- Добавить долг ---
app.post("/api/user/:email/debts", async (req, res) => {
  const { email } = req.params
  const { type, person, amount, description } = req.body
  
  if (!type || !person || !amount) {
    return res.status(400).json({ error: "Заполните все обязательные поля" })
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO debts (user_email, type, person, amount, description, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [email, type, person, amount, description || '']
    )
    res.json({ debt: result.rows[0] })
  } catch (e) {
    console.error("Add debt error:", e)
    res.status(500).json({ error: "Не удалось добавить долг: " + e.message })
  }
})

// --- Удалить долг ---
app.delete("/api/user/:email/debts/:debtId", async (req, res) => {
  const { email, debtId } = req.params
  
  try {
    await pool.query(
      `DELETE FROM debts WHERE id = $1 AND user_email = $2`,
      [debtId, email]
    )
    res.json({ success: true })
  } catch (e) {
    console.error("Delete debt error:", e)
    res.status(500).json({ error: "Не удалось удалить долг: " + e.message })
  }
})

// --- Связывание пользователей (совместный кошелек) ---
app.post("/api/user/:email/link", async (req, res) => {
  const { email } = req.params
  const { linkedEmail } = req.body

  if (!linkedEmail) {
    return res.status(400).json({ error: "linkedEmail обязателен" })
  }

  try {
    // Проверяем, существует ли связь
    const existing = await pool.query(
      `SELECT * FROM linked_users WHERE user_email = $1 AND linked_email = $2`,
      [email, linkedEmail]
    )

    if (existing.rows.length > 0) {
      return res.json({ success: true, message: "Пользователи уже связаны" })
    }

    // Создаем двустороннюю связь
    await pool.query(
      `INSERT INTO linked_users (user_email, linked_email) VALUES ($1, $2)`,
      [email, linkedEmail]
    )
    await pool.query(
      `INSERT INTO linked_users (user_email, linked_email) VALUES ($1, $2)`,
      [linkedEmail, email]
    )

    res.json({ success: true, message: "Пользователи успешно связаны" })
  } catch (e) {
    console.error("Link users error:", e)
    res.status(500).json({ error: "Не удалось связать пользователей: " + e.message })
  }
})

// --- Получить связанных пользователей ---
app.get("/api/user/:email/linked", async (req, res) => {
  const { email } = req.params

  try {
    const result = await pool.query(
      `SELECT linked_email, created_at FROM linked_users WHERE user_email = $1`,
      [email]
    )
    res.json({ linkedUsers: result.rows })
  } catch (e) {
    console.error("Get linked users error:", e)
    res.status(500).json({ error: "Не удалось получить связанных пользователей: " + e.message })
  }
})

// --- Универсальное связывание пользователей (email + Telegram ID) ---
app.post("/api/link", async (req, res) => {
  const { 
    currentTelegramId, 
    currentEmail, 
    currentUserName,
    referrerTelegramId, 
    referrerEmail,
    referrerName 
  } = req.body

  if (!currentTelegramId || !referrerTelegramId) {
    return res.status(400).json({ error: "Telegram ID обязательны" })
  }

  try {
    // Проверяем, существует ли связь по Telegram ID
    const existingTg = await pool.query(
      `SELECT * FROM telegram_links WHERE telegram_id = $1 AND linked_telegram_id = $2`,
      [currentTelegramId, referrerTelegramId]
    )

    if (existingTg.rows.length > 0) {
      return res.json({ success: true, message: "Пользователи уже связаны" })
    }

    // Создаем двустороннюю связь по Telegram ID
    await pool.query(
      `INSERT INTO telegram_links (telegram_id, linked_telegram_id, user_name, linked_email) VALUES ($1, $2, $3, $4)`,
      [currentTelegramId, referrerTelegramId, currentUserName, referrerEmail]
    )
    await pool.query(
      `INSERT INTO telegram_links (telegram_id, linked_telegram_id, user_name, linked_email) VALUES ($1, $2, $3, $4)`,
      [referrerTelegramId, currentTelegramId, referrerName, currentEmail]
    )

    console.log(`✅ Linked users: TG ${currentTelegramId} (${currentEmail || 'no email'}) <-> TG ${referrerTelegramId} (${referrerEmail || 'no email'})`)

    // Если оба пользователя имеют email, создаем также связь по email
    if (currentEmail && referrerEmail) {
      const existingEmail = await pool.query(
        `SELECT * FROM linked_users WHERE user_email = $1 AND linked_email = $2`,
        [currentEmail, referrerEmail]
      )

      if (existingEmail.rows.length === 0) {
        await pool.query(
          `INSERT INTO linked_users (user_email, linked_email) VALUES ($1, $2)`,
          [currentEmail, referrerEmail]
        )
        await pool.query(
          `INSERT INTO linked_users (user_email, linked_email) VALUES ($1, $2)`,
          [referrerEmail, currentEmail]
        )
        console.log(`✅ Also linked by email: ${currentEmail} <-> ${referrerEmail}`)
      }
    }

    res.json({ success: true, message: "Пользователи успешно связаны" })
  } catch (e) {
    console.error("Link users error:", e)
    res.status(500).json({ error: "Не удалось связать пользователей: " + e.message })
  }
})

// --- Связывание пользователей по Telegram ID (старый эндпоинт для совместимости) ---
app.post("/api/telegram/:telegramId/link", async (req, res) => {
  const { telegramId } = req.params
  const { linkedTelegramId, userName, referrerName } = req.body

  if (!linkedTelegramId) {
    return res.status(400).json({ error: "linkedTelegramId обязателен" })
  }

  try {
    // Проверяем, существует ли связь
    const existing = await pool.query(
      `SELECT * FROM telegram_links WHERE telegram_id = $1 AND linked_telegram_id = $2`,
      [telegramId, linkedTelegramId]
    )

    if (existing.rows.length > 0) {
      return res.json({ success: true, message: "Пользователи уже связаны" })
    }

    // Создаем двустороннюю связь
    await pool.query(
      `INSERT INTO telegram_links (telegram_id, linked_telegram_id, user_name) VALUES ($1, $2, $3)`,
      [telegramId, linkedTelegramId, userName]
    )
    await pool.query(
      `INSERT INTO telegram_links (telegram_id, linked_telegram_id, user_name) VALUES ($1, $2, $3)`,
      [linkedTelegramId, telegramId, referrerName]
    )

    console.log(`✅ Linked Telegram users: ${telegramId} <-> ${linkedTelegramId}`)
    res.json({ success: true, message: "Пользователи успешно связаны" })
  } catch (e) {
    console.error("Link Telegram users error:", e)
    res.status(500).json({ error: "Не удалось связать пользователей: " + e.message })
  }
})

// --- Получить связанных пользователей по Telegram ID ---
app.get("/api/telegram/:telegramId/linked", async (req, res) => {
  const { telegramId } = req.params

  try {
    const result = await pool.query(
      `SELECT linked_telegram_id, user_name, created_at FROM telegram_links WHERE telegram_id = $1`,
      [telegramId]
    )
    res.json({ linkedUsers: result.rows })
  } catch (e) {
    console.error("Get linked Telegram users error:", e)
    res.status(500).json({ error: "Не удалось получить связанных пользователей: " + e.message })
  }
})

// --- Инициализация таблиц ---
async function initTables() {
  try {
    // Таблица debts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS debts (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        type VARCHAR(10) NOT NULL,
        person VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_debts_user_email ON debts(user_email)
    `)
    
    console.log('✅ Таблица debts инициализирована')
    
    // Таблица linked_users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS linked_users (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        linked_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_email, linked_email)
      )
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_linked_users_email ON linked_users(user_email)
    `)
    
    console.log('✅ Таблица linked_users инициализирована')
    
    // Таблица telegram_links (для связывания по Telegram ID)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS telegram_links (
        id SERIAL PRIMARY KEY,
        telegram_id VARCHAR(50) NOT NULL,
        linked_telegram_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(255),
        linked_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(telegram_id, linked_telegram_id)
      )
    `)
    
    // Добавляем колонку linked_email если её нет (для существующих таблиц)
    await pool.query(`
      ALTER TABLE telegram_links 
      ADD COLUMN IF NOT EXISTS linked_email VARCHAR(255)
    `).catch(() => {
      // Игнорируем ошибку если колонка уже существует
    })
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_telegram_links_id ON telegram_links(telegram_id)
    `)
    
    console.log('✅ Таблица telegram_links инициализирована')
  } catch (e) {
    console.error('❌ Ошибка инициализации таблиц:', e.message)
  }
}

const PORT = process.env.PORT || 10000
app.listen(PORT, async () => {
  console.log(`Сервер на порту ${PORT}`)
  await initTables()
})