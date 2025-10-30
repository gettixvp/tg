const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const pool = require('./db');

// Инициализация Express
const app = express();

app.use(cors({
  origin: ['https://web.telegram.org', 'https://*.onrender.com', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Тестовый роут
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Finance Backend API работает!',
    endpoints: ['POST /api/auth', 'GET /api/user/:email', 'PUT /api/user/:id', 'POST /api/transactions']
  });
});

// Аутентификация
app.post('/api/auth', async (req, res) => {
  const { email, password, first_name, currency, token } = req.body;
  if (!email || (!password && !token) || !first_name) {
    return res.status(400).json({ error: 'email, password/token, first_name обязательны' });
  }

  try {
    let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      const hash = await bcrypt.hash(password, 10);
      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, first_name, currency) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, hash, first_name, currency || 'RUB']
      );
      user = { rows: [newUser.rows[0]] };
    } else {
      const valid = token 
        ? user.rows[0].password_hash === token
        : await bcrypt.compare(password, user.rows[0].password_hash);
      if (!valid) return res.status(401).json({ error: 'Неверный пароль' });
    }

    const transactions = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
      [user.rows[0].id]
    );

    res.json({
      user: user.rows[0],
      transactions: transactions.rows
    });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Серверная ошибка' });
  }
});

// Получение пользователя
app.get('/api/user/:email', async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [req.params.email]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user.rows[0]);
  } catch (err) {
    console.error('User GET error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Обновление пользователя
app.put('/api/user/:id', async (req, res) => {
  const { balance, income, expenses, savings, currency, goalSavings } = req.body;
  try {
    await pool.query(
      'UPDATE users SET balance = $1, income = $2, expenses = $3, savings = $4, currency = $5, goal_savings = $6 WHERE id = $7',
      [balance, income, expenses, savings, currency, goalSavings, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('User PUT error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Сохранение транзакции
app.post('/api/transactions', async (req, res) => {
  const { user_id, type, amount, description, category } = req.body;
  try {
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, description, category) VALUES ($1, $2, $3, $4, $5)',
      [user_id, type, amount, description, category]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Tx POST error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Получение транзакций
app.get('/api/transactions', async (req, res) => {
  const { user_id } = req.query;
  try {
    const transactions = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
      [user_id]
    );
    res.json(transactions.rows);
  } catch (err) {
    console.error('Tx GET error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});