import { useEffect, useMemo, useState } from 'react';
import { listFeedback, createFeedback, deleteFeedback, importCSV } from '../services/api';
import SentimentBadge from '../components/SentimentBadge';
import { useToast } from '../context/ToastContext';
import Pagination from '../components/Pagination';

const CATEGORIES = [
  'All',
  'Product Feedback',
  'Customer Service',
  'Fraud and Scam',
  'Operational Issues',
];
const SENTIMENTS = ['All', 'pending', 'positive', 'neutral', 'negative'];
const PAGE_SIZE = 20;

export default function FeedbackPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sentiment, setSentiment] = useState('All');

  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('Product Feedback');
  const toast = useToast();
  const [importing, setImporting] = useState(false);

  const query = useMemo(() => {
    const q = { page, limit: PAGE_SIZE };
    if (search) q.search = search;
    if (category !== 'All') q.category = category;
    if (sentiment !== 'All') q.sentiment = sentiment;
    return q;
  }, [page, search, category, sentiment]);

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const data = await listFeedback(query);
      setItems(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [query]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(t);
  }, [search, category, sentiment]);

  async function onAdd() {
    if (!newText.trim()) return;
    try {
      await createFeedback({ text: newText.trim(), category: newCategory });
      setNewText('');
      setShowAdd(false);
      toast.success('Feedback entry recorded successfully');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  }

  async function onDelete(id) {
    if (!confirm('Are you sure you want to delete this feedback item?')) return;
    try {
      await deleteFeedback(id);
      toast.success('Feedback removed');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  }

  async function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError('');
    try {
      const r = await importCSV(file);
      toast.success(`Successfully imported ${r.inserted} feedback records`);
      refresh();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-display text-slate-100 tracking-tight">Customer Feedback</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20">
              {total.toLocaleString()} records
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Browse, filter, and inspect raw customer submissions and their AI-inferred classifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className={`btn-secondary ${importing ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}>
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>{importing ? 'Importing…' : 'Import CSV'}</span>
            <input type="file" accept=".csv" className="hidden" onChange={onFileChange} disabled={importing} />
          </label>

          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Feedback</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
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
            placeholder="Search feedback text…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="input text-xs sm:text-sm py-1.5 min-w-[170px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          <select
            className="input text-xs sm:text-sm py-1.5 min-w-[140px]"
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
          >
            {SENTIMENTS.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Sentiments' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          {(search || category !== 'All' || sentiment !== 'All') && (
            <button
              onClick={() => { setSearch(''); setCategory('All'); setSentiment('All'); }}
              className="btn-ghost text-xs text-slate-400 hover:text-slate-200"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card overflow-hidden">
        {error && (
          <div className="p-3 text-rose-300 text-sm border-b border-rose-500/20 bg-rose-950/40 flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left font-medium min-w-[280px]">Feedback Content</th>
                <th className="text-left font-medium min-w-[150px]">Category</th>
                <th className="text-left font-medium min-w-[120px]">Sentiment</th>
                <th className="text-left font-medium min-w-[180px]">Detected Topics</th>
                <th className="w-12 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      <span>Loading records…</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                      <span className="text-sm">No feedback matches the selected criteria</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && items.map(it => (
                <tr key={it._id} className="group">
                  <td className="max-w-[500px]">
                    <div className="line-clamp-2 text-slate-200 text-xs sm:text-sm leading-relaxed" title={it.text}>
                      {it.text}
                    </div>
                  </td>
                  <td className="whitespace-nowrap">
                    <span className="inline-block text-xs font-medium text-slate-300 bg-surface-700/60 px-2.5 py-1 rounded-md border border-white/[0.06]">
                      {it.category}
                    </span>
                  </td>
                  <td>
                    <SentimentBadge value={it.sentiment} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(it.topics || []).length > 0 ? (
                        (it.topics || []).slice(0, 3).map(t => (
                          <span
                            key={t}
                            className="inline-block text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.04]"
                          >
                            #{t}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  <td className="text-right">
                    <button
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-60 group-hover:opacity-100"
                      onClick={() => onDelete(it._id)}
                      title="Delete record"
                      aria-label="Delete feedback record"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-white/[0.06] bg-surface-900/40 flex-wrap gap-2">
          <div className="text-xs text-slate-400">
            Page <span className="font-semibold text-slate-200">{page}</span> of{' '}
            <span className="font-semibold text-slate-200">{pages}</span> · Total {total.toLocaleString()} entries
          </div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </div>
      </div>

      {/* Add Feedback Modal */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-surface-850 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-elevated animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-100">Add Feedback Entry</h3>
                <p className="text-xs text-slate-400">Submit raw customer quote for classification</p>
              </div>
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
                onClick={() => setShowAdd(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Customer Quote / Text
                </label>
                <textarea
                  className="input h-32 text-sm leading-relaxed"
                  placeholder="Paste customer statement, support ticket excerpt, or review…"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Initial Category
                </label>
                <select
                  className="input text-sm"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-white/[0.08]">
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-primary" onClick={onAdd} disabled={!newText.trim()}>
                Save & Analyze
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
