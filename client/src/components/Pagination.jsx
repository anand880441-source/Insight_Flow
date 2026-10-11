export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const nums = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <div className="flex items-center gap-1.5 select-none">
      <button
        className="btn-ghost px-2.5 py-1.5 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        aria-label="Previous page"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span className="hidden sm:inline">Prev</span>
      </button>

      {start > 1 && <span className="text-slate-600 px-1 text-xs">…</span>}

      {nums.map(n => (
        <button
          key={n}
          onClick={() => onPage(n)}
          className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center ${
            n === page
              ? 'bg-gradient-brand text-white shadow-glow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]'
          }`}
        >
          {n}
        </button>
      ))}

      {end < pages && <span className="text-slate-600 px-1 text-xs">…</span>}

      <button
        className="btn-ghost px-2.5 py-1.5 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
