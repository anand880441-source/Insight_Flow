import StatusBadge from './StatusBadge';

export default function IssueCard({ issue, onOpen, selected, onSelect, onStatusChange }) {
  const tone =
    issue.severity >= 5
      ? 'border-rose-500/40 hover:border-rose-500/60 shadow-[0_0_15px_-3px_rgba(244,63,94,0.1)]'
      : issue.severity >= 4
      ? 'border-amber-500/40 hover:border-amber-500/60'
      : 'border-white/[0.07] hover:border-white/[0.15]';

  return (
    <div
      className={`card p-5 transition-all duration-200 ${tone} ${
        selected ? 'ring-2 ring-brand-500/60 border-brand-500/50 bg-brand-500/[0.03]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 rounded border-white/20 bg-surface-700 text-brand-500 focus:ring-brand-500/30 focus:ring-offset-0 cursor-pointer"
            checked={!!selected}
            onChange={() => onSelect?.(issue._id)}
          />
          <div className="min-w-0 flex-1">
            <button
              className="text-left text-base font-bold font-display text-slate-100 hover:text-brand-300 transition-colors truncate w-full"
              onClick={() => onOpen(issue)}
            >
              {issue.title}
            </button>
            {issue.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {issue.description}
              </p>
            )}
          </div>
        </div>
        <StatusBadge value={issue.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5 text-xs">
        <Stat
          label="Severity"
          value={`${issue.severity}/5`}
          tone={issue.severity >= 4 ? 'text-rose-400' : 'text-slate-200'}
        />
        <Stat label="Priority" value={issue.priorityScore} tone="text-brand-300 font-mono" />
        <Stat label="Frequency" value={`${issue.frequency} reports`} tone="text-slate-200" />
      </div>

      {issue.recommendation && (
        <div className="mt-3.5 rounded-xl bg-brand-500/[0.06] border border-brand-500/15 p-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-300 mb-1">
            <svg className="w-3 h-3 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            AI Recommended Action
          </div>
          <p className="leading-relaxed text-slate-300 line-clamp-2">{issue.recommendation}</p>
        </div>
      )}

      <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          {['open', 'in-progress', 'resolved'].map(s => {
            const isActive = s === issue.status;
            return (
              <button
                key={s}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-glow-sm cursor-default'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-white/[0.05]'
                }`}
                onClick={() => onStatusChange(issue._id, s)}
                disabled={isActive}
              >
                {s}
              </button>
            );
          })}
        </div>

        <button
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
          onClick={() => onOpen(issue)}
        >
          <span>Details</span>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = 'text-slate-200' }) {
  return (
    <div className="rounded-lg bg-surface-850/80 border border-white/[0.06] px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{label}</div>
      <div className={`text-xs font-semibold mt-0.5 ${tone}`}>{value}</div>
    </div>
  );
}
