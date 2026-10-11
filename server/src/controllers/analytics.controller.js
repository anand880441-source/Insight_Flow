const Feedback = require('../models/Feedback');

function buildMatch(query) {
  const match = {};
  if (query.category) match.category = query.category;
  if (query.from || query.to) {
    match.createdAt = {};
    if (query.from) match.createdAt.$gte = new Date(query.from + 'T00:00:00.000Z');
    if (query.to)   match.createdAt.$lte = new Date(query.to   + 'T23:59:59.999Z');
  }
  return match;
}

exports.overview = async (req, res, next) => {
  try {
    const match = buildMatch(req.query);
    const [total, pending, sentimentAgg, categoryAgg] = await Promise.all([
      Feedback.countDocuments(match),
      Feedback.countDocuments({ ...match, sentiment: 'pending' }),
      Feedback.aggregate([
        { $match: match },
        { $group: { _id: '$sentiment', count: { $sum: 1 } } },
      ]),
      Feedback.aggregate([
        { $match: match },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
    ]);
    const sentiment = { positive: 0, neutral: 0, negative: 0, pending: 0 };
    sentimentAgg.forEach(s => { sentiment[s._id] = s.count; });
    res.json({
      total,
      analyzed: total - pending,
      pending,
      sentiment,
      categories: categoryAgg.map(c => ({ category: c._id, count: c.count })),
    });
  } catch (err) { next(err); }
};

exports.trends = async (req, res, next) => {
  try {
    const days = Math.min(Number(req.query.days || 30), 180);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const match = { ...buildMatch(req.query), createdAt: { $gte: since } };
    const agg = await Feedback.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$sentimentScore' },
          positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $eq: ['$sentiment', 'neutral'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({
      days,
      series: agg.map(d => ({
        date: d._id,
        count: d.count,
        avgScore: Number((d.avgScore || 0).toFixed(2)),
        positive: d.positive,
        neutral: d.neutral,
        negative: d.negative,
      })),
    });
  } catch (err) { next(err); }
};

exports.topComplaints = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 10), 50);
    const match = buildMatch(req.query);
    const agg = await Feedback.aggregate([
      { $match: { ...match, 'complaints.0': { $exists: true } } },
      { $unwind: '$complaints' },
      { $group: { _id: '$complaints', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
    res.json({ complaints: agg.map(c => ({ complaint: c._id, count: c.count })) });
  } catch (err) { next(err); }
};

exports.sentimentByCategory = async (req, res, next) => {
  try {
    const match = buildMatch(req.query);
    const agg = await Feedback.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $eq: ['$sentiment', 'neutral'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$sentiment', 'pending'] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 15 },
    ]);
    res.json({
      rows: agg.map(r => ({
        category: r._id,
        positive: r.positive,
        neutral: r.neutral,
        negative: r.negative,
        pending: r.pending,
        total: r.total,
        negativityRate: r.total ? Number((r.negative / r.total).toFixed(3)) : 0,
      })),
    });
  } catch (err) { next(err); }
};
