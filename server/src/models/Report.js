const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    filters: {
      category: { type: String, default: null },
      from: { type: String, default: null },
      to: { type: String, default: null },
    },
    summary: {
      total: { type: Number, default: 0 },
      analyzed: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      sentiment: {
        positive: { type: Number, default: 0 },
        neutral: { type: Number, default: 0 },
        negative: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
      },
      negativityRate: { type: Number, default: 0 },
      topComplaints: [
        {
          complaint: String,
          count: Number,
        },
      ],
    },
    issues: [
      {
        title: String,
        description: String,
        severity: Number,
        priorityScore: Number,
        frequency: Number,
        status: String,
        recommendation: String,
        why: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', ReportSchema);
