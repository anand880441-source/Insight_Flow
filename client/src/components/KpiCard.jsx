const toneConfig = {
  default: {
    value: 'text-slate-50',
    bar: 'bg-brand-500',
    icon: 'text-brand-400',
    border: 'border-brand-500/20',
    glow: 'from-brand-600/10 to-transparent',
  },
  positive: {
    value: 'text-accent-emerald',
    bar: 'bg-accent-emerald',
    icon: 'text-accent-emerald',
    border: 'border-emerald-500/20',
    glow: 'from-emerald-600/10 to-transparent',
  },
  negative: {
    value: 'text-accent-rose',
    bar: 'bg-accent-rose',
    icon: 'text-accent-rose',
    border: 'border-rose-500/20',
    glow: 'from-rose-600/10 to-transparent',
  },
  warning: {
    value: 'text-accent-amber',
    bar: 'bg-accent-amber',
    icon: 'text-accent-amber',
    border: 'border-amber-500/20',
    glow: 'from-amber-600/10 to-transparent',
  },
};

const icons = {
  default: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  positive: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  negative: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

export default function KpiCard({ label, value, sub, tone = 'default', trend }) {
  const cfg = toneConfig[tone] || toneConfig.default;
  return (
    <div className={`card p-5 group relative overflow-hidden shine border ${cfg.border}`}>
      {/* Gradient glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${cfg.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl`} />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 leading-none">
            {label}
          </div>
          <div className={`${cfg.icon} opacity-60`}>
            {icons[tone] || icons.default}
          </div>
        </div>

        <div className={`mt-3 text-3xl font-display font-bold tracking-tight ${cfg.value}`}>
          {value}
        </div>

        {sub && (
          <div className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {sub}
          </div>
        )}

        {trend !== undefined && (
          <div className={`mt-2 text-xs font-medium ${trend >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs last period
          </div>
        )}
      </div>
    </div>
  );
}
