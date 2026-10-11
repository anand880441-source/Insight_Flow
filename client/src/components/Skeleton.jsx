export default function Skeleton({ className = '', height = 16, width = '100%' }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded ${className}`}
      style={{ height, width }}
    />
  );
}
