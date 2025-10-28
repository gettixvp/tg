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
  console.error('ERROR: "public" folder not found!');
  process.exit(1);
}
if (!fs.existsSync(indexPath)) {
  console.error('ERROR: public/index.html not found!');
  process.exit(1);
} else {
  console.log('✓ public/index.html found');
}

app.use(express.static(publicPath));

const users = {};
const SECRET = process.env.SECRET || 'secret-2025';

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Required' });
    if (users[email]) return res.status(400).json({ error: 'Exists' });
    const hash = await bcrypt.hash(password, 10);
    users[email] = { hash, data: { balance: 0, income: 0, expenses: 0, savings: 0, transactions: [] } };
    const token = jwt.sign({ email }, SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) { res.status(500).json({ error: 'Error' }); }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users[email];
    if (!user || !(await bcrypt.compare(password, user.hash))) return res.status(401).json({ error: 'Invalid' });
    const token = jwt.sign({ email }, SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) { res.status(500).json({ error: 'Error' }); }
});

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const { email } = jwt.verify(token, SECRET);
    req.user = users[email];
    if (!req.user) return res.status(401).json({ error: 'Invalid' });
    next();
  } catch { res.status(401).json({ error: 'Unauthorized' }); }
};

app.get('/getData', auth, (req, res) => res.json(req.user.data));
app.post('/saveData', auth, (req, res) => { req.user.data = req.body; res.json({ success: true }); });

app.get('*', (req, res) => res.sendFile(indexPath));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server on port ${PORT}`));
