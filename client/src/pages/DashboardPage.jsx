import useAnalytics from '../hooks/useAnalytics';
import KpiCard from '../components/KpiCard';
import FiltersBar from '../components/FiltersBar';
import SentimentPie from '../components/charts/SentimentPie';
import CategoryBar from '../components/charts/CategoryBar';
import TrendLine from '../components/charts/TrendLine';
import ComplaintsBar from '../components/charts/ComplaintsBar';
import SentimentByCategoryBar from '../components/charts/SentimentByCategoryBar';

function pct(n, d) {
  if (!d) return '0%';
  return ((n / d) * 100).toFixed(1) + '%';
}

export default function DashboardPage() {
  const { overview, trends, complaints, byCategory, loading, error } = useAnalytics();

  const total = overview?.total ?? 0;
  const analyzed = overview?.analyzed ?? 0;
  const pending = overview?.pending ?? 0;
  const s = overview?.sentiment || { positive: 0, neutral: 0, negative: 0, pending: 0 };

  // negativity across analyzed
  const analyzedCount = s.positive + s.neutral + s.negative;
  const negativityRate = analyzedCount ? (s.negative / analyzedCount) * 100 : 0;

  // categories wrapped for the chart component
  const categoryData = (overview?.categories || []).map(c => ({
    category: c.category,
    count: c.count,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-500">
            {loading ? 'Refreshing…' : (total ? `Analyzed ${analyzed.toLocaleString()} of ${total.toLocaleString()} feedback entries` : 'Loading…')}
          </p>
        </div>
      </div>

      {/* Global filters */}
      <FiltersBar />

      {error && (
        <div className="card p-3 text-sm text-rose-600 bg-rose-50 border-rose-100">{error}</div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total feedback" value={total.toLocaleString()} sub="in the current filter" />
        <KpiCard
          label="Negativity rate"
          value={negativityRate.toFixed(1) + '%'}
          sub={`${s.negative.toLocaleString()} negative of ${analyzedCount.toLocaleString()} analyzed`}
          tone={negativityRate > 30 ? 'negative' : negativityRate > 15 ? 'warning' : 'positive'}
        />
        <KpiCard
          label="Positive share"
          value={pct(s.positive, analyzedCount)}
          sub={`${s.positive.toLocaleString()} positive`}
          tone="positive"
        />
        <KpiCard
          label="Pending analysis"
          value={pending.toLocaleString()}
          sub="awaiting AI processing"
          tone={pending > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Row 1: sentiment pie + category bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="font-medium mb-2">Sentiment distribution</div>
          <SentimentPie data={s} />
        </div>
        <div className="card p-4">
          <div className="font-medium mb-2">Feedback by category</div>
          <CategoryBar data={categoryData} />
        </div>
      </div>

      {/* Row 2: trend line */}
      <div className="card p-4">
        <div className="font-medium mb-2">Sentiment trend (last 30 days)</div>
        <TrendLine data={trends} />
      </div>

      {/* Row 3: complaints + sentiment by category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="font-medium mb-2">Top complaints</div>
          <ComplaintsBar data={complaints} />
        </div>
        <div className="card p-4">
          <div className="font-medium mb-2">Sentiment by category</div>
          <SentimentByCategoryBar data={byCategory} />
        </div>
      </div>

      {/* Row 4: table of category breakdown */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 font-medium">Category breakdown</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Category</th>
              <th className="text-right px-4 py-2 font-medium">Total</th>
              <th className="text-right px-4 py-2 font-medium">Positive</th>
              <th className="text-right px-4 py-2 font-medium">Neutral</th>
              <th className="text-right px-4 py-2 font-medium">Negative</th>
              <th className="text-right px-4 py-2 font-medium">Negativity</th>
            </tr>
          </thead>
          <tbody>
            {byCategory.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No data</td></tr>
            )}
            {byCategory.map(r => (
              <tr key={r.category} className="border-t border-slate-100">
                <td className="px-4 py-2">{r.category}</td>
                <td className="px-4 py-2 text-right">{r.total.toLocaleString()}</td>
                <td className="px-4 py-2 text-right text-emerald-600">{r.positive}</td>
                <td className="px-4 py-2 text-right text-slate-500">{r.neutral}</td>
                <td className="px-4 py-2 text-right text-rose-600">{r.negative}</td>
                <td className="px-4 py-2 text-right">{(r.negativityRate * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
