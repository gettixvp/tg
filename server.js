const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'finance-tracker-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection with better error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-tracker';

// In-memory storage as fallback if MongoDB is not available
let memoryStorage = {
  users: [],
  userData: new Map()
};

// Connect to MongoDB with timeout
const connectDB = async () => {
  try {
    if (!MONGODB_URI.includes('localhost')) {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    } else {
      console.log('Using in-memory storage (no MongoDB configured)');
    }
  } catch (error) {
    console.log('MongoDB connection failed, using in-memory storage:', error.message);
  }
};

connectDB();

// User Schema for MongoDB
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  income: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  savings: { type: Number, default: 0 },
  transactions: [{
    id: Number,
    type: String,
    amount: Number,
    description: String,
    category: String,
    date: String
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Helper function to get user model (MongoDB or memory)
const getUserModel = {
  async findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return await User.findOne(query);
    } else {
      return memoryStorage.users.find(user => user.email === query.email);
    }
  },

  async create(userData) {
    if (mongoose.connection.readyState === 1) {
      const user = new User(userData);
      return await user.save();
    } else {
      const user = { ...userData, _id: Date.now().toString() };
      memoryStorage.users.push(user);
      memoryStorage.userData.set(user._id, {
        balance: 0,
        income: 0,
        expenses: 0,
        savings: 0,
        transactions: []
      });
      return user;
    }
  },

  async findByIdAndUpdate(id, update, options) {
    if (mongoose.connection.readyState === 1) {
      return await User.findByIdAndUpdate(id, update, options);
    } else {
      const userData = memoryStorage.userData.get(id);
      if (userData && update) {
        Object.assign(userData, update);
      }
      return { _id: id, ...userData };
    }
  }
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      req.user = user;
    } else {
      // Memory storage
      const user = memoryStorage.users.find(u => u._id === decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      req.user = user;
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Finance Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Memory',
    timestamp: new Date().toISOString()
  });
});

// Register endpoint
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await getUserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await getUserModel.create({
      email,
      password: hashedPassword
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await getUserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user data
app.get('/getData', authenticateToken, async (req, res) => {
  try {
    let userData;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      userData = {
        balance: user.balance || 0,
        income: user.income || 0,
        expenses: user.expenses || 0,
        savings: user.savings || 0,
        transactions: user.transactions || []
      };
    } else {
      // Memory storage
      userData = memoryStorage.userData.get(req.user._id) || {
        balance: 0,
        income: 0,
        expenses: 0,
        savings: 0,
        transactions: []
      };
    }

    res.json(userData);
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save user data
app.post('/saveData', authenticateToken, async (req, res) => {
  try {
    const { balance, income, expenses, savings, transactions } = req.body;

    if (mongoose.connection.readyState === 1) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          balance: balance || 0,
          income: income || 0,
          expenses: expenses || 0,
          savings: savings || 0,
          transactions: transactions || []
        },
        { new: true }
      );
    } else {
      // Memory storage
      const userData = memoryStorage.userData.get(req.user._id) || {};
      memoryStorage.userData.set(req.user._id, {
        balance: balance || 0,
        income: income || 0,
        expenses: expenses || 0,
        savings: savings || 0,
        transactions: transactions || []
      });
    }

    res.json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Save data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});