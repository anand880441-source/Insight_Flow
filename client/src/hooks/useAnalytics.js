import { useEffect, useState } from 'react';
import {
  getOverview,
  getTrends,
  getTopComplaints,
  getSentimentByCategory,
} from '../services/api';
import { useFilters } from '../context/FiltersContext';

export default function useAnalytics() {
  const { category, from, to } = useFilters();
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const q = {};
        if (category && category !== 'All') q.category = category;
        if (from) q.from = from;
        if (to) q.to = to;

        const [ov, tr, tc, bc] = await Promise.all([
          getOverview(q),
          getTrends({ ...q, days: 30 }),
          getTopComplaints({ ...q, limit: 10 }),
          getSentimentByCategory(q),
        ]);
        if (cancelled) return;
        setOverview(ov);
        setTrends(tr.series || []);
        setComplaints(tc.complaints || []);
        setByCategory(bc.rows || []);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [category, from, to]);

  return { overview, trends, complaints, byCategory, loading, error };
}
