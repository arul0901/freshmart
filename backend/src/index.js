const express = require('express');
const cors = require('cors');
const authenticate = require('./middleware/authMiddleware');
const logger = require('./services/loggerService');
const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173', // Storefront dev
  'http://localhost:5174', // Admin dev
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Global Auth Middleware (Attaches user context for logging)
app.use(authenticate);

app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/password-reset', require('./routes/password-reset-fixed'));
app.use('/api/flash-deals', require('./routes/flash-deals'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/ai', require('./routes/ai'));

app.get('/', (req, res) => res.json({ message: 'FreshMart API v2.0', status: 'running' }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  logger.logError(req, err, {
    method: req.method,
    url: req.originalUrl,
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
  });
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ FreshMart API v2.0 running at http://localhost:${PORT}`));
