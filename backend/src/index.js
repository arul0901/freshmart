const express = require('express');
const cors = require('cors');
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

app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/flash-deals', require('./routes/flash-deals'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/ai', require('./routes/ai'));

app.get('/', (req, res) => res.json({ message: 'FreshMart API v1.0', status: 'running' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ FreshMart API running at http://localhost:${PORT}`));
