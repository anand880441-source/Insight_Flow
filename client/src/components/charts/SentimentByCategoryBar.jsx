import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

export default function SentimentByCategoryBar({ data }) {
  if (!data || !data.length) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center text-sm text-slate-500 gap-2">
        <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </div>
        <span>No category sentiment breakdown available</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: 5, right: 15, top: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={45}
          axisLine={{ stroke: '#1e293b' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={{ stroke: '#1e293b' }}
          tickLine={false}
        />
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
          cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          formatter={(value) => (
            <span className="text-xs text-slate-300 font-medium px-1 capitalize">{value}</span>
          )}
        />
        <Bar dataKey="positive" name="Positive" stackId="a" fill="#10b981" />
        <Bar dataKey="neutral"  name="Neutral"  stackId="a" fill="#64748b" />
        <Bar dataKey="negative" name="Negative" stackId="a" fill="#f43f5e" />
        <Bar dataKey="pending"  name="Pending"  stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
