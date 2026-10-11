import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

export default function TrendLine({ data }) {
  if (!data || !data.length) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center text-sm text-slate-500 gap-2">
        <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <span>No trend data available for this range</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ left: 5, right: 15, top: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#64748b' }}
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
          labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          formatter={(value) => (
            <span className="text-xs text-slate-300 font-medium px-1 capitalize">{value}</span>
          )}
        />
        <Line
          type="monotone"
          dataKey="positive"
          name="Positive"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#10b981', stroke: '#022c22', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="neutral"
          name="Neutral"
          stroke="#64748b"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: '#64748b', stroke: '#0f172a', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="negative"
          name="Negative"
          stroke="#f43f5e"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#f43f5e', stroke: '#4c0519', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
