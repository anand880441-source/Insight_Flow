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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold font-display text-slate-100 tracking-tight">Executive Dashboard</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Insights
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {loading ? (
              <span className="inline-flex items-center gap-1.5 text-brand-400">
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Syncing intelligence data…
              </span>
            ) : total ? (
              <>
                Synthesized <span className="text-slate-200 font-semibold">{analyzed.toLocaleString()}</span> of{' '}
                <span className="text-slate-200 font-semibold">{total.toLocaleString()}</span> incoming customer feedback entries
              </>
            ) : (
              'Awaiting incoming feedback stream…'
            )}
          </p>
        </div>
      </div>

      {/* Global filters */}
      <FiltersBar />

      {error && (
        <div className="card p-4 text-sm text-rose-300 bg-rose-950/40 border-rose-500/30 flex items-center gap-3">
          <svg className="w-5 h-5 text-rose-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Feedback"
          value={total.toLocaleString()}
          sub="Within active filters"
        />
        <KpiCard
          label="Negativity Rate"
          value={negativityRate.toFixed(1) + '%'}
          sub={`${s.negative.toLocaleString()} of ${analyzedCount.toLocaleString()} analyzed`}
          tone={negativityRate > 30 ? 'negative' : negativityRate > 15 ? 'warning' : 'positive'}
        />
        <KpiCard
          label="Positive Share"
          value={pct(s.positive, analyzedCount)}
          sub={`${s.positive.toLocaleString()} high-satisfaction entries`}
          tone="positive"
        />
        <KpiCard
          label="Pending Processing"
          value={pending.toLocaleString()}
          sub="Queued for AI pipeline"
          tone={pending > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Row 1: sentiment pie + category bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="font-semibold text-slate-200 text-sm font-display tracking-wide">Sentiment Distribution</h2>
              <p className="text-xs text-slate-500">Breakdown across analyzed customer sentiment</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-surface-700/60 px-2 py-0.5 rounded border border-white/[0.06]">
              {analyzedCount} analyzed
            </span>
          </div>
          <SentimentPie data={s} />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="font-semibold text-slate-200 text-sm font-display tracking-wide">Volume by Category</h2>
              <p className="text-xs text-slate-500">Distribution of customer submissions</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-surface-700/60 px-2 py-0.5 rounded border border-white/[0.06]">
              {categoryData.length} categories
            </span>
          </div>
          <CategoryBar data={categoryData} />
        </div>
      </div>

      {/* Row 2: trend line */}
      <div className="card p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
          <div>
            <h2 className="font-semibold text-slate-200 text-sm font-display tracking-wide">Sentiment Trajectory</h2>
            <p className="text-xs text-slate-500">Daily frequency trends over the last 30 days</p>
          </div>
          <span className="text-[11px] text-slate-400 bg-surface-700/60 px-2.5 py-1 rounded-lg border border-white/[0.06] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            30-day window
          </span>
        </div>
        <TrendLine data={trends} />
      </div>

      {/* Row 3: complaints + sentiment by category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="font-semibold text-slate-200 text-sm font-display tracking-wide">Top Identified Pain Points</h2>
              <p className="text-xs text-slate-500">Highest recurring negative signals</p>
            </div>
            <span className="text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-medium">
              High Impact
            </span>
          </div>
          <ComplaintsBar data={complaints} />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="font-semibold text-slate-200 text-sm font-display tracking-wide">Category Sentiment Stack</h2>
              <p className="text-xs text-slate-500">Polarity ratio across product domains</p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-surface-700/60 px-2 py-0.5 rounded border border-white/[0.06]">
              Polarity breakdown
            </span>
          </div>
          <SentimentByCategoryBar data={byCategory} />
        </div>
      </div>

      {/* Row 4: table of category breakdown */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-200 text-sm font-display tracking-wide">Domain Category Metrics</h2>
            <p className="text-xs text-slate-500">Comprehensive breakdown with sentiment distribution</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left font-medium">Domain Category</th>
                <th className="text-right font-medium">Total Volume</th>
                <th className="text-right font-medium">Positive</th>
                <th className="text-right font-medium">Neutral</th>
                <th className="text-right font-medium">Negative</th>
                <th className="text-right font-medium">Negativity Rate</th>
              </tr>
            </thead>
            <tbody>
              {byCategory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No category data collected for this period
                  </td>
                </tr>
              )}
              {byCategory.map(r => {
                const neg = r.negativityRate * 100;
                return (
                  <tr key={r.category}>
                    <td className="font-medium text-slate-200">{r.category}</td>
                    <td className="text-right font-mono text-slate-300">{r.total.toLocaleString()}</td>
                    <td className="text-right font-mono text-emerald-400">{r.positive.toLocaleString()}</td>
                    <td className="text-right font-mono text-slate-400">{r.neutral.toLocaleString()}</td>
                    <td className="text-right font-mono text-rose-400">{r.negative.toLocaleString()}</td>
                    <td className="text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                          neg > 30
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : neg > 15
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {neg.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
