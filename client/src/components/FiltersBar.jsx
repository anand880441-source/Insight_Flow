import { useFilters } from '../context/FiltersContext';

const CATEGORIES = [
  'All',
  'Product Feedback',
  'Customer Service',
  'Fraud and Scam',
  'Operational Issues',
];

function CalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}

export default function FiltersBar() {
  const { category, setCategory, from, setFrom, to, setTo, reset } = useFilters();

  const hasFilters = (category && category !== 'All') || from || to;

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Category */}
        <div className="flex items-center gap-2 text-slate-400">
          <FilterIcon />
          <span className="text-xs font-medium text-slate-500 hidden sm:block">Filter</span>
        </div>

        <select
          className="input max-w-[200px] cursor-pointer"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Separator */}
        <div className="w-px h-6 bg-white/[0.08] hidden sm:block" />

        {/* Date range */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <CalIcon />
          <span className="text-xs text-slate-500 hidden sm:block">From</span>
        </div>
        <input
          type="date"
          className="input max-w-[160px] cursor-pointer [color-scheme:dark]"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />

        <span className="text-xs text-slate-500">to</span>
        <input
          type="date"
          className="input max-w-[160px] cursor-pointer [color-scheme:dark]"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />

        {/* Reset */}
        {hasFilters && (
          <button
            className="ml-auto btn-ghost text-xs gap-1.5 text-slate-400"
            onClick={reset}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
