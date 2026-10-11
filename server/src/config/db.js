const mongoose = require('mongoose');
const dns = require('node:dns');

// Fix for Render / Linux cloud environments where local DNS fails to resolve MongoDB+SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if not permitted in environment
}

let lastMongoError = null;
let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (isConnecting) {
    return null;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    lastMongoError = 'MONGO_URI is not defined in environment variables';
    console.warn('⚠️ [MongoDB]', lastMongoError);
    return null;
  }

  isConnecting = true;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    lastMongoError = null;
    console.log('✅ MongoDB connected: ' + conn.connection.host);
    return conn;
  } catch (err) {
    lastMongoError = err.message;
    console.error('❌ MongoDB connection failed:', err.message);
    return null;
  } finally {
    isConnecting = false;
  }
};

const getLastMongoError = () => lastMongoError;

module.exports = {
  connectDB,
  getLastMongoError,
};
