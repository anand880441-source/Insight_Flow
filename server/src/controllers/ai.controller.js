const Feedback = require('../models/Feedback');
const Issue = require('../models/Issue');
const mongoose = require('mongoose');
const {
  analyzeFeedbackBatch,
  clusterIssues,
  recommendForIssue,
} = require('../services/aiService');

exports.analyze = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.body.limit || 100), 500);
    const onlyPending = req.body.onlyPending !== false;

    const q = onlyPending ? { sentiment: 'pending' } : {};
    const items = await Feedback.find(q).limit(limit).lean();
    if (!items.length) return res.json({ analyzed: 0, message: 'Nothing to analyze' });

    const payload = items.map(it => ({ id: String(it._id), text: it.text }));
    const results = await analyzeFeedbackBatch(payload);

    if (!results || !results.length) {
      return res.status(502).json({ analyzed: 0, message: 'AI returned no results — check API key/model' });
    }

    const byId = new Map(results.map(r => [String(r.id), r]));
    const ops = items
      .map(it => {
        const r = byId.get(String(it._id));
        if (!r) return null;
        return {
          updateOne: {
            filter: { _id: it._id },
            update: {
              $set: {
                sentiment: r.sentiment || 'neutral',
                sentimentScore: Number(r.sentimentScore || 0),
                topics: Array.isArray(r.topics) ? r.topics : [],
                complaints: Array.isArray(r.complaints) ? r.complaints : [],
              },
            },
          },
        };
      })
      .filter(Boolean);

    if (ops.length) await Feedback.bulkWrite(ops, { ordered: false });
    res.json({
      analyzed: ops.length,
      remainingPending: await Feedback.countDocuments({ sentiment: 'pending' }),
    });
  } catch (err) { next(err); }
};

exports.cluster = async (req, res, next) => {
  try {
    const replace = req.body.replace !== false;
    const items = await Feedback.find({ sentiment: { $in: ['negative', 'neutral'] } })
      .sort({ sentimentScore: 1 })
      .limit(300)
      .lean();
    if (!items.length) return res.json({ issues: [], message: 'Run /api/ai/analyze first' });

    const clusters = await clusterIssues(
      items.map(it => ({
        id: String(it._id),
        text: it.text,
        category: it.category,
        sentiment: it.sentiment,
      }))
    );

    if (replace) await Issue.deleteMany({});

    const docs = [];
    for (const c of clusters) {
      const priorityScore = (Number(c.severity) || 3) * (Number(c.frequency) || 1);
      const rec = await recommendForIssue({
        title: c.title,
        description: c.description,
        severity: c.severity,
        frequency: c.frequency,
        keywords: c.keywords,
      });
      docs.push({
        title: c.title || 'Untitled issue',
        description: c.description || '',
        severity: Number(c.severity) || 3,
        priorityScore,
        frequency: Number(c.frequency) || 0,
        relatedFeedbackIds: (c.exampleIds || []).filter(id => id && String(id).match(/^[a-f0-9]{24}$/)),
        keywords: Array.isArray(c.keywords) ? c.keywords : [],
        recommendation: rec.recommendation,
        why: rec.why,
        status: 'open',
      });
    }
    const saved = await Issue.insertMany(docs, { ordered: false });
    res.json({ issues: saved });
  } catch (err) { next(err); }
};

exports.listIssues = async (req, res, next) => {
  try {
    const issues = await Issue.find({}).sort({ priorityScore: -1 });
    res.json({ issues });
  } catch (err) { next(err); }
};

exports.updateIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid issue id' });
    }
    const { status } = req.body;
    const allowed = ['open', 'in-progress', 'resolved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Allowed: ' + allowed.join(', ') });
    }
    const doc = await Issue.findByIdAndUpdate(id, { status }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Issue not found' });
    res.json(doc);
  } catch (err) { next(err); }
};

/* POST /api/ai/issues/bulk-status
 * Body: { ids: [ObjectId], status: 'open'|'in-progress'|'resolved' }
 */
exports.bulkUpdateStatus = async (req, res, next) => {
  try {
    const { ids, status } = req.body;
    const allowed = ['open', 'in-progress', 'resolved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const clean = (ids || []).filter(id => mongoose.Types.ObjectId.isValid(id));
    if (!clean.length) return res.status(400).json({ message: 'No valid ids' });
    const r = await Issue.updateMany({ _id: { $in: clean } }, { $set: { status } });
    res.json({ matched: r.matchedCount, modified: r.modifiedCount });
  } catch (err) { next(err); }
};
