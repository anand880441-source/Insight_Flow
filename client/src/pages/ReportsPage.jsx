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
      setError('Please enter a report title.');
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
      await refreshList();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setCreating(false);
    }
  }

  async function openSaved(id) {
    try {
      const doc = await getReport(id);
      setCurrent(doc);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  async function removeReport(id) {
    if (!confirm('Delete this report?')) return;
    try {
      await deleteReport(id);
      if (current?._id === id) setCurrent(null);
      refreshList();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  }

  const activeFilterChips = [
    category && category !== 'All' ? `category: ${category}` : null,
    from ? `from: ${from}` : null,
    to ? `to: ${to}` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Header + generator */}
      <div className="card p-5">
        <h1 className="text-2xl font-semibold mb-1">Reports</h1>
        <p className="text-sm text-slate-500 mb-4">
          Generate a snapshot of the current analytics + issues and export it as PDF or CSV.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            className="input max-w-sm"
            placeholder="Report title (e.g. Weekly insights)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn-primary" onClick={generate} disabled={creating}>
            {creating ? 'Generating…' : 'Generate report'}
          </button>
          {activeFilterChips.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              Applies current filters:
              {activeFilterChips.map(c => (
                <span key={c} className="badge bg-slate-100 text-slate-600">{c}</span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2">
            {error}
          </div>
        )}
      </div>

      {/* Saved reports list */}
      <div className="card">
        <div className="px-5 py-3 border-b border-slate-100 font-medium">Saved reports</div>
        {loading && <div className="p-5 text-sm text-slate-400">Loading…</div>}
        {!loading && saved.length === 0 && (
          <div className="p-5 text-sm text-slate-400">No reports yet. Generate one above.</div>
        )}
        {!loading && saved.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-5 py-2 font-medium">Title</th>
                <th className="text-right px-5 py-2 font-medium">Total</th>
                <th className="text-right px-5 py-2 font-medium">Analyzed</th>
                <th className="text-right px-5 py-2 font-medium">Negativity</th>
                <th className="text-left px-5 py-2 font-medium">Created</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {saved.map(r => (
                <tr key={r._id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-5 py-2">
                    <button className="text-left font-medium hover:text-brand-700" onClick={() => openSaved(r._id)}>
                      {r.title}
                    </button>
                  </td>
                  <td className="px-5 py-2 text-right">{r.summary?.total ?? 0}</td>
                  <td className="px-5 py-2 text-right">{r.summary?.analyzed ?? 0}</td>
                  <td className="px-5 py-2 text-right">
                    {((r.summary?.negativityRate || 0) * 100).toFixed(1)}%
                  </td>
                  <td className="px-5 py-2 text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-2 text-right">
                    <button className="text-rose-500 hover:text-rose-700" onClick={() => removeReport(r._id)}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Current report preview */}
      {current && (
        <ReportPreview report={current} onDelete={removeReport} />
      )}
    </div>
  );
}

