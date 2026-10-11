require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { connectDB, getLastMongoError } = require('./config/db');
const feedbackRoutes = require('./routes/feedback.routes');
const aiRoutes = require('./routes/ai.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const reportsRoutes = require('./routes/reports.routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

const rawOrigins = process.env.CORS_ORIGIN || '*';
const allowedOrigins = rawOrigins
  .split(',')
  .map(s => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*')) {
      return cb(null, true);
    }
    const cleanOrigin = origin.replace(/\/+$/, '');
    const isAllowed = allowedOrigins.some(ao => {
      if (ao === cleanOrigin) return true;
      if (ao.includes('vercel.app') && cleanOrigin.endsWith('.vercel.app')) return true;
      return false;
    });
    if (isAllowed) {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  const state = mongoose.connection.readyState;
  if (state !== 1 && state !== 2) {
    connectDB().catch(() => {});
  }
  res.json({
    status: 'ok',
    ts: Date.now(),
    db: state === 1 ? 'connected' : state === 2 ? 'connecting' : 'disconnected',
    hasMongoUri: Boolean(process.env.MONGO_URI),
    mongoError: getLastMongoError(),
  });
});

app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  connectDB();
});
