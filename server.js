const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const users = {};
const SECRET = 'your-secret-key-change-in-production';

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (users[email]) return res.status(400).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  users[email] = { hash, data: { balance: 0, income: 0, expenses: 0, savings: 0, transactions: [] } };
  const token = jwt.sign({ email }, SECRET, { expiresIn: '30d' });
  res.json({ token });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users[email];
  if (!user || !(await bcrypt.compare(password, user.hash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ email }, SECRET, { expiresIn: '30d' });
  res.json({ token });
});

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const { email } = jwt.verify(token, SECRET);
    req.user = users[email];
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.get('/getData', auth, (req, res) => res.json(req.user.data));
app.post('/saveData', auth, (req, res) => {
  req.user.data = req.body;
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));