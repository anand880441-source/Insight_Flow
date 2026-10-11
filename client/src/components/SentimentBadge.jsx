const styles = {
  positive: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  neutral:  'bg-slate-100 text-slate-600 border border-slate-200',
  negative: 'bg-rose-50 text-rose-700 border border-rose-200',
  pending:  'bg-amber-50 text-amber-700 border border-amber-200',
};

export default function SentimentBadge({ value }) {
  const cls = styles[value] || styles.neutral;
  return <span className={`badge ${cls}`}>{value || 'unknown'}</span>;
}
