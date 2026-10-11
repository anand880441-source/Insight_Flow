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
    await createFeedback({ text: newText.trim(), category: newCategory });
    setNewText('');
    setShowAdd(false);
    refresh();
  }

  async function onDelete(id) {
    if (!confirm('Delete this feedback?')) return;
    await deleteFeedback(id);
    refresh();
  }

  async function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError('');
    try {
      const r = await importCSV(file);
      alert(`Imported ${r.inserted} rows`);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Feedback</h1>
          <p className="text-sm text-slate-500">{total.toLocaleString()} entries</p>
        </div>
        <div className="flex items-center gap-2">
          <label className={`btn-ghost ${importing ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}>
            {importing ? 'Importing…' : 'Import CSV'}
            <input type="file" accept=".csv" className="hidden" onChange={onFileChange} disabled={importing} />
          </label>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add feedback</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <input
          className="input max-w-xs"
          placeholder="Search text…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input max-w-[200px]" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input max-w-[160px]" value={sentiment} onChange={(e) => setSentiment(e.target.value)}>
          {SENTIMENTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {error && <div className="p-4 text-rose-600 text-sm border-b border-rose-100 bg-rose-50">{error}</div>}
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Text</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Sentiment</th>
              <th className="text-left px-4 py-3 font-medium">Topics</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Loading…</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No feedback found</td></tr>
            )}
            {!loading && items.map(it => (
              <tr key={it._id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3 max-w-[520px]">
                  <div className="line-clamp-2" title={it.text}>{it.text}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">{it.category}</td>
                <td className="px-4 py-3"><SentimentBadge value={it.sentiment} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(it.topics || []).slice(0, 3).map(t => (
                      <span key={t} className="badge bg-slate-100 text-slate-600">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-rose-500 hover:text-rose-700" onClick={() => onDelete(it._id)} title="Delete">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center p-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">Page {page} of {pages}</div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl p-5 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3">Add feedback</h3>
            <textarea
              className="input h-28 mb-3"
              placeholder="Paste customer feedback…"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <select className="input mb-4" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-primary" onClick={onAdd}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

