import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useJobs(filters = {}) {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/jobs', { params: { ...filters, ...params } });
      setJobs(res.data.jobs);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return { jobs, pagination, loading, fetchJobs };
}
