-- Создание таблицы для учета долгов
CREATE TABLE IF NOT EXISTS debts (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'owe' (я должен) или 'owed' (мне должны)
  person VARCHAR(255) NOT NULL, -- Кто должен / Кому должен
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);

-- Индекс для быстрого поиска по пользователю
CREATE INDEX IF NOT EXISTS idx_debts_user_email ON debts(user_email);
