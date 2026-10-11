const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    category: { type: String, default: 'Uncategorized', index: true },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'pending'],
      default: 'pending',
      index: true,
    },
    sentimentScore: { type: Number, default: 0 },
    topics: { type: [String], default: [] },
    complaints: { type: [String], default: [] },
    source: { type: String, enum: ['csv', 'manual', 'import'], default: 'manual' },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

FeedbackSchema.index({ text: 'text' });

module.exports = mongoose.model('Feedback', FeedbackSchema);
