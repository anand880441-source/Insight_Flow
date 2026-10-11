export default function KpiCard({ label, value, sub, tone = 'default' }) {
  const tones = {
    default: 'text-slate-800',
    positive: 'text-emerald-600',
    negative: 'text-rose-600',
    warning: 'text-amber-600',
  };
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${tones[tone]}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}
