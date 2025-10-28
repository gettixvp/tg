const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const publicPath = path.join(__dirname, 'public');
const indexPath = path.join(publicPath, 'index.html');

if (!fs.existsSync(publicPath)) {
  console.error('ОШИБКА: Папка "public" не найдена! Проверьте репозиторий.');
  process.exit(1);
}
if (!fs.existsSync(indexPath)) {
  console.error('ОШИБКА: public/index.html не найден! Загрузите файл.');
  process.exit(1);
} else {
  console.log('✓ public/index.html найден');
}

app.use(express.static(publicPath));

// API routes (регистрация, вход, данные)
const users = {};
const SECRET = process.env.SECRET || 'super-secret-2025';

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email и пароль обязательны' });
    if (users[email]) return res.status(400).json({ error: 'Пользователь существует' });
    const hash = await bcrypt.hash(password, 10);
    users[email] = { hash, data: { balance: 0, income: 0, expenses: 0, savings: 0, transactions: [] } };
    const token = jwt.sign({ email }, SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users[email];
    if (!user || !(await bcrypt.compare(password, user.hash))) {
      return res.status(401).json({ error: 'Неверные данные' });
    }
    const token = jwt.sign({ email }, SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Нет токена' });
  try {
    const { email } = jwt.verify(token, SECRET);
    req.user = users[email];
    if (!req.user) return res.status(401).json({ error: 'Неверный токен' });
    next();
  } catch (err) { res.status(401).json({ error: 'Unauthorized' }); }
};

app.get('/getData', auth, (req, res) => res.json(req.user.data));
app.post('/saveData', auth, (req, res) => {
  req.user.data = req.body;
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});