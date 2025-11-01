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

    // 2. Проверяем существование таблицы transactions
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'transactions'
      );
    `);

    if (tableCheck.rows[0].exists) {
      // Таблица существует - проверяем структуру
      const columnCheck = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'user_email';
      `);

      if (columnCheck.rowCount === 0) {
        // Колонка user_email не существует - делаем миграцию
        console.log("Миграция таблицы transactions...");
        
        // Сначала добавляем новую колонку
        await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_email TEXT;`);
        
        // Если есть старая колонка user_id, копируем данные (если они связаны с email)
        const oldColumnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'transactions' AND column_name = 'user_id';
        `);
        
        if (oldColumnCheck.rowCount > 0) {
          // Пытаемся сопоставить старые ID с email (если возможно)
          console.log("Обнаружена старая колонка user_id, очищаем старые данные...");
          await pool.query(`DELETE FROM transactions WHERE user_email IS NULL;`);
        }
        
        // Удаляем старый внешний ключ если есть
        await pool.query(`
          DO $$ 
          BEGIN
            ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
          EXCEPTION
            WHEN undefined_object THEN NULL;
          END $$;
        `);
        
        // Делаем user_email NOT NULL только если есть данные
        const hasData = await pool.query(`SELECT COUNT(*) FROM transactions;`);
        if (hasData.rows[0].count === '0') {
          await pool.query(`ALTER TABLE transactions ALTER COLUMN user_email SET NOT NULL;`);
        }
        
        // Добавляем внешний ключ
        await pool.query(`
          ALTER TABLE transactions 
          ADD CONSTRAINT transactions_user_email_fkey 
          FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE;
        `);
        
        console.log("Миграция завершена");
      }
    } else {
      // Таблица не существует - создаём с правильной структурой
      await pool.query(`
        CREATE TABLE transactions (
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
    }

    // Добавляем converted_amount_usd если его нет
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS converted_amount_usd NUMERIC;`);

    console.log("БД готова: email — уникальный ключ");
  } catch (error) {
    console.error("Ошибка инициализации БД:", error);
  }
}

initDB();
module.exports = pool;
