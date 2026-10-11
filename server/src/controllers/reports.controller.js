const Report = require('../models/Report');
const Feedback = require('../models/Feedback');
const Issue = require('../models/Issue');

/* Helper: build the Mongo match from report filters */
function buildMatch(filters = {}) {
  const m = {};
  if (filters.category) m.category = filters.category;
  if (filters.from || filters.to) {
    m.createdAt = {};
    if (filters.from) m.createdAt.$gte = new Date(filters.from + 'T00:00:00.000Z');
    if (filters.to)   m.createdAt.$lte = new Date(filters.to   + 'T23:59:59.999Z');
  }
  return m;
}

/* POST /api/reports
 * Body: { title, filters?: { category, from, to }, includeIssues?: bool }
 * Generates a snapshot and saves it.
 */
exports.createReport = async (req, res, next) => {
  try {
    const title = (req.body.title || '').trim();
    if (!title) return res.status(400).json({ message: 'title is required' });

    const filters = req.body.filters || {};
    const includeIssues = req.body.includeIssues !== false;

    const match = buildMatch(filters);

    const [total, pending, sentimentAgg, complaintsAgg] = await Promise.all([
      Feedback.countDocuments(match),
      Feedback.countDocuments({ ...match, sentiment: 'pending' }),
      Feedback.aggregate([
        { $match: match },
        { $group: { _id: '$sentiment', count: { $sum: 1 } } },
      ]),
      Feedback.aggregate([
        { $match: { ...match, 'complaints.0': { $exists: true } } },
        { $unwind: '$complaints' },
        { $group: { _id: '$complaints', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const sentiment = { positive: 0, neutral: 0, negative: 0, pending: 0 };
    sentimentAgg.forEach(s => { sentiment[s._id] = s.count; });

    const analyzed = sentiment.positive + sentiment.neutral + sentiment.negative;
    const negativityRate = analyzed ? sentiment.negative / analyzed : 0;

    let issues = [];
    if (includeIssues) {
      const raw = await Issue.find({}).sort({ priorityScore: -1 }).limit(20).lean();
      issues = raw.map(i => ({
        title: i.title,
        description: i.description || '',
        severity: i.severity,
        priorityScore: i.priorityScore,
        frequency: i.frequency,
        status: i.status,
        recommendation: i.recommendation || '',
        why: i.why || '',
      }));
    }

    const doc = await Report.create({
      title,
      filters: {
        category: filters.category || null,
        from: filters.from || null,
        to: filters.to || null,
      },
      summary: {
        total,
        analyzed,
        pending,
        sentiment,
        negativityRate,
        topComplaints: complaintsAgg.map(c => ({ complaint: c._id, count: c.count })),
      },
      issues,
    });

    res.status(201).json(doc);
  } catch (err) { next(err); }
};

/* GET /api/reports — list, newest first */
exports.listReports = async (req, res, next) => {
  try {
    const items = await Report.find({})
      .sort({ createdAt: -1 })
      .select('title createdAt summary.total summary.analyzed summary.negativityRate filters');
    res.json({ items });
  } catch (err) { next(err); }
};

/* GET /api/reports/:id */
exports.getReport = async (req, res, next) => {
  try {
    const doc = await Report.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Report not found' });
    res.json(doc);
  } catch (err) { next(err); }
};

/* DELETE /api/reports/:id */
exports.deleteReport = async (req, res, next) => {
  try {
    const doc = await Report.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) { next(err); }
};
