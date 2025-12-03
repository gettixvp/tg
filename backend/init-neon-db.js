// init-neon-db.js - Создание структуры таблиц в новой базе Neon
const { Pool } = require('pg');
require('dotenv').config();

// НОВАЯ БАЗА ДАННЫХ (Neon)
const NEW_DATABASE_URL = 'postgresql://neondb_owner:npg_HnsXeph1qi6g@ep-billowing-base-agrjulce-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: NEW_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDB() {
  try {
    console.log('🚀 Инициализация структуры БД в Neon...\n');

    // 1. Таблица пользователей
    console.log('📊 Создание таблицы users...');
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY NOT NULL,
      password_hash TEXT,
      first_name TEXT,
      balance NUMERIC DEFAULT 0,
      income NUMERIC DEFAULT 0,
      expenses NUMERIC DEFAULT 0,
      savings_usd NUMERIC DEFAULT 0,
      goal_savings NUMERIC DEFAULT 50000,
      currency TEXT DEFAULT 'BYN',
      goal_name TEXT DEFAULT 'Моя цель',
      initial_savings_amount NUMERIC DEFAULT 0,
      second_goal_name TEXT DEFAULT '',
      second_goal_amount NUMERIC DEFAULT 0,
      second_goal_savings NUMERIC DEFAULT 0,
      second_goal_initial_amount NUMERIC DEFAULT 0,
      budgets JSONB DEFAULT '{}'::jsonb
    );`);

    // Добавляем колонки, если их нет (для совместимости)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS savings_usd NUMERIC DEFAULT 0;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS goal_savings NUMERIC DEFAULT 50000;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS goal_name TEXT DEFAULT 'Моя цель';`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS initial_savings_amount NUMERIC DEFAULT 0;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS second_goal_name TEXT DEFAULT '';`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS second_goal_amount NUMERIC DEFAULT 0;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS second_goal_savings NUMERIC DEFAULT 0;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS second_goal_initial_amount NUMERIC DEFAULT 0;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS budgets JSONB DEFAULT '{}'::jsonb;`);

    console.log('✅ Таблица users создана\n');

    // 2. Таблица транзакций
    console.log('📊 Создание таблицы transactions...');
    const tableCheck = await pool.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions');`
    );

    if (tableCheck.rows[0].exists) {
      console.log('   Таблица transactions уже существует, проверяем структуру...');
      
      // Проверяем наличие столбца user_email
      const columnCheck = await pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_email';`
      );

      if (columnCheck.rowCount === 0) {
        console.log('   Миграция таблицы transactions...');
        await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_email TEXT;`);
        await pool.query(
          `DO $$ BEGIN ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey; EXCEPTION WHEN undefined_object THEN NULL; END $$;`
        );
        await pool.query(`DELETE FROM transactions WHERE user_email IS NULL;`);
        await pool.query(
          `ALTER TABLE transactions ADD CONSTRAINT transactions_user_email_fkey FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE;`
        );
        console.log('   Миграция завершена');
      }

      // Проверяем тип id
      const idTypeCheck = await pool.query(
        `SELECT data_type FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'id';`
      );

      if (idTypeCheck.rows[0] && idTypeCheck.rows[0].data_type !== 'bigint') {
        console.log('   Изменение типа id на BIGINT...');
        await pool.query(`ALTER TABLE transactions ALTER COLUMN id TYPE BIGINT USING id::bigint;`);
        await pool.query(
          `DO $$ DECLARE seq_name TEXT; BEGIN SELECT pg_get_serial_sequence('transactions', 'id') INTO seq_name; IF seq_name IS NOT NULL THEN EXECUTE 'DROP SEQUENCE IF EXISTS ' || seq_name; EXECUTE 'CREATE SEQUENCE ' || seq_name || ' AS BIGINT OWNED BY transactions.id'; EXECUTE 'ALTER TABLE transactions ALTER COLUMN id SET DEFAULT nextval(''' || seq_name || '''::regclass)'; END IF; END $$;`
        );
        console.log('   Тип id изменён на BIGINT');
      }
    } else {
      // Таблица создаётся впервые
      await pool.query(`CREATE TABLE transactions (
        id BIGSERIAL PRIMARY KEY,
        user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        converted_amount_usd NUMERIC,
        description TEXT,
        category TEXT,
        date TIMESTAMP DEFAULT NOW(),
        created_by_telegram_id BIGINT,
        created_by_name TEXT,
        telegram_photo_url TEXT,
        savings_goal TEXT DEFAULT 'main'
      );`);
      console.log('✅ Таблица transactions создана\n');
    }

    // Добавляем дополнительные колонки
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS converted_amount_usd NUMERIC;`);
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by_telegram_id BIGINT;`);
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by_name TEXT;`);
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS telegram_photo_url TEXT;`);
    await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS savings_goal TEXT DEFAULT 'main';`);

    // 3. Таблица связанных Telegram пользователей
    console.log('📊 Создание таблицы linked_telegram_users...');
    await pool.query(`CREATE TABLE IF NOT EXISTS linked_telegram_users (
      id SERIAL PRIMARY KEY,
      user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      telegram_id BIGINT NOT NULL,
      telegram_name TEXT,
      linked_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_email, telegram_id)
    );`);

    await pool.query(`ALTER TABLE linked_telegram_users ADD COLUMN IF NOT EXISTS telegram_photo_url TEXT;`);
    console.log('✅ Таблица linked_telegram_users создана\n');

    // 4. Таблица комментариев к транзакциям
    console.log('📊 Создание таблицы transaction_comments...');
    await pool.query(`CREATE TABLE IF NOT EXISTS transaction_comments (
      id BIGSERIAL PRIMARY KEY,
      transaction_id BIGINT NOT NULL,
      author TEXT NOT NULL,
      text TEXT NOT NULL,
      date TIMESTAMP DEFAULT NOW(),
      telegram_id BIGINT
    );`);
    console.log('✅ Таблица transaction_comments создана\n');

    // 5. Таблица долгов (debts)
    console.log('📊 Создание таблицы debts...');
    await pool.query(`CREATE TABLE IF NOT EXISTS debts (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255) NOT NULL,
      type VARCHAR(10) NOT NULL,
      person VARCHAR(255) NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );`);
    console.log('✅ Таблица debts создана\n');

    // 6. Таблица связанных пользователей по email (linked_users)
    console.log('📊 Создание таблицы linked_users...');
    await pool.query(`CREATE TABLE IF NOT EXISTS linked_users (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255) NOT NULL,
      linked_email VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_email, linked_email)
    );`);
    console.log('✅ Таблица linked_users создана\n');

    // 7. Таблица связей по Telegram ID (telegram_links)
    console.log('📊 Создание таблицы telegram_links...');
    await pool.query(`CREATE TABLE IF NOT EXISTS telegram_links (
      id SERIAL PRIMARY KEY,
      telegram_id VARCHAR(50) NOT NULL,
      linked_telegram_id VARCHAR(50) NOT NULL,
      user_name VARCHAR(255),
      linked_email VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(telegram_id, linked_telegram_id)
    );`);
    
    // Добавляем колонку linked_email если её нет (для существующих таблиц)
    await pool.query(`
      ALTER TABLE telegram_links 
      ADD COLUMN IF NOT EXISTS linked_email VARCHAR(255)
    `).catch(() => {
      // Игнорируем ошибку если колонка уже существует
    });
    console.log('✅ Таблица telegram_links создана\n');

    // 8. Создаем индексы для оптимизации
    console.log('📊 Создание индексов...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_email ON transactions(user_email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_transaction_comments_transaction_id ON transaction_comments(transaction_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_linked_users_email ON linked_telegram_users(user_email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_debts_user_email ON debts(user_email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_linked_users_email ON linked_users(user_email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_telegram_links_id ON telegram_links(telegram_id);`);
    console.log('✅ Индексы созданы\n');

    console.log('✅ Структура БД успешно создана в Neon!');
    console.log('\n📋 Созданные таблицы:');
    console.log('   - users');
    console.log('   - transactions');
    console.log('   - linked_telegram_users');
    console.log('   - transaction_comments');
    console.log('   - debts');
    console.log('   - linked_users');
    console.log('   - telegram_links');
    console.log('\n⚠️  Следующие шаги:');
    console.log('   1. Обновите DATABASE_URL в Render (Environment Variables)');
    console.log('      Новый URL: postgresql://neondb_owner:npg_HnsXeph1qi6g@ep-billowing-base-agrjulce-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
    console.log('   2. Перезапустите backend сервис на Render');
    console.log('   3. Протестируйте приложение');

  } catch (error) {
    console.error('❌ Ошибка инициализации БД:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Запуск инициализации
initDB().catch(error => {
  console.error('\n❌ Критическая ошибка:', error);
  process.exit(1);
});

