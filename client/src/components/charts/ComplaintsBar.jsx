import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

export default function ComplaintsBar({ data }) {
  if (!data || !data.length) {
    return <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">No complaints extracted yet</div>;
  }
  const top = data.slice(0, 8);
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={top} layout="vertical" margin={{ left: 30, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="complaint" width={150} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
