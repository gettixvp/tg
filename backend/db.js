// db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  try {
    console.log("Инициализация БД...");

    // 1. Таблица пользователей — email как PRIMARY KEY
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY NOT NULL,
        password_hash TEXT,
        first_name TEXT,
        balance NUMERIC DEFAULT 0,
        income NUMERIC DEFAULT 0,
        expenses NUMERIC DEFAULT 0,
        savings_usd NUMERIC DEFAULT 0,
        goal_savings NUMERIC DEFAULT 0,
        currency TEXT DEFAULT 'BYN'
      );
    `);

    // Добавляем недостающие столбцы (если БД старая)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS savings_usd NUMERIC DEFAULT 0;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS goal_savings NUMERIC DEFAULT 0;`);

    // 2. Таблица транзакций — user_email вместо user_id
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        converted_amount_usd NUMERIC,
        description TEXT,
        category TEXT,
        date TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS converted_amount_usd NUMERIC;`);

    console.log("БД готова: email — уникальный ключ");
  } catch (error) {
    console.error("Ошибка инициализации БД:", error);
  }
}

initDB();
module.exports = pool;
