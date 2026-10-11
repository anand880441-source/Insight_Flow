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
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30" />
      <div
        className="w-[520px] max-w-full bg-white border-l border-slate-200 h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Issue</div>
            <div className="text-lg font-semibold">{issue.title}</div>
          </div>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-3 gap-3">
            <Meta label="Severity" value={issue.severity + ' / 5'} />
            <Meta label="Priority" value={issue.priorityScore} />
            <Meta label="Frequency" value={issue.frequency} />
          </div>

          {/* Status + transitions */}
          <div>
            <div className="text-xs text-slate-500 mb-2">Status</div>
            <div className="flex items-center gap-2">
              <StatusBadge value={issue.status} />
              {['open', 'in-progress', 'resolved']
                .filter(s => s !== issue.status)
                .map(s => (
                  <button
                    key={s}
                    className="btn-ghost"
                    onClick={() => onChangeStatus(issue._id, s)}
                  >
                    → {s}
                  </button>
                ))}
            </div>
          </div>

          {/* Why + recommendation */}
          {issue.why && (
            <Section title="Why this matters">
              <p className="text-sm text-slate-700">{issue.why}</p>
            </Section>
          )}
          {issue.recommendation && (
            <Section title="Recommended action">
              <p className="text-sm text-slate-700">{issue.recommendation}</p>
            </Section>
          )}

          {/* Keywords */}
          {issue.keywords?.length > 0 && (
            <Section title="Keywords">
              <div className="flex flex-wrap gap-1">
                {issue.keywords.map(k => (
                  <span key={k} className="badge bg-slate-100 text-slate-600">{k}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Related feedback */}
          <Section title={`Related feedback (${feedback.length})`}>
            {loading && <div className="text-sm text-slate-400">Loading…</div>}
            {!loading && feedback.length === 0 && (
              <div className="text-sm text-slate-400">No related feedback attached.</div>
            )}
            <ul className="space-y-2">
              {feedback.map(f => (
                <li key={f._id} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <SentimentBadge value={f.sentiment} />
                    <span className="badge bg-slate-100 text-slate-600">{f.category}</span>
                  </div>
                  <div className="text-sm text-slate-700">{f.text}</div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">{title}</div>
      {children}
    </div>
  );
}
