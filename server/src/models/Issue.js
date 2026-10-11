const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    severity: { type: Number, default: 3, min: 1, max: 5 },
    priorityScore: { type: Number, default: 0, index: true },
    frequency: { type: Number, default: 0 },
    keywords: { type: [String], default: [] },
    relatedFeedbackIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' }],
    recommendation: { type: String, default: '' },
    why: { type: String, default: '' },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved'],
      default: 'open',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Issue', IssueSchema);
