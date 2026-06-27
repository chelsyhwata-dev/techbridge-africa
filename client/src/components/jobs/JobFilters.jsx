import { Search } from 'lucide-react';

export default function JobFilters({ filters, setFilters, onSearch }) {
  const handleChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search jobs..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(filters)}
            className="input-field pl-10"
          />
        </div>
        <select value={filters.type || ''} onChange={(e) => handleChange('type', e.target.value)} className="input-field sm:w-40">
          <option value="">All Types</option>
          <option value="internship">Internship</option>
          <option value="graduate">Graduate</option>
          <option value="graduate_programme">Graduate Programme</option>
          <option value="entry_level">Entry-Level</option>
          <option value="learnership">Learnership</option>
          <option value="part-time">Part-time</option>
          <option value="full-time">Full-time</option>
          <option value="contract">Contract</option>
        </select>
        <input
          type="text"
          placeholder="Location"
          value={filters.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className="input-field sm:w-40"
        />
        <button onClick={() => onSearch(filters)} className="btn-primary whitespace-nowrap">
          Search
        </button>
      </div>
    </div>
  );
}
