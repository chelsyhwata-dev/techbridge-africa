import { useState } from 'react';
import { useJobs } from '../hooks/useJobs';
import JobFilters from '../components/jobs/JobFilters';
import JobList from '../components/jobs/JobList';

export default function Jobs() {
  const [filters, setFilters] = useState({});
  const { jobs, pagination, loading, fetchJobs } = useJobs();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Job & Internship Listings</h1>
        <p className="text-gray-500 mt-1">Find your next opportunity in African tech</p>
      </div>

      <div className="space-y-6">
        <JobFilters filters={filters} setFilters={setFilters} onSearch={fetchJobs} />
        <JobList jobs={jobs} loading={loading} />

        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button key={i} onClick={() => fetchJobs({ ...filters, page: i + 1 })}
                className={`w-10 h-10 rounded-lg font-medium ${pagination.page === i + 1 ? 'bg-navy-800 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
