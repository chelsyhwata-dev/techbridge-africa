import { useState, useEffect } from 'react';
import { BarChart3, Eye, Users, Clock } from 'lucide-react';
import api from '../api/axios';

export default function CompanyAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/companies/analytics').then((res) => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="text-gold-500" size={28} />
        <h1 className="text-3xl font-bold text-navy-900">Employer Analytics</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card text-center"><Eye className="mx-auto text-gold-500 mb-2" size={20} /><p className="text-2xl font-extrabold text-navy-900">{data.totalViews}</p><p className="text-xs text-gray-500 mt-1">Total Views</p></div>
        <div className="card text-center"><Users className="mx-auto text-gold-500 mb-2" size={20} /><p className="text-2xl font-extrabold text-navy-900">{data.totalApplicants}</p><p className="text-xs text-gray-500 mt-1">Total Applicants</p></div>
        <div className="card text-center"><p className="text-2xl font-extrabold text-navy-900">{data.overallClickThroughRate}%</p><p className="text-xs text-gray-500 mt-1">Overall CTR</p></div>
        <div className="card text-center"><Clock className="mx-auto text-gold-500 mb-2" size={20} /><p className="text-2xl font-extrabold text-navy-900">{data.avgTimeToHireDays ?? '—'}</p><p className="text-xs text-gray-500 mt-1">Avg Days to Hire</p></div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-navy-900 mb-4">Per-Job Performance</h2>
        <div className="space-y-2">
          {data.jobs.map((j) => (
            <div key={j.id} className="flex items-center justify-between border-b border-gray-50 last:border-none py-2.5">
              <div>
                <p className="font-medium text-navy-900 text-sm">{j.title}</p>
                <p className="text-xs text-gray-400">{j.status}</p>
              </div>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>{j.view_count} views</span>
                <span>{j.applicant_count} applicants</span>
                <span className="font-medium text-navy-900">{j.clickThroughRate}% CTR</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
