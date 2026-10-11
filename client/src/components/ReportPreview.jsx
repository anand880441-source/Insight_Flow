import { downloadCSV, downloadPDF } from '../utils/exporters';
import StatusBadge from './StatusBadge';

export default function ReportPreview({ report, onDelete }) {
  if (!report) return null;

  const s = report.summary.sentiment || { positive: 0, neutral: 0, negative: 0, pending: 0 };
  const negRate = (report.summary.negativityRate * 100).toFixed(1);

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header + actions */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                Generated Report
              </span>
              <span className="text-xs text-slate-400">
                {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-slate-100">{report.title}</h2>
            {report.filters && Object.keys(report.filters).length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-xs text-slate-500">Filter parameters:</span>
                {Object.entries(report.filters).map(([k, v]) => (
                  <span
                    key={k}
                    className="text-[11px] font-mono text-slate-300 bg-surface-700/60 px-2 py-0.5 rounded border border-white/[0.06]"
                  >
                    {k}: {String(v)}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button className="btn-secondary" onClick={() => downloadCSV(report)}>
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Export CSV</span>
            </button>
            <button className="btn-secondary" onClick={() => downloadPDF(report)}>
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Export PDF</span>
            </button>
            <button
              className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
              onClick={() => onDelete?.(report._id)}
              title="Delete report"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <Kpi label="Total Feedback" value={report.summary.total} />
          <Kpi label="Analyzed Volume" value={report.summary.analyzed} />
          <Kpi label="Pending In Queue" value={report.summary.pending} />
          <Kpi
            label="Negativity Index"
            value={negRate + '%'}
            tone={Number(negRate) > 30 ? 'text-rose-400' : 'text-slate-100'}
          />
        </div>
      </div>

      {/* Sentiment breakdown */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-200 text-sm font-display mb-3">Sentiment Distribution</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Sent label="Positive" value={s.positive} tone="emerald" />
          <Sent label="Neutral" value={s.neutral} tone="slate" />
          <Sent label="Negative" value={s.negative} tone="rose" />
          <Sent label="Pending" value={s.pending} tone="amber" />
        </div>
      </div>

      {/* Top complaints */}
      {report.summary.topComplaints?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-200 text-sm font-display mb-3">Top Identified Complaints</h3>
          <ul className="space-y-2 text-sm">
            {report.summary.topComplaints.map(c => (
              <li key={c.complaint} className="flex justify-between items-center bg-surface-850 px-4 py-2.5 rounded-xl border border-white/[0.06]">
                <span className="text-slate-300 font-medium">{c.complaint}</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {c.count} mentions
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Issues */}
      {report.issues?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-200 text-sm font-display mb-4">Priority Issues Included</h3>
          <div className="space-y-3">
            {report.issues.map((i, idx) => (
              <div key={idx} className="bg-surface-850 border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold text-slate-100 font-display">{i.title}</div>
                  <StatusBadge value={i.status} />
                </div>
                {i.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{i.description}</p>
                )}
                <div className="flex gap-4 text-xs font-mono text-slate-400 mt-3 pt-2 border-t border-white/[0.04]">
                  <span>Severity: <strong className="text-slate-200">{i.severity}/5</strong></span>
                  <span>Priority: <strong className="text-brand-300">{i.priorityScore}</strong></span>
                  <span>Reports: <strong className="text-slate-200">{i.frequency}</strong></span>
                </div>
                {i.recommendation && (
                  <div className="mt-3 text-xs text-slate-300 bg-brand-500/[0.06] border border-brand-500/15 rounded-lg p-3">
                    <div className="text-[10px] uppercase font-semibold text-brand-300 mb-1">
                      Action Recommendation
                    </div>
                    {i.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, tone = 'text-slate-100' }) {
  return (
    <div className="rounded-xl bg-surface-850 border border-white/[0.06] p-4">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{label}</div>
      <div className={`text-xl font-bold font-display mt-1 ${tone}`}>{value?.toLocaleString?.() ?? value}</div>
    </div>
  );
}

function Sent({ label, value, tone }) {
  const tones = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    slate: 'text-slate-400 bg-surface-700/60 border-white/[0.06]',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">{label}</div>
      <div className="text-xl font-bold font-display mt-1">{value?.toLocaleString?.() ?? value}</div>
    </div>
  );
}
