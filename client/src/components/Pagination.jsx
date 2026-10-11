export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const nums = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <div className="flex items-center gap-2">
      <button className="btn-ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Prev
      </button>
      {start > 1 && <span className="text-slate-400">…</span>}
      {nums.map(n => (
        <button
          key={n}
          onClick={() => onPage(n)}
          className={`btn ${n === page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {n}
        </button>
      ))}
      {end < pages && <span className="text-slate-400">…</span>}
      <button className="btn-ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </div>
  );
}
