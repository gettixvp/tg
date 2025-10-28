const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Регистрация/Вход (простой, без проверки email)
app.post('/api/auth', async (req, res) => {
  const { email, password, first_name } = req.body;
  try {
    let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      // Регистрация
      const hash = await bcrypt.hash(password, 10);
      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, first_name) VALUES ($1, $2, $3) RETURNING *',
        [email, hash, first_name]
      );
      user = { rows: [newUser.rows[0]] };
    } else {
      // Проверка пароля
      const valid = await bcrypt.compare(password, user.rows[0].password_hash);
      if (!valid) return res.status(401).json({ error: 'Неверный пароль' });
    }
    // Загружаем данные
    const transactions = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
      [user.rows[0].id]
    );
    res.json({
      user: user.rows[0],
      transactions: transactions.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получение/Обновление данных пользователя
app.get('/api/user/:email', async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [req.params.email]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/user/:id', async (req, res) => {
  const { balance, income, expenses, savings, currency } = req.body;
  try {
    await pool.query(
      'UPDATE users SET balance = $1, income = $2, expenses = $3, savings = $4, currency = $5 WHERE id = $6',
      [balance, income, expenses, savings, currency, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));