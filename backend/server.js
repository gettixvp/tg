const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// === Проверка файлов ===
const publicDir = path.join(__dirname, 'public');
const indexFile = path.join(publicDir, 'index.html');

console.log('Проверка файлов...');
if (!fs.existsSync(publicDir)) {
  console.error('FATAL: Папка public не найдена!');
  process.exit(1);
}
if (!fs.existsSync(indexFile)) {
  console.error('FATAL: public/index.html не найден!');
  process.exit(1);
}
console.log('SUCCESS: public/index.html найден');

// Статические файлы
app.use(express.static(publicDir));

// === База данных в памяти ===
const users = {};
const SECRET = process.env.SECRET || 'render-finance-secret-2025';

// === Регистрация ===
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });
    if (users[email]) return res.status(400).json({ error: 'Пользователь существует' });

    const hash = await bcrypt.hash(password, 10);
    users[email] = {
      hash,
      data: { balance: 0, income: 0, expenses: 0, savings: 0, transactions: [] }
    };
    const token = jwt.sign({ email }, SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// === Логин ===
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users[email];
    if (!user || !(await bcrypt.compare(password, user.hash))) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const token = jwt.sign({ email }, SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// === Авторизация ===
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Нет токена' });

  const token = authHeader.split(' ')[1];
  try {
    const { email } = jwt.verify(token, SECRET);
    req.user = users[email];
    if (!req.user) return res.status(401).json({ error: 'Неверный токен' });
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Неавторизован' });
  }
};

// === API ===
app.get('/getData', authenticate, (req, res) => {
  res.json(req.user.data);
});

app.post('/saveData', authenticate, (req, res) => {
  req.user.data = req.body;
  res.json({ success: true });
});

// === SPA ===
app.get('*', (req, res) => {
  res.sendFile(indexFile);
});

// === ЗАПУСК СЕРВЕРА ===
const PORT = process.env.PORT;  // <-- ОБЯЗАТЕЛЬНО! Без || 3000

if (!PORT) {
  console.error('FATAL: process.env.PORT не установлен!');
  process.exit(1);
}

console.log(`Запуск сервера на порту ${PORT}...`);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SERVER LIVE ON PORT ${PORT}`);
  console.log(`URL: https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost'}`);
  console.log('Render должен увидеть порт и перейти в статус LIVE');
});

// === Keep-alive (на всякий случай) ===
setInterval(() => {
  console.log(`Keep-alive: ${new Date().toISOString()}`);
}, 300000); // каждые 5 минут