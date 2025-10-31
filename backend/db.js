// db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // для Render и других хостингов
});

async function initDB() {
  // Создаём таблицу пользователей
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      first_name TEXT,
      balance NUMERIC DEFAULT 0,      -- общий баланс (BYN)
      income NUMERIC DEFAULT 0,       -- доходы (BYN)
      expenses NUMERIC DEFAULT 0,     -- расходы (BYN)
      savings_usd NUMERIC DEFAULT 0,  -- накопления (USD)
      goal_savings NUMERIC DEFAULT 0, -- цель накоплений (USD)
      currency TEXT DEFAULT 'BYN'
    );
  `);

  // Таблица транзакций
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,                -- income | expense | savings
      amount NUMERIC NOT NULL,           -- сумма в BYN (основная)
      converted_amount_usd NUMERIC,      -- если savings → сколько получилось в USD
      description TEXT,
      category TEXT,
      date TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("✅ DB initialized");
}

initDB();
module.exports = pool;
