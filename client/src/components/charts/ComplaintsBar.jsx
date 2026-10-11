import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

export default function ComplaintsBar({ data }) {
  if (!data || !data.length) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center text-sm text-slate-500 gap-2">
        <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <span>No complaint patterns identified yet</span>
      </div>
    );
  }

  const top = data.slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={top} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="complaint"
          width={150}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
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
          formatter={(val) => [val.toLocaleString(), 'Occurrences']}
          cursor={{ fill: 'rgba(244, 63, 94, 0.05)' }}
        />
        <Bar
          dataKey="count"
          fill="#f43f5e"
          radius={[0, 6, 6, 0]}
          barSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
