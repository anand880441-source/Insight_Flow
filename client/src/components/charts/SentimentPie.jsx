import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  positive: '#10b981',
  neutral:  '#94a3b8',
  negative: '#ef4444',
  pending:  '#f59e0b',
};

export default function SentimentPie({ data }) {
  const rows = ['positive', 'neutral', 'negative', 'pending']
    .map(k => ({ name: k, value: data?.[k] || 0 }))
    .filter(r => r.value > 0);

  if (!rows.length) return <EmptyChart label="No sentiment data yet" />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={rows}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {rows.map(r => <Cell key={r.name} fill={COLORS[r.name]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ label }) {
  return (
    <div className="h-[260px] flex items-center justify-center text-sm text-slate-400">
      {label}
    </div>
  );
}
