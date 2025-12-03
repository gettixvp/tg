# 🚀 Руководство по миграции базы данных с Render

## 📋 Шаг 1: Экспорт данных с Render

### Вариант A: Через pg_dump (рекомендуется)

1. **Получите DATABASE_URL из Render:**
   - Зайдите в ваш проект на Render
   - Откройте раздел "Databases" или "PostgreSQL"
   - Скопируйте "Internal Database URL" или "External Connection String"

2. **Установите PostgreSQL клиент** (если еще не установлен):
   ```bash
   # Windows (через Chocolatey)
   choco install postgresql
   
   # Или скачайте с https://www.postgresql.org/download/
   ```

3. **Экспортируйте базу данных:**
   ```bash
   # Замените YOUR_DATABASE_URL на ваш URL из Render
   pg_dump "YOUR_DATABASE_URL" > database_backup.sql
   
   # Или с более подробными опциями:
   pg_dump "YOUR_DATABASE_URL" --clean --if-exists --format=plain > database_backup.sql
   ```

### Вариант B: Через Render Dashboard

1. Зайдите в ваш PostgreSQL сервис на Render
2. Откройте вкладку "Connect"
3. Используйте встроенный терминал или подключитесь через psql
4. Выполните экспорт через pg_dump

---

## 🆓 Шаг 2: Выбор бесплатной платформы

### Рекомендуемые варианты:

#### 1. **Neon** (⭐ Рекомендуется)
- ✅ Полностью бесплатный тариф
- ✅ 0.5 GB хранилища
- ✅ Автоматические бэкапы
- ✅ Быстрое подключение
- 🔗 https://neon.tech

#### 2. **Supabase**
- ✅ Бесплатный тариф
- ✅ 500 MB хранилища
- ✅ Встроенный REST API
- 🔗 https://supabase.com

#### 3. **Railway**
- ✅ $5 бесплатных кредитов в месяц
- ✅ Простое развертывание
- 🔗 https://railway.app

#### 4. **ElephantSQL**
- ✅ Бесплатный тариф (20 MB)
- ✅ Простой интерфейс
- 🔗 https://www.elephantsql.com

---

## 📥 Шаг 3: Создание новой базы данных

### Для Neon:

1. Зарегистрируйтесь на https://neon.tech
2. Создайте новый проект
3. Создайте базу данных
4. Скопируйте Connection String (он будет выглядеть как `postgres://user:password@host/dbname`)

### Для Supabase:

1. Зарегистрируйтесь на https://supabase.com
2. Создайте новый проект
3. Перейдите в Settings → Database
4. Скопируйте Connection String

---

## 🔄 Шаг 4: Импорт данных

### Импорт через psql:

```bash
# Замените NEW_DATABASE_URL на URL новой базы данных
psql "NEW_DATABASE_URL" < database_backup.sql
```

### Или через pg_restore (если использовали custom format):

```bash
pg_restore -d "NEW_DATABASE_URL" database_backup.dump
```

### Проверка импорта:

```bash
# Подключитесь к новой базе
psql "NEW_DATABASE_URL"

# Проверьте таблицы
\dt

# Проверьте данные
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM transactions;
```

---

## ⚙️ Шаг 5: Обновление переменных окружения

### В Render:

1. Зайдите в ваш Backend сервис
2. Откройте "Environment"
3. Обновите `DATABASE_URL` на новый URL

### Или локально в `.env`:

```env
DATABASE_URL=postgres://user:password@new-host:5432/dbname
```

---

## 🔧 Шаг 6: Проверка работы

1. **Перезапустите backend:**
   ```bash
   # На Render это произойдет автоматически после изменения переменных
   ```

2. **Проверьте подключение:**
   - Откройте логи в Render
   - Убедитесь, что нет ошибок подключения к БД

3. **Протестируйте API:**
   - Попробуйте войти в приложение
   - Проверьте, что данные отображаются корректно

---

## 🛠️ Альтернативный способ: Прямая миграция через скрипт

Создайте файл `migrate.js` в папке `backend/`:

```javascript
// migrate.js
const { Pool } = require('pg');
require('dotenv').config();

const sourcePool = new Pool({
  connectionString: process.env.OLD_DATABASE_URL, // Старый URL из Render
  ssl: { rejectUnauthorized: false }
});

const targetPool = new Pool({
  connectionString: process.env.NEW_DATABASE_URL, // Новый URL
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('Начинаем миграцию...');
    
    // 1. Экспорт данных из старой БД
    const users = await sourcePool.query('SELECT * FROM users');
    const transactions = await sourcePool.query('SELECT * FROM transactions');
    const linkedUsers = await sourcePool.query('SELECT * FROM linked_telegram_users');
    const comments = await sourcePool.query('SELECT * FROM transaction_comments');
    
    // 2. Импорт в новую БД
    for (const user of users.rows) {
      await targetPool.query(`
        INSERT INTO users (email, password_hash, first_name, balance, income, expenses, savings_usd, goal_savings, currency)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          first_name = EXCLUDED.first_name,
          balance = EXCLUDED.balance,
          income = EXCLUDED.income,
          expenses = EXCLUDED.expenses,
          savings_usd = EXCLUDED.savings_usd,
          goal_savings = EXCLUDED.goal_savings,
          currency = EXCLUDED.currency
      `, [user.email, user.password_hash, user.first_name, user.balance, user.income, user.expenses, user.savings_usd, user.goal_savings, user.currency]);
    }
    
    for (const tx of transactions.rows) {
      await targetPool.query(`
        INSERT INTO transactions (id, user_email, type, amount, description, category, date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [tx.id, tx.user_email, tx.type, tx.amount, tx.description, tx.category, tx.date]);
    }
    
    // Аналогично для других таблиц...
    
    console.log('Миграция завершена успешно!');
    console.log(`Пользователей: ${users.rows.length}`);
    console.log(`Транзакций: ${transactions.rows.length}`);
    
  } catch (error) {
    console.error('Ошибка миграции:', error);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

migrate();
```

Запуск:
```bash
cd backend
node migrate.js
```

---

## ⚠️ Важные замечания

1. **Сделайте бэкап перед миграцией!**
2. **Проверьте все данные после миграции**
3. **Не удаляйте старую базу сразу** - оставьте на несколько дней для проверки
4. **Обновите все переменные окружения** в Render и локально

---

## 🆘 Решение проблем

### Ошибка подключения:
- Проверьте правильность Connection String
- Убедитесь, что SSL настроен правильно
- Проверьте firewall настройки новой платформы

### Ошибки при импорте:
- Убедитесь, что структура таблиц создана (запустите `initDB()`)
- Проверьте кодировку файла (должна быть UTF-8)

### Данные не отображаются:
- Проверьте логи backend
- Убедитесь, что DATABASE_URL обновлен
- Перезапустите сервис

---

## 📞 Полезные ссылки

- [Neon Documentation](https://neon.tech/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)

