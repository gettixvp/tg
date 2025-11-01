// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const pool = require("./db");

const app = express();
app.use(express.json());
app.use(cors());

// --- Health check для keep-alive ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Регистрация / Вход ---
app.post("/api/auth", async (req, res) => {
  const { email, password, first_name } = req.body;

  try {
    // Проверяем есть ли пользователь
    const existing = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (existing.rowCount === 0) {
      // Регистрация
      const password_hash = password ? await bcrypt.hash(password, 10) : null;
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, first_name)
         VALUES ($1,$2,$3) RETURNING *`,
        [email, password_hash, first_name || email]
      );
      return res.json({ user: convertUser(userResult.rows[0]), transactions: [] });
    }

    // Вход
    const user = existing.rows[0];
    if (user.password_hash && password) {
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: "Неверный пароль" });
    }

    // Забираем транзакции
    const tx = await pool.query("SELECT * FROM transactions WHERE user_id=$1 ORDER BY date DESC", [user.id]);

    res.json({ user: convertUser(user), transactions: tx.rows });

  } catch (e) {
    console.error("Auth error:", e);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// --- Сохранение данных пользователя ---
app.put("/api/user/:id", async (req, res) => {
  const { balance, income, expenses, savings, goalSavings } = req.body;

  try {
    await pool.query(
      `UPDATE users
       SET balance=$1, income=$2, expenses=$3, savings_usd=$4, goal_savings=$5
       WHERE id=$6`,
      [balance, income, expenses, savings, goalSavings, req.params.id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error("User update error:", e);
    res.status(500).json({ error: "Не удалось сохранить данные" });
  }
});

// --- Сброс всех данных пользователя ---
app.post("/api/user/:id/reset", async (req, res) => {
  try {
    // Удаляем все транзакции
    await pool.query("DELETE FROM transactions WHERE user_id=$1", [req.params.id]);
    
    // Обнуляем балансы
    await pool.query(
      `UPDATE users
       SET balance=0, income=0, expenses=0, savings_usd=0
       WHERE id=$1`,
      [req.params.id]
    );
    
    res.json({ success: true });
  } catch (e) {
    console.error("Reset error:", e);
    res.status(500).json({ error: "Не удалось сбросить данные" });
  }
});

// --- Новая транзакция ---
app.post("/api/transactions", async (req, res) => {
  const { user_id, type, amount, description, category, converted_amount_usd } = req.body;

  try {
    const r = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, converted_amount_usd, description, category)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [user_id, type, amount, converted_amount_usd, description, category]
    );
    res.json(r.rows[0]);
  } catch (e) {
    console.error("TX insert error:", e);
    res.status(500).json({ error: "Ошибка сохранения транзакции" });
  }
});

// --- Удалить транзакцию ---
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM transactions WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    console.error("TX delete error:", e);
    res.status(500).json({ error: "Ошибка удаления транзакции" });
  }
});

// --- Получить транзакции пользователя ---
app.get("/api/transactions", async (req, res) => {
  const { user_id } = req.query;
  try {
    const r = await pool.query(
      "SELECT * FROM transactions WHERE user_id=$1 ORDER BY date DESC",
      [user_id]
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: "Ошибка получения транзакций" });
  }
});

// --- Helper: привести объект user к удобному формату ---
function convertUser(u) {
  return {
    id: u.id,
    email: u.email,
    first_name: u.first_name,
    balance: Number(u.balance),
    income: Number(u.income),
    expenses: Number(u.expenses),
    savings_usd: Number(u.savings_usd),
    goal_savings: Number(u.goal_savings),
  };
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
