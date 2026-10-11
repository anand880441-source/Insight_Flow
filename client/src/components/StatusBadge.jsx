const configs = {
  open: {
    cls: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    dot: 'bg-rose-400',
    label: 'Open',
  },
  'in-progress': {
    cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-400 animate-pulse',
    label: 'In Progress',
  },
  resolved: {
    cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-400',
    label: 'Resolved',
  },
};

export default function StatusBadge({ value }) {
  const cfg = configs[value] || {
    cls: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    dot: 'bg-slate-400',
    label: value,
  };
  return (
    <span className={`badge ${cfg.cls} gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
