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

    // Telegram accounts (auto-registration by telegram_id)
    await pool.query(`CREATE TABLE IF NOT EXISTS telegram_accounts (
      telegram_id BIGINT PRIMARY KEY,
      telegram_name TEXT,
      wallet_email TEXT,
      email TEXT,
      active_wallet_email TEXT,
      photo_url TEXT,
      last_seen_at TIMESTAMP,
      last_ip TEXT,
      last_user_agent TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );`)

    await pool.query(`ALTER TABLE telegram_accounts ADD COLUMN IF NOT EXISTS wallet_email TEXT;`)
    await pool.query(`ALTER TABLE telegram_accounts ADD COLUMN IF NOT EXISTS photo_url TEXT;`)
    await pool.query(`ALTER TABLE telegram_accounts ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP;`)
    await pool.query(`ALTER TABLE telegram_accounts ADD COLUMN IF NOT EXISTS last_ip TEXT;`)
    await pool.query(`ALTER TABLE telegram_accounts ADD COLUMN IF NOT EXISTS last_user_agent TEXT;`)

    // Wallet members (owner can block/remove members)
    await pool.query(`CREATE TABLE IF NOT EXISTS wallet_members (
      id SERIAL PRIMARY KEY,
      owner_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      member_telegram_id BIGINT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(owner_email, member_telegram_id)
    );`)

    // Single-use invite tokens
    await pool.query(`CREATE TABLE IF NOT EXISTS invite_tokens (
      token TEXT PRIMARY KEY,
      owner_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      created_by_telegram_id BIGINT,
      used_by_telegram_id BIGINT,
      used_at TIMESTAMP,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );`)

    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by_telegram_id BIGINT;`)
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by_name TEXT;`)
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS telegram_photo_url TEXT;`)

    // Добавляем колонку для отслеживания какая копилка была пополнена
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS savings_goal TEXT DEFAULT 'main';`)

    // Добавляем колонки для настроек копилки
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS goal_name TEXT DEFAULT 'Моя цель';`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS initial_savings_amount NUMERIC DEFAULT 0;`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS second_goal_name TEXT DEFAULT '';`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS second_goal_amount NUMERIC DEFAULT 0;`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS second_goal_savings NUMERIC DEFAULT 0;`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS second_goal_initial_amount NUMERIC DEFAULT 0;`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS third_goal_name TEXT DEFAULT '';`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS third_goal_amount NUMERIC DEFAULT 0;`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS third_goal_savings NUMERIC DEFAULT 0;`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS third_goal_initial_amount NUMERIC DEFAULT 0;`)

    // Настройки виджета "Общий баланс"
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_widget_title TEXT DEFAULT 'Общий баланс';`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_widget_emoji TEXT DEFAULT '💳';`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_widget_gradient TEXT DEFAULT 'default';`)
    
    // Добавляем колонку для бюджетов (JSON)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS budgets JSONB DEFAULT '{}'::jsonb;`)

    // Таблица комментариев к транзакциям
    await pool.query(`CREATE TABLE IF NOT EXISTS transaction_comments (
      id BIGSERIAL PRIMARY KEY,
      transaction_id BIGINT NOT NULL,
      author TEXT NOT NULL,
      text TEXT NOT NULL,
      date TIMESTAMP DEFAULT NOW(),
      telegram_id BIGINT
    );`)

    await pool.query(`CREATE TABLE IF NOT EXISTS transaction_likes (
      id BIGSERIAL PRIMARY KEY,
      wallet_email TEXT NOT NULL,
      transaction_id BIGINT NOT NULL,
      liker_key TEXT NOT NULL,
      liked_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(wallet_email, transaction_id, liker_key)
    );`)

    // Добавляем telegram_photo_url в linked_telegram_users
    await pool.query(`ALTER TABLE linked_telegram_users ADD COLUMN IF NOT EXISTS telegram_photo_url TEXT;`)

    // Создаем индексы для оптимизации запросов
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_email ON transactions(user_email);`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transaction_comments_transaction_id ON transaction_comments(transaction_id);`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_linked_users_email ON linked_telegram_users(user_email);`)

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transaction_likes_wallet_email ON transaction_likes(wallet_email);`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transaction_likes_tx_id ON transaction_likes(transaction_id);`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transaction_likes_liker_key ON transaction_likes(liker_key);`)

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_telegram_accounts_email ON telegram_accounts(email);`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_telegram_accounts_wallet_email ON telegram_accounts(wallet_email);`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_telegram_accounts_active_wallet ON telegram_accounts(active_wallet_email);`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_wallet_members_owner ON wallet_members(owner_email);`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_wallet_members_member ON wallet_members(member_telegram_id);`)

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_invite_tokens_owner ON invite_tokens(owner_email);`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_invite_tokens_used_at ON invite_tokens(used_at);`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_invite_tokens_expires_at ON invite_tokens(expires_at);`)

    console.log("БД готова!")
  } catch (error) {
    console.error("Ошибка инициализации БД:", error)
  }
}

initDB()

module.exports = pool
