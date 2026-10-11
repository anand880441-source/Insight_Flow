import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

export default function SentimentByCategoryBar({ data }) {
  if (!data || !data.length) {
    return <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">No data</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: 10, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" tick={{ fontSize: 11 }} interval={0} angle={-10} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="positive" stackId="a" fill="#10b981" />
        <Bar dataKey="neutral"  stackId="a" fill="#94a3b8" />
        <Bar dataKey="negative" stackId="a" fill="#ef4444" />
        <Bar dataKey="pending"  stackId="a" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
}
