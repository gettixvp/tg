-- Добавить поле wallet_key для поддержки нескольких кошельков
-- Безопасно для существующих данных: все старые транзакции получают wallet_key = 'main'

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS wallet_key TEXT NOT NULL DEFAULT 'main';

-- Необязательный индекс для ускорения выборок по кошельку
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_key
  ON transactions(wallet_key);
