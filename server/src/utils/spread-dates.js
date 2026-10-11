require('dotenv').config();
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const col = mongoose.connection.collection('feedbacks');
  const docs = await col.find({}).project({ _id: 1 }).toArray();
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const ops = docs.map(d => {
    const daysAgo = Math.floor(Math.random() * 30);
    const jitter = Math.floor(Math.random() * DAY);
    const when = new Date(now - daysAgo * DAY - jitter);
    return { updateOne: { filter: { _id: d._id }, update: { $set: { createdAt: when } } } };
  });
  const res = await col.bulkWrite(ops, { ordered: false });
  console.log('Spread createdAt on', res.modifiedCount, 'docs');
  await mongoose.connection.close();
  process.exit(0);
})();
