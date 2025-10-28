const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // ← Исправлено: path.join

// In-memory storage (для теста)
const users = {};
const SECRET = process.env.SECRET || 'your-secret-key-change-in-production';

// === Регистрация ===
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (users[email]) return res.status(400).json({ error: 'User exists' });

    const hash = await bcrypt.hash(password, 10);
    users[email] = {
      hash,
      data: { balance: 0, income: 0, expenses: 0, savings: 0, transactions: [] }
    };

    const token = jwt.sign({ email }, SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// === Вход ===
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users[email];
    if (!user || !(await bcrypt.compare(password, user.hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ email }, SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// === Middleware авторизации ===
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const { email } = jwt.verify(token, SECRET);
    req.user = users[email];
    if (!req.user) return res.status(401).json({ error: 'Invalid token' });
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// === Получить данные ===
app.get('/getData', auth, (req, res) => {
  res.json(req.user.data);
});

// === Сохранить данные ===
app.post('/saveData', auth, (req, res) => {
  req.user.data = req.body;
  res.json({ success: true });
});

// === SPA: отдаём index.html для всех маршрутов ===
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === Запуск сервера ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open: https://your-app.onrender.com`);
});