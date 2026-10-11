import { downloadCSV, downloadPDF } from '../utils/exporters';
import StatusBadge from './StatusBadge';

export default function ReportPreview({ report, onDelete }) {
  if (!report) return null;

  const s = report.summary.sentiment || { positive: 0, neutral: 0, negative: 0, pending: 0 };
  const negRate = (report.summary.negativityRate * 100).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Header + actions */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold">{report.title}</h2>
            <div className="text-xs text-slate-500 mt-1">
              Generated {new Date(report.createdAt).toLocaleString()} · Filters:{' '}
              {JSON.stringify(report.filters)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost" onClick={() => downloadCSV(report)}>Export CSV</button>
            <button className="btn-ghost" onClick={() => downloadPDF(report)}>Export PDF</button>
            <button className="btn-ghost text-rose-600 hover:bg-rose-50" onClick={() => onDelete?.(report._id)}>
              Delete
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Kpi label="Total" value={report.summary.total} />
          <Kpi label="Analyzed" value={report.summary.analyzed} />
          <Kpi label="Pending" value={report.summary.pending} />
          <Kpi label="Negativity rate" value={negRate + '%'} />
        </div>
      </div>

      {/* Sentiment breakdown */}
      <div className="card p-5">
        <div className="font-medium mb-3">Sentiment distribution</div>
        <div className="grid grid-cols-4 gap-3">
          <Sent label="Positive" value={s.positive} tone="emerald" />
          <Sent label="Neutral" value={s.neutral} tone="slate" />
          <Sent label="Negative" value={s.negative} tone="rose" />
          <Sent label="Pending" value={s.pending} tone="amber" />
        </div>
      </div>

      {/* Top complaints */}
      {report.summary.topComplaints?.length > 0 && (
        <div className="card p-5">
          <div className="font-medium mb-3">Top complaints</div>
          <ul className="space-y-1 text-sm">
            {report.summary.topComplaints.map(c => (
              <li key={c.complaint} className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-700">{c.complaint}</span>
                <span className="text-slate-500">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Issues */}
      {report.issues?.length > 0 && (
        <div className="card p-5">
          <div className="font-medium mb-3">Priority issues</div>
          <div className="space-y-3">
            {report.issues.map((i, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{i.title}</div>
                  <StatusBadge value={i.status} />
                </div>
                {i.description && <div className="text-sm text-slate-500 mt-1">{i.description}</div>}
                <div className="flex gap-4 text-xs text-slate-500 mt-2">
                  <span>Severity: {i.severity}/5</span>
                  <span>Priority: {i.priorityScore}</span>
                  <span>Reports: {i.frequency}</span>
                </div>
                {i.recommendation && (
                  <div className="mt-2 text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded p-2">
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Recommendation</div>
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

function Kpi({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-semibold">{value?.toLocaleString?.() ?? value}</div>
    </div>
  );
}

function Sent({ label, value, tone }) {
  const tones = {
    emerald: 'text-emerald-600',
    slate: 'text-slate-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
  };
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-xl font-semibold ${tones[tone]}`}>{value?.toLocaleString?.() ?? value}</div>
    </div>
  );
}
