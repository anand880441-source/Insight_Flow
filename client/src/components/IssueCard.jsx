import StatusBadge from './StatusBadge';

export default function IssueCard({ issue, onOpen, selected, onSelect, onStatusChange }) {
  const tone =
    issue.severity >= 5 ? 'border-rose-300' :
    issue.severity >= 4 ? 'border-amber-300' :
    'border-slate-200';

  return (
    <div
      className={`card p-4 border ${tone} ${selected ? 'ring-2 ring-brand-500/40' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <input
            type="checkbox"
            className="mt-1"
            checked={!!selected}
            onChange={() => onSelect?.(issue._id)}
          />
          <div className="min-w-0">
            <button
              className="text-left text-base font-semibold hover:text-brand-700 truncate w-full"
              onClick={() => onOpen(issue)}
            >
              {issue.title}
            </button>
            {issue.description && (
              <div className="text-sm text-slate-500 mt-0.5 line-clamp-2">{issue.description}</div>
            )}
          </div>
        </div>
        <StatusBadge value={issue.status} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <Stat label="Severity" value={issue.severity + '/5'} />
        <Stat label="Priority" value={issue.priorityScore} />
        <Stat label="Reports" value={issue.frequency} />
      </div>

      {issue.recommendation && (
        <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm text-slate-700">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Recommendation</div>
          {issue.recommendation}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {['open', 'in-progress', 'resolved'].map(s => (
          <button
            key={s}
            className={`btn ${s === issue.status ? 'bg-brand-600 text-white' : 'btn-ghost'}`}
            onClick={() => onStatusChange(issue._id, s)}
            disabled={s === issue.status}
          >
            {s}
          </button>
        ))}
        <button className="btn-ghost ml-auto" onClick={() => onOpen(issue)}>View details →</button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
