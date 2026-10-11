const configs = {
  positive: {
    cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-400',
    label: 'Positive',
  },
  neutral: {
    cls: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    dot: 'bg-slate-400',
    label: 'Neutral',
  },
  negative: {
    cls: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    dot: 'bg-rose-400',
    label: 'Negative',
  },
  pending: {
    cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-400',
    label: 'Pending',
  },
};

export default function SentimentBadge({ value }) {
  const cfg = configs[value] || configs.neutral;
  return (
    <span className={`badge ${cfg.cls} gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
