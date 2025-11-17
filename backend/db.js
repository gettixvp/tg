// db.js
const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function initDB() {
  try {
    console.log("Инициализация БД...")

    // 1. Таблица пользователей
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY NOT NULL,
      password_hash TEXT,
      first_name TEXT,
      balance NUMERIC DEFAULT 0,
      income NUMERIC DEFAULT 0,
      expenses NUMERIC DEFAULT 0,
      savings_usd NUMERIC DEFAULT 0,
      goal_savings NUMERIC DEFAULT 50000,
      currency TEXT DEFAULT 'BYN'
    );`)

    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS savings_usd NUMERIC DEFAULT 0;`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS goal_savings NUMERIC DEFAULT 50000;`)

    // 2. Таблица транзакций
    const tableCheck = await pool.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions');`,
    )

    if (tableCheck.rows[0].exists) {
      // Таблица уже существует — проверяем наличие столбца user_email и миграция
      const columnCheck = await pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_email';`,
      )

      if (columnCheck.rowCount === 0) {
        console.log("Миграция таблицы transactions...")

        await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_email TEXT;`)

        // Удаляем старый FK (если был)
        await pool.query(
          `DO $$ BEGIN ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey; EXCEPTION WHEN undefined_object THEN NULL; END $$;`,
        )

        await pool.query(`DELETE FROM transactions WHERE user_email IS NULL;`)

        await pool.query(
          `ALTER TABLE transactions ADD CONSTRAINT transactions_user_email_fkey FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE;`,
        )

        console.log("Миграция завершена")
      }

      // Критическое исправление: меняем тип id на BIGINT (если ещё не сделано)
      const idTypeCheck = await pool.query(
        `SELECT data_type FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'id';`,
      )

      if (idTypeCheck.rows[0].data_type !== "bigint") {
        console.log("Миграция: изменение типа id на BIGINT...")
        await pool.query(`ALTER TABLE transactions ALTER COLUMN id TYPE BIGINT USING id::bigint;`)

        // Если была последовательность SERIAL, пересоздаём её как BIGSERIAL
        await pool.query(
          `DO $$ DECLARE seq_name TEXT; BEGIN SELECT pg_get_serial_sequence('transactions', 'id') INTO seq_name; IF seq_name IS NOT NULL THEN EXECUTE 'DROP SEQUENCE IF EXISTS ' || seq_name; EXECUTE 'CREATE SEQUENCE ' || seq_name || ' AS BIGINT OWNED BY transactions.id'; EXECUTE 'ALTER TABLE transactions ALTER COLUMN id SET DEFAULT nextval(''' || seq_name || '''::regclass)'; END IF; END $$;`,
        )

        console.log("Тип id изменён на BIGINT")
      }
    } else {
      // Таблица создаётся впервые — используем BIGSERIAL сразу
      await pool.query(`CREATE TABLE transactions (
        id BIGSERIAL PRIMARY KEY,
        user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        converted_amount_usd NUMERIC,
        description TEXT,
        category TEXT,
        date TIMESTAMP DEFAULT NOW()
      );`)
    }

    // Добавляем столбец, если его нет
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS converted_amount_usd NUMERIC;`)

    await pool.query(`CREATE TABLE IF NOT EXISTS linked_telegram_users (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      telegram_id BIGINT NOT NULL,
      telegram_name TEXT,
      linked_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_email, telegram_id)
    );`)

    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by_telegram_id BIGINT;`)
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by_name TEXT;`)

    console.log("БД готова!")
  } catch (error) {
    console.error("Ошибка инициализации БД:", error)
  }
}

initDB()

module.exports = pool
