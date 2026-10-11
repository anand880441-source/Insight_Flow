import { useEffect, useState } from 'react';
import {
  createReport,
  listReports,
  getReport,
  deleteReport,
} from '../services/api';
import { useFilters } from '../context/FiltersContext';
import ReportPreview from '../components/ReportPreview';
import { useToast } from '../context/ToastContext';

export default function ReportsPage() {
  const { category, from, to } = useFilters();

  const [title, setTitle] = useState('');
  const [saved, setSaved] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  async function refreshList() {
    setLoading(true);
    try {
      const d = await listReports();
      setSaved(d.items || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshList(); }, []);

  async function generate() {
    if (!title.trim()) {
      setError('Please enter a title for the report.');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const filters = {};
      if (category && category !== 'All') filters.category = category;
      if (from) filters.from = from;
      if (to) filters.to = to;

      const doc = await createReport({
        title: title.trim(),
        filters,
        includeIssues: true,
      });
      setCurrent(doc);
      setTitle('');
      toast.success('Report snapshot created successfully');
      await refreshList();
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

  async function openSaved(id) {
    try {
      const doc = await getReport(id);
      setCurrent(doc);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  }

  async function removeReport(id) {
    if (!confirm('Are you sure you want to delete this report?')) return;
    try {
      await deleteReport(id);
      toast.success('Report deleted');
      if (current?._id === id) setCurrent(null);
      refreshList();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  }

  const activeFilterChips = [
    category && category !== 'All' ? `Category: ${category}` : null,
    from ? `From: ${from}` : null,
    to ? `To: ${to}` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header & Generator Card */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold font-display text-slate-100 tracking-tight">Executive Reports</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20">
            Export Suite
          </span>
        </div>
        <p className="text-sm text-slate-400 mb-5">
          Generate structured point-in-time analytical briefs with sentiment analytics and high-priority cluster data.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            className="input max-w-sm"
            placeholder="Report title (e.g. Q4 Customer Satisfaction Brief)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') generate(); }}
          />
          <button className="btn-primary" onClick={generate} disabled={creating}>
            {creating ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span>Generating…</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                <span>Generate Snapshot</span>
              </>
            )}
          </button>

          {activeFilterChips.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
              <span className="text-slate-500">Inherited filters:</span>
              {activeFilterChips.map(c => (
                <span
                  key={c}
                  className="text-[11px] font-mono text-slate-300 bg-surface-700/60 px-2 py-0.5 rounded border border-white/[0.06]"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 text-sm text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Saved reports table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-200 text-sm font-display tracking-wide">Archived Reports</h2>
            <p className="text-xs text-slate-500">Historical snapshots available for re-export</p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-surface-700/60 px-2.5 py-0.5 rounded border border-white/[0.06]">
            {saved.length} archived
          </span>
        </div>

        {loading && (
          <div className="p-8 text-center text-sm text-slate-500">
            <div className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span>Fetching reports…</span>
            </div>
          </div>
        )}

        {!loading && saved.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-500">
            <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-2 text-slate-500">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span>No reports saved yet. Enter a title above to generate your first brief.</span>
          </div>
        )}

        {!loading && saved.length > 0 && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-left font-medium">Report Title</th>
                  <th className="text-right font-medium">Total Feedback</th>
                  <th className="text-right font-medium">Analyzed</th>
                  <th className="text-right font-medium">Negativity</th>
                  <th className="text-left font-medium">Generated On</th>
                  <th className="w-12 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {saved.map(r => {
                  const isSelected = current?._id === r._id;
                  const negRate = (r.summary?.negativityRate || 0) * 100;
                  return (
                    <tr
                      key={r._id}
                      className={`group cursor-pointer ${
                        isSelected ? 'bg-brand-500/[0.06]' : ''
                      }`}
                      onClick={() => openSaved(r._id)}
                    >
                      <td>
                        <span className="font-semibold text-slate-200 group-hover:text-brand-300 transition-colors">
                          {r.title}
                        </span>
                      </td>
                      <td className="text-right font-mono text-slate-300">
                        {r.summary?.total?.toLocaleString?.() ?? 0}
                      </td>
                      <td className="text-right font-mono text-slate-300">
                        {r.summary?.analyzed?.toLocaleString?.() ?? 0}
                      </td>
                      <td className="text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                            negRate > 30
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : negRate > 15
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {negRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-slate-400 text-xs font-mono">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          onClick={() => removeReport(r._id)}
                          title="Delete report"
                          aria-label="Delete report"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Report Preview */}
      {current && (
        <ReportPreview report={current} onDelete={removeReport} />
      )}
    </div>
  );
}
