import { createContext, useContext, useMemo, useState } from 'react';

const FiltersContext = createContext(null);

export function FiltersProvider({ children }) {
  const [category, setCategory] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const value = useMemo(() => ({
    category, setCategory,
    from, setFrom,
    to, setTo,
    // helper: turns state into a query object for the API
    toQuery() {
      const q = {};
      if (category && category !== 'All') q.category = category;
      if (from) q.from = from;
      if (to) q.to = to;
      return q;
    },
    reset() {
      setCategory('All');
      setFrom('');
      setTo('');
    },
  }), [category, from, to]);

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters must be inside FiltersProvider');
  return ctx;
}
