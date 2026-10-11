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
    // optimistic
    setIssues(prev => prev.map(i => i._id === id ? { ...i, status } : i));
    if (openIssue?._id === id) setOpenIssue({ ...openIssue, status });
    try {
      await updateIssue(id, { status });
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      refresh();
    }
  }

  async function applyBulk(status) {
    if (!selected.length) return;
    try {
      await bulkUpdateIssueStatus(selected, status);
      setSelected([]);
      refresh();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  async function recluster() {
    if (!confirm('Re-run clustering? This replaces all existing issues.')) return;
    setReclustering(true);
    setError('');
    try {
      await clusterFeedback({ replace: true });
      await refresh();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setReclustering(false);
    }
  }

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Issues</h1>
          <p className="text-sm text-slate-500">
            {issues.length} total · {counts.open} open · {counts['in-progress']} in-progress · {counts.resolved} resolved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={refresh} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <button className="btn-primary" onClick={recluster} disabled={reclustering}>
            {reclustering ? 'Re-clustering…' : 'Re-run AI clustering'}
          </button>
        </div>
      </div>

      {/* Filters + bulk actions */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <input
          className="input max-w-xs"
          placeholder="Search issues…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex items-center gap-1">
          {STATUSES.map(s => (
            <button
              key={s}
              className={`btn ${s === statusFilter ? 'bg-brand-600 text-white' : 'btn-ghost'}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-500">{selected.length} selected</span>
            <button className="btn-ghost" onClick={() => applyBulk('open')}>Mark open</button>
            <button className="btn-ghost" onClick={() => applyBulk('in-progress')}>Mark in-progress</button>
            <button className="btn-ghost" onClick={() => applyBulk('resolved')}>Mark resolved</button>
            <button className="btn-ghost" onClick={() => setSelected([])}>Clear</button>
          </div>
        )}
      </div>

      {error && (
        <div className="card p-3 text-sm text-rose-600 bg-rose-50 border-rose-100">{error}</div>
      )}

      {/* Issue grid */}
      {!loading && filtered.length === 0 && (
        <div className="card p-8 text-center text-slate-500">
          No issues found. {issues.length === 0 && 'Click "Re-run AI clustering" to generate issues.'}
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

