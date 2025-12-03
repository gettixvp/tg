// check-neon-db.js - Проверка структуры БД в Neon
const { Pool } = require('pg');

const NEW_DATABASE_URL = 'postgresql://neondb_owner:npg_HnsXeph1qi6g@ep-billowing-base-agrjulce-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: NEW_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDB() {
  try {
    console.log('🔍 Проверка структуры БД в Neon...\n');

    // Проверяем таблицы
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('📊 Найденные таблицы:');
    tables.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });

    // Проверяем структуру каждой таблицы
    console.log('\n📋 Структура таблиц:\n');

    for (const table of tables.rows) {
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [table.table_name]);

      console.log(`📌 ${table.table_name}:`);
      columns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      });
      console.log('');
    }

    // Проверяем индексы
    const indexes = await pool.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `);

    console.log('📊 Индексы:');
    indexes.rows.forEach(idx => {
      console.log(`   ✅ ${idx.indexname} на ${idx.tablename}`);
    });

    console.log('\n✅ Проверка завершена! БД готова к использованию.');

  } catch (error) {
    console.error('❌ Ошибка проверки:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

checkDB().catch(error => {
  console.error('\n❌ Критическая ошибка:', error);
  process.exit(1);
});

