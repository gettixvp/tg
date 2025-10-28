const cors = require('cors');

const allowedOrigins = [
  'https://web.telegram.org',
  'https://walletfront-*.onrender.com', // ваш фронтенд
  'http://localhost:5173', // для dev
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.match(o))) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked: ' + origin));
    }
  },
  credentials: true
}));