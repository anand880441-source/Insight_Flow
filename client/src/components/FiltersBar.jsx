import { useFilters } from '../context/FiltersContext';

const CATEGORIES = [
  'All',
  'Product Feedback',
  'Customer Service',
  'Fraud and Scam',
  'Operational Issues',
];

export default function FiltersBar() {
  const { category, setCategory, from, setFrom, to, setTo, reset } = useFilters();

  return (
    <div className="card p-4 flex items-center gap-3 flex-wrap">
      <select
        className="input max-w-[200px]"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">From</label>
        <input type="date" className="input max-w-[160px]" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500">To</label>
        <input type="date" className="input max-w-[160px]" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      <button className="btn-ghost ml-auto" onClick={reset}>Reset</button>
    </div>
  );
}
