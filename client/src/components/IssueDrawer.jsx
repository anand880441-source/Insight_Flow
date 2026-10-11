import { useEffect, useState } from 'react';
import { listFeedbackByIds } from '../services/api';
import SentimentBadge from './SentimentBadge';
import StatusBadge from './StatusBadge';

export default function IssueDrawer({ issue, onClose, onChangeStatus }) {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!issue) return;
    if (!issue.relatedFeedbackIds?.length) {
      setFeedback([]);
      return;
    }
    setLoading(true);
    listFeedbackByIds(issue.relatedFeedbackIds.map(String))
      .then(d => setFeedback(d.items || []))
      .finally(() => setLoading(false));
  }, [issue]);

  if (!issue) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in" onClick={onClose}>
      <div className="flex-1 bg-black/70 backdrop-blur-sm transition-opacity" />
      <div
        className="w-[560px] max-w-full bg-surface-900 border-l border-white/[0.08] h-full overflow-y-auto shadow-elevated flex flex-col animate-slide-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-surface-900/95 backdrop-blur-md border-b border-white/[0.08] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                Clustered Issue
              </span>
              <StatusBadge value={issue.status} />
            </div>
            <h2 className="text-lg font-bold font-display text-slate-100">{issue.title}</h2>
          </div>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-3">
            <Meta
              label="Severity"
              value={`${issue.severity} / 5`}
              tone={issue.severity >= 4 ? 'text-rose-400' : 'text-slate-200'}
            />
            <Meta label="Priority Score" value={issue.priorityScore} tone="text-brand-300 font-mono" />
            <Meta label="Frequency" value={`${issue.frequency} reports`} tone="text-slate-200" />
          </div>

          {/* Status Controls */}
          <div className="rounded-xl bg-surface-850 p-4 border border-white/[0.06]">
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2.5">
              Lifecycle Status
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {['open', 'in-progress', 'resolved'].map(s => {
                const isActive = s === issue.status;
                return (
                  <button
                    key={s}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-glow-sm font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-white/[0.06]'
                    }`}
                    onClick={() => onChangeStatus(issue._id, s)}
                    disabled={isActive}
                  >
                    {isActive ? `Current: ${s}` : `Move to ${s}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          {issue.description && (
            <Section title="Issue Synopsis">
              <p className="text-sm text-slate-300 leading-relaxed bg-surface-850 p-4 rounded-xl border border-white/[0.06]">
                {issue.description}
              </p>
            </Section>
          )}

          {/* Why this matters */}
          {issue.why && (
            <Section title="Business Impact & Significance">
              <div className="text-sm text-slate-300 leading-relaxed bg-surface-850 p-4 rounded-xl border border-white/[0.06]">
                {issue.why}
              </div>
            </Section>
          )}

          {/* Recommendation */}
          {issue.recommendation && (
            <Section title="AI Recommended Mitigation">
              <div className="text-sm text-slate-200 leading-relaxed bg-brand-500/[0.07] border border-brand-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-300 mb-1">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Proposed Solution
                </div>
                {issue.recommendation}
              </div>
            </Section>
          )}

          {/* Keywords */}
          {issue.keywords?.length > 0 && (
            <Section title="Extracted Keywords">
              <div className="flex flex-wrap gap-1.5">
                {issue.keywords.map(k => (
                  <span
                    key={k}
                    className="inline-block text-xs font-mono text-slate-300 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/[0.06]"
                  >
                    #{k}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Related feedback */}
          <Section title={`Related Customer Feedback (${feedback.length})`}>
            {loading && (
              <div className="p-4 text-center text-sm text-slate-500">
                <div className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Loading linked customer feedback…</span>
                </div>
              </div>
            )}
            {!loading && feedback.length === 0 && (
              <div className="text-sm text-slate-500 bg-surface-850 p-4 rounded-xl border border-white/[0.06]">
                No specific raw customer feedback items linked.
              </div>
            )}
            <ul className="space-y-2.5">
              {feedback.map(f => (
                <li key={f._id} className="bg-surface-850 border border-white/[0.06] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <SentimentBadge value={f.sentiment} />
                    <span className="text-[11px] font-medium text-slate-300 bg-surface-700/60 px-2 py-0.5 rounded border border-white/[0.06]">
                      {f.category}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                    "{f.text}"
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value, tone = 'text-slate-200' }) {
  return (
    <div className="rounded-xl bg-surface-850 border border-white/[0.06] p-3.5">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{label}</div>
      <div className={`text-base font-bold font-display mt-0.5 ${tone}`}>{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2.5">{title}</div>
      {children}
    </div>
  );
}
