const styles = {
  open:        'bg-rose-50 text-rose-700 border border-rose-200',
  'in-progress': 'bg-amber-50 text-amber-700 border border-amber-200',
  resolved:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

export default function StatusBadge({ value }) {
  const cls = styles[value] || 'bg-slate-100 text-slate-600 border border-slate-200';
  return <span className={`badge ${cls}`}>{value}</span>;
}
