require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Feedback = require('../models/Feedback');
const { parseCSVBuffer } = require('../services/csvService');

(async () => {
  try {
    await connectDB();

    const csvPath = path.join(__dirname, '..', '..', 'data', 'dataset.csv');
    if (!fs.existsSync(csvPath)) {
      console.error('Place your CSV at server/data/dataset.csv');
      process.exit(1);
    }

    const buffer = fs.readFileSync(csvPath);
    const rows = await parseCSVBuffer(buffer);

    const docs = rows
      .filter(r => r.review && r.review.trim())
      .map(r => ({
        text: r.review.trim(),
        category: r.category ? r.category.trim() : 'Uncategorized',
        source: 'csv',
      }));

    await Feedback.deleteMany({});
    const inserted = await Feedback.insertMany(docs, { ordered: false });
    console.log('Seeded ' + inserted.length + ' feedback entries');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
