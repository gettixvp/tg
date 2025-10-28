const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// === Проверка файлов ===
const publicPath = path.join(__dirname, 'public');
const indexPath = path.join(publicPath, 'index.html');

if (!fs.existsSync(publicPath)) {
  console.error('ERROR: "public" folder not found!');
  process.exit(1);
}
if (!fs.existsSync(indexPath)) {
  console.error('ERROR: public/index.html not found!');
  process.exit(1);
<<<<<<< HEAD
=======
} else {
  console.log('✓ public/index.html found');
>>>>>>> 51d27fb259ba0a99c71ef953b9b00fa50f4b1a11
}
console.log('✓ public/index.html found - server starting...');

app.use(express.static(publicPath));

<<<<<<< HEAD
// === Хранилище ===
const users = {};
const SECRET = process.env.SECRET || 'render-secret-2025';
=======
const users = {};
const SECRET = process.env.SECRET || 'secret-2025';
>>>>>>> 51d27fb259ba0a99c71ef953b9b00fa50f4b1a11

// === API ===
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Required' });
    if (users[email]) return res.status(400).json({ error: 'Exists' });
    const hash = await bcrypt.hash(password, 10);
    users[email] = { hash, data: { balance: 0, income: 0, expenses: 0, savings: 0, transactions: [] } };
    const token = jwt.sign({ email }, SECRET, { expiresIn: '30d' });
    res.json({ token });
<<<<<<< HEAD
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error' });
  }
=======
  } catch (err) { res.status(500).json({ error: 'Error' }); }
>>>>>>> 51d27fb259ba0a99c71ef953b9b00fa50f4b1a11
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users[email];
    if (!user || !(await bcrypt.compare(password, user.hash))) return res.status(401).json({ error: 'Invalid' });
    const token = jwt.sign({ email }, SECRET, { expiresIn: '30d' });
    res.json({ token });
<<<<<<< HEAD
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error' });
  }
=======
  } catch (err) { res.status(500).json({ error: 'Error' }); }
>>>>>>> 51d27fb259ba0a99c71ef953b9b00fa50f4b1a11
});

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const { email } = jwt.verify(token, SECRET);
    req.user = users[email];
    if (!req.user) return res.status(401).json({ error: 'Invalid' });
    next();
<<<<<<< HEAD
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
=======
  } catch { res.status(401).json({ error: 'Unauthorized' }); }
>>>>>>> 51d27fb259ba0a99c71ef953b9b00fa50f4b1a11
};

app.get('/getData', auth, (req, res) => res.json(req.user.data));
app.post('/saveData', auth, (req, res) => { req.user.data = req.body; res.json({ success: true }); });

app.get('*', (req, res) => res.sendFile(indexPath));
<<<<<<< HEAD

// === Запуск с keep-alive ===
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
  console.log(`🌍 OPEN: https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost:' + PORT}`);
});

// === KEEP-ALIVE: пинг каждые 5 минут ===
setInterval(() => {
  console.log('Keep-alive ping...');
  // Пустой запрос, чтобы Render не "усыпал" сервис
}, 5 * 60 * 1000);
=======

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server on port ${PORT}`));
>>>>>>> 51d27fb259ba0a99c71ef953b9b00fa50f4b1a11
