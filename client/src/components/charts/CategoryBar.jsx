import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

const PALETTE = ['#6366f1', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function CategoryBar({ data }) {
  if (!data || !data.length) {
    return (
      <div className="h-[260px] flex flex-col items-center justify-center text-sm text-slate-500 gap-2">
        <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <span>No categories recorded yet</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="category"
          width={130}
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
          formatter={(val) => [val.toLocaleString(), 'Feedback entries']}
          cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
