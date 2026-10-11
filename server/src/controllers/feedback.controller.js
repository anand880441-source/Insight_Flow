const Feedback = require('../models/Feedback');
const { parseCSVBuffer } = require('../services/csvService');

// POST /api/feedback
exports.createFeedback = async (req, res, next) => {
  try {
    const { text, category, source } = req.body;
    if (!text) return res.status(400).json({ message: 'text is required' });
    const doc = await Feedback.create({ text, category, source: source || 'manual' });
    res.status(201).json(doc);
  } catch (err) { next(err); }
};

// GET /api/feedback?search=&category=&sentiment=&page=&limit=&ids=a,b,c
exports.listFeedback = async (req, res, next) => {
  try {
    const { search, category, sentiment, page = 1, limit = 20, ids } = req.query;
    const q = {};
    if (search) q.$text = { $search: search };
    if (category) q.category = category;
    if (sentiment) q.sentiment = sentiment;

    // Filter by explicit list of ids (used by issue detail view)
    if (ids) {
      const list = String(ids)
        .split(',')
        .map(s => s.trim())
        .filter(s => /^[a-f0-9]{24}$/i.test(s));
      if (list.length) q._id = { $in: list };
      else return res.json({ items: [], total: 0, page: 1, pages: 0 });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Feedback.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Feedback.countDocuments(q),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 0 });
  } catch (err) { next(err); }
};

// GET /api/feedback/:id
exports.getFeedback = async (req, res, next) => {
  try {
    const doc = await Feedback.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { next(err); }
};

// DELETE /api/feedback/:id
exports.deleteFeedback = async (req, res, next) => {
  try {
    const doc = await Feedback.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) { next(err); }
};

// POST /api/feedback/import (multipart form-data: file)
exports.importCSV = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'CSV file required' });
    const rows = await parseCSVBuffer(req.file.buffer);
    const docs = rows
      .filter(r => r.review && r.review.trim())
      .map(r => ({
        text: r.review.trim(),
        category: r.category ? r.category.trim() : 'Uncategorized',
        source: 'csv',
      }));

    const inserted = await Feedback.insertMany(docs, { ordered: false });
    res.status(201).json({ inserted: inserted.length });
  } catch (err) { next(err); }
};
