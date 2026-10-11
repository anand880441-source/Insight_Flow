import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  positive: '#10b981',
  neutral:  '#64748b',
  negative: '#f43f5e',
  pending:  '#f59e0b',
};

const LABELS = {
  positive: 'Positive',
  neutral:  'Neutral',
  negative: 'Negative',
  pending:  'Pending',
};

export default function SentimentPie({ data }) {
  const rows = ['positive', 'neutral', 'negative', 'pending']
    .map(k => ({ name: k, label: LABELS[k] || k, value: data?.[k] || 0 }))
    .filter(r => r.value > 0);

  if (!rows.length) return <EmptyChart label="No sentiment data recorded yet" />;

  const total = rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={rows}
            dataKey="value"
            nameKey="label"
            innerRadius={62}
            outerRadius={96}
            paddingAngle={3}
            stroke="none"
          >
            {rows.map(r => (
              <Cell key={r.name} fill={COLORS[r.name]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '0.75rem',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
              color: '#f8fafc',
              fontSize: '12px',
              padding: '8px 12px',
            }}
            formatter={(val, name) => [`${val.toLocaleString()} (${((val / total) * 100).toFixed(1)}%)`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-300 font-medium px-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 top-0 bottom-9 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-slate-100 font-display">{total.toLocaleString()}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Total</span>
      </div>
    </div>
  );
}

function EmptyChart({ label }) {
  return (
    <div className="h-[260px] flex flex-col items-center justify-center text-sm text-slate-500 gap-2">
      <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <span>{label}</span>
    </div>
  );
}
