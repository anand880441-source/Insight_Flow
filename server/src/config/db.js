const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('⚠️ [MongoDB] MONGO_URI is not set. Please configure it in your Render environment variables.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ MongoDB connected: ' + conn.connection.host);
    return conn;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.warn('⚠️ [MongoDB] Ensure your MongoDB Atlas Network Access has 0.0.0.0/0 (Allow Access From Anywhere) enabled.');
    return null;
  }
};

module.exports = connectDB;
