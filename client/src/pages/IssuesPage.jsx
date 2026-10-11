import { useEffect, useMemo, useState } from 'react';
import {
  listIssues,
  updateIssue,
  bulkUpdateIssueStatus,
  clusterFeedback,
} from '../services/api';
import IssueCard from '../components/IssueCard';
import IssueDrawer from '../components/IssueDrawer';
import { useToast } from '../context/ToastContext';

const STATUSES = ['all', 'open', 'in-progress', 'resolved'];

export default function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reclustering, setReclustering] = useState(false);

  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [openIssue, setOpenIssue] = useState(null);
  const toast = useToast();

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const data = await listIssues();
      setIssues(data.issues || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    return issues.filter(i => {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!i.title.toLowerCase().includes(q) &&
            !(i.description || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [issues, statusFilter, query]);

  const counts = useMemo(() => {
    const c = { open: 0, 'in-progress': 0, resolved: 0 };
    issues.forEach(i => { if (c[i.status] !== undefined) c[i.status]++; });
    return c;
  }, [issues]);

  async function changeStatus(id, status) {
    // optimistic update
    setIssues(prev => prev.map(i => i._id === id ? { ...i, status } : i));
    if (openIssue?._id === id) setOpenIssue({ ...openIssue, status });
    try {
      await updateIssue(id, { status });
      toast.success(`Issue updated to ${status}`);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
      refresh();
    }
  }

  async function applyBulk(status) {
    if (!selected.length) return;
    try {
      await bulkUpdateIssueStatus(selected, status);
      toast.success(`Updated ${selected.length} issues to ${status}`);
      setSelected([]);
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  }

  async function recluster() {
    if (!confirm('Re-run clustering? This replaces all existing issues.')) return;
    setReclustering(true);
    setError('');
    try {
      await clusterFeedback({ replace: true });
      toast.success('AI clustering complete! Issues refreshed.');
      await refresh();
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setReclustering(false);
    }
  }

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display text-slate-100 tracking-tight">Identified Issues</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20">
              {issues.length} clustered
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              {counts.open} open
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {counts['in-progress']} in-progress
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {counts.resolved} resolved
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="btn-secondary" onClick={refresh} disabled={loading}>
            <svg className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
          </button>
          <button className="btn-primary" onClick={recluster} disabled={reclustering}>
            {reclustering ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span>Analyzing Clusters…</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>Re-run AI Clustering</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter toolbar + bulk actions */}
      <div className="card p-3.5 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="input pl-9 text-xs sm:text-sm py-1.5"
            placeholder="Search issues…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5">
          {STATUSES.map(s => {
            const isActive = s === statusFilter;
            return (
              <button
                key={s}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-glow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-white/[0.06]'
                }`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            );
          })}
        </div>

        {selected.length > 0 && (
          <div className="ml-auto flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-brand-300 font-semibold">{selected.length} selected</span>
            <button
              className="text-xs px-2 py-1 rounded bg-surface-800 text-slate-200 hover:bg-surface-700 border border-white/10"
              onClick={() => applyBulk('open')}
            >
              Mark open
            </button>
            <button
              className="text-xs px-2 py-1 rounded bg-surface-800 text-slate-200 hover:bg-surface-700 border border-white/10"
              onClick={() => applyBulk('in-progress')}
            >
              Mark in-progress
            </button>
            <button
              className="text-xs px-2 py-1 rounded bg-surface-800 text-slate-200 hover:bg-surface-700 border border-white/10"
              onClick={() => applyBulk('resolved')}
            >
              Mark resolved
            </button>
            <button
              className="text-xs text-slate-400 hover:text-slate-200 px-1"
              onClick={() => setSelected([])}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="card p-3.5 text-sm text-rose-300 bg-rose-950/40 border-rose-500/30 flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Issue grid */}
      {!loading && filtered.length === 0 && (
        <div className="card p-12 text-center text-slate-400">
          <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-slate-500">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-300">No issues found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {issues.length === 0
              ? 'Click "Re-run AI Clustering" above to synthesize issues from current customer feedback.'
              : 'Try clearing your search query or switching status filters.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(issue => (
          <IssueCard
            key={issue._id}
            issue={issue}
            selected={selected.includes(issue._id)}
            onSelect={toggleSelect}
            onOpen={setOpenIssue}
            onStatusChange={changeStatus}
          />
        ))}
      </div>

      <IssueDrawer
        issue={openIssue}
        onClose={() => setOpenIssue(null)}
        onChangeStatus={changeStatus}
      />
    </div>
  );
}
