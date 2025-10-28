const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Для Render
});

// Инициализация таблицы (один раз)
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    balance NUMERIC DEFAULT 0,
    income NUMERIC DEFAULT 0,
    expenses NUMERIC DEFAULT 0,
    savings NUMERIC DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'RUB',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT,
    category VARCHAR(100),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).then(() => console.log('Таблица users и transactions создана/проверена'))
  .catch(err => console.error('Ошибка БД:', err));

module.exports = pool;