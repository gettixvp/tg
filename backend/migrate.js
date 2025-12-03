// migrate.js - Скрипт для миграции данных между базами данных
const { Pool } = require('pg');
require('dotenv').config();

// Проверяем наличие переменных окружения
if (!process.env.OLD_DATABASE_URL || !process.env.NEW_DATABASE_URL) {
  console.error('❌ Ошибка: Необходимо установить переменные окружения:');
  console.error('   OLD_DATABASE_URL - URL старой базы данных (Render)');
  console.error('   NEW_DATABASE_URL - URL новой базы данных');
  console.error('\nПример использования:');
  console.error('   OLD_DATABASE_URL="postgres://..." NEW_DATABASE_URL="postgres://..." node migrate.js');
  process.exit(1);
}

const sourcePool = new Pool({
  connectionString: process.env.OLD_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const targetPool = new Pool({
  connectionString: process.env.NEW_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkConnection(pool, name) {
  try {
    await pool.query('SELECT 1');
    console.log(`✅ Подключение к ${name} успешно`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка подключения к ${name}:`, error.message);
    return false;
  }
}

async function migrateTable(pool, tableName, query) {
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error(`⚠️  Ошибка при чтении таблицы ${tableName}:`, error.message);
    return [];
  }
}

async function insertUsers(targetPool, users) {
  if (users.length === 0) return 0;
  
  let inserted = 0;
  for (const user of users) {
    try {
      await targetPool.query(`
        INSERT INTO users (
          email, password_hash, first_name, balance, income, expenses, 
          savings_usd, goal_savings, currency, goal_name, initial_savings_amount,
          second_goal_name, second_goal_amount, second_goal_savings, 
          second_goal_initial_amount, budgets
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          first_name = EXCLUDED.first_name,
          balance = EXCLUDED.balance,
          income = EXCLUDED.income,
          expenses = EXCLUDED.expenses,
          savings_usd = EXCLUDED.savings_usd,
          goal_savings = EXCLUDED.goal_savings,
          currency = EXCLUDED.currency,
          goal_name = COALESCE(EXCLUDED.goal_name, users.goal_name),
          initial_savings_amount = COALESCE(EXCLUDED.initial_savings_amount, users.initial_savings_amount),
          second_goal_name = COALESCE(EXCLUDED.second_goal_name, users.second_goal_name),
          second_goal_amount = COALESCE(EXCLUDED.second_goal_amount, users.second_goal_amount),
          second_goal_savings = COALESCE(EXCLUDED.second_goal_savings, users.second_goal_savings),
          second_goal_initial_amount = COALESCE(EXCLUDED.second_goal_initial_amount, users.second_goal_initial_amount),
          budgets = COALESCE(EXCLUDED.budgets, users.budgets)
      `, [
        user.email,
        user.password_hash,
        user.first_name,
        user.balance,
        user.income,
        user.expenses,
        user.savings_usd || 0,
        user.goal_savings || 50000,
        user.currency || 'BYN',
        user.goal_name || 'Моя цель',
        user.initial_savings_amount || 0,
        user.second_goal_name || '',
        user.second_goal_amount || 0,
        user.second_goal_savings || 0,
        user.second_goal_initial_amount || 0,
        user.budgets || '{}'
      ]);
      inserted++;
    } catch (error) {
      console.error(`⚠️  Ошибка при вставке пользователя ${user.email}:`, error.message);
    }
  }
  return inserted;
}

async function insertTransactions(targetPool, transactions) {
  if (transactions.length === 0) return 0;
  
  let inserted = 0;
  for (const tx of transactions) {
    try {
      await targetPool.query(`
        INSERT INTO transactions (
          id, user_email, type, amount, converted_amount_usd, description, 
          category, date, created_by_telegram_id, created_by_name, 
          telegram_photo_url, savings_goal
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          user_email = EXCLUDED.user_email,
          type = EXCLUDED.type,
          amount = EXCLUDED.amount,
          converted_amount_usd = EXCLUDED.converted_amount_usd,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          date = EXCLUDED.date,
          created_by_telegram_id = EXCLUDED.created_by_telegram_id,
          created_by_name = EXCLUDED.created_by_name,
          telegram_photo_url = EXCLUDED.telegram_photo_url,
          savings_goal = EXCLUDED.savings_goal
      `, [
        tx.id,
        tx.user_email,
        tx.type,
        tx.amount,
        tx.converted_amount_usd,
        tx.description,
        tx.category,
        tx.date,
        tx.created_by_telegram_id,
        tx.created_by_name,
        tx.telegram_photo_url,
        tx.savings_goal || 'main'
      ]);
      inserted++;
    } catch (error) {
      console.error(`⚠️  Ошибка при вставке транзакции ${tx.id}:`, error.message);
    }
  }
  return inserted;
}

async function insertLinkedUsers(targetPool, linkedUsers) {
  if (linkedUsers.length === 0) return 0;
  
  let inserted = 0;
  for (const linked of linkedUsers) {
    try {
      await targetPool.query(`
        INSERT INTO linked_telegram_users (
          id, user_email, telegram_id, telegram_name, linked_at, telegram_photo_url
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_email, telegram_id) DO UPDATE SET
          telegram_name = EXCLUDED.telegram_name,
          telegram_photo_url = EXCLUDED.telegram_photo_url
      `, [
        linked.id,
        linked.user_email,
        linked.telegram_id,
        linked.telegram_name,
        linked.linked_at,
        linked.telegram_photo_url
      ]);
      inserted++;
    } catch (error) {
      console.error(`⚠️  Ошибка при вставке связанного пользователя:`, error.message);
    }
  }
  return inserted;
}

async function insertComments(targetPool, comments) {
  if (comments.length === 0) return 0;
  
  let inserted = 0;
  for (const comment of comments) {
    try {
      await targetPool.query(`
        INSERT INTO transaction_comments (
          id, transaction_id, author, text, date, telegram_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          author = EXCLUDED.author,
          text = EXCLUDED.text,
          date = EXCLUDED.date,
          telegram_id = EXCLUDED.telegram_id
      `, [
        comment.id,
        comment.transaction_id,
        comment.author,
        comment.text,
        comment.date,
        comment.telegram_id
      ]);
      inserted++;
    } catch (error) {
      console.error(`⚠️  Ошибка при вставке комментария ${comment.id}:`, error.message);
    }
  }
  return inserted;
}

async function migrate() {
  console.log('🚀 Начинаем миграцию базы данных...\n');
  
  // Проверка подключений
  const sourceConnected = await checkConnection(sourcePool, 'старой БД (Render)');
  const targetConnected = await checkConnection(targetPool, 'новой БД');
  
  if (!sourceConnected || !targetConnected) {
    console.error('\n❌ Не удалось подключиться к базам данных. Проверьте URL.');
    process.exit(1);
  }
  
  console.log('\n📊 Экспорт данных из старой базы...\n');
  
  // Экспорт данных
  const users = await migrateTable(sourcePool, 'users', 'SELECT * FROM users');
  const transactions = await migrateTable(sourcePool, 'transactions', 'SELECT * FROM transactions ORDER BY id');
  const linkedUsers = await migrateTable(sourcePool, 'linked_telegram_users', 'SELECT * FROM linked_telegram_users');
  const comments = await migrateTable(sourcePool, 'transaction_comments', 'SELECT * FROM transaction_comments ORDER BY id');
  
  console.log(`📦 Найдено данных:`);
  console.log(`   - Пользователей: ${users.length}`);
  console.log(`   - Транзакций: ${transactions.length}`);
  console.log(`   - Связанных пользователей: ${linkedUsers.length}`);
  console.log(`   - Комментариев: ${comments.length}\n`);
  
  console.log('📥 Импорт данных в новую базу...\n');
  
  // Импорт данных
  const usersInserted = await insertUsers(targetPool, users);
  console.log(`✅ Пользователей импортировано: ${usersInserted}/${users.length}`);
  
  const transactionsInserted = await insertTransactions(targetPool, transactions);
  console.log(`✅ Транзакций импортировано: ${transactionsInserted}/${transactions.length}`);
  
  const linkedUsersInserted = await insertLinkedUsers(targetPool, linkedUsers);
  console.log(`✅ Связанных пользователей импортировано: ${linkedUsersInserted}/${linkedUsers.length}`);
  
  const commentsInserted = await insertComments(targetPool, comments);
  console.log(`✅ Комментариев импортировано: ${commentsInserted}/${comments.length}`);
  
  // Проверка данных в новой БД
  console.log('\n🔍 Проверка данных в новой базе...\n');
  
  const newUsersCount = await targetPool.query('SELECT COUNT(*) FROM users');
  const newTransactionsCount = await targetPool.query('SELECT COUNT(*) FROM transactions');
  const newLinkedUsersCount = await targetPool.query('SELECT COUNT(*) FROM linked_telegram_users');
  const newCommentsCount = await targetPool.query('SELECT COUNT(*) FROM transaction_comments');
  
  console.log(`📊 Данные в новой базе:`);
  console.log(`   - Пользователей: ${newUsersCount.rows[0].count}`);
  console.log(`   - Транзакций: ${newTransactionsCount.rows[0].count}`);
  console.log(`   - Связанных пользователей: ${newLinkedUsersCount.rows[0].count}`);
  console.log(`   - Комментариев: ${newCommentsCount.rows[0].count}`);
  
  console.log('\n✅ Миграция завершена успешно!');
  console.log('\n⚠️  Не забудьте:');
  console.log('   1. Обновить DATABASE_URL в Render (Environment Variables)');
  console.log('   2. Перезапустить backend сервис');
  console.log('   3. Протестировать приложение');
  console.log('   4. Не удалять старую базу сразу - оставьте на несколько дней для проверки');
  
  await sourcePool.end();
  await targetPool.end();
}

// Запуск миграции
migrate().catch(error => {
  console.error('\n❌ Критическая ошибка миграции:', error);
  process.exit(1);
});

